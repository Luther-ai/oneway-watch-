import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import AnimeHome from './pages/AnimeHome';
import AnimeWatchPage from './pages/AnimeWatch';
import LibraryPage from './pages/MangaHome';
import MangaSearch from './pages/MangaSearch';
import MangaDetails from './pages/MangaDetails';
import MangaReader from './pages/MangaReader';
import Extensions from './pages/Extensions';

function App() {
  return (
    <div className="text-white min-h-screen bg-[#050505] font-sans selection:bg-purple-500/30">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/anime" replace />} />
        
        {/* Anime Routes */}
        <Route path="/anime" element={<AnimeHome />} />
        <Route path="/anime/watch/:id" element={<AnimeWatchPage />} />
        
        {/* Manga Routes */}
        <Route path="/manga" element={<LibraryPage />} />
        <Route path="/manga/search" element={<MangaSearch />} />
        <Route path="/manga/sources" element={<Extensions />} />
        <Route path="/manga/:id" element={<MangaDetails />} />
        <Route path="/manga/read/:chapterId" element={<MangaReader />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/anime" replace />} />
      </Routes>
    </div>
  );
}

export default App;