import { ANIME } from '@consumet/extensions';

export type AnimeProvider = {
  name: string;
  instance: any;
};

// Consumet has changed provider availability over time. Build the provider
// list dynamically so a missing/renamed provider cannot crash the API.
const PROVIDER_NAMES = [
  'Gogoanime',
  'Hianime',
  'HiAnime',
  'AnimeKai',
  'AnimePahe',
  'KickAssAnime',
];

export function getAvailableProviders(): AnimeProvider[] {
  const group: any = ANIME as any;
  const providers: AnimeProvider[] = [];

  for (const name of PROVIDER_NAMES) {
    const Provider = group?.[name];
    if (typeof Provider !== 'function') continue;
    try {
      providers.push({ name, instance: new Provider() });
    } catch (error) {
      console.warn(`[anime-provider] Failed to initialize ${name}`, error);
    }
  }

  return providers;
}

export async function searchAnimeAcrossProviders(query: string) {
  const errors: string[] = [];

  for (const provider of getAvailableProviders()) {
    try {
      const response: any = await provider.instance.search(query);
      const results = Array.isArray(response?.results) ? response.results : [];
      if (results.length) {
        return { provider: provider.name, results };
      }
    } catch (error: any) {
      errors.push(`${provider.name}: ${error?.message || 'request failed'}`);
    }
  }

  return { provider: null, results: [], errors };
}

export async function fetchAnimeInfoAcrossProviders(id: string) {
  const errors: string[] = [];

  for (const provider of getAvailableProviders()) {
    try {
      const info: any = await provider.instance.fetchAnimeInfo(id);
      if (info && typeof info === 'object') {
        return { provider: provider.name, info };
      }
    } catch (error: any) {
      errors.push(`${provider.name}: ${error?.message || 'request failed'}`);
    }
  }

  return { provider: null, info: null, errors };
}

export async function fetchEpisodeSourcesAcrossProviders(id: string) {
  const errors: string[] = [];

  for (const provider of getAvailableProviders()) {
    try {
      const result: any = await provider.instance.fetchEpisodeSources(id);
      const sources = Array.isArray(result?.sources)
        ? result.sources.filter((source: any) => source?.url)
        : [];
      if (sources.length) {
        return { provider: provider.name, sources };
      }
    } catch (error: any) {
      errors.push(`${provider.name}: ${error?.message || 'request failed'}`);
    }
  }

  return { provider: null, sources: [], errors };
}
