import { searchAnimeAcrossProviders } from '../../lib/server-anime-provider';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const q = String(req.query?.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing q' });

  try {
    const result = await searchAnimeAcrossProviders(q);

    // Return an empty, valid payload instead of throwing when every provider
    // is temporarily unavailable. This keeps the React app from crashing.
    return res.status(200).json({
      provider: result.provider,
      results: Array.isArray(result.results) ? result.results : [],
      providerUnavailable: !result.provider,
    });
  } catch (error: any) {
    console.error('Anime search adapter error:', error);
    return res.status(200).json({ provider: null, results: [], providerUnavailable: true });
  }
}
