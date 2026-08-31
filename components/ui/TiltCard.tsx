import React from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  image: string;
  title: string;
  color?: string;
  badge?: string;
  onClick?: () => void;
}

export default function TiltCard({ image, title, color = '#8b5cf6', badge, onClick }: TiltCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -7 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-[18px] border border-white/8 bg-[#0b0b0f] text-left shadow-[0_18px_50px_rgba(0,0,0,.25)] outline-none transition hover:border-white/15 hover:shadow-[0_22px_60px_rgba(0,0,0,.38)] focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <div className="absolute inset-0 bg-white/[.03]" />
        <img src={image} alt={title} className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-108 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent opacity-90" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />

        {badge && <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-black tracking-wide text-white/90 backdrop-blur-md">{badge}</div>}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="line-clamp-2 text-sm font-black leading-tight text-white transition group-hover:text-violet-200 md:text-[15px]">{title}</h3>
          <div className="mt-3 h-[2px] w-8 rounded-full transition-all duration-300 group-hover:w-16" style={{ background: color }} />
        </div>
      </div>
    </motion.button>
  );
}
