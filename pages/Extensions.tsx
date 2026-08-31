import React from 'react';
import { Server, ShieldCheck, Download, Trash2 } from 'lucide-react';

const SOURCES = [
    { name: "MangaDex", lang: "Multi", version: "1.4.2", installed: true },
    { name: "MangaSee", lang: "English", version: "1.2.0", installed: false },
    { name: "Comick", lang: "English", version: "1.0.9", installed: false },
    { name: "TMO", lang: "Spanish", version: "2.1.0", installed: true },
];

export default function Extensions() {
  return (
    <div className="min-h-screen p-6 md:p-12 pt-24">
      <div className="flex items-center gap-3 mb-8">
        <Server className="text-blue-500" size={32} />
        <h1 className="text-3xl font-black text-white">EXTENSIONS</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
          {SOURCES.map((s, i) => (
              <div key={i} className="bg-[#111] border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center font-bold text-gray-500 group-hover:text-white transition-colors">
                          {s.name[0]}
                      </div>
                      <div>
                          <h3 className="font-bold text-white">{s.name}</h3>
                          <p className="text-xs text-gray-500">{s.lang} • v{s.version}</p>
                      </div>
                  </div>
                  
                  {s.installed ? (
                      <button className="px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-xs font-bold transition-colors border border-white/5">
                          UNINSTALL
                      </button>
                  ) : (
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors">
                          INSTALL
                      </button>
                  )}
              </div>
          ))}
      </div>
    </div>
  );
}