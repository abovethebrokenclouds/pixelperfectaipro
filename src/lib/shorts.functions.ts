import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import type {
  GenerateShortsResult,
  Platform,
  ShortPlan,
} from "./types";

const PlatformEnum = z.enum([
  "tiktok",
  "instagram",
  "youtube_shorts",
  "facebook",
  "x",
]);

const ShortPlanSchema = z.object({
  id: z.string(),
  highlightId: z.string(),
  title: z.string(),
  hook: z.string(),
  theme: z.string(),
  startSec: z.number(),
  endSec: z.number(),
  durationSec: z.number(),
  layout: z.enum(["full_bleed", "split_top_bottom", "centered_card"]),
  captionStyle: z.object({
    font: z.string(),
    size: z.number(),
    color: z.string(),
    highlightColor: z.string(),
    position: z.enum(["top", "center", "bottom"]),
  }),
  cta: z.string(),
  platforms: z.array(PlatformEnum),
});

const GenerateInputSchema = z.object({
  url: z.string().min(1),
  preferences: z
    .object({
      numShorts: z.number().int().min(1).max(8).optional(),
      platforms: z.array(PlatformEnum).optional(),
    })
    .optional(),
});

const VariationInputSchema = z.object({
  plan: ShortPlanSchema,
  instruction: z.string().min(1),
});

const ALL_PLATFORMS: Platform[] = [
  "tiktok",
  "instagram",
  "youtube_shorts",
  "facebook",
  "x",
];

const LAYOUTS = ["full_bleed", "split_top_bottom", "centered_card"] as const;

const defaultCaption = {
  font: "Inter",
  size: 64,
  color: "#ffffff",
  highlightColor: "#a855f7",
  position: "bottom" as const,
};

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  return createLovableAiGatewayProvider(key);
}

function detectSourceType(url: string): "youtube" | "direct_video" | "podcast" | "unknown" {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.match(/\.(mp4|mov|webm|mkv)(\?|$)/)) return "direct_video";
  if (u.includes("podcast") || u.includes("spotify.com") || u.includes("apple.com/podcast")) return "podcast";
  return "unknown";
}

