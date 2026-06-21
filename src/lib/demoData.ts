import type { GenerateShortsResult, ShortCopy, ShortPlan } from "./types";

const defaultCaption = {
  font: "Inter",
  size: 64,
  color: "#ffffff",
  highlightColor: "#a855f7",
  position: "bottom" as const,
};

const shorts: ShortPlan[] = [
  {
    id: "short_1",
    highlightId: "h_1",
    title: "The 5-second rule that changed everything",
    hook: "You're 5 seconds away from your next breakthrough.",
    theme: "Motivation",
    startSec: 124,
    endSec: 168,
    durationSec: 44,
    layout: "full_bleed",
    captionStyle: defaultCaption,
    cta: "Follow for more mindset clips",
    platforms: ["tiktok", "instagram", "youtube_shorts"],
  },
  {
    id: "short_2",
    highlightId: "h_2",
    title: "Why most creators quit at month 3",
    hook: "90% of creators give up right before it works.",
    theme: "Creator economy",
    startSec: 542,
    endSec: 595,
    durationSec: 53,
    layout: "split_top_bottom",
    captionStyle: defaultCaption,
    cta: "Save this for later 📌",
    platforms: ["tiktok", "instagram", "youtube_shorts", "x"],
  },
  {
    id: "short_3",
    highlightId: "h_3",
    title: "The one habit billionaires share",
    hook: "He does this every morning before 6am.",
    theme: "Productivity",
    startSec: 880,
    endSec: 932,
    durationSec: 52,
    layout: "centered_card",
    captionStyle: defaultCaption,
    cta: "Comment your morning routine 👇",
    platforms: ["tiktok", "instagram", "youtube_shorts", "facebook"],
  },
  {
    id: "short_4",
    highlightId: "h_4",
    title: "AI is replacing this skill first",
    hook: "If you do this for a living, listen up.",
    theme: "AI & future of work",
    startSec: 1420,
    endSec: 1478,
    durationSec: 58,
    layout: "full_bleed",
    captionStyle: defaultCaption,
    cta: "Follow for daily AI insights",
    platforms: ["tiktok", "instagram", "youtube_shorts", "x", "facebook"],
  },
];

const platformCopy: ShortCopy[] = shorts.map((s) => ({
  shortId: s.id,
  copies: [
    {
      platform: "tiktok",
      title: s.title,
      description: `${s.hook} ${s.cta}`,
      hashtags: ["#fyp", "#viral", "#mindset", "#shorts"],
      cta: s.cta,
    },
    {
      platform: "instagram",
      title: s.title,
      description: `${s.hook}\n\n${s.cta}`,
      hashtags: ["#reels", "#explore", "#motivation", "#growth"],
      cta: s.cta,
    },
    {
      platform: "youtube_shorts",
      title: s.title,
      description: `${s.hook}\n\nSubscribe for more.\n${s.cta}`,
      hashtags: ["#shorts", "#youtubeshorts"],
      cta: s.cta,
    },
    {
      platform: "facebook",
      title: s.title,
      description: `${s.hook} — ${s.cta}`,
      hashtags: ["#video", "#share"],
      cta: s.cta,
    },
    {
      platform: "x",
      title: s.title,
      description: `${s.hook}`,
      hashtags: ["#shorts", "#AI"],
      cta: s.cta,
    },
  ],
}));

export const demoResult: GenerateShortsResult = {
  ingestion: {
    url: "https://www.youtube.com/watch?v=demo",
    sourceType: "youtube",
    ingestionMethod: "yt-dlp",
    metadata: {
      title: "How to build a creator business in 2026",
      author: "Demo Channel",
      durationSec: 2400,
    },
  },
  shorts,
  platformCopy,
};
