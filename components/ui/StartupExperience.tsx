import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Play, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'oneway-startup-seen';

export default function StartupExperience() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (seen) return;
    setVisible(true);

    const startedAt = performance.now();
    const duration = 1800;
    let frame = 0;

    const tick = (now: number) => {
      const value = Math.min(100, ((now - startedAt) / duration) * 100);
      setProgress(value);
      if (value < 100) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setVisible(false);
    }, duration + 350);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden bg-[#050507]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 startup-grid opacity-30" />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[52vw] w-[52vw] max-h-[720px] max-w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[36vw] w-[36vw] max-h-[520px] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/20 border-dashed"
            animate={{ rotate: -360 }}
            transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative flex min-h-full items-center justify-center px-6">
            <div className="flex w-full max-w-xl flex-col items-center text-center">
              <motion.div
                className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] shadow-[0_0_80px_rgba(124,58,237,.25)] backdrop-blur-xl"
                initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute inset-3 rounded-full border border-violet-400/30" />
                <BookOpen className="h-10 w-10 text-violet-300" />
              </motion.div>

              <motion.div
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.55 }}
              >
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.45em] text-violet-300/80">Welcome to the story</p>
                <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">OneWay Watch</h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/45 md:text-base">Your anime and manga universe. Discover something new, pick up where you left off, and stay in the story.</p>
              </motion.div>

              <div className="mt-9 w-full max-w-sm">
                <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                  <span>Preparing your library</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-violet-400" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <motion.div
                className="mt-8 flex items-center gap-2 text-[11px] font-semibold text-white/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Discover</span>
                <span>•</span>
                <Play className="h-3.5 w-3.5" />
                <span>Watch</span>
                <span>•</span>
                <BookOpen className="h-3.5 w-3.5" />
                <span>Read</span>
              </motion.div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-violet-900/10 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
