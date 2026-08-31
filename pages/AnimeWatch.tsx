import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimeService, AnimeInfo, EpisodeInfo } from '../lib/anime-service';
import { fetchMediaById } from '../lib/api';
import HLSPlayer from '../components/ui/HLSPlayer';
import BackButton from '../components/ui/BackButton';
import { useWatchStore } from '../lib/store';
import {
  Loader2,
  AlertTriangle,
  Play,
  ListVideo,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
} from 'lucide-react';

export default function AnimeWatchPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { saveWatchProgress, updateWatchTime, getLastWatchedEpisode } = useWatchStore();

  const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeInfo | null>(null);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string>('');
  const [selectedEpisodeNum, setSelectedEpisodeNum] = useState(1);
  const [initialSeekTime, setInitialSeekTime] = useState<number | undefined>(undefined);

  const lastTimeUpdateRef = useRef<number>(0);

  const loadStream = useCallback(async (episodeId: string) => {
    try {
      setPlayerError('');
      setStreamUrl('');
      const streamData = await AnimeService.getStreamUrl(episodeId);

      if (!streamData?.url) {
        throw new Error('No playable video source is currently available.');
      }

      setStreamUrl(streamData.url);
    } catch (error: any) {
      console.error('Stream load error:', error);
      setPlayerError(error?.message || 'Failed to load video stream.');
      setStreamUrl('');
    }
  }, []);

  const handleEpisodeSelect = useCallback(async (episode: EpisodeInfo, animeData?: AnimeInfo | null) => {
    if (!episode?.id) return;

    setCurrentEpisode(episode);
    setSelectedEpisodeNum(episode.number);

    const info = animeData || animeInfo;
    if (id && info) {
      saveWatchProgress({
        id: String(id),
        title: info.title,
        image: episode.image || info.image,
        episodeId: episode.id,
        episodeNumber: episode.number,
        episodeTitle: episode.title || `Episode ${episode.number}`,
        totalEpisodes: info.totalEpisodes,
      });
    }

    await loadStream(episode.id);
  }, [animeInfo, id, loadStream, saveWatchProgress]);

  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    const now = Date.now();
    if (now - lastTimeUpdateRef.current > 4000) {
      lastTimeUpdateRef.current = now;
      if (id && currentEpisode) {
        updateWatchTime(String(id), currentEpisode.id, currentTime, duration);
      }
    }
  }, [id, currentEpisode, updateWatchTime]);

  useEffect(() => {
    let cancelled = false;

    async function loadAnimeData() {
      try {
        setLoading(true);
        setPlayerError('');
        setStreamUrl('');

        if (!id) throw new Error('No anime ID provided.');

        // The catalog uses AniList IDs. Resolve that title to a playback-provider ID.
        let providerId = await AnimeService.mapToProvider(String(id));

        if (!providerId) {
          // Provider failure should not destroy the page. Keep the AniList metadata
          // visible and tell the user that playback is temporarily unavailable.
          const media: any = await fetchMediaById(String(id), 'ANIME');
          if (!cancelled && media) {
            const fallback: AnimeInfo = {
              id: String(media.id || id),
              title: media.title?.english || media.title?.romaji || media.title?.native || 'Unknown Anime',
              image: media.coverImage?.extraLarge || media.coverImage?.large || '',
              description: typeof media.description === 'string' ? media.description : '',
              totalEpisodes: Number(media.episodes || 0),
              episodes: [],
              provider: null,
              providerUnavailable: true,
            };
            setAnimeInfo(fallback);
            setPlayerError('The anime provider is temporarily unavailable. Metadata is still available.');
          }
          return;
        }

        const info = await AnimeService.getAnimeInfo(providerId);
        if (!info) throw new Error('Failed to load anime information.');

        const safeInfo: AnimeInfo = {
          ...info,
          episodes: Array.isArray(info.episodes) ? info.episodes : [],
          totalEpisodes: Number(info.totalEpisodes || (Array.isArray(info.episodes) ? info.episodes.length : 0)),
        };

        if (cancelled) return;
        setAnimeInfo(safeInfo);

        const requestedEpRaw = searchParams.get('ep');
        const requestedEpNum = requestedEpRaw ? Number.parseInt(requestedEpRaw, 10) : null;
        const lastWatched = getLastWatchedEpisode(String(id));
        const episodes = safeInfo.episodes;

        let targetEpisode: EpisodeInfo | undefined;
        let seekTime: number | undefined;

        if (requestedEpNum && Number.isFinite(requestedEpNum)) {
          targetEpisode = episodes.find(ep => ep.number === requestedEpNum);
        } else if (lastWatched) {
          targetEpisode = episodes.find(ep => ep.id === lastWatched.episodeId || ep.number === lastWatched.episodeNumber);
          if (lastWatched.currentTime && lastWatched.currentTime > 5 && (lastWatched.progressPercent || 0) < 95) {
            seekTime = lastWatched.currentTime;
          }
        }

        targetEpisode = targetEpisode || episodes[0];

        if (targetEpisode) {
          setInitialSeekTime(seekTime);
          await handleEpisodeSelect(targetEpisode, safeInfo);
        } else {
          setPlayerError('No episodes are currently available from the connected provider.');
        }
      } catch (error: any) {
        console.error('Load error:', error);
        if (!cancelled) setPlayerError(error?.message || 'Failed to load anime.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnimeData();
    return () => { cancelled = true; };
  }, [id, searchParams, getLastWatchedEpisode, handleEpisodeSelect]);

  const navigateEpisode = useCallback((direction: 'prev' | 'next') => {
    const episodes = animeInfo?.episodes ?? [];
    if (!episodes.length) return;

    const currentIndex = episodes.findIndex(ep => ep.number === selectedEpisodeNum);
    if (currentIndex < 0) return;

    const nextIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex >= 0 && nextIndex < episodes.length) {
      handleEpisodeSelect(episodes[nextIndex]);
    }
  }, [animeInfo, selectedEpisodeNum, handleEpisodeSelect]);

  const handlePlayerError = useCallback((error: string) => {
    setPlayerError(`Player error: ${error}`);
  }, []);

  const handleRetry = useCallback(() => {
    if (currentEpisode?.id) loadStream(currentEpisode.id);
  }, [currentEpisode, loadStream]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading anime data...</p>
      </div>
    );
  }

  const episodes = animeInfo?.episodes ?? [];
  const providerUnavailable = Boolean(animeInfo?.providerUnavailable);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-[1800px] mx-auto">
      <BackButton />

      {playerError && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl mt-12">
          <div className="flex items-start gap-3 text-red-300">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Playback unavailable</p>
              <p className="text-sm text-red-200/70 mt-1">{playerError}</p>
            </div>
            {currentEpisode && (
              <button onClick={handleRetry} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-video">
            {streamUrl ? (
              <HLSPlayer
                src={streamUrl}
                poster={currentEpisode?.image || animeInfo?.image}
                className="w-full h-full"
                onError={handlePlayerError}
                onTimeUpdate={handleTimeUpdate}
                initialTime={initialSeekTime}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-300 font-semibold">No playable stream</p>
                <p className="text-gray-500 text-sm mt-2 max-w-md">
                  {providerUnavailable
                    ? 'The connected anime providers are temporarily unavailable. Try again later.'
                    : 'Choose an episode to start playback.'}
                </p>
                {currentEpisode && (
                  <button onClick={handleRetry} className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
                    Try Again
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#111] p-6 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <ListVideo className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-bold text-white">Episodes</h3>
                <span className="text-sm text-gray-400">{selectedEpisodeNum} / {animeInfo?.totalEpisodes || '?'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigateEpisode('prev')} disabled={!episodes.length || selectedEpisodeNum <= 1} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors" title="Previous Episode">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => navigateEpisode('next')} disabled={!episodes.length || selectedEpisodeNum >= (animeInfo?.totalEpisodes || 0)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors" title="Next Episode">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {episodes.length ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {episodes.map((episode) => (
                  <button
                    key={episode.id}
                    onClick={() => handleEpisodeSelect(episode)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${selectedEpisodeNum === episode.number ? 'bg-purple-600 text-white scale-105 shadow-lg shadow-purple-600/30 font-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                  >
                    <span className="text-lg font-bold">{episode.number}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/5 bg-white/[.03] p-8 text-center">
                <Info className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <p className="text-white/70 font-semibold">No episode list available</p>
                <p className="text-white/35 text-sm mt-1">The metadata is available, but the streaming provider did not return episodes.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-xl border border-white/5 sticky top-24">
            <div className="flex items-start gap-4 mb-6">
              {animeInfo?.image ? (
                <img src={animeInfo.image} alt={animeInfo.title} className="w-20 h-28 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-20 h-28 rounded-lg bg-white/5 flex-shrink-0" />
              )}
              <div>
                <h1 className="text-xl font-bold text-white leading-tight line-clamp-2">{animeInfo?.title || 'Unknown Anime'}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs font-bold rounded">Episode {selectedEpisodeNum}</span>
                  <span className="text-xs text-gray-400">{animeInfo?.totalEpisodes || '?'} episodes</span>
                </div>
              </div>
            </div>

            {animeInfo?.description && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
                <p className="text-sm text-gray-400 line-clamp-6">{animeInfo.description.replace(/<[^>]*>/g, ' ')}</p>
              </div>
            )}

            <button onClick={() => navigate('/anime')} className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
              Browse More Anime
            </button>
          </div>

          {currentEpisode && (
            <div className="bg-[#111] p-6 rounded-xl border border-white/5">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-purple-400" />Now Playing</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0"><Play className="w-5 h-5 text-purple-500 fill-current" /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">Episode {currentEpisode.number}</p>
                  <p className="text-sm text-gray-400 truncate">{currentEpisode.title || animeInfo?.title}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
