import { fetchEpisodeSourcesAcrossProviders } from '../../lib/server-anime-provider';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = String(req.query?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const result = await fetchEpisodeSourcesAcrossProviders(id);
    const sources = result.sources
      .filter((source: any) => source?.url)
      .map((source: any) => ({
        url: String(source.url),
        quality: source.quality || 'auto',
        isM3U8: Boolean(source.isM3U8),
        type: source.type || (source.isM3U8 ? 'hls' : 'unknown'),
        ...(source.headers ? { headers: source.headers } : {}),
      }));

    const preferred =
      sources.find((source: any) => source.type === 'hls') ||
      sources.find((source: any) => source.type === 'mp4') ||
      sources[0] ||
      null;

    return res.status(200).json({
      provider: result.provider,
      source: preferred,
      sources,
      unavailable: !preferred,
      errors: result.errors,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Anime source adapter error:', error);
    return res.status(200).json({
      provider: null,
      source: null,
      sources: [],
      unavailable: true,
      errors: [error?.message || 'Source service failed'],
      serverTime: new Date().toISOString(),
    });
  }
}
