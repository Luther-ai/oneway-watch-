import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, ChevronLeft, ChevronRight, Clock, Tv } from 'lucide-react';
import { useWatchStore } from '../../lib/store';
import { formatTimeAgo } from '../../lib/utils';
import { ContinueWatchingItem } from '../../types';

interface ContinueWatchingSectionProps {
  className?: string;
}

export default function ContinueWatchingSection({ className = '' }: ContinueWatchingSectionProps) {
  const navigate = useNavigate();
  const { continueWatching, removeWatchProgress, clearWatchHistory } = useWatchStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (continueWatching.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardClick = (item: ContinueWatchingItem) => {
    navigate(`/anime/watch/${item.id}?ep=${item.episodeNumber}`);
  };

  return (
    <section className={`mb-12 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Tv size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Continue <span className="text-purple-400">Watching</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {continueWatching.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">Pick up right where you left off</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {continueWatching.length > 1 && (
            <button
              onClick={clearWatchHistory}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 font-medium"
              title="Clear continue watching history"
            >
              Clear All
            </button>
          )}

          {continueWatching.length > 2 && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-lg bg-[#111] hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                title="Scroll Left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-lg bg-[#111] hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
                title="Scroll Right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <AnimatePresence mode="popLayout">
          {continueWatching.map((item) => {
            const percent = item.progressPercent !== undefined 
              ? Math.max(5, item.progressPercent) 
              : (item.totalEpisodes && item.episodeNumber 
                  ? Math.round((item.episodeNumber / item.totalEpisodes) * 100) 
                  : 50);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="snap-start shrink-0 w-64 sm:w-72 group relative"
              >
                <div
                  onClick={() => handleCardClick(item)}
                  className="bg-[#0e0e0e] rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 shadow-xl transition-all duration-300 group-hover:-translate-y-1 cursor-pointer flex flex-col"
                >
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-600/50 scale-90 group-hover:scale-100 transition-transform">
                        <Play size={22} className="ml-1 fill-white" />
                      </div>
                    </div>

                    {/* Episode Badge */}
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-extrabold text-purple-300 border border-purple-500/30 shadow-md">
                      EP {item.episodeNumber} {item.totalEpisodes ? `/ ${item.totalEpisodes}` : ''}
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWatchProgress(item.id);
                      }}
                      title="Remove from history"
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 hover:bg-red-500 text-gray-400 hover:text-white backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Time Ago */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-gray-300 font-medium">
                      <Clock size={10} className="text-purple-400" />
                      <span>{formatTimeAgo(item.updatedAt)}</span>
                    </div>

                    {/* Progress Bar at bottom of thumbnail */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                      <div
                        className="h-full bg-purple-500 transition-all duration-300 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                        {item.episodeTitle || `Episode ${item.episodeNumber}`}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[11px] font-semibold text-purple-400">
                        Resume Ep. {item.episodeNumber}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {percent}% watched
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
