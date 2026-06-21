# CLAUDE.md — Backend integration brief for Claude Code

This file is the entry point for **Claude Code** when it connects to this repo as the backend service for the **Auto-Shorts AI** frontend. Read this first; everything else (routes, types, demo fixtures) is referenced from here.

---

## 1. What this repo is

- **Frontend**: TanStack Start v1 + React 19 + Vite 7 + Tailwind v4 (single-page marketing + generator UI in `src/routes/index.tsx`, components under `src/components/auto-shorts/`).
- **Backend**: NOT YET IMPLEMENTED. The frontend talks to an HTTP API via `VITE_API_BASE_URL` (default `http://localhost:4000`). When the API is unreachable, the UI gracefully falls back to bundled demo fixtures (`src/lib/demoData.ts`) and shows a "Demo mode" badge.
- **Your job (Claude Code)**: implement the backend that fulfils the contract in §3 using the Anthropic API (`ANTHROPIC_API_KEY`). The backend lives **outside this repo's Vite/Worker bundle** — you can put it in `backend/` as a separate Node/Bun service, or in any runtime you prefer. Do not try to add it to `src/server.ts` or as TanStack server functions unless explicitly asked.

---

## 2. Project layout (frontend)

```
src/
  routes/
    __root.tsx           # root layout (head/meta/providers)
    index.tsx            # landing + generator page
  components/auto-shorts/ # Hero, Generator, ShortsGrid, ShortCard, EditModal, SettingsModal, …
  hooks/
    useGenerateShorts.ts # orchestrates ingest → highlights → copy
    useRenderJob.ts      # starts a render and polls /api/jobs/:id every 2s
    useSettings.ts       # baseUrl + forceDemo, persisted to localStorage
  lib/
    api.ts               # ALL backend HTTP calls live here — read this first
    types.ts             # canonical wire types (see §3)
    demoData.ts          # fallback fixtures; mirror their shape exactly
    render.ts, format.ts # helpers
DEPLOY_LOG.md            # CI/CD + deployment runbook (read after this file)
```

`src/lib/api.ts` is the single source of truth for endpoint paths, request bodies, and response shapes. If you change the contract, update both the backend and `api.ts`/`types.ts` in the same change.

---

## 3. HTTP contract the frontend expects

Base URL: `${VITE_API_BASE_URL}` (no trailing slash). All bodies are JSON. CORS must allow the frontend origin.

| Method | Path                  | Request body                                                                 | Response (200)                  |
|--------|-----------------------|------------------------------------------------------------------------------|---------------------------------|
| GET    | `/health`             | —                                                                            | `200 OK` (body ignored)          |
| POST   | `/api/ingest-url`     | `{ "url": string }`                                                          | `IngestionResult`                |
| POST   | `/api/generate-shorts`| `{ "url": string, "preferences"?: { "numShorts"?: number, "platforms"?: Platform[] } }` | `GenerateShortsResult`           |
| POST   | `/api/variation`      | `{ "plan": ShortPlan, "instruction": string }`                               | `ShortPlan` (re-angled)          |
| POST   | `/api/render-short`   | `{ "shortId": string }`                                                      | `RenderJob` (status `queued`)    |
| GET    | `/api/jobs/:id`       | —                                                                            | `RenderJob` (polled every 2s)    |

`Platform = "tiktok" | "instagram" | "youtube_shorts" | "facebook" | "x"`.

Full TypeScript types (copy-paste authoritative): **`src/lib/types.ts`**.
Example payload shapes for every endpoint: **`src/lib/demoData.ts`** — your real responses MUST validate against these shapes (same field names, same enums, same nesting). The frontend will silently fall back to demo data on any HTTP error, so a malformed response looks like "it works but feels fake" — don't ship that.

### Render job lifecycle

`RenderJob.status` transitions: `queued → rendering → done` (or `failed` with `error: string`). The UI polls `/api/jobs/:id` every 2s and stops when status is `done` or `failed`. On `done`, return a publicly downloadable `outputUrl` (mp4).

### Error handling

- Non-2xx responses cause the frontend to fall back to demo mode for that call. Return 4xx/5xx with a JSON `{ "error": string }` body when something is genuinely wrong.
- Keep `/health` cheap — it's used by deploy smoke tests (see `DEPLOY_LOG.md`).

