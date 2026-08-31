import React, { useCallback, useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';

interface HLSPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

function getSourceType(src: string) {
  const lower = src.toLowerCase();
  if (lower.includes('.m3u8')) return 'application/x-mpegURL';
  if (lower.includes('.mp4')) return 'video/mp4';
  return 'video/mp4';
}

export default function HLSPlayer({ src, poster, className, onError, onTimeUpdate, initialTime }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const hasSeekedInitial = useRef(false);

  const reportError = useCallback((message: string) => {
    setError(message);
    onError?.(message);
  }, [onError]);

  useEffect(() => {
    if (!videoRef.current || playerRef.current) return;

    const sourceType = getSourceType(src);
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      responsive: true,
      playsinline: true,
      inactivityTimeout: 1800,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'remainingTimeDisplay',
          'playbackRateMenuButton',
          'fullscreenToggle',
        ],
      },
      sources: [{ src, type: sourceType }],
      poster,
    }, () => {
      setError(null);
    });

    playerRef.current = player;
    hasSeekedInitial.current = false;

    const handleTimeUpdate = () => {
      const current = player.currentTime() || 0;
      const duration = player.duration() || 0;
      onTimeUpdate?.(current, Number.isFinite(duration) ? duration : 0);
    };

    const handleLoadedMetadata = () => {
      if (hasSeekedInitial.current || !initialTime || initialTime <= 0) return;
      const duration = player.duration();
      const safeTime = Number.isFinite(duration) && duration > 0
        ? Math.min(initialTime, Math.max(0, duration - 1))
        : initialTime;
      if (safeTime > 0) {
        hasSeekedInitial.current = true;
        player.currentTime(safeTime);
      }
    };

    const handlePlayerError = () => {
      const playerError = player.error();
      const message = playerError?.message || 'The video source could not be played.';
      console.error('Video.js playback error:', playerError);
      reportError(message);
    };

    player.on('timeupdate', handleTimeUpdate);
    player.on('loadedmetadata', handleLoadedMetadata);
    player.on('error', handlePlayerError);

    return () => {
      player.off('timeupdate', handleTimeUpdate);
      player.off('loadedmetadata', handleLoadedMetadata);
      player.off('error', handlePlayerError);
      player.dispose();
      playerRef.current = null;
    };
  }, [src, poster, initialTime, onTimeUpdate, reportError]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !src) return;

    setError(null);
    setRetrying(false);
    hasSeekedInitial.current = false;
    player.src({ src, type: getSourceType(src) });
    if (poster) player.poster(poster);
    player.load();
  }, [src, poster]);

  const retry = useCallback(async () => {
    const player = playerRef.current;
    if (!player || !src) return;

    setRetrying(true);
    setError(null);
    try {
      player.pause();
      player.reset();
      player.src({ src, type: getSourceType(src) });
      if (poster) player.poster(poster);
      player.load();
      await new Promise<void>((resolve) => player.one('loadedmetadata', () => resolve()));
      await player.play();
    } catch (retryError: any) {
      reportError(retryError?.message || 'Retry failed. The source may be unavailable.');
    } finally {
      setRetrying(false);
    }
  }, [poster, reportError, src]);

  if (error) {
    return (
      <div className={`bg-black/90 rounded-xl aspect-video flex flex-col items-center justify-center p-8 ${className || ''}`}>
        <div className="text-red-400 text-xl font-bold mb-3">Playback unavailable</div>
        <div className="text-gray-300 text-center text-sm max-w-xl mb-6">{error}</div>
        <button
          onClick={retry}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg font-semibold transition-colors"
        >
          {retrying ? 'Retrying…' : 'Retry playback'}
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden shadow-2xl ${className || ''}`}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-default-skin"
          playsInline
        />
      </div>
    </div>
  );
}
