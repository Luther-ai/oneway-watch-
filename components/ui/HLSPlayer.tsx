import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';

interface HLSPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onError?: (error: any) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

export default function HLSPlayer({ src, poster, className, onError, onTimeUpdate, initialTime }: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const hasSeekedInitial = useRef(false);

  useEffect(() => {
    if (!videoRef.current) return;

    hasSeekedInitial.current = false;

    // Initialize Video.js player
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      preload: 'auto',
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 1, 1.5, 2],
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
          'fullscreenToggle'
        ]
      },
      sources: [{
        src: src,
        type: 'application/x-mpegURL'
      }],
      poster: poster
    }, () => {
      console.log('Player is ready');
    });

    if (onTimeUpdate) {
      playerRef.current.on('timeupdate', () => {
        if (playerRef.current) {
          const current = playerRef.current.currentTime() || 0;
          const duration = playerRef.current.duration() || 0;
          onTimeUpdate(current, duration);
        }
      });
    }

    if (initialTime && initialTime > 0) {
      playerRef.current.on('loadedmetadata', () => {
        if (!hasSeekedInitial.current && playerRef.current) {
          hasSeekedInitial.current = true;
          playerRef.current.currentTime(initialTime);
        }
      });
    }

    // Error handling
    playerRef.current.on('error', (e: any) => {
      const errorMessage = playerRef.current?.error()?.message || 'Unknown playback error';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Video.js error:', errorMessage);
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster, onError, onTimeUpdate, initialTime]);

  // Update src when prop changes
  useEffect(() => {
    if (playerRef.current) {
        playerRef.current.src({ src, type: 'application/x-mpegURL' });
        if(poster) playerRef.current.poster(poster);
    }
  }, [src, poster]);

  if (error) {
    return (
      <div className="bg-black/80 rounded-xl aspect-video flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-xl mb-4">❌ Playback Error</div>
        <div className="text-gray-300 text-center mb-6">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden shadow-2xl ${className}`}>
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