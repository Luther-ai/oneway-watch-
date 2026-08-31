import { fetchAnimeInfoAcrossProviders } from '../../lib/server-anime-provider';

function normalizeEpisode(ep: any, index: number) {
  return {
    id: String(ep?.id || ep?.episodeId || ''),
    number: Number(ep?.number ?? ep?.episodeNumber ?? index + 1),
    title: ep?.title || ep?.name || undefined,
    image: ep?.image || ep?.thumbnail || undefined,
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const id = String(req.query?.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const result = await fetchAnimeInfoAcrossProviders(id);
    const info: any = result.info;

    if (!info) {
      return res.status(200).json({
        id,
        title: id,
        image: '',
        description: 'The anime metadata provider is temporarily unavailable.',
        totalEpisodes: 0,
        episodes: [],
        provider: null,
        providerUnavailable: true,
      });
    }

    const rawEpisodes = Array.isArray(info.episodes)
      ? info.episodes
      : Array.isArray(info.episodesList)
        ? info.episodesList
        : [];

    const episodes = rawEpisodes
      .map(normalizeEpisode)
      .filter((ep: any) => ep.id && Number.isFinite(ep.number));

    return res.status(200).json({
      id: String(info.id || id),
      title: typeof info.title === 'string'
        ? info.title
        : info.title?.english || info.title?.romaji || info.title?.native || 'Unknown Title',
      image: info.image || info.cover || '',
      description: typeof info.description === 'string' ? info.description : '',
      totalEpisodes: Number(info.totalEpisodes || info.totalEpisodesCount || episodes.length || 0),
      episodes,
      provider: result.provider,
      providerUnavailable: false,
    });
  } catch (error: any) {
    console.error('Anime info adapter error:', error);
    return res.status(200).json({
      id,
      title: id,
      image: '',
      description: 'Anime information could not be loaded right now.',
      totalEpisodes: 0,
      episodes: [],
      provider: null,
      providerUnavailable: true,
    });
  }
}
