import { encodeProviderId, fetchAnimeInfoAcrossProviders } from '../../lib/server-anime-provider';

function normalizeEpisode(ep: any, index: number, provider: string | null, fallbackImage = '') {
  const rawId = String(ep?.id || ep?.episodeId || '');
  const number = Number(ep?.number ?? ep?.episodeNumber ?? index + 1);
  return {
    // Keep the provider attached to the episode ID so playback uses the same provider
    // that returned the episode instead of guessing across unrelated providers.
    id: rawId && provider ? encodeProviderId(provider, rawId) : rawId,
    number,
    title: ep?.title || ep?.name || `Episode ${index + 1}`,
    image: ep?.image || ep?.thumbnail || fallbackImage || undefined,
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
        description: 'The anime provider is temporarily unavailable. Try another source or retry shortly.',
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
        : Array.isArray(info.results)
          ? info.results
          : [];

    const episodes = rawEpisodes
      .map((ep: any, index: number) => normalizeEpisode(ep, index, result.provider, info.image || info.cover || ''))
      .filter((ep: any) => ep.id && Number.isFinite(ep.number))
      .sort((a: any, b: any) => a.number - b.number);

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
