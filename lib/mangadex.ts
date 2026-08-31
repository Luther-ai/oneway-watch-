import { Chapter } from '../types';

const BASE_URL = "https://api.mangadex.org";

export async function getMangaDexId(title: string) {
  try {
    const res = await fetch(`${BASE_URL}/manga?title=${encodeURIComponent(title)}&limit=1`);
    const data = await res.json();
    return data.data[0]?.id;
  } catch (e) { return null; }
}

export async function getChapters(mangaDexId: string): Promise<Chapter[]> {
  try {
    const res = await fetch(`${BASE_URL}/manga/${mangaDexId}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=100`);
    const data = await res.json();
    return data.data.map((ch: any) => ({
      id: ch.id,
      chapter: ch.attributes.chapter,
      title: ch.attributes.title || `Chapter ${ch.attributes.chapter}`,
      date: new Date(ch.attributes.publishAt).toLocaleDateString(),
    }));
  } catch (e) { return []; }
}

export async function getChapterPages(chapterId: string) {
  try {
    const res = await fetch(`${BASE_URL}/at-home/server/${chapterId}`);
    const data = await res.json();
    return data.chapter.data.map((file: string) => `${data.baseUrl}/data/${data.chapter.hash}/${file}`);
  } catch (e) { return []; }
}