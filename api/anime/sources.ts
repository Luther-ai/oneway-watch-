import { ANIME } from '@consumet/extensions';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const id = String(req.query?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const Provider: any = ANIME as any;
    const provider = new Provider.Gogoanime();
    const result: any = await provider.fetchEpisodeSources(id);
    const sources = (result?.sources || [])
      .filter((source: any) => source?.url)
      .map((source: any) => ({
        url: source.url,
        quality: source.quality || 'auto',
        isM3U8: Boolean(source.isM3U8 || /\.m3u8($|\?)/i.test(source.url)),
      }));

    const preferred = sources.find((source: any) => source.isM3U8) || sources[0];
    if (!preferred) return res.status(404).json({ error: 'No playable source found' });
    return res.status(200).json({ source: preferred, sources });
  } catch (error: any) {
    console.error('Anime source provider error:', error);
    return res.status(502).json({ error: 'Video source unavailable' });
  }
}
