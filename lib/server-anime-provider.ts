import { ANIME } from '@consumet/extensions';

export type AnimeProvider = {
  name: string;
  instance: any;
};

export type NormalizedSource = {
  url: string;
  quality: string;
  isM3U8: boolean;
  type: 'hls' | 'mp4' | 'unknown';
  headers?: Record<string, string>;
};

const PROVIDER_NAMES = [
  'Hianime',
  'HiAnime',
  'AnimeKai',
  'AnimePahe',
  'KickAssAnime',
  'Gogoanime',
];

const PROVIDER_TIMEOUT_MS = 12_000;
let providerCache: AnimeProvider[] | null = null;

async function withTimeout<T>(task: Promise<T>, provider: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${provider}: provider request timed out after ${PROVIDER_TIMEOUT_MS}ms`)),
          PROVIDER_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function safeProviderId(id: unknown): string {
  return String(id ?? '').trim();
}

export function getAvailableProviders(): AnimeProvider[] {
  if (providerCache) return providerCache;

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

  providerCache = providers;
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
  const raw = String(value || '').trim();
  const separator = raw.indexOf('::');
  if (separator === -1) return { provider: null, id: raw };
  return {
    provider: raw.slice(0, separator),
    id: raw.slice(separator + 2),
  };
}

export function normalizeSources(rawSources: any[]): NormalizedSource[] {
  const seen = new Set<string>();

  return rawSources
    .map((source: any): NormalizedSource | null => {
      const url = String(source?.url || source?.link || '').trim();
      if (!url) return null;

      const lower = url.toLowerCase();
      const isM3U8 = Boolean(source?.isM3U8) || lower.includes('.m3u8');
      const isMp4 = lower.includes('.mp4');
      const type: NormalizedSource['type'] = isM3U8 ? 'hls' : isMp4 ? 'mp4' : 'unknown';
      const quality = String(source?.quality || source?.label || source?.resolution || 'auto');
      const key = `${url}|${quality}`;
      if (seen.has(key)) return null;
      seen.add(key);

      const headers = source?.headers && typeof source.headers === 'object'
        ? Object.fromEntries(
            Object.entries(source.headers)
              .filter(([key, value]) => typeof key === 'string' && typeof value === 'string')
              .map(([key, value]) => [key, String(value)]),
          )
        : undefined;

      return { url, quality, isM3U8, type, ...(headers ? { headers } : {}) };
    })
    .filter((source): source is NormalizedSource => Boolean(source));
}

function orderedProviders(preferredName: string | null) {
  const providers = getAvailableProviders();
  const preferred = getProvider(preferredName);
  if (!preferred) return providers;
  return [preferred, ...providers.filter((item) => item.name !== preferred.name)];
}

export async function searchAnimeAcrossProviders(query: string) {
  const cleanQuery = String(query || '').trim();
  const errors: string[] = [];
  if (!cleanQuery) return { provider: null, results: [], errors: ['Search query is empty'] };

  for (const provider of getAvailableProviders()) {
    try {
      const response: any = await withTimeout(provider.instance.search(cleanQuery), provider.name);
      const results = Array.isArray(response?.results) ? response.results : [];
      const validResults = results.filter((item: any) => safeProviderId(item?.id));
      if (validResults.length) {
        return {
          provider: provider.name,
          results: validResults.map((item: any) => ({
            ...item,
            id: encodeProviderId(provider.name, safeProviderId(item?.id)),
          })),
          errors,
        };
      }
      errors.push(`${provider.name}: no results`);
    } catch (error: any) {
      errors.push(`${provider.name}: ${error?.message || 'request failed'}`);
    }
  }

  return { provider: null, results: [], errors };
}

export async function fetchAnimeInfoAcrossProviders(rawId: string) {
  const decoded = decodeProviderId(rawId);
  if (!decoded.id) return { provider: null, info: null, errors: ['Missing provider id'] };

  const errors: string[] = [];
  for (const provider of orderedProviders(decoded.provider)) {
    try {
      const info: any = await withTimeout(provider.instance.fetchAnimeInfo(decoded.id), provider.name);
      if (info && typeof info === 'object') {
        return { provider: provider.name, info, errors };
      }
      errors.push(`${provider.name}: empty anime info`);
    } catch (error: any) {
      errors.push(`${provider.name}: ${error?.message || 'request failed'}`);
    }
  }

  return { provider: null, info: null, errors };
}

export async function fetchEpisodeSourcesAcrossProviders(rawId: string) {
  const decoded = decodeProviderId(rawId);
  if (!decoded.id) return { provider: null, sources: [], errors: ['Missing episode id'] };

  const errors: string[] = [];
  for (const provider of orderedProviders(decoded.provider)) {
    try {
      const result: any = await withTimeout(provider.instance.fetchEpisodeSources(decoded.id), provider.name);
      const rawSources = Array.isArray(result?.sources) ? result.sources : [];
      const sources = normalizeSources(rawSources);
      if (sources.length) {
        return { provider: provider.name, sources, errors };
      }
      errors.push(`${provider.name}: no playable sources returned`);
    } catch (error: any) {
      errors.push(`${provider.name}: ${error?.message || 'request failed'}`);
    }
  }

  return { provider: null, sources: [], errors };
}
