import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Settings, RefreshCw, Hexagon } from 'lucide-react';
import { ANIME_NAV, ANIME_EXTRAS, MANGA_NAV, MANGA_EXTRAS } from '../../config/navigation';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  
  const isManga = pathname.startsWith('/manga');
  const mainNav = isManga ? MANGA_NAV : ANIME_NAV;
  const extraNav = isManga ? MANGA_EXTRAS : ANIME_EXTRAS;
  const themeColor = isManga ? 'text-blue-500' : 'text-purple-500';
  const themeBg = isManga ? 'bg-blue-600' : 'bg-purple-600';

  const handleSwitchMode = () => {
    setIsOpen(false);
    navigate(isManga ? '/anime' : '/manga');
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        className={`fixed top-5 left-5 z-[100] p-3 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl transition-colors ${isOpen ? 'bg-transparent text-white' : 'bg-black/40 text-white'}`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-80 bg-[#0a0a0a] border-r border-white/10 z-[100] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <div className="p-8 pt-24 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                <div className="flex items-center gap-3">
                  <Hexagon className={`w-10 h-10 ${themeColor} fill-current/20`} />
                  <div>
                    <h1 className="font-black text-2xl tracking-tighter leading-none text-white">{isManga ? 'MANGA' : 'ANIME'}<span className={`${themeColor}`}>HUB</span></h1>
                    <p className="text-xs text-gray-500 font-bold tracking-widest mt-1">{isManga ? 'READING MODE' : 'STREAMING MODE'}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">{mainNav.map((item, i) => <NavItem key={item.href} item={item} idx={i} isActive={pathname === item.href} themeColor={themeColor} themeBg={themeBg} onClick={() => setIsOpen(false)} />)}</div>
                <div className="h-px bg-white/10 w-full" />
                <div className="space-y-2"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Extras</h3>{extraNav.map((item, i) => <NavItem key={item.href} item={item} idx={i + 5} isActive={pathname === item.href} themeColor={themeColor} themeBg={themeBg} onClick={() => setIsOpen(false)} />)}</div>
              </div>

              <div className="p-6 bg-[#050505] border-t border-white/5 space-y-3">
                <Link to="/settings" onClick={() => setIsOpen(false)}><div className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"><Settings size={20} /><span className="font-bold text-sm">Settings</span></div></Link>
                <button onClick={handleSwitchMode} className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border ${isManga ? 'border-blue-500/30' : 'border-purple-500/30'} bg-white/5 hover:bg-white/10 transition-all group`}><div className="flex items-center gap-3"><RefreshCw size={20} className={`${themeColor} transition-transform group-hover:rotate-180`} /><div className="text-left leading-none"><span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Switch to</span><span className="block text-white font-bold">{isManga ? 'ANIME MODE' : 'MANGA MODE'}</span></div></div></button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ item, idx, isActive, themeColor, themeBg, onClick }: any) {
  return (
    <Link to={item.href} onClick={onClick}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (idx * 0.05) }} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
        {isActive && <motion.div layoutId="active-bg" className={`absolute inset-0 ${themeBg} opacity-20`} />}
        <item.icon size={20} className={`relative z-10 transition-transform group-hover:scale-110 ${isActive ? themeColor : ''}`} />
        <span className={`relative z-10 font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
      </motion.div>
    </Link>
  )
}