function extractJson(text: string): any {
  let t = text.trim();
  // strip markdown fences
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  // find first { or [
  const start = t.search(/[{[]/);
  if (start === -1) throw new Error("No JSON found in response");
  const open = t[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === open) depth++;
      else if (c === close) {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
  }
  if (end === -1) throw new Error("Unterminated JSON in response");
  return JSON.parse(t.slice(start, end + 1));
}

function normalizeLayout(v: unknown): "full_bleed" | "split_top_bottom" | "centered_card" {
  return LAYOUTS.includes(v as any) ? (v as any) : "full_bleed";
}

function normalizePlatform(v: unknown): Platform | null {
  const s = String(v ?? "").toLowerCase().replace(/[\s-]/g, "_");
  const map: Record<string, Platform> = {
    tiktok: "tiktok",
    instagram: "instagram",
    ig: "instagram",
    youtube_shorts: "youtube_shorts",
    youtube: "youtube_shorts",
    shorts: "youtube_shorts",
    facebook: "facebook",
    fb: "facebook",
    x: "x",
    twitter: "x",
  };
  return map[s] ?? null;
}

export const generateShortsFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateInputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateShortsResult> => {
    const gateway = getGateway();
    const model = gateway("google/gemini-3-flash-preview");
    const numShorts = data.preferences?.numShorts ?? 4;
    const platforms = data.preferences?.platforms?.length
      ? data.preferences.platforms
      : ALL_PLATFORMS;

    const sourceType = detectSourceType(data.url);

    const { text: planText } = await generateText({
      model,
      prompt: `You are an expert short-form video producer. Given a source URL, infer a plausible topic and generate ${numShorts} scroll-stopping shorts.

URL: ${data.url}
Source type: ${sourceType}

Respond with ONLY a valid JSON object (no markdown, no commentary) of this exact shape:
{
  "ingestion": { "title": string, "author": string, "durationSec": number (600-3600) },
  "shorts": [
    {
      "title": string,
      "hook": string (<=12 words, punchy),
      "theme": string (1-3 words),
      "startSec": number,
      "endSec": number,
      "layout": "full_bleed" | "split_top_bottom" | "centered_card",
      "cta": string (short, actionable)
    }
  ]
}

Generate exactly ${numShorts} shorts. Each short duration (endSec - startSec) should be 30-60s, with startSec >= 30 and endSec <= durationSec - 30.`,
    });

    const planRaw = extractJson(planText);
    const ingestion = {
      title: String(planRaw?.ingestion?.title ?? "Untitled"),
      author: String(planRaw?.ingestion?.author ?? "Unknown"),
      durationSec: Number(planRaw?.ingestion?.durationSec ?? 1200),
    };
    const rawShorts: any[] = Array.isArray(planRaw?.shorts) ? planRaw.shorts : [];

    const shorts: ShortPlan[] = rawShorts.slice(0, numShorts).map((s, i) => {
      const start = Math.floor(Number(s?.startSec ?? 30 + i * 60));
      const end = Math.floor(Number(s?.endSec ?? start + 45));
      return {
        id: `short_${Date.now()}_${i}`,
        highlightId: `h_${i + 1}`,
        title: String(s?.title ?? `Short ${i + 1}`),
        hook: String(s?.hook ?? ""),
        theme: String(s?.theme ?? ""),
        startSec: start,
        endSec: end,
        durationSec: Math.max(1, end - start),
        layout: normalizeLayout(s?.layout),
        captionStyle: defaultCaption,
        cta: String(s?.cta ?? "Watch more"),
        platforms,
      };
    });

    // Step 2: per-short platform copy
    const platformCopy = await Promise.all(
      shorts.map(async (s) => {
        const { text: copyText } = await generateText({
          model,
          prompt: `Write per-platform social copy for this short.

Title: ${s.title}
Hook: ${s.hook}
Theme: ${s.theme}
CTA: ${s.cta}

Respond with ONLY a valid JSON object (no markdown, no commentary) of this exact shape:
{
  "copies": [
    {
      "platform": one of ${platforms.map((p) => `"${p}"`).join(", ")},
      "title": string (<=80 chars),
      "description": string,
      "hashtags": string[] (3-6 items, lowercase, each starting with #),
      "cta": string
    }
  ]
}

Include exactly one entry for each of these platforms: ${platforms.join(", ")}.`,
        });

        let copies: any[] = [];
        try {
          const parsed = extractJson(copyText);
          copies = Array.isArray(parsed?.copies) ? parsed.copies : [];
        } catch {
          copies = [];
        }

        const normalized = copies
          .map((c) => {
            const platform = normalizePlatform(c?.platform);
            if (!platform || !platforms.includes(platform)) return null;
            return {
              platform,
              title: String(c?.title ?? s.title),
              description: String(c?.description ?? s.hook),
              hashtags: Array.isArray(c?.hashtags)
                ? c.hashtags.map((h: unknown) => {
                    const str = String(h).trim();
                    return str.startsWith("#") ? str : `#${str}`;
                  })
                : [],
              cta: String(c?.cta ?? s.cta),
            };
          })
          .filter((c): c is NonNullable<typeof c> => c !== null);

        // Ensure every requested platform has an entry (fallback to defaults)
        for (const p of platforms) {
          if (!normalized.find((c) => c.platform === p)) {
            normalized.push({
              platform: p,
              title: s.title,
              description: s.hook,
              hashtags: [],
              cta: s.cta,
            });
          }
        }

        return { shortId: s.id, copies: normalized };
      }),
    );

    return {
      ingestion: {
        url: data.url,
        sourceType,
        ingestionMethod: sourceType === "youtube" ? "yt-dlp" : sourceType === "podcast" ? "rss" : "http",
        metadata: ingestion,
      },
      shorts,
      platformCopy,
    };
  });

export const variationFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => VariationInputSchema.parse(input))
  .handler(async ({ data }): Promise<ShortPlan> => {
    const gateway = getGateway();
    const model = gateway("google/gemini-3-flash-preview");

    const { text } = await generateText({
      model,
      prompt: `Re-angle this short based on the instruction. Keep it punchy.

Current:
- title: ${data.plan.title}
- hook: ${data.plan.hook}
- theme: ${data.plan.theme}
- cta: ${data.plan.cta}
- layout: ${data.plan.layout}

Instruction: ${data.instruction}

Respond with ONLY a valid JSON object (no markdown, no commentary) of this exact shape:
{
  "title": string,
  "hook": string (<=12 words),
  "theme": string,
  "cta": string,
  "layout": "full_bleed" | "split_top_bottom" | "centered_card"
}`,
    });

    const raw = extractJson(text);
    return {
      ...data.plan,
      title: String(raw?.title ?? data.plan.title),
      hook: String(raw?.hook ?? data.plan.hook),
      theme: String(raw?.theme ?? data.plan.theme),
      cta: String(raw?.cta ?? data.plan.cta),
      layout: normalizeLayout(raw?.layout ?? data.plan.layout),
    };
  });
