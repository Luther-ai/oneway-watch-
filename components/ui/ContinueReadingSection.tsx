import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trash2, ChevronLeft, ChevronRight, Clock, BookMarked } from 'lucide-react';
import { useMangaStore } from '../../lib/store';
import { formatTimeAgo } from '../../lib/utils';
import { ContinueReadingItem } from '../../types';

interface ContinueReadingSectionProps {
  className?: string;
}

export default function ContinueReadingSection({ className = '' }: ContinueReadingSectionProps) {
  const navigate = useNavigate();
  const { continueReading, removeReadingProgress, clearReadingHistory } = useMangaStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (continueReading.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCardClick = (item: ContinueReadingItem) => {
    navigate(`/manga/read/${item.chapterId}`, {
      state: {
        mangaId: item.id,
        mangaTitle: item.title,
        mangaCover: item.coverImage,
        chapterNumber: item.chapterNumber,
        chapterTitle: item.chapterTitle,
        totalChapters: item.totalChapters,
      }
    });
  };

  return (
    <section className={`mb-12 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <BookMarked size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Continue <span className="text-blue-400">Reading</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {continueReading.length}
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">Resume where your manga adventure left off</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {continueReading.length > 1 && (
            <button
              onClick={clearReadingHistory}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 font-medium"
              title="Clear continue reading history"
            >
              Clear All
            </button>
          )}

          {continueReading.length > 2 && (
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
          {continueReading.map((item) => {
            const pageInfo = item.page && item.totalPages 
              ? `Page ${item.page}/${item.totalPages}` 
              : null;

            return (
              <motion.div
                key={String(item.id)}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="snap-start shrink-0 w-64 sm:w-72 group relative"
              >
                <div
                  onClick={() => handleCardClick(item)}
                  className="bg-[#0e0e0e] rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 shadow-xl transition-all duration-300 group-hover:-translate-y-1 cursor-pointer flex flex-col"
                >
                  {/* Thumbnail / Cover Area */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-900">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                    {/* Book icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 scale-90 group-hover:scale-100 transition-transform">
                        <BookOpen size={22} className="fill-white" />
                      </div>
                    </div>

                    {/* Chapter Badge */}
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-extrabold text-blue-300 border border-blue-500/30 shadow-md">
                      CH {item.chapterNumber} {item.totalChapters ? `/ ${item.totalChapters}` : ''}
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeReadingProgress(item.id);
                      }}
                      title="Remove from reading history"
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 hover:bg-red-500 text-gray-400 hover:text-white backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* Time Ago */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-gray-300 font-medium">
                      <Clock size={10} className="text-blue-400" />
                      <span>{formatTimeAgo(item.updatedAt)}</span>
                    </div>

                    {/* Blue bottom progress accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  </div>

                  {/* Card Info */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                        {item.chapterTitle || `Chapter ${item.chapterNumber}`}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[11px] font-semibold text-blue-400">
                        Resume Ch. {item.chapterNumber}
                      </span>
                      {pageInfo && (
                        <span className="text-[10px] text-gray-500">
                          {pageInfo}
                        </span>
                      )}
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
