import { encodeProviderId, searchAnimeAcrossProviders } from '../../lib/server-anime-provider';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = String(req.query?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const response = await globalThis.fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        query: `query ($id: Int) { Media(id: $id, type: ANIME) { title { romaji english native } } }`,
        variables: { id: Number(id) },
      }),
    });

    if (!response.ok) return res.status(502).json({ error: 'AniList unavailable' });
    const json = await response.json();
    const title = json?.data?.Media?.title?.english || json?.data?.Media?.title?.romaji || json?.data?.Media?.title?.native;
    if (!title) return res.status(404).json({ error: 'Anime not found' });

    const result = await searchAnimeAcrossProviders(title);
    const first = result.results?.[0];
    if (!first?.id || !result.provider) {
      return res.status(404).json({ error: 'No configured provider result found', providerErrors: result.errors });
    }

    const providerId = String(first.id).includes('::')
      ? String(first.id)
      : encodeProviderId(result.provider, String(first.id));

    return res.status(200).json({ anilistId: id, title, provider: result.provider, providerId });
  } catch (error: any) {
    console.error('Anime resolve error:', error);
    return res.status(502).json({ error: 'Anime resolution unavailable' });
  }
}
