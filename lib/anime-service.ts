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
  provider?: string | null;
  providerUnavailable?: boolean;
}

type JsonResponse = Record<string, any>;

async function getJson(url: string): Promise<JsonResponse> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data && typeof data === 'object' ? data : {};
}

export class AnimeService {
  static async searchAnime(query: string): Promise<any[]> {
    if (!query.trim()) return [];
    try {
      const data = await getJson(`/api/anime/search?q=${encodeURIComponent(query.trim())}`);
      return Array.isArray(data.results) ? data.results : [];
    } catch (error) {
      console.error('Anime search error:', error);
      return [];
    }
  }

  static async getAnimeInfo(animeId: string): Promise<AnimeInfo | null> {
    try {
      const data = await getJson(`/api/anime/info?id=${encodeURIComponent(animeId)}`);
      const episodes = Array.isArray(data.episodes)
        ? data.episodes
            .map((ep: any, index: number) => ({
              id: String(ep?.id || ep?.episodeId || ''),
              number: Number(ep?.number ?? ep?.episodeNumber ?? index + 1),
              title: ep?.title || ep?.name || `Episode ${index + 1}`,
              image: ep?.image || ep?.thumbnail || undefined,
            }))
            .filter((ep: EpisodeInfo) => ep.id && Number.isFinite(ep.number))
        : [];

      return {
        id: String(data.id || animeId),
        title: String(data.title || 'Unknown Title'),
        image: String(data.image || ''),
        description: typeof data.description === 'string' ? data.description : '',
        totalEpisodes: Number(data.totalEpisodes || episodes.length || 0),
        episodes,
        provider: data.provider || null,
        providerUnavailable: Boolean(data.providerUnavailable),
      };
    } catch (error) {
      console.error('Anime info error:', error);
      return null;
    }
  }

  static async getStreamUrl(episodeId: string): Promise<{ url: string; quality: string } | null> {
    try {
      const data = await getJson(`/api/anime/sources?id=${encodeURIComponent(episodeId)}`);
      if (!data.source || typeof data.source.url !== 'string' || !data.source.url) return null;
      return { url: data.source.url, quality: String(data.source.quality || 'auto') };
    } catch (error) {
      console.error('Stream URL error:', error);
      return null;
    }
  }

  static async mapToProvider(anilistId: string): Promise<string | null> {
    try {
      // Already mapped by a provider-aware search result.
      if (String(anilistId).includes('::')) return String(anilistId);

      const numericId = Number(anilistId);
      if (!Number.isFinite(numericId)) return null;

      const mediaResponse = await fetch(`/api/anime/resolve?id=${encodeURIComponent(String(numericId))}`, {
        headers: { Accept: 'application/json' },
      });
      const mediaData = await mediaResponse.json().catch(() => ({}));
      if (mediaResponse.ok && mediaData?.providerId) return String(mediaData.providerId);

      // Compatibility fallback: resolve the AniList title in the browser-side API layer.
      const { fetchMediaById } = await import('./api');
      const media: any = await fetchMediaById(String(numericId), 'ANIME');
      const title = media?.title?.english || media?.title?.romaji || media?.title?.native;
      if (!title) return null;

      const results = await this.searchAnime(String(title));
      const first = Array.isArray(results) ? results[0] : null;
      return first?.id ? String(first.id) : null;
    } catch (error) {
      console.error('Provider mapping error:', error);
      return null;
    }
  }
}
