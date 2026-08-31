import { ANIME } from '@consumet/extensions';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const q = String(req.query?.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing q' });

  try {
    const Provider: any = ANIME as any;
    const provider = new Provider.Gogoanime();
    const result = await provider.search(q);
    return res.status(200).json({ results: result?.results || [] });
  } catch (error: any) {
    console.error('Anime search provider error:', error);
    return res.status(502).json({ error: 'Anime provider unavailable' });
  }
}
