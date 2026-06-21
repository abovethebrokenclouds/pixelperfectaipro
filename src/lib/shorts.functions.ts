import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
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

const CaptionStyleSchema = z.object({
  font: z.string(),
  size: z.number(),
  color: z.string(),
  highlightColor: z.string(),
  position: z.enum(["top", "center", "bottom"]),
});

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
  captionStyle: CaptionStyleSchema,
  cta: z.string(),
  platforms: z.array(PlatformEnum),
});

const PlatformCopySchema = z.object({
  platform: PlatformEnum,
  title: z.string(),
  description: z.string(),
  hashtags: z.array(z.string()),
  cta: z.string(),
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

export const generateShortsFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateInputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateShortsResult> => {
    const gateway = getGateway();
    const model = gateway("google/gemini-3-flash-preview");
    const numShorts = data.preferences?.numShorts ?? 4;
    const platforms = data.preferences?.platforms?.length
      ? data.preferences.platforms
      : ALL_PLATFORMS;

    // Step 1: generate ingestion metadata + shorts plans
    const planSchema = z.object({
      ingestion: z.object({
        title: z.string(),
        author: z.string(),
        durationSec: z.number(),
      }),
      shorts: z
        .array(
          z.object({
            title: z.string(),
            hook: z.string(),
            theme: z.string(),
            startSec: z.number(),
            endSec: z.number(),
            layout: z.enum(["full_bleed", "split_top_bottom", "centered_card"]),
            cta: z.string(),
          }),
        )
        .min(1)
        .max(8),
    });

    const sourceType = detectSourceType(data.url);

    const { output: planOut } = await generateText({
      model,
      output: Output.object({ schema: planSchema }),
      prompt: `You are an expert short-form video producer. Given a source URL, infer a plausible topic and generate ${numShorts} scroll-stopping shorts.

URL: ${data.url}
Source type: ${sourceType}

For "ingestion", invent realistic metadata (title, author, durationSec between 600-3600).
For each short:
- startSec/endSec are timestamps within the video (between 30 and durationSec-30); duration 30-60s
- hook: <=12 words, punchy and curiosity-driven
- theme: 1-3 words
- layout: choose the best of full_bleed, split_top_bottom, centered_card
- cta: short, actionable

Return exactly ${numShorts} shorts.`,
    });

    const shorts: ShortPlan[] = planOut.shorts.slice(0, numShorts).map((s, i) => {
      const start = Math.floor(s.startSec);
      const end = Math.floor(s.endSec);
      return {
        id: `short_${Date.now()}_${i}`,
        highlightId: `h_${i + 1}`,
        title: s.title,
        hook: s.hook,
        theme: s.theme,
        startSec: start,
        endSec: end,
        durationSec: Math.max(1, end - start),
        layout: s.layout,
        captionStyle: defaultCaption,
        cta: s.cta,
        platforms,
      };
    });

    // Step 2: per-short platform copy
    const copySchema = z.object({
      copies: z.array(PlatformCopySchema),
    });

    const platformCopy = await Promise.all(
      shorts.map(async (s) => {
        const { output } = await generateText({
          model,
          output: Output.object({ schema: copySchema }),
          prompt: `Write per-platform copy for this short.

Title: ${s.title}
Hook: ${s.hook}
Theme: ${s.theme}
CTA: ${s.cta}

Generate one entry for each of these platforms: ${platforms.join(", ")}.
Each entry needs: platform, title (<=80 chars), description (platform-appropriate length), hashtags (3-6, lowercase, with #), cta.`,
        });
        return {
          shortId: s.id,
          copies: output.copies.filter((c) => platforms.includes(c.platform)),
        };
      }),
    );

    return {
      ingestion: {
        url: data.url,
        sourceType,
        ingestionMethod: sourceType === "youtube" ? "yt-dlp" : sourceType === "podcast" ? "rss" : "http",
        metadata: planOut.ingestion,
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

    const schema = z.object({
      title: z.string(),
      hook: z.string(),
      theme: z.string(),
      cta: z.string(),
      layout: z.enum(["full_bleed", "split_top_bottom", "centered_card"]),
    });

    const { output } = await generateText({
      model,
      output: Output.object({ schema }),
      prompt: `Re-angle this short based on the instruction. Keep it punchy.

Current:
- title: ${data.plan.title}
- hook: ${data.plan.hook}
- theme: ${data.plan.theme}
- cta: ${data.plan.cta}
- layout: ${data.plan.layout}

Instruction: ${data.instruction}

Return updated title, hook (<=12 words), theme, cta, and layout.`,
    });

    return {
      ...data.plan,
      title: output.title,
      hook: output.hook,
      theme: output.theme,
      cta: output.cta,
      layout: output.layout,
    };
  });
