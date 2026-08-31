import { Media } from '../types';

const ANILIST_QUERY = `
query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort], $search: String) {
  Page (page: $page, perPage: $perPage) {
    media (type: $type, sort: $sort, search: $search, isAdult: false) {
      id
      title { romaji english native }
      coverImage { extraLarge large color }
      bannerImage
      format
      chapters
      episodes
      averageScore
      genres
      description
      studios { nodes { name } }
      status
      startDate { year month day }
    }
  }
}
`;

async function fetchFromAniList(type: "ANIME" | "MANGA", sort: string, search?: string): Promise<Media[]> {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: { page: 1, perPage: 24, type, sort: [sort], search }
      })
    });
    const data = await response.json();
    return data.data.Page.media;
  } catch (error) {
    console.error("AniList Fetch Error:", error);
    return [];
  }
}

export async function fetchAnime(sort: string = "TRENDING_DESC", search?: string) {
  return fetchFromAniList("ANIME", sort, search);
}

export async function fetchMangaList(sort: string = "TRENDING_DESC", search?: string) {
  return fetchFromAniList("MANGA", sort, search);
}

// Helper for fetching single detail (simulated by fetching popular and finding, 
// in a real app this would query by ID directly)
export async function fetchMediaById(id: string, type: "ANIME" | "MANGA") {
    // Note: For this demo, we are reusing the list fetch. 
    // In production, you would write a specific query for single ID.
    // We will do a small hack: search for trending/popular and try to find it, 
    // or return a specific single query if needed. 
    // For reliability in this demo, let's implement a direct ID fetch.
    
    const SINGLE_QUERY = `
    query ($id: Int) {
      Media (id: $id) {
        id
        title { romaji english native }
        coverImage { extraLarge large color }
        bannerImage
        format
        chapters
        episodes
        averageScore
        genres
        description
        studios { nodes { name } }
        status
        startDate { year month day }
      }
    }
    `;

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              query: SINGLE_QUERY,
              variables: { id: parseInt(id) }
            })
          });
          const data = await response.json();
          return data.data.Media;
    } catch (e) {
        console.error(e);
        return null;
    }
}