import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Flame, Loader2, Search } from 'lucide-react';
import { fetchMangaList } from '../lib/api';
import { Media } from '../types';

export default function MangaSearch() {
  const [data, setData] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchMangaList("TRENDING_DESC").then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        setLoading(true);
        fetchMangaList("TRENDING_DESC", query).then(res => {
            setData(res);
            setLoading(false);
        });
    }
  }

  return (
    <div className="min-h-screen pb-20 pt-24 px-6 md:px-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-black text-white">Browse Manga</h1>
            <p className="text-gray-400 text-sm">Discover new titles from AniList & MangaDex</p>
        </div>
        
        <div className="relative w-full md:w-auto">
            <input 
                type="text" 
                placeholder="Search..." 
                className="w-full md:w-64 bg-[#111] border border-white/10 rounded-full py-2 pl-10 text-white focus:border-blue-500 outline-none text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
            />
            <Search className="absolute left-3.5 top-2.5 text-gray-500" size={16} />
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64 text-blue-500"><Loader2 className="animate-spin w-10 h-10" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {data.map((item) => (
            <Link key={item.id} to={`/manga/${item.id}`} className="group">
                <div className="aspect-[2/3] rounded-lg overflow-hidden relative shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border border-white/5">
                    <img src={item.coverImage.extraLarge} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={item.title.romaji} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-block px-2 py-0.5 bg-blue-600/80 backdrop-blur-sm rounded text-[10px] font-bold text-white mb-2">{item.genres[0]}</span>
                    </div>
                </div>
                <h3 className="font-bold text-white mt-3 leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">{item.title.english || item.title.romaji}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                    <BookOpen size={12} /> <span>{item.chapters || '?'} Chs</span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full" />
                    <Flame size={12} className="text-orange-500" /> <span>{item.averageScore}%</span>
                </div>
            </Link>
            ))}
        </div>
      )}
    </div>
  );
}