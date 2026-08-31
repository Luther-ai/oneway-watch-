import { Chapter } from '../types';

const BASE_URL = 'https://api.mangadex.org';
const REQUEST_TIMEOUT_MS = 10_000;

async function mdFetch(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    if (!res.ok) throw new Error(`MangaDex HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function getMangaDexId(title: string, alternatives: string[] = []) {
  const candidates = [title, ...alternatives].filter((value, index, arr) => value?.trim() && arr.indexOf(value) === index).slice(0, 6);
  for (const candidate of candidates) {
    try {
      const params = new URLSearchParams({ title: candidate, limit: '10', 'includes[]': 'cover_art' });
      const data = await mdFetch(`${BASE_URL}/manga?${params.toString()}`);
      const rows = Array.isArray(data?.data) ? data.data : [];
      const normalized = candidate.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      const best = rows.sort((a: any, b: any) => {
        const score = (item: any) => {
          const titles = item?.attributes?.title || {};
          const values = Object.values(titles).map(String);
          return values.some(v => v.toLowerCase() === normalized) ? 100 : values.some(v => v.toLowerCase().includes(normalized)) ? 80 : 0;
        };
        return score(b) - score(a);
      })[0];
      if (best?.id) return String(best.id);
    } catch (error) {
      console.warn('MangaDex title lookup failed:', candidate, error);
    }
  }
  return null;
}

export async function getChapters(mangaDexId: string): Promise<Chapter[]> {
  const chapters: Chapter[] = [];
  let offset = 0;

  try {
    // Pull multiple pages so long-running manga do not appear to have zero/very few chapters.
    for (let page = 0; page < 5; page++) {
      const params = new URLSearchParams({ limit: '100', offset: String(offset), 'order[chapter]': 'desc' });
      params.append('translatedLanguage[]', 'en');
      params.append('includes[]', 'scanlation_group');
      const data = await mdFetch(`${BASE_URL}/manga/${encodeURIComponent(mangaDexId)}/feed?${params.toString()}`);
      const rows = Array.isArray(data?.data) ? data.data : [];
      for (const ch of rows) {
        const number = ch?.attributes?.chapter;
        chapters.push({
          id: String(ch.id),
          chapter: number == null ? '' : String(number),
          title: ch?.attributes?.title || (number ? `Chapter ${number}` : 'Oneshot / Special'),
          date: ch?.attributes?.publishAt ? new Date(ch.attributes.publishAt).toLocaleDateString() : '',
        });
      }
      const total = Number(data?.total || chapters.length);
      offset += rows.length;
      if (!rows.length || offset >= total) break;
    }

    const seen = new Set<string>();
    return chapters.filter((chapter) => {
      if (seen.has(chapter.id)) return false;
      seen.add(chapter.id);
      return true;
    });
  } catch (error) {
    console.error('MangaDex chapter lookup failed:', error);
    return chapters;
  }
}

export async function getChapterPages(chapterId: string) {
  try {
    const data = await mdFetch(`${BASE_URL}/at-home/server/${encodeURIComponent(chapterId)}`);
    const base = String(data?.baseUrl || '');
    const hash = String(data?.chapter?.hash || '');
    const files = Array.isArray(data?.chapter?.data) ? data.chapter.data : [];
    if (!base || !hash || !files.length) return [];
    return files.map((file: string) => `${base}/data/${hash}/${file}`);
  } catch (error) {
    console.error('MangaDex page lookup failed:', error);
    return [];
  }
}
