import React from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  image: string;
  title: string;
  color?: string;
  badge?: string;
  onClick?: () => void;
}

export default function TiltCard({ image, title, color = "#3b82f6", badge, onClick }: TiltCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer shadow-lg group"
    >
      <div className="absolute inset-0 bg-gray-900" />
      <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100" />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
      
      {badge && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
          {badge}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <div className="h-0.5 w-0 group-hover:w-full bg-blue-500 mt-2 transition-all duration-300" />
      </div>
    </motion.div>
  );
}