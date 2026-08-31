import { ANIME, META } from '@consumet/extensions';

// Initialize providers
// Use 'any' casting to bypass TypeScript checks and ensure runtime compatibility
// with the CDN version of @consumet/extensions
const AnimeLib = ANIME as any;
const MetaLib = META as any;

// Use Gogoanime as the provider (Hianime/Zoro might not be in this version)
const provider = new AnimeLib.Gogoanime();
const anilist = new MetaLib.Anilist();

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

export class AnimeService {
  // Search anime by title
  static async searchAnime(query: string): Promise<any[]> {
    try {
      if (!provider) throw new Error("Provider not initialized");
      const results = await provider.search(query);
      return results.results || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  // Get anime info with episodes
  static async getAnimeInfo(animeId: string): Promise<AnimeInfo | null> {
    try {
      if (!provider) throw new Error("Provider not initialized");
      const info = await provider.fetchAnimeInfo(animeId);
      
      return {
        id: info.id,
        title: typeof info.title === 'string' ? info.title : (info.title as any)?.english || (info.title as any)?.romaji || 'Unknown Title',
        image: info.image || '',
        description: typeof info.description === 'string' ? info.description : '',
        totalEpisodes: info.totalEpisodes || 0,
        episodes: info.episodes?.map((ep: any) => ({
          id: ep.id,
          number: ep.number,
          title: ep.title,
          image: ep.image
        })) || []
      };
    } catch (error) {
      console.error('Anime info error:', error);
      return null;
    }
  }

  // Get streaming URL for specific episode
  static async getStreamUrl(episodeId: string): Promise<{ url: string; quality: string } | null> {
    try {
      if (!provider) throw new Error("Provider not initialized");
      const sources = await provider.fetchEpisodeSources(episodeId);
      
      if (!sources.sources || sources.sources.length === 0) {
        return null;
      }

      // Prefer HLS streams
      const hlsSource = sources.sources.find((s: any) => s.isM3U8);
      if (hlsSource) {
        return {
          url: hlsSource.url,
          quality: hlsSource.quality || 'auto'
        };
      }

      // Fallback to first available source
      return {
        url: sources.sources[0].url,
        quality: sources.sources[0].quality || 'auto'
      };
    } catch (error) {
      console.error('Stream URL error:', error);
      return null;
    }
  }

  // Map AniList ID to Provider ID
  static async mapToProvider(anilistId: string): Promise<string | null> {
    try {
      if (!anilist) throw new Error("Metadata provider not initialized");
      const anilistInfo = await anilist.fetchAnimeInfo(anilistId);
      // @ts-ignore
      const searchQuery = anilistInfo.title?.english || anilistInfo.title?.romaji;
      
      if (!searchQuery) return null;

      const results = await this.searchAnime(searchQuery);
      if (results.length > 0) {
        return results[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Mapping error:', error);
      return null;
    }
  }
}