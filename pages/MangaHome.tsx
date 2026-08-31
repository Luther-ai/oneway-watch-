import React, { useState } from 'react';
import { useMangaStore, useWatchStore } from '../lib/store';
import { Search, LayoutGrid, List as ListIcon, Trash2, BookOpen, Library } from 'lucide-react';
import TiltCard from '../components/ui/TiltCard';
import { Link } from 'react-router-dom';
import ContinueReadingSection from '../components/ui/ContinueReadingSection';
import ContinueWatchingSection from '../components/ui/ContinueWatchingSection';

export default function LibraryPage() {
  const { library, removeFromLibrary, continueReading } = useMangaStore();
  const { continueWatching } = useWatchStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState('');

  const filtered = library.filter(m => 
    (m.title.english || m.title.romaji).toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-12 pb-24 pt-24 max-w-[1800px] mx-auto">
      
      {/* Continue Reading Section */}
      <ContinueReadingSection />

      {/* Continue Watching (if any anime is in progress) */}
      {continueWatching.length > 0 && (
        <ContinueWatchingSection />
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Library size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white leading-none">
              MY <span className="text-blue-500">LIBRARY</span>
            </h1>
            <p className="text-gray-400 text-xs font-medium mt-1">{library.length} bookmarked titles</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Filter Bar */}
          <div className="relative flex-1 md:w-64">
            <input 
                type="text" 
                placeholder="Filter library..." 
                value={filter}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                onChange={(e) => setFilter(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          </div>

          <div className="flex gap-1 bg-[#111] p-1 rounded-lg border border-white/10">
             <button 
               onClick={() => setView('grid')} 
               title="Grid View"
               className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
             >
               <LayoutGrid size={18}/>
             </button>
             <button 
               onClick={() => setView('list')} 
               title="List View"
               className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
             >
               <ListIcon size={18}/>
             </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-2xl border border-white/5 p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-white/10 text-gray-400">
                <BookOpen size={28} />
            </div>
            <p className="text-white font-bold text-lg mb-1">{filter ? 'No titles match your filter' : 'Your library is empty'}</p>
            <p className="text-gray-400 text-sm max-w-sm mb-4">
              {filter ? 'Try clearing the search text to see all saved manga.' : 'Search and add manga to your personal collection to track them.'}
            </p>
            <Link to="/manga/search" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-blue-600/30">
              Browse Manga
            </Link>
        </div>
      ) : (
        <div className={view === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex flex-col gap-2"}>
          {filtered.map((item) => (
             view === 'grid' ? (
                <Link key={item.id} to={`/manga/${item.id}`} className="relative group">
                    <TiltCard 
                        image={item.coverImage.extraLarge} 
                        title={item.title.english || item.title.romaji} 
                        color="#3b82f6" 
                        badge={item.chapters ? `${item.chapters} Ch` : undefined}
                    />
                </Link>
             ) : (
                <Link key={item.id} to={`/manga/${item.id}`} className="flex gap-4 p-3 bg-[#111] rounded-xl border border-white/5 hover:border-blue-500/50 transition-colors cursor-pointer group">
                    <img src={item.coverImage.extraLarge} className="w-12 h-16 md:w-16 md:h-24 object-cover rounded" alt={item.title.romaji} />
                    <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{item.title.english || item.title.romaji}</h3>
                        <p className="text-xs text-gray-500">{item.chapters || '?'} Chapters • {item.status}</p>
                    </div>
                    <button 
                        onClick={(e) => {e.preventDefault(); removeFromLibrary(item.id)}} 
                        className="p-3 text-gray-600 hover:text-red-500 transition-colors flex items-center"
                    >
                        <Trash2 size={18}/>
                    </button>
                </Link>
             )
          ))}
        </div>
      )}
    </div>
  );
}