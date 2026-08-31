import { fetchMediaById } from './api';

export interface EpisodeInfo {
  id: string;
  number: number;
  title?: string;
  image?: string;
}

export interface AnimeInfo {
  id: string;
  title: string;
  image: string;
  description?: string;
  totalEpisodes: number;
  episodes: EpisodeInfo[];
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data as T;
}

/**
 * Browser-safe anime service.
 * Provider scraping runs behind /api/anime so provider packages and network
 * quirks never have to be shipped to the browser.
 */
export class AnimeService {
  static async searchAnime(query: string): Promise<any[]> {
    if (!query.trim()) return [];
    try {
      const data = await getJson<{ results: any[] }>(`/api/anime/search?q=${encodeURIComponent(query.trim())}`);
      return data.results || [];
    } catch (error) {
      console.error('Anime search error:', error);
      return [];
    }
  }

  static async getAnimeInfo(animeId: string): Promise<AnimeInfo | null> {
    try {
      return await getJson<AnimeInfo>(`/api/anime/info?id=${encodeURIComponent(animeId)}`);
    } catch (error) {
      console.error('Anime info error:', error);
      return null;
    }
  }

  static async getStreamUrl(episodeId: string): Promise<{ url: string; quality: string } | null> {
    try {
      const data = await getJson<{ source: { url: string; quality?: string } }>(`/api/anime/sources?id=${encodeURIComponent(episodeId)}`);
      if (!data.source?.url) return null;
      return { url: data.source.url, quality: data.source.quality || 'auto' };
    } catch (error) {
      console.error('Stream URL error:', error);
      return null;
    }
  }

  static async mapToProvider(anilistId: string): Promise<string | null> {
    try {
      const media: any = await fetchMediaById(anilistId, 'ANIME');
      const title = media?.title?.english || media?.title?.romaji || media?.title?.native;
      if (!title) return null;
      const results = await this.searchAnime(title);
      return results[0]?.id || null;
    } catch (error) {
      console.error('Provider mapping error:', error);
      return null;
    }
  }
}
