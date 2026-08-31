import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Star, Loader2, Heart, Check, Download, ArrowDownUp, ListFilter, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchMediaById } from '../lib/api';
import { getMangaDexId, getChapters } from '../lib/mangadex';
import BackButton from '../components/ui/BackButton';
import { useMangaStore } from '../lib/store';
import { Media, Chapter } from '../types';

export default function MangaDetails() {
  const { id } = useParams();
  const { 
    library, 
    addToLibrary, 
    removeFromLibrary, 
    readChapters, 
    markChapterRead,
    getLastReadChapter,
    saveReadingProgress
  } = useMangaStore();
  
  const [manga, setManga] = useState<Media | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortDesc, setSortDesc] = useState(true);

  // Check if in library
  const inLibrary = manga && library.some(m => m.id === manga.id);

  // Check if there is reading progress
  const lastRead = id ? getLastReadChapter(id) : undefined;

  useEffect(() => {
    async function load() {
      if (!id) return;
      const found = await fetchMediaById(id, "MANGA");
      setManga(found);
      if (found) {
        const title = found.title.english || found.title.romaji;
        const mdId = await getMangaDexId(title);
        if (mdId) setChapters(await getChapters(mdId));
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !manga) return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>;

  const displayedChapters = sortDesc ? chapters : [...chapters].reverse();

  // Find target chapter for "Read" button:
  // If user previously read a chapter, resume that chapter (or next unread); otherwise start from first available chapter
  const resumeChapter = lastRead 
    ? chapters.find(c => c.id === lastRead.chapterId || c.chapter === String(lastRead.chapterNumber)) || chapters[0]
    : chapters[0];

  const handleStartRead = (ch: Chapter) => {
    if (!manga) return;
    saveReadingProgress({
      id: manga.id,
      title: manga.title.english || manga.title.romaji,
      coverImage: manga.coverImage.extraLarge || manga.coverImage.large,
      chapterId: ch.id,
      chapterNumber: ch.chapter,
      chapterTitle: ch.title,
      totalChapters: manga.chapters || chapters.length,
    });
  };

  return (
    <div className="min-h-screen relative pb-20">
      <BackButton />
      
      {/* Metadata Section */}
      <div className="relative pt-32 px-6 md:px-12 flex flex-col md:flex-row gap-8">
         <div className="relative shrink-0 mx-auto md:mx-0">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-48 rounded-lg overflow-hidden shadow-2xl border border-white/10">
                 <img src={manga.coverImage.extraLarge} className="w-full object-cover" alt="Cover" />
             </motion.div>
         </div>
         <div className="flex-1 space-y-4 text-center md:text-left">
             <h1 className="text-3xl md:text-5xl font-black text-white leading-none">{manga.title.english || manga.title.romaji}</h1>
             <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{__html: manga.description}} />
             
             <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                 {manga.genres.map((g:string) => <span key={g} className="px-2 py-1 bg-white/5 rounded text-xs font-bold text-gray-300 border border-white/10">{g}</span>)}
             </div>

             <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                 <button 
                    onClick={() => inLibrary ? removeFromLibrary(manga.id) : addToLibrary(manga)}
                    className={`px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${inLibrary ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-blue-600 text-white shadow-lg hover:bg-blue-500'}`}
                 >
                    <Heart size={20} fill={inLibrary ? "currentColor" : "none"} /> {inLibrary ? 'In Library' : 'Add to Library'}
                 </button>
                 
                 {chapters.length > 0 && resumeChapter && (
                     <Link 
                       to={`/manga/read/${resumeChapter.id}`}
                       state={{ 
                         mangaId: manga.id, 
                         mangaTitle: manga.title.english || manga.title.romaji,
                         mangaCover: manga.coverImage.extraLarge,
                         chapterNumber: resumeChapter.chapter,
                         chapterTitle: resumeChapter.title,
                         totalChapters: manga.chapters || chapters.length,
                         chapters: chapters.map(c => ({ id: c.id, chapter: c.chapter, title: c.title }))
                       }}
                       onClick={() => handleStartRead(resumeChapter)}
                     >
                        <button className="px-8 py-3 rounded-full font-bold flex items-center gap-2 bg-white text-black hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                            <BookOpen size={20} /> {lastRead ? `Continue Ch. ${lastRead.chapterNumber}` : 'Start Reading'}
                        </button>
                     </Link>
                 )}
             </div>
         </div>
      </div>

      {/* Chapter List */}
      <div className="mt-12 px-6 md:px-12">
          <div className="bg-[#111] rounded-t-xl border border-white/5 p-4 flex justify-between items-center">
              <h3 className="font-bold text-white">{chapters.length} Chapters</h3>
              <div className="flex gap-4">
                  <button onClick={() => setSortDesc(!sortDesc)} title="Sort Chapters"><ArrowDownUp size={18} className="text-gray-400 hover:text-white"/></button>
                  <ListFilter size={18} className="text-gray-400 hover:text-white"/>
              </div>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 border-t-0 rounded-b-xl divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {displayedChapters.map(ch => {
                  const isRead = readChapters.includes(ch.id);
                  const isCurrentResume = lastRead && (lastRead.chapterId === ch.id || String(lastRead.chapterNumber) === ch.chapter);
                  return (
                    <div key={ch.id} className={`p-4 flex justify-between items-center hover:bg-white/5 group transition-colors ${isRead ? 'opacity-60' : ''}`}>
                        <Link 
                          to={`/manga/read/${ch.id}`} 
                          state={{ 
                            mangaId: manga.id, 
                            mangaTitle: manga.title.english || manga.title.romaji,
                            mangaCover: manga.coverImage.extraLarge,
                            chapterNumber: ch.chapter,
                            chapterTitle: ch.title,
                            totalChapters: manga.chapters || chapters.length,
                            chapters: chapters.map(c => ({ id: c.id, chapter: c.chapter, title: c.title }))
                          }}
                          onClick={() => handleStartRead(ch)}
                          className="flex-1"
                        >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-200 group-hover:text-blue-400 transition-colors">
                                Chapter {ch.chapter}
                              </span>
                              {isCurrentResume && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                <span>{ch.date}</span>
                                {ch.title && ch.title !== `Chapter ${ch.chapter}` && (
                                  <span className="truncate max-w-md">• {ch.title}</span>
                                )}
                                {isRead && <span className="text-green-500 text-[10px] uppercase font-bold ml-1">✓ Read</span>}
                            </div>
                        </Link>
                        <div className="flex items-center gap-3">
                            <button 
                              onClick={() => markChapterRead(ch.id)} 
                              title={isRead ? "Marked as read" : "Mark as read"}
                              className={`p-2 rounded-full transition-colors ${isRead ? 'text-green-500 bg-green-500/10' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
                            >
                                <Check size={18} />
                            </button>
                        </div>
                    </div>
                  )
              })}
              {chapters.length === 0 && <div className="p-8 text-center text-gray-500">No chapters found on MangaDex</div>}
          </div>
      </div>
    </div>
  );
}