import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimeService, AnimeInfo, EpisodeInfo } from '../lib/anime-service';
import HLSPlayer from '../components/ui/HLSPlayer';
import BackButton from '../components/ui/BackButton';
import { useWatchStore } from '../lib/store';
import { 
  Loader2, 
  AlertTriangle, 
  Play, 
  ListVideo, 
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock
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

  // Load stream for episode
  const loadStream = useCallback(async (episodeId: string) => {
    try {
      setPlayerError('');
      const streamData = await AnimeService.getStreamUrl(episodeId);
      
      if (!streamData || !streamData.url) {
        throw new Error('Stream not available for this episode');
      }

      setStreamUrl(streamData.url);
    } catch (error: any) {
      console.error('Stream load error:', error);
      setPlayerError('Failed to load video stream. (Might be CORS restricted in browser)');
      setStreamUrl('');
    }
  }, []);

  // Handle episode selection & save progress
  const handleEpisodeSelect = useCallback(async (episode: EpisodeInfo, animeData?: AnimeInfo | null) => {
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

  // Track playback time
  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    const now = Date.now();
    // Throttle store update to once every 4 seconds
    if (now - lastTimeUpdateRef.current > 4000) {
      lastTimeUpdateRef.current = now;
      if (id && currentEpisode) {
        updateWatchTime(String(id), currentEpisode.id, currentTime, duration);
      }
    }
  }, [id, currentEpisode, updateWatchTime]);

  // Load anime info and episodes with auto-resume
  useEffect(() => {
    async function loadAnimeData() {
      try {
        setLoading(true);
        setPlayerError('');
        
        if (!id) throw new Error("No ID provided");

        // Map AniList ID to Gogoanime ID
        const providerId = await AnimeService.mapToProvider(id as string);
        
        if (!providerId) {
          throw new Error('Anime not found on streaming provider');
        }

        // Get anime info with episodes
        const info = await AnimeService.getAnimeInfo(providerId);
        if (!info) {
          throw new Error('Failed to load anime information');
        }

        setAnimeInfo(info);
        
        // Determine which episode to resume:
        // 1. URL search param ?ep=
        // 2. Last watched episode from localStorage history
        // 3. First episode
        const requestedEpNum = searchParams.get('ep') ? parseInt(searchParams.get('ep')!, 10) : null;
        const lastWatched = getLastWatchedEpisode(String(id));
        
        let targetEpisode: EpisodeInfo | undefined;
        let seekTime: number | undefined;

        if (requestedEpNum) {
          targetEpisode = info.episodes.find(ep => ep.number === requestedEpNum);
        } else if (lastWatched) {
          targetEpisode = info.episodes.find(ep => ep.id === lastWatched.episodeId || ep.number === lastWatched.episodeNumber);
          if (lastWatched.currentTime && lastWatched.currentTime > 5 && (lastWatched.progressPercent || 0) < 95) {
            seekTime = lastWatched.currentTime;
          }
        }

        if (!targetEpisode) {
          targetEpisode = info.episodes[0];
        }

        if (targetEpisode) {
          setInitialSeekTime(seekTime);
          await handleEpisodeSelect(targetEpisode, info);
        }

      } catch (error: any) {
        console.error('Load error:', error);
        setPlayerError(error.message || 'Failed to load anime');
      } finally {
        setLoading(false);
      }
    }

    loadAnimeData();
  }, [id, searchParams, getLastWatchedEpisode, handleEpisodeSelect]);

  // Navigate to previous/next episode
  const navigateEpisode = useCallback((direction: 'prev' | 'next') => {
    if (!animeInfo) return;

    const currentIndex = animeInfo.episodes.findIndex(
      ep => ep.number === selectedEpisodeNum
    );
    
    if (direction === 'prev' && currentIndex > 0) {
      handleEpisodeSelect(animeInfo.episodes[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < animeInfo.episodes.length - 1) {
      handleEpisodeSelect(animeInfo.episodes[currentIndex + 1]);
    }
  }, [animeInfo, selectedEpisodeNum, handleEpisodeSelect]);

  // Handle player errors
  const handlePlayerError = useCallback((error: string) => {
    setPlayerError(`Player error: ${error}`);
  }, []);

  // Retry loading
  const handleRetry = useCallback(() => {
    if (currentEpisode) {
      loadStream(currentEpisode.id);
    }
  }, [currentEpisode, loadStream]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading anime data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-[1800px] mx-auto">
      <BackButton />
      
      {playerError && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl mt-12">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>{playerError}</span>
            <button
              onClick={handleRetry}
              className="ml-auto px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Main Player Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Player */}
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
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center p-8">
                  <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6">No stream available or loading...</p>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Episode Navigation */}
          <div className="bg-[#111] p-6 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <ListVideo className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-bold text-white">Episodes</h3>
                <span className="text-sm text-gray-400">
                  {selectedEpisodeNum} / {animeInfo?.totalEpisodes || '?'}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => navigateEpisode('prev')}
                  disabled={selectedEpisodeNum <= 1}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
                  title="Previous Episode"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateEpisode('next')}
                  disabled={selectedEpisodeNum >= (animeInfo?.totalEpisodes || 0)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
                  title="Next Episode"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Episode Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {animeInfo?.episodes.map((episode) => (
                <button
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                    selectedEpisodeNum === episode.number
                      ? 'bg-purple-600 text-white scale-105 shadow-lg shadow-purple-600/30 font-black'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-lg font-bold">{episode.number}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Anime Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-xl border border-white/5 sticky top-24">
            <div className="flex items-start gap-4 mb-6">
              <img
                src={animeInfo?.image}
                alt={animeInfo?.title}
                className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
              />
              <div>
                <h1 className="text-xl font-bold text-white leading-tight line-clamp-2">
                  {animeInfo?.title}
                </h1>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs font-bold rounded">
                    Episode {selectedEpisodeNum}
                  </span>
                  <span className="text-xs text-gray-400">
                    {animeInfo?.totalEpisodes} episodes
                  </span>
                </div>
              </div>
            </div>

            {animeInfo?.description && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
                <p className="text-sm text-gray-400 line-clamp-6" dangerouslySetInnerHTML={{ __html: animeInfo.description }}>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => window.open(`https://gogoanime3.co/category/${animeInfo?.id}`, '_blank')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Open on Gogoanime</span>
              </button>

              <button
                onClick={() => navigate(`/anime`)}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
              >
                Browse More Anime
              </button>
            </div>
          </div>

          {/* Currently Watching */}
          {currentEpisode && (
            <div className="bg-[#111] p-6 rounded-xl border border-white/5">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Now Playing
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 text-purple-500 fill-current" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">
                      Episode {currentEpisode.number}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {currentEpisode.title || animeInfo?.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}