import type {
  GenerateShortsResult,
  IngestionResult,
  Platform,
  RenderJob,
  ShortPlan,
} from "./types";
import { demoResult } from "./demoData";

const SETTINGS_KEY = "auto-shorts-settings";

export interface Settings {
  baseUrl: string;
  forceDemo: boolean;
}

export const defaultSettings: Settings = {
  baseUrl:
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_API_BASE_URL) ||
    "http://localhost:4000",
  forceDemo: false,
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(s: Settings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const settings = loadSettings();
  const url = `${settings.baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export interface ApiCallResult<T> {
  data: T;
  usedDemo: boolean;
}

function withDemoBadge<T>(data: T, usedDemo: boolean): ApiCallResult<T> {
  return { data, usedDemo };
}

export async function ingestUrl(
  url: string,
): Promise<ApiCallResult<IngestionResult>> {
  const settings = loadSettings();
  if (settings.forceDemo) return withDemoBadge(demoResult.ingestion, true);
  try {
    const data = await http<IngestionResult>("/api/ingest-url", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
    return withDemoBadge(data, false);
  } catch {
    return withDemoBadge({ ...demoResult.ingestion, url }, true);
  }
}

export async function generateShorts(
  url: string,
  preferences?: { numShorts?: number; platforms?: Platform[] },
): Promise<ApiCallResult<GenerateShortsResult>> {
  const settings = loadSettings();
  if (settings.forceDemo) {
    return withDemoBadge(filterDemo(url, preferences), true);
  }
  try {
    const data = await http<GenerateShortsResult>("/api/generate-shorts", {
      method: "POST",
      body: JSON.stringify({ url, preferences }),
    });
    return withDemoBadge(data, false);
  } catch {
    return withDemoBadge(filterDemo(url, preferences), true);
  }
}

function filterDemo(
  url: string,
  preferences?: { numShorts?: number; platforms?: Platform[] },
): GenerateShortsResult {
  const num = preferences?.numShorts ?? demoResult.shorts.length;
  const platforms = preferences?.platforms;
  const shorts = demoResult.shorts.slice(0, num).map((s) =>
    platforms && platforms.length
      ? { ...s, platforms: s.platforms.filter((p) => platforms.includes(p)) }
      : s,
  );
  const ids = new Set(shorts.map((s) => s.id));
  return {
    ingestion: { ...demoResult.ingestion, url },
    shorts,
    platformCopy: demoResult.platformCopy.filter((c) => ids.has(c.shortId)),
  };
}

export async function variation(
  plan: ShortPlan,
  instruction: string,
): Promise<ApiCallResult<ShortPlan>> {
  const settings = loadSettings();
  if (settings.forceDemo) return withDemoBadge(localVariation(plan, instruction), true);
  try {
    const data = await http<ShortPlan>("/api/variation", {
      method: "POST",
      body: JSON.stringify({ plan, instruction }),
    });
    return withDemoBadge(data, false);
  } catch {
    return withDemoBadge(localVariation(plan, instruction), true);
  }
}

function localVariation(plan: ShortPlan, instruction: string): ShortPlan {
  return {
    ...plan,
    hook: `${plan.hook} (${instruction})`,
    title: `${plan.title} — re-angled`,
  };
}

// Render jobs — demo simulation persisted in memory.
const demoJobs = new Map<string, RenderJob>();

export async function renderShort(
  shortId: string,
): Promise<ApiCallResult<RenderJob>> {
  const settings = loadSettings();
  if (settings.forceDemo) return withDemoBadge(startDemoJob(shortId), true);
  try {
    const data = await http<RenderJob>("/api/render-short", {
      method: "POST",
      body: JSON.stringify({ shortId }),
    });
    return withDemoBadge(data, false);
  } catch {
    return withDemoBadge(startDemoJob(shortId), true);
  }
}

export async function getJob(id: string): Promise<ApiCallResult<RenderJob>> {
  const settings = loadSettings();
  const local = demoJobs.get(id);
  if (settings.forceDemo && local) return withDemoBadge(tickDemoJob(local), true);
  try {
    const data = await http<RenderJob>(`/api/jobs/${id}`);
    return withDemoBadge(data, false);
  } catch {
    if (local) return withDemoBadge(tickDemoJob(local), true);
    throw new Error("Job not found");
  }
}

function startDemoJob(shortId: string): RenderJob {
  const job: RenderJob = {
    id: `job_${Date.now()}_${shortId}`,
    shortId,
    status: "queued",
  };
  (job as any)._startedAt = Date.now();
  demoJobs.set(job.id, job);
  return job;
}

function tickDemoJob(job: RenderJob): RenderJob {
  const started = (job as any)._startedAt as number | undefined;
  const elapsed = started ? Date.now() - started : 0;
  let next: RenderJob = { ...job };
  if (elapsed > 6000) {
    next.status = "done";
    next.outputUrl = "https://samplelib.com/lib/preview/mp4/sample-5s.mp4";
  } else if (elapsed > 2000) {
    next.status = "rendering";
  } else {
    next.status = "queued";
  }
  (next as any)._startedAt = started;
  demoJobs.set(job.id, next);
  return next;
}

export async function testConnection(): Promise<boolean> {
  const settings = loadSettings();
  try {
    const res = await fetch(`${settings.baseUrl.replace(/\/$/, "")}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
