import React, { useEffect, useMemo, useState } from 'react';
import { Search, Sparkles, Play, ChevronLeft, ChevronRight, SlidersHorizontal, Info } from 'lucide-react';
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
  const secondary = useMemo(() => animeList.filter(item => item.id !== hero?.id).slice(0, 5), [animeList, hero]);

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
    <main className="oneway-home min-h-screen pb-24">
      <header className="topbar sticky top-0 z-50 border-b border-white/5 bg-black/45 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1780px] items-center gap-4 px-5 py-4 md:px-8">
          <div className="brand-mark hidden md:flex items-center gap-3 shrink-0">
            <div className="brand-glyph">OW</div>
            <div>
              <div className="text-sm font-black tracking-[.22em] text-white">ONEWAY</div>
              <div className="text-[9px] font-bold tracking-[.3em] text-white/35">WATCH</div>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-white/55">
            <button className="text-white">Home</button>
            <button onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>Discover</button>
            <button onClick={() => document.getElementById('continue')?.scrollIntoView({ behavior: 'smooth' })}>Continue Watching</button>
            <button onClick={() => navigate('/manga')}>Manga</button>
          </nav>
          <form onSubmit={search} className="ml-auto w-full max-w-[460px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="What do you want to watch?" className="topbar-search w-full rounded-2xl border border-white/10 bg-white/[.045] py-3 pl-11 pr-24 text-sm text-white outline-none transition focus:border-violet-400/60 focus:bg-white/[.06]" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-900/30">Search</button>
            </div>
          </form>
        </div>
      </header>

      {hero && !searchQuery && page === 1 && (
        <section className="hero-shell mx-auto max-w-[1780px] px-4 pt-5 md:px-8 md:pt-7">
          <div className="hero-cinema relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0a0d]">
            <img src={hero.bannerImage || hero.coverImage.extraLarge} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-80" />
            <div className="hero-vignette absolute inset-0" />
            <div className="hero-glow absolute -left-10 bottom-0 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative z-10 grid min-h-[500px] grid-cols-1 items-end gap-8 p-7 md:min-h-[620px] md:grid-cols-[1fr_auto] md:p-12 lg:p-16">
              <div className="max-w-2xl pb-3">
                <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.22em] text-violet-300"><Sparkles size={14} /> Featured tonight</div>
                <h1 className="max-w-3xl text-5xl font-black leading-[.95] tracking-[-.04em] text-white md:text-7xl lg:text-8xl">{titleOf(hero)}</h1>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
                  {hero.format && <span className="hero-pill">{hero.format}</span>}
                  {hero.averageScore > 0 && <span className="hero-pill">★ {(hero.averageScore / 10).toFixed(1)}</span>}
                  {hero.episodes && <span className="hero-pill">{hero.episodes} episodes</span>}
                  {hero.status && <span className="hero-pill">{hero.status.replaceAll('_', ' ')}</span>}
                </div>
                <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 md:text-base">{(hero.description || 'Discover a new world, one episode at a time.').replace(/<[^>]+>/g, ' ')}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button onClick={() => navigate(`/anime/watch/${hero.id}`)} className="cta-primary inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-violet-50"><Play size={17} fill="currentColor" /> Watch now</button>
                  <button onClick={() => navigate(`/anime/watch/${hero.id}`)} className="cta-secondary inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"><Info size={16} /> More info</button>
                </div>
              </div>

              <div className="hidden md:block w-[250px] lg:w-[300px]">
                <div className="hero-side-label mb-3 text-[10px] font-bold uppercase tracking-[.25em] text-white/35">Quick picks</div>
                <div className="space-y-3">
                  {secondary.map((item, index) => (
                    <button key={item.id} onClick={() => navigate(`/anime/watch/${item.id}`)} className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-2 text-left backdrop-blur-md transition hover:border-violet-400/30 hover:bg-black/45">
                      <img src={item.coverImage.large || item.coverImage.extraLarge} alt="" className="h-14 w-10 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-white/90">{titleOf(item)}</div>
                        <div className="mt-1 text-[10px] text-white/35">{item.episodes ? `${item.episodes} EPS` : item.format || 'Anime'} {item.averageScore ? `· ${(item.averageScore / 10).toFixed(1)}` : ''}</div>
                      </div>
                      <span className="text-xs text-white/20 group-hover:text-violet-300">{String(index + 1).padStart(2, '0')}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="continue" className="mx-auto max-w-[1780px] px-4 pt-8 md:px-8">
        <ContinueWatchingSection />
        {continueReading.length > 0 && <ContinueReadingSection />}
      </section>

      <section id="discover" className="mx-auto max-w-[1780px] px-4 pt-10 md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.3em] text-violet-400">Explore the library</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Discover anime</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setFiltersOpen(v => !v)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-4 py-2.5 text-xs font-bold text-white/75"><SlidersHorizontal size={15}/> Filters</button>
            <div className="flex max-w-full gap-2 overflow-x-auto no-scrollbar">{ANIME_SORTS.map(option => <button key={option.value} onClick={() => { setSort(option.value); setPage(1); }} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${sort === option.value ? 'bg-violet-600 text-white shadow-lg shadow-violet-950/30' : 'bg-white/[.04] text-white/45 hover:bg-white/[.08] hover:text-white'}`}>{option.label}</button>)}</div>
          </div>
        </div>

        {filtersOpen && <div className="mt-4 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-4"><button onClick={() => { setGenre(''); setPage(1); }} className={`rounded-lg px-3 py-2 text-xs ${!genre ? 'bg-white text-black' : 'bg-white/5 text-white/60'}`}>All genres</button>{GENRES.map(g => <button key={g} onClick={() => { setGenre(g); setPage(1); }} className={`rounded-lg px-3 py-2 text-xs ${genre === g ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>{g}</button>)}</div>}

        <div className="mt-8 flex items-center justify-between"><div><h3 className="text-lg font-black text-white md:text-xl">{searchQuery ? `Results for “${searchQuery}”` : genre || 'Trending now'}</h3>{searchQuery && <button onClick={clearSearch} className="mt-1 text-xs text-violet-400 hover:text-violet-300">Clear search</button>}</div><div className="flex gap-2"><button disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-white/10 bg-white/5 p-2 disabled:opacity-25"><ChevronLeft size={17}/></button><button disabled={animeList.length < 24 || loading} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-white/10 bg-white/5 p-2 disabled:opacity-25"><ChevronRight size={17}/></button></div></div>

        {loading ? <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">{Array.from({length:12}).map((_,i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-white/[.035]" />)}</div> : animeList.length === 0 ? <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] py-20 text-center text-white/45">No anime found. Try another title or genre.</div> : <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">{animeList.map(item => <TiltCard key={item.id} image={item.coverImage.extraLarge || item.coverImage.large} title={titleOf(item)} badge={item.episodes ? `${item.episodes} EPS` : item.format} color="#8b5cf6" onClick={() => navigate(`/anime/watch/${item.id}`)} />)}</div>}
      </section>
    </main>
  );
}
