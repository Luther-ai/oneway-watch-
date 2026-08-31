import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Media, ContinueWatchingItem, ContinueReadingItem } from '../types';

type ReaderMode = 'webtoon' | 'ltr' | 'rtl';

interface WatchState {
  continueWatching: ContinueWatchingItem[];
  saveWatchProgress: (item: Omit<ContinueWatchingItem, 'updatedAt'>) => void;
  updateWatchTime: (animeId: string, episodeId: string, currentTime: number, duration: number) => void;
  removeWatchProgress: (animeId: string) => void;
  clearWatchHistory: () => void;
  getLastWatchedEpisode: (animeId: string) => ContinueWatchingItem | undefined;
}

export const useWatchStore = create(
  persist<WatchState>(
    (set, get) => ({
      continueWatching: [],
      saveWatchProgress: (item) => set((state) => {
        const existing = state.continueWatching.filter((w) => w.id !== item.id);
        const newItem: ContinueWatchingItem = {
          ...item,
          updatedAt: Date.now(),
        };
        // Keep the latest 30 items, sorted by most recently updated
        return {
          continueWatching: [newItem, ...existing].slice(0, 30),
        };
      }),
      updateWatchTime: (animeId, episodeId, currentTime, duration) => set((state) => {
        const progressPercent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
        return {
          continueWatching: state.continueWatching.map((item) => {
            if (item.id === animeId && item.episodeId === episodeId) {
              return {
                ...item,
                currentTime,
                duration,
                progressPercent,
                updatedAt: Date.now(),
              };
            }
            return item;
          }),
        };
      }),
      removeWatchProgress: (animeId) => set((state) => ({
        continueWatching: state.continueWatching.filter((w) => w.id !== animeId),
      })),
      clearWatchHistory: () => set({ continueWatching: [] }),
      getLastWatchedEpisode: (animeId) => {
        return get().continueWatching.find((w) => w.id === animeId);
      },
    }),
    { name: 'anime-watch-storage' }
  )
);

interface MangaState {
  // Library
  library: Media[];
  addToLibrary: (manga: Media) => void;
  removeFromLibrary: (id: number) => void;
  
  // Continue Reading History
  continueReading: ContinueReadingItem[];
  saveReadingProgress: (item: Omit<ContinueReadingItem, 'updatedAt'>) => void;
  updateReadingPage: (chapterId: string, page: number, totalPages: number) => void;
  removeReadingProgress: (mangaId: string | number) => void;
  clearReadingHistory: () => void;
  getLastReadChapter: (mangaId: string | number) => ContinueReadingItem | undefined;

  // Reading Progress Map (legacy + quick lookup)
  history: { [mangaId: string]: string }; // mangaId -> chapterId
  readChapters: string[]; // List of read chapter IDs
  markChapterRead: (id: string) => void;
  updateHistory: (mangaId: string, chapterId: string) => void;

  // Settings
  readerMode: ReaderMode;
  setReaderMode: (mode: ReaderMode) => void;
  bgWhite: boolean; // For manga that needs white background
  toggleBg: () => void;
}

export const useMangaStore = create(
  persist<MangaState>(
    (set, get) => ({
      library: [],
      addToLibrary: (manga) => set((state) => ({ 
        library: [...state.library.filter(m => m.id !== manga.id), manga] 
      })),
      removeFromLibrary: (id) => set((state) => ({ 
        library: state.library.filter((m) => m.id !== id) 
      })),

      continueReading: [],
      saveReadingProgress: (item) => set((state) => {
        const idStr = String(item.id);
        const existing = state.continueReading.filter((r) => String(r.id) !== idStr);
        const newItem: ContinueReadingItem = {
          ...item,
          updatedAt: Date.now(),
        };
        return {
          continueReading: [newItem, ...existing].slice(0, 30),
          history: { ...state.history, [idStr]: item.chapterId },
          readChapters: state.readChapters.includes(item.chapterId) 
            ? state.readChapters 
            : [...state.readChapters, item.chapterId],
        };
      }),
      updateReadingPage: (chapterId, page, totalPages) => set((state) => ({
        continueReading: state.continueReading.map((item) => {
          if (item.chapterId === chapterId) {
            return {
              ...item,
              page,
              totalPages,
              updatedAt: Date.now(),
            };
          }
          return item;
        }),
      })),
      removeReadingProgress: (mangaId) => set((state) => {
        const idStr = String(mangaId);
        return {
          continueReading: state.continueReading.filter((r) => String(r.id) !== idStr),
        };
      }),
      clearReadingHistory: () => set({ continueReading: [] }),
      getLastReadChapter: (mangaId) => {
        const idStr = String(mangaId);
        return get().continueReading.find((r) => String(r.id) === idStr);
      },

      history: {},
      readChapters: [],
      markChapterRead: (id) => set((state) => ({ 
        readChapters: state.readChapters.includes(id) ? state.readChapters : [...state.readChapters, id] 
      })),
      updateHistory: (mId, cId) => set((state) => ({
        history: { ...state.history, [mId]: cId }
      })),

      readerMode: 'webtoon',
      setReaderMode: (mode) => set({ readerMode: mode }),
      bgWhite: false,
      toggleBg: () => set((state) => ({ bgWhite: !state.bgWhite })),
    }),
    { name: 'manga-storage' }
  )
);
