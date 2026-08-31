import { ANIME } from '@consumet/extensions';

export type AnimeProvider = {
  name: string;
  instance: any;
};

const PROVIDER_NAMES = [
  'Hianime',
  'HiAnime',
  'AnimeKai',
  'AnimePahe',
  'KickAssAnime',
  'Gogoanime',
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

export function getProvider(name: string | null | undefined): AnimeProvider | null {
  if (!name) return null;
  return getAvailableProviders().find((provider) => provider.name.toLowerCase() === name.toLowerCase()) || null;
}

export function encodeProviderId(provider: string, id: string): string {
  return `${provider}::${id}`;
}

export function decodeProviderId(value: string): { provider: string | null; id: string } {
  const separator = value.indexOf('::');
  if (separator === -1) return { provider: null, id: value };
  return {
    provider: value.slice(0, separator),
    id: value.slice(separator + 2),
  };
}

export async function searchAnimeAcrossProviders(query: string) {
  const errors: string[] = [];

  for (const provider of getAvailableProviders()) {
    try {
      const response: any = await provider.instance.search(query);
      const results = Array.isArray(response?.results) ? response.results : [];
      if (results.length) {
        return {
          provider: provider.name,
          results: results.map((item: any) => ({
            ...item,
            id: encodeProviderId(provider.name, String(item?.id || '')),
          })),
          errors,
        };
      }
    } catch (error: any) {
      errors.push(`${provider.name}: ${error?.message || 'request failed'}`);
    }
  }

  return { provider: null, results: [], errors };
}

export async function fetchAnimeInfoAcrossProviders(rawId: string) {
  const decoded = decodeProviderId(rawId);
  const preferred = getProvider(decoded.provider);
  const providers = preferred
    ? [preferred, ...getAvailableProviders().filter((item) => item.name !== preferred.name)]
    : getAvailableProviders();
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const info: any = await provider.instance.fetchAnimeInfo(decoded.id);
      if (info && typeof info === 'object') {
        return { provider: provider.name, info, errors };
      }
    } catch (error: any) {
      errors.push(`${provider.name}: ${error?.message || 'request failed'}`);
    }
  }

  return { provider: null, info: null, errors };
}

export async function fetchEpisodeSourcesAcrossProviders(rawId: string) {
  const decoded = decodeProviderId(rawId);
  const preferred = getProvider(decoded.provider);
  const providers = preferred
    ? [preferred, ...getAvailableProviders().filter((item) => item.name !== preferred.name)]
    : getAvailableProviders();
  const errors: string[] = [];

  for (const provider of providers) {
    try {
      const result: any = await provider.instance.fetchEpisodeSources(decoded.id);
      const sources = Array.isArray(result?.sources)
        ? result.sources.filter((source: any) => source?.url)
        : [];
      if (sources.length) {
        return { provider: provider.name, sources, errors };
      }
    } catch (error: any) {
      errors.push(`${provider.name}: ${error?.message || 'request failed'}`);
    }
  }

  return { provider: null, sources: [], errors };
}
