# Deploy Log — Claude Backend Integration

Project: Auto-Shorts AI
Owner: (set in repo settings)
Last updated: 2026-06-21

---

## Overview

This log tracks deployments of the Claude-powered backend that serves the Auto-Shorts AI frontend. The frontend calls the backend via `VITE_API_BASE_URL` (overridable in Settings → API base URL, persisted to `localStorage`). When the backend is unreachable, the UI falls back to bundled demo fixtures (`src/lib/demoData.ts`).

### Endpoints expected by the frontend
- `POST /api/ingest-url` → `IngestionResult`
- `POST /api/generate-shorts` → `GenerateShortsResult`
- `POST /api/variation` → `ShortPlan`
- `POST /api/render-short` → `RenderJob`
- `GET  /api/jobs/:id` → `RenderJob`
- `GET  /health` → `200 OK`

### Required environment variables (backend)
- `ANTHROPIC_API_KEY` — Claude API key (server-side only, never exposed to client)
- `ANTHROPIC_MODEL` — e.g. `claude-sonnet-4-5`
- `PORT` — default `4000`
- `CORS_ORIGIN` — published frontend origin
- `RENDER_WORKER_URL` — render service base URL (if external)
- `STORAGE_BUCKET` — output upload target

---

## Deployment checklist

- [ ] Secrets configured in hosting provider
- [ ] `/health` returns 200 from the public URL
- [ ] CORS allows the published frontend origin
- [ ] Frontend `VITE_API_BASE_URL` points at the new backend
- [ ] Smoke test: ingest → generate → render → download
- [ ] Force demo mode toggled OFF in Settings

---

## Releases

### v0.1.0 — Initial scaffold (planned)
- Date: TBD
- Commit: TBD
- Notes: Claude-based highlight + copy generation, queue-based render worker, demo fallback parity.
- Verification:
  - [ ] `/health` ✅
  - [ ] `generate-shorts` returns ≥1 `ShortPlan` for a known URL
  - [ ] `render-short` transitions `queued → rendering → done`
  - [ ] `outputUrl` is downloadable

---

## Incident / rollback log

| Date | Version | Issue | Action | Resolved |
|------|---------|-------|--------|----------|
|      |         |       |        |          |

---

## Notes

- Frontend gracefully degrades to demo fixtures on any backend error (see `src/lib/api.ts`). Use the **Force demo mode** switch in Settings to validate UI without the backend.
- Never commit `ANTHROPIC_API_KEY` to the repo. Store it via the hosting provider's secret manager.
