export interface MediaTitle {
  romaji: string;
  english: string | null;
  native: string;
}

export interface MediaCover {
  extraLarge: string;
  large: string;
  color: string;
}

export interface Media {
  id: number;
  title: MediaTitle;
  coverImage: MediaCover;
  bannerImage: string | null;
  format: string;
  chapters: number | null;
  episodes: number | null;
  averageScore: number;
  genres: string[];
  description: string;
  studios: { nodes: { name: string }[] };
  status: string;
  startDate: { year: number; month: number; day: number };
}

export interface Chapter {
  id: string;
  chapter: string;
  title: string;
  date: string;
}

export interface ContinueWatchingItem {
  id: string; // Anime ID (or provider ID / anilist ID)
  title: string;
  image: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle?: string;
  totalEpisodes?: number;
  progressPercent?: number; // 0 to 100
  currentTime?: number;
  duration?: number;
  updatedAt: number; // Date.now() timestamp
}

export interface ContinueReadingItem {
  id: string | number; // Manga ID (AniList or MangaDex)
  title: string;
  coverImage: string;
  chapterId: string;
  chapterNumber: string | number;
  chapterTitle?: string;
  totalChapters?: number | null;
  page?: number;
  totalPages?: number;
  updatedAt: number; // Date.now() timestamp
}
