import { encodeProviderId, findBestAnimeMatch } from '../../lib/server-anime-provider';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = String(req.query?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return res.status(400).json({ error: 'Invalid AniList id' });

    const response = await globalThis.fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: `query ($id: Int) { Media(id: $id, type: ANIME) { title { romaji english native } synonyms } }`,
        variables: { id: numericId },
      }),
    });

    if (!response.ok) return res.status(502).json({ error: 'AniList unavailable' });
    const json = await response.json();
    const media = json?.data?.Media;
    const titles = [media?.title?.english, media?.title?.romaji, media?.title?.native, ...(media?.synonyms || [])]
      .filter((value: any): value is string => typeof value === 'string' && value.trim());

    if (!titles.length) return res.status(404).json({ error: 'Anime not found' });

    const result = await findBestAnimeMatch(titles);
    const best = result.match;

    if (!best?.id) {
      return res.status(404).json({ error: 'No provider match with episodes found', title: titles[0], providerErrors: result.errors });
    }

    const providerId = encodeProviderId(best.provider, best.id);
    return res.status(200).json({
      anilistId: id,
      title: titles[0],
      provider: best.provider,
      providerTitle: best.title,
      providerId,
      matchScore: best.score,
      hasEpisodes: Array.isArray(best.info?.episodes) && best.info.episodes.length > 0,
    });
  } catch (error: any) {
    console.error('Anime resolve error:', error);
    return res.status(502).json({ error: 'Anime resolution unavailable' });
  }
}
