import { ANIME } from '@consumet/extensions';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const id = String(req.query?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const Provider: any = ANIME as any;
    const provider = new Provider.Gogoanime();
    const info: any = await provider.fetchAnimeInfo(id);
    return res.status(200).json({
      id: info.id,
      title: typeof info.title === 'string' ? info.title : info.title?.english || info.title?.romaji || 'Unknown Title',
      image: info.image || '',
      description: typeof info.description === 'string' ? info.description : '',
      totalEpisodes: info.totalEpisodes || info.episodes?.length || 0,
      episodes: (info.episodes || []).map((ep: any) => ({ id: ep.id, number: ep.number, title: ep.title, image: ep.image })),
    });
  } catch (error: any) {
    console.error('Anime info provider error:', error);
    return res.status(502).json({ error: 'Anime provider unavailable' });
  }
}
