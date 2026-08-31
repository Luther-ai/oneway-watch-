import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white text-white hover:text-black transition-all shadow-xl group"
    >
      <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
    </button>
  );
}