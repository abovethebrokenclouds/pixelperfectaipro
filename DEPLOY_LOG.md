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

## CI/CD Pipeline

The Claude backend ships through a two-environment GitHub Actions pipeline: **staging** (auto on merge to `main`) and **production** (manual approval after staging is green).

### Branch & environment map

| Branch / event                 | Environment | URL                                       | Approval               |
|--------------------------------|-------------|-------------------------------------------|------------------------|
| PR to `main`                   | ci-only     | —                                         | none                   |
| push to `main`                 | staging     | `project--{project-id}-dev.lovable.app`   | none (auto)            |
| `workflow_dispatch` / tag `v*` | production  | `project--{project-id}.lovable.app`       | required (1+ reviewer) |

### Required GitHub environment secrets

Set under **Settings → Environments → {staging|production} → Secrets**:

- `ANTHROPIC_API_KEY` — separate keys per env
- `ANTHROPIC_MODEL` — e.g. `claude-sonnet-4-5`
- `CORS_ORIGIN` — published frontend origin for that env
- `RENDER_WORKER_URL`, `STORAGE_BUCKET`
- `DEPLOY_TOKEN` — hosting provider token (Cloudflare API token, Fly token, etc.)

Frontend `VITE_API_BASE_URL` is a **build-time** value — set per environment in the frontend deploy, not as a runtime secret.

### Workflow: `.github/workflows/ci.yml` (PRs)

1. `actions/checkout@v4`
2. `oven-sh/setup-bun@v2`
3. `bun install --frozen-lockfile`
4. `bun run typecheck`
5. `bun run build`

Concurrency: cancel in-progress runs for the same ref. Must pass before merge.

### Workflow: `.github/workflows/deploy-staging.yml` (push to `main`)

1. CI steps above
2. Build backend image / bundle
3. Deploy to **staging** using `DEPLOY_TOKEN`, injecting staging secrets
4. Wait for `GET https://<staging-backend>/health` → `200` (timeout 60s)
5. Smoke test: `POST /api/ingest-url` with a fixture URL → expect 200 + valid `IngestionResult`
6. Post deploy summary to the Actions run (commit SHA, image tag, URL)

Rollback: re-run the previous successful workflow run, or `deploy --image <previous-sha>`.

### Workflow: `.github/workflows/deploy-prod.yml` (manual / tag `v*`)

1. `environment: production` → requires reviewer approval
2. CI steps above
3. Verify the same commit SHA is currently live on staging and `/health` is green
4. Deploy to **production** with prod secrets
5. Health check + smoke test against prod URL
6. On failure: auto-rollback to previous release (`deploy --image <previous-sha>`) and fail the job
7. Create a GitHub Release with the changelog and link to this `DEPLOY_LOG.md`

### Promotion checklist (staging → production)

- [ ] Staging `/health` green for ≥10 min on target SHA
- [ ] Manual smoke: ingest → generate → render → download on staging
- [ ] No new error spikes in staging logs (last 30 min)
- [ ] Prod secrets present and distinct from staging
- [ ] Frontend `VITE_API_BASE_URL` points at prod backend (or queued in same release)
- [ ] Reviewer approved the `production` environment in GitHub

### Post-deploy verification (both envs)

- [ ] `GET /health` → 200
- [ ] CORS preflight from frontend origin → 204 with correct `Access-Control-Allow-Origin`
- [ ] `generate-shorts` returns ≥1 `ShortPlan` end-to-end
- [ ] `render-short` transitions `queued → rendering → done`, `outputUrl` downloadable
- [ ] Force demo mode OFF in Settings → real backend responses observed

---

## Notes

- Frontend gracefully degrades to demo fixtures on any backend error (see `src/lib/api.ts`). Use the **Force demo mode** switch in Settings to validate UI without the backend.
- Never commit `ANTHROPIC_API_KEY` to the repo. Store per-environment in GitHub Environment Secrets and in the hosting provider's secret manager.
- After rotating any secret, redeploy so the backend picks up the new value.
