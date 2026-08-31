import React, { useState, useEffect } from 'react';
import TiltCard from '../components/ui/TiltCard';
import { Flame, Search, Loader2, Sparkles } from 'lucide-react';
import { AnimeService } from '../lib/anime-service';
import BackButton from '../components/ui/BackButton';
import { useNavigate } from 'react-router-dom';
import ContinueWatchingSection from '../components/ui/ContinueWatchingSection';
import ContinueReadingSection from '../components/ui/ContinueReadingSection';
import { useWatchStore, useMangaStore } from '../lib/store';

export default function AnimeHome() {
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const { continueWatching } = useWatchStore();
  const { continueReading } = useMangaStore();

  // Load trending anime on mount
  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setLoading(true);
    try {
      // Search for popular anime to show as trending
      const results = await AnimeService.searchAnime('top airing');
      setAnimeList(results.slice(0, 24));
    } catch (error) {
      console.error('Error loading trending:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadTrending();
      return;
    }

    setSearchLoading(true);
    try {
      const results = await AnimeService.searchAnime(searchQuery);
      setAnimeList(results.slice(0, 24));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 pl-4 md:pl-24 pt-20 pb-24 max-w-[1800px] mx-auto">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-3">
          <Flame className="text-purple-500" size={32} />
          <div>
            <h1 className="text-3xl font-black text-white leading-none">
              ANIME <span className="text-purple-500">STREAM</span>
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-1">Watch trending anime & track your progress</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime by title..."
              className="w-full pl-12 pr-24 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-bold text-white disabled:opacity-50 transition-colors"
            >
              {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Continue Watching Section */}
      <ContinueWatchingSection />

      {/* Continue Reading Section (if any manga was read) */}
      {continueReading.length > 0 && (
        <ContinueReadingSection />
      )}

      {/* Trending / Search Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Trending Anime'}
          </h2>
        </div>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              loadTrending();
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Anime Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-[#111] animate-pulse rounded-xl border border-white/5" />
          ))}
        </div>
      ) : animeList.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 p-8">
          <p className="text-gray-400 text-lg mb-4">No anime found matching your query.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              loadTrending();
            }}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-sm text-white transition-colors"
          >
            Back to Trending
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {animeList.map((item) => (
            <TiltCard
              key={item.id}
              image={item.image}
              title={item.title?.english || item.title?.romaji || item.title}
              badge={item.subOrDub ? item.subOrDub.toUpperCase() : undefined}
              color="#9333ea"
              onClick={() => {
                navigate(`/anime/watch/${item.id}`); 
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}