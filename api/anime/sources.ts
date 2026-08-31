import { fetchEpisodeSourcesAcrossProviders } from '../../lib/server-anime-provider';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = String(req.query?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const result = await fetchEpisodeSourcesAcrossProviders(id);
    const sources = result.sources
      .filter((source: any) => source?.url)
      .map((source: any) => ({
        url: String(source.url),
        quality: source.quality || source.label || 'auto',
        isM3U8: Boolean(source.isM3U8 || /\.m3u8($|\?)/i.test(String(source.url))),
      }));

    const preferred = sources.find((source: any) => source.isM3U8) || sources[0];

    return res.status(200).json({
      provider: result.provider,
      source: preferred || null,
      sources,
      unavailable: !preferred,
    });
  } catch (error: any) {
    console.error('Anime source adapter error:', error);
    return res.status(200).json({ provider: null, source: null, sources: [], unavailable: true });
  }
}
