# OneWay Watch

OneWay Watch is a React/Vite anime + manga platform with a streaming-style discovery experience, episode playback, manga reading, search, progress tracking and local library features.

## What is live in the codebase

- AniList-powered anime and manga metadata/search.
- Anime discovery with trending, popularity, score and date sorting.
- Genre filtering and paginated results.
- Anime detail → episode selection → playback flow.
- Server-side anime provider adapter under `/api/anime/*` so provider dependencies are not shipped to the browser.
- Provider fallback with per-request timeouts, provider-instance caching, provider ID encoding and source normalization.
- Playback source selection that prefers HLS and can fall back to MP4/other recognized media types.
- Manga search/details/chapters/reader powered by MangaDex APIs.
- Continue Watching and Continue Reading progress stored locally with Zustand.
- Responsive dark streaming UI with a featured hero and Video.js player.
- Video.js retry handling and resume-from-progress support.
- Vercel configuration for deploying both the Vite frontend and `/api` functions together.

## Run locally

Install dependencies first:

```bash
npm install
```

### Frontend only

```bash
npm run dev
```

This starts Vite. The UI will load, but Vercel-style `/api/anime/*` functions are not executed by a plain Vite server.

### Full local app

Use a runtime that supports Vercel Functions:

```bash
npx vercel dev
```

This is the recommended local development mode when testing anime search, provider resolution and playback source APIs together with the frontend.

### Production build

```bash
npm run build
npm run preview
```

## Playback architecture

```text
AniList catalog
      ↓
provider ID mapping
      ↓
/anime/info
      ↓
episode selection
      ↓
/anime/sources
      ↓
provider fallback + source normalization
      ↓
HLS / MP4 source
      ↓
Video.js
```

Each provider is isolated behind the server adapter. A provider timeout or empty response does not block the rest of the provider chain.

## Deployment checklist

1. Deploy the repository to a host that executes the `/api` directory as serverless functions, such as Vercel.
2. Confirm `/api/anime/search`, `/api/anime/info`, and `/api/anime/sources` return JSON from the deployed domain.
3. Test at least one anime with multiple episodes.
4. Test a provider failure path and confirm the next provider is attempted.
5. Test both HLS and MP4 playback when those source types are available from an authorized provider.

## Content and provider responsibility

OneWay Watch is an interface and provider-adapter architecture. Only connect or expose media sources that you are authorized to access and distribute in your deployment and region. Metadata APIs and the reader integration are kept separate from the playback provider so the source layer can be replaced without rebuilding the UI.
