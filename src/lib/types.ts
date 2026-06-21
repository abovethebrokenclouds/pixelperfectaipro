export type Platform = "tiktok" | "instagram" | "youtube_shorts" | "facebook" | "x";

export interface CaptionStyle {
  font: string;
  size: number;
  color: string;
  highlightColor: string;
  position: "top" | "center" | "bottom";
}

export interface ShortPlan {
  id: string;
  highlightId: string;
  title: string;
  hook: string;
  theme: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  layout: "full_bleed" | "split_top_bottom" | "centered_card";
  captionStyle: CaptionStyle;
  cta: string;
  platforms: Platform[];
}

export interface PlatformCopy {
  platform: Platform;
  title: string;
  description: string;
  hashtags: string[];
  cta: string;
}

export interface ShortCopy {
  shortId: string;
  copies: PlatformCopy[];
}

export type RenderStatus = "queued" | "rendering" | "done" | "failed";

export interface RenderJob {
  id: string;
  shortId: string;
  status: RenderStatus;
  outputUrl?: string;
  error?: string;
}

export interface IngestionResult {
  url: string;
  sourceType: "youtube" | "direct_video" | "podcast" | "unknown";
  ingestionMethod: "yt-dlp" | "http" | "rss";
  metadata: { title?: string; author?: string; durationSec?: number };
}

export interface GenerateShortsResult {
  ingestion: IngestionResult;
  shorts: ShortPlan[];
  platformCopy: ShortCopy[];
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube_shorts: "YouTube Shorts",
  facebook: "Facebook",
  x: "X",
};

export const ALL_PLATFORMS: Platform[] = [
  "tiktok",
  "instagram",
  "youtube_shorts",
  "facebook",
  "x",
];
