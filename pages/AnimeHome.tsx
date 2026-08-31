import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles, Play, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TiltCard from '../components/ui/TiltCard';
import ContinueWatchingSection from '../components/ui/ContinueWatchingSection';
import ContinueReadingSection from '../components/ui/ContinueReadingSection';
import { fetchAnime, ANIME_SORTS, GENRES } from '../lib/api';
import { useMangaStore } from '../lib/store';
import { Media } from '../types';

const titleOf = (item: Media) => item.title.english || item.title.romaji || item.title.native;

export default function AnimeHome() {
  const navigate = useNavigate();
  const [animeList, setAnimeList] = useState<Media[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('TRENDING_DESC');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { continueReading } = useMangaStore();

  const loadAnime = async (query = searchQuery) => {
    setLoading(true);
    const results = await fetchAnime(sort, query || undefined, genre || undefined, page);
    setAnimeList(results);
    setLoading(false);
  };

  useEffect(() => { loadAnime(); }, [sort, genre, page]);

  const hero = useMemo(() => animeList.find(a => a.bannerImage) || animeList[0], [animeList]);

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setLoading(true);
    const results = await fetchAnime(sort, searchQuery.trim() || undefined, genre || undefined, 1);
    setAnimeList(results);
    setLoading(false);
  };

  const clearSearch = async () => {
    setSearchQuery('');
    setPage(1);
    setLoading(true);
    const results = await fetchAnime(sort, undefined, genre || undefined, 1);
    setAnimeList(results);
    setLoading(false);
  };

  return (
    <main className="min-h-screen pl-4 md:pl-24 pt-16 pb-24">
      {hero && !searchQuery && page === 1 && (
        <section className="relative mx-4 md:mx-8 max-w-[1700px] h-[440px] md:h-[560px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d12]">
          <img src={hero.bannerImage || hero.coverImage.extraLarge} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65" />
          <div className="hero-fade absolute inset-0" />
          <div className="relative z-10 flex h-full max-w-2xl flex-col justify-end p-7 md:p-12">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-violet-300"><Sparkles size={14} /> Featured anime</div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">{titleOf(hero)}</h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
              {hero.format && <span className="rounded-full bg-white/10 px-3 py-1">{hero.format}</span>}
              {hero.averageScore > 0 && <span className="rounded-full bg-white/10 px-3 py-1">★ {(hero.averageScore / 10).toFixed(1)}</span>}
              {hero.episodes && <span className="rounded-full bg-white/10 px-3 py-1">{hero.episodes} episodes</span>}
            </div>
            <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-white/70">{(hero.description || 'Discover your next series.').replace(/<[^>]+>/g, ' ')}</p>
            <button onClick={() => navigate(`/anime/watch/${hero.id}`)} className="mt-6 flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-black transition hover:scale-[1.02]"><Play size={17} fill="currentColor" /> Start watching</button>
          </div>
        </section>
      )}

      <section className="mx-4 md:mx-8 mt-8 max-w-[1700px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-400">OneWay Watch</p><h2 className="mt-1 text-3xl font-black text-white">Anime</h2><p className="mt-1 text-sm text-white/45">Discover, watch and keep your progress synced locally.</p></div>
          <form onSubmit={search} className="w-full lg:w-[430px]"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18}/><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search anime..." className="w-full rounded-2xl border border-white/10 bg-white/[.04] py-3 pl-11 pr-24 text-sm text-white outline-none transition focus:border-violet-500/60"/><button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold">Search</button></div></form>
        </div>

        <ContinueWatchingSection />
        {continueReading.length > 0 && <ContinueReadingSection />}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button onClick={() => setFiltersOpen(v => !v)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-bold text-white/80"><SlidersHorizontal size={15}/> Filters</button>
          <div className="flex max-w-full gap-2 overflow-x-auto no-scrollbar">{ANIME_SORTS.map(option => <button key={option.value} onClick={() => { setSort(option.value); setPage(1); }} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${sort === option.value ? 'bg-violet-600 text-white' : 'bg-white/[.04] text-white/55 hover:bg-white/[.08]'}`}>{option.label}</button>)}</div>
        </div>

        {filtersOpen && <div className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-4"><button onClick={() => { setGenre(''); setPage(1); }} className={`rounded-lg px-3 py-2 text-xs ${!genre ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}>All genres</button>{GENRES.map(g => <button key={g} onClick={() => { setGenre(g); setPage(1); }} className={`rounded-lg px-3 py-2 text-xs ${genre === g ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>{g}</button>)}</div>}

        <div className="mt-7 flex items-center justify-between"><div><h3 className="text-xl font-black text-white">{searchQuery ? `Results for “${searchQuery}”` : genre || 'Discover anime'}</h3>{searchQuery && <button onClick={clearSearch} className="mt-1 text-xs text-violet-400 hover:text-violet-300">Clear search</button>}</div><div className="flex gap-2"><button disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)} className="rounded-lg bg-white/5 p-2 disabled:opacity-25"><ChevronLeft size={17}/></button><button disabled={animeList.length < 24 || loading} onClick={() => setPage(p => p + 1)} className="rounded-lg bg-white/5 p-2 disabled:opacity-25"><ChevronRight size={17}/></button></div></div>

        {loading ? <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">{Array.from({length:12}).map((_,i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-white/[.04]" />)}</div> : animeList.length === 0 ? <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] py-20 text-center text-white/45">No anime found. Try another title or genre.</div> : <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">{animeList.map(item => <TiltCard key={item.id} image={item.coverImage.extraLarge || item.coverImage.large} title={titleOf(item)} badge={item.episodes ? `${item.episodes} EPS` : item.format} color="#8b5cf6" onClick={() => navigate(`/anime/watch/${item.id}`)} />)}</div>}
      </section>
    </main>
  );
}
