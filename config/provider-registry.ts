export type ProviderKind = 'catalog' | 'metadata' | 'manga' | 'playback';

export interface ProviderDefinition {
  id: string;
  name: string;
  kind: ProviderKind;
  repository: string;
  docs: string;
  baseUrl?: string;
  status: 'active' | 'experimental';
  notes: string;
}

/**
 * Real, publicly documented projects/services that OneWay Watch can integrate
 * with. Keep the provider layer replaceable and only expose media you are
 * authorized to access and distribute.
 */
export const PROVIDERS: ProviderDefinition[] = [
  {
    id: 'anilist',
    name: 'AniList',
    kind: 'metadata',
    repository: 'https://github.com/AniList/docs',
    docs: 'https://docs.anilist.co/',
    baseUrl: 'https://graphql.anilist.co',
    status: 'active',
    notes: 'Primary anime + manga metadata, search, genres, scores and airing data.',
  },
  {
    id: 'consumet',
    name: 'Consumet',
    kind: 'playback',
    repository: 'https://github.com/consumet/consumet.ts',
    docs: 'https://consumet.org/extensions/list/',
    baseUrl: 'https://api.consumet.org',
    status: 'experimental',
    notes: 'Provider abstraction for obtaining anime/manga information and source links. Use only with authorized sources.',
  },
  {
    id: 'mangadex',
    name: 'MangaDex',
    kind: 'manga',
    repository: 'https://gitlab.com/mangadex-pub/mangadex-api-docs',
    docs: 'https://api.mangadex.org/docs/',
    baseUrl: 'https://api.mangadex.org',
    status: 'active',
    notes: 'Manga metadata, chapters and reader page delivery. Credit MangaDex and respect its API/content policies.',
  },
  {
    id: 'mangadex-sdk',
    name: 'MangaDex Full API SDK',
    kind: 'manga',
    repository: 'https://github.com/md-y/mangadex-full-api',
    docs: 'https://md-y.github.io/mangadex-full-api/',
    baseUrl: 'https://api.mangadex.org',
    status: 'experimental',
    notes: 'Optional typed Node/browser SDK around the MangaDex API.',
  },
  {
    id: 'jikan',
    name: 'Jikan',
    kind: 'metadata',
    repository: 'https://github.com/jikan-me/jikan-rest',
    docs: 'https://docs.jikan.moe/',
    baseUrl: 'https://api.jikan.moe/v4',
    status: 'experimental',
    notes: 'Unofficial MyAnimeList REST API that can serve as a metadata fallback.',
  },
];

export const getProvider = (id: string) => PROVIDERS.find((provider) => provider.id === id);
