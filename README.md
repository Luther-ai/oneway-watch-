# OneWay Watch

OneWay Watch is a React/Vite anime + manga platform with a streaming-style discovery experience, episode playback, manga reading, search, progress tracking and local library features.

## What is live in the codebase

- AniList-powered anime and manga metadata/search.
- Anime discovery with trending, popularity, score and date sorting.
- Genre filtering and paginated results.
- Anime detail → episode selection → HLS/video playback flow.
- Server-side anime provider adapter under `/api/anime/*` so provider dependencies are not shipped to the browser.
- Manga search/details/chapters/reader powered by MangaDex APIs.
- Continue Watching and Continue Reading progress stored locally with Zustand.
- Responsive dark streaming UI with a featured hero and Video.js player.
- Vercel configuration for deploying both the Vite frontend and `/api` functions together.

## Run locally

```bash
npm install
npm run dev
```

For the server-side `/api/anime/*` functions, run the project through a host/runtime that supports the Vercel Functions convention (for example Vercel or `vercel dev`). A plain Vite dev server serves the frontend but does not execute the `/api` Node functions.

## Content and provider responsibility

OneWay Watch is an interface and provider-adapter architecture. Only connect or expose media sources that you are authorized to access and distribute in your deployment and region. Metadata APIs and the reader integration are kept separate from the playback provider so the source layer can be replaced without rebuilding the UI.
