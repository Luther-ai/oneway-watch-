import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMangaStore } from '../lib/store';
import { getChapterPages } from '../lib/mangadex';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Maximize, AlignJustify, Columns, Loader2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MangaReader() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { readerMode, setReaderMode, bgWhite, toggleBg, markChapterRead, saveReadingProgress, updateReadingPage } = useMangaStore();

  const stateData = location.state as {
    mangaId?: number | string;
    mangaTitle?: string;
    mangaCover?: string;
    chapterNumber?: string | number;
    chapterTitle?: string;
    totalChapters?: number | null;
    chapters?: { id: string; chapter: string; title: string }[];
  } | undefined;

  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [menuVisible, setMenuVisible] = useState(true);

  useEffect(() => {
    async function load() {
      if(!chapterId) return;
      setLoading(true);
      const p = await getChapterPages(chapterId);
      setPages(p);
      setLoading(false);
      markChapterRead(chapterId); // Mark as read when opened

      if (stateData?.mangaId && stateData?.mangaTitle) {
        saveReadingProgress({
          id: stateData.mangaId,
          title: stateData.mangaTitle,
          coverImage: stateData.mangaCover || '',
          chapterId: chapterId,
          chapterNumber: stateData.chapterNumber || '1',
          chapterTitle: stateData.chapterTitle,
          totalChapters: stateData.totalChapters,
          page: 1,
          totalPages: p.length,
        });
      }
    }
    load();
  }, [chapterId]);

  // Update page progress in paged mode
  useEffect(() => {
    if (chapterId && pages.length > 0) {
      updateReadingPage(chapterId, currentPage + 1, pages.length);
    }
  }, [chapterId, currentPage, pages.length, updateReadingPage]);

  // Handle Paged Navigation
  const nextPage = () => currentPage < pages.length - 1 && setCurrentPage(c => c + 1);
  const prevPage = () => currentPage > 0 && setCurrentPage(c => c - 1);

  // Chapter navigation helpers
  const chaptersList = stateData?.chapters || [];
  const currentChapterIdx = chaptersList.findIndex(c => c.id === chapterId);
  const prevChapterObj = currentChapterIdx !== -1 && currentChapterIdx < chaptersList.length - 1 
    ? chaptersList[currentChapterIdx + 1] 
    : undefined;
  const nextChapterObj = currentChapterIdx > 0 
    ? chaptersList[currentChapterIdx - 1] 
    : undefined;

  const navigateToChapter = (targetChapter: { id: string; chapter: string; title: string }) => {
    navigate(`/manga/read/${targetChapter.id}`, {
      state: {
        ...stateData,
        chapterNumber: targetChapter.chapter,
        chapterTitle: targetChapter.title,
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-blue-500 gap-3">
      <Loader2 size={40} className="animate-spin" />
      <p className="text-gray-400 text-sm">Loading chapter pages...</p>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col items-center relative transition-colors duration-300 ${bgWhite ? 'bg-white' : 'bg-black'}`}>
      
      {/* OVERLAY HEADER */}
      <AnimatePresence>
      {menuVisible && (
        <motion.div initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} className="fixed top-0 left-0 right-0 bg-[#111]/95 backdrop-blur-md p-4 z-50 flex justify-between items-center border-b border-white/10 text-white shadow-xl">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
                <div>
                  <h2 className="font-bold text-sm leading-tight text-white line-clamp-1">
                    {stateData?.mangaTitle || 'Chapter Reader'}
                  </h2>
                  <p className="text-xs text-blue-400 font-medium">
                    {stateData?.chapterNumber ? `Chapter ${stateData.chapterNumber}` : 'Reader'}
                    {stateData?.chapterTitle && stateData.chapterTitle !== `Chapter ${stateData.chapterNumber}` && ` • ${stateData.chapterTitle}`}
                  </p>
                </div>
            </div>
            
            {/* READER SETTINGS */}
            <div className="flex items-center gap-3">
                 <button onClick={toggleBg} title="Toggle Background (White/Dark)" className={`p-2 rounded-lg transition-colors ${bgWhite ? "text-blue-500 bg-blue-500/10" : "text-gray-400 hover:text-white"}`}><Maximize size={18}/></button>
                 <div className="h-5 w-px bg-white/20" />
                 <button onClick={() => setReaderMode('webtoon')} className={`p-2 rounded-lg transition-colors ${readerMode === 'webtoon' ? 'text-blue-500 bg-blue-500/10 font-bold' : 'text-gray-400 hover:text-white'}`} title="Webtoon Mode (Vertical Scroll)"><AlignJustify size={18}/></button>
                 <button onClick={() => setReaderMode('ltr')} className={`p-2 rounded-lg transition-colors ${readerMode === 'ltr' ? 'text-blue-500 bg-blue-500/10 font-bold' : 'text-gray-400 hover:text-white'}`} title="Paged Mode (Single Image)"><Columns size={18}/></button>
            </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* READING AREA */}
      <div onClick={() => setMenuVisible(!menuVisible)} className="w-full h-full min-h-screen cursor-pointer">
         
         {/* MODE: WEBTOON (Vertical Scroll) */}
         {readerMode === 'webtoon' && (
             <div className="max-w-3xl mx-auto flex flex-col pb-32 pt-16">
                 {pages.map((src, i) => (
                     <img key={i} src={src} className="w-full block" loading="lazy" referrerPolicy="no-referrer" alt={`Page ${i+1}`} />
                 ))}
                 
                 <div className="p-8 w-full flex justify-between gap-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (prevChapterObj) navigateToChapter(prevChapterObj);
                      }} 
                      disabled={!prevChapterObj}
                      className="flex-1 py-4 rounded-xl bg-[#111] text-white font-bold border border-white/10 hover:border-blue-500 disabled:opacity-30 disabled:hover:border-white/10 transition-colors"
                    >
                      Prev Chapter
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (nextChapterObj) navigateToChapter(nextChapterObj);
                      }} 
                      disabled={!nextChapterObj}
                      className="flex-1 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 transition-colors"
                    >
                      Next Chapter
                    </button>
                 </div>
             </div>
         )}

         {/* MODE: PAGED (Single Image) */}
         {readerMode !== 'webtoon' && pages.length > 0 && (
             <div className="fixed inset-0 flex items-center justify-center h-full w-full pt-16">
                 <img src={pages[currentPage]} className="max-h-[calc(100vh-5rem)] max-w-full object-contain select-none" referrerPolicy="no-referrer" alt={`Page ${currentPage+1}`} />
                 
                 {/* Click Zones */}
                 <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={(e) => { e.stopPropagation(); prevPage(); }} />
                 <div className="absolute inset-y-0 right-0 w-1/3 z-20" onClick={(e) => { e.stopPropagation(); nextPage(); }} />
                 
                 <div className="absolute bottom-6 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold border border-white/10 flex items-center gap-3">
                     <button 
                       onClick={(e) => { e.stopPropagation(); prevPage(); }} 
                       disabled={currentPage === 0}
                       className="text-gray-400 hover:text-white disabled:opacity-30"
                     >
                       <ChevronLeft size={16} />
                     </button>
                     <span>Page {currentPage + 1} / {pages.length}</span>
                     <button 
                       onClick={(e) => { e.stopPropagation(); nextPage(); }} 
                       disabled={currentPage === pages.length - 1}
                       className="text-gray-400 hover:text-white disabled:opacity-30"
                     >
                       <ChevronRight size={16} />
                     </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
}