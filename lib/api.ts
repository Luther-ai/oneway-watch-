import { Media } from '../types';

const ANILIST_URL = 'https://graphql.anilist.co';

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  coverImage { extraLarge large color }
  bannerImage
  format
  chapters
  episodes
  averageScore
  genres
  description(asHtml: false)
  studios { nodes { name } }
  status
  startDate { year month day }
`;

const LIST_QUERY = `
query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort], $search: String, $genre: String) {
  Page(page: $page, perPage: $perPage) {
    media(type: $type, sort: $sort, search: $search, genre: $genre, isAdult: false) {
      ${MEDIA_FIELDS}
    }
  }
}`;

const DETAIL_QUERY = `
query ($id: Int, $type: MediaType) {
  Media(id: $id, type: $type) {
    ${MEDIA_FIELDS}
    relations {
      edges { relationType node { id title { romaji english } coverImage { large } type } }
    }
    recommendations(perPage: 8, sort: RATING_DESC) {
      nodes { mediaRecommendation { id title { romaji english } coverImage { large } averageScore } }
    }
  }
}`;

async function anilist<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  try {
    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) throw new Error(`AniList HTTP ${response.status}`);
    const json = await response.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);
    return json.data ?? null;
  } catch (error) {
    console.error('AniList API error:', error);
    return null;
  }
}

export async function fetchMediaList(
  type: 'ANIME' | 'MANGA',
  sort: string = 'TRENDING_DESC',
  search?: string,
  genre?: string,
  page = 1,
  perPage = 24,
): Promise<Media[]> {
  const data = await anilist<{ Page: { media: Media[] } }>(LIST_QUERY, {
    page, perPage, type, sort: [sort], search: search?.trim() || undefined, genre: genre || undefined,
  });
  return data?.Page?.media ?? [];
}

export async function fetchAnime(sort = 'TRENDING_DESC', search?: string, genre?: string, page = 1) {
  return fetchMediaList('ANIME', sort, search, genre, page);
}

export async function fetchMangaList(sort = 'TRENDING_DESC', search?: string, genre?: string, page = 1) {
  return fetchMediaList('MANGA', sort, search, genre, page);
}

export async function fetchMediaById(id: string, type: 'ANIME' | 'MANGA') {
  const data = await anilist<any>(DETAIL_QUERY, { id: Number(id), type });
  return data?.Media ?? null;
}

export const ANIME_SORTS = [
  { value: 'TRENDING_DESC', label: 'Trending' },
  { value: 'POPULARITY_DESC', label: 'Most Popular' },
  { value: 'SCORE_DESC', label: 'Top Rated' },
  { value: 'START_DATE_DESC', label: 'Recently Added' },
  { value: 'END_DATE_DESC', label: 'Recently Finished' },
];

export const MANGA_SORTS = [
  { value: 'TRENDING_DESC', label: 'Trending' },
  { value: 'POPULARITY_DESC', label: 'Most Popular' },
  { value: 'SCORE_DESC', label: 'Top Rated' },
  { value: 'START_DATE_DESC', label: 'Recently Added' },
];

export const GENRES = ['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Slice of Life','Sports','Supernatural','Thriller'];