---

## 4. Environment variables

Backend (server-side only, never exposed to client):

| Var                  | Required | Notes                                                            |
|----------------------|----------|------------------------------------------------------------------|
| `ANTHROPIC_API_KEY`  | yes      | Claude API key. Never commit. Per-environment in GitHub Secrets. |
| `ANTHROPIC_MODEL`    | yes      | e.g. `claude-sonnet-4-5`                                         |
| `PORT`               | no       | Default `4000`                                                   |
| `CORS_ORIGIN`        | yes      | Published frontend origin (or `*` for local dev only)            |
| `RENDER_WORKER_URL`  | if external render service | Where to dispatch render jobs                         |
| `STORAGE_BUCKET`     | if uploads | Where rendered mp4s land                                       |

Frontend (build-time, injected by Vite):

| Var                    | Default                  | Notes                                              |
|------------------------|--------------------------|----------------------------------------------------|
| `VITE_API_BASE_URL`    | `http://localhost:4000`  | Also overridable in-app via Settings → API base URL (persisted to `localStorage`). |

A blank `.env.example` is provided at the repo root listing the names — copy to `.env` (gitignored) and fill in values.

---

## 5. Suggested backend implementation outline

You have freedom here, but a sensible default for first cut:

1. **Runtime**: Bun or Node 20 + Hono/Express. Single process.
2. **Ingest** (`/api/ingest-url`): detect YouTube vs direct video vs podcast; for YouTube use `yt-dlp` to fetch audio + metadata; return `IngestionResult`.
3. **Transcribe**: Whisper (local or hosted) → timestamped transcript.
4. **Highlights → ShortPlans** (`/api/generate-shorts`): one Claude call with the transcript + preferences, asking for `N` highlight windows with hook/title/cta/platforms. Validate against `ShortPlan` shape.
5. **Per-platform copy**: second Claude call per short (or batched) producing `PlatformCopy` for each requested platform; return as `ShortCopy[]`.
6. **Variation** (`/api/variation`): single Claude call, "re-angle this short with instruction X", return updated `ShortPlan`.
7. **Render** (`/api/render-short`): enqueue a job (in-memory map is fine for v0), kick off ffmpeg (cut by `startSec`/`endSec`, burn captions per `captionStyle`, apply `layout`); upload mp4; set `outputUrl`; mark `done`.
8. **Jobs** (`/api/jobs/:id`): return the current `RenderJob`.

Keep the Claude prompts in `backend/prompts/` as plain `.md` or `.ts` constants so they're easy to iterate on. Use structured output (tool use or JSON mode) and validate with Zod before responding.

---

## 6. Local dev workflow

```bash
# Frontend (this repo)
bun install
bun run dev                 # http://localhost:3000

# Backend (your new service, separate process)
cd backend && bun install && bun run dev   # http://localhost:4000

# Point frontend at backend (either)
echo "VITE_API_BASE_URL=http://localhost:4000" > .env.local
# …or set it at runtime in the app's Settings modal.
```

Toggle **Settings → Force demo mode** to validate UI without the backend. Toggle it OFF to hit the real backend.

---

## 7. Constraints & non-goals

- **Do not** import the backend into the TanStack Worker bundle (`src/server.ts`, `wrangler.jsonc`). It must be a separate deployable — ffmpeg, yt-dlp, native binaries, and long-running renders do not run on Cloudflare Workers.
- **Do not** put `ANTHROPIC_API_KEY` anywhere client-side, in `VITE_*` vars, route loaders, or committed `.env` files.
- **Do not** change the wire types in `src/lib/types.ts` without also updating `src/lib/demoData.ts` and `src/lib/api.ts` — the frontend's demo fallback depends on shape parity.
- **Do** preserve the existing UI; backend work should not touch `src/components/auto-shorts/*` unless the contract changes.

---

## 8. Pointers

- Wire types & enums → `src/lib/types.ts`
- Endpoint paths, request bodies, demo fallback behavior → `src/lib/api.ts`
- Example response shapes (use as fixtures for backend tests) → `src/lib/demoData.ts`
- Deployment, CI/CD, smoke tests, rollback → `DEPLOY_LOG.md`
- Frontend route → `src/routes/index.tsx`
