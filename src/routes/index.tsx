import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DemoBadge } from "@/components/auto-shorts/DemoBadge";
import { EditModal } from "@/components/auto-shorts/EditModal";
import { Faq } from "@/components/auto-shorts/Faq";
import { Features } from "@/components/auto-shorts/Features";
import { Footer } from "@/components/auto-shorts/Footer";
import { Generator } from "@/components/auto-shorts/Generator";
import { Hero } from "@/components/auto-shorts/Hero";
import { HowItWorks } from "@/components/auto-shorts/HowItWorks";
import { Nav } from "@/components/auto-shorts/Nav";
import { SettingsModal } from "@/components/auto-shorts/SettingsModal";
import { ShortsGrid } from "@/components/auto-shorts/ShortsGrid";
import { useGenerateShorts } from "@/hooks/useGenerateShorts";
import { useSettings } from "@/hooks/useSettings";
import type { ShortPlan } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auto-Shorts AI — Turn any link into scroll-stopping shorts" },
      {
        name: "description",
        content:
          "Paste any URL — YouTube, podcast or video — and Auto-Shorts AI generates platform-ready 9:16 shorts with captions, hooks and per-platform copy.",
      },
      { property: "og:title", content: "Auto-Shorts AI" },
      {
        property: "og:description",
        content:
          "Turn any link into scroll-stopping shorts for TikTok, Reels and YouTube Shorts.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { settings, update } = useSettings();
  const gen = useGenerateShorts();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editing, setEditing] = useState<ShortPlan | null>(null);

  const handleGenerate = (url: string, prefs?: { numShorts: number; platforms: any[] }) => {
    gen.run(url, prefs);
    requestAnimationFrame(() => {
      document.getElementById("generate")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="bg-app min-h-screen text-foreground">
      <Nav onOpenSettings={() => setSettingsOpen(true)} />
      <Hero
        onGenerate={(url) => handleGenerate(url)}
        onDemo={() => {
          gen.loadDemo();
          requestAnimationFrame(() => {
            document.getElementById("generate")?.scrollIntoView({ behavior: "smooth" });
          });
        }}
      />
      <Generator
        step={gen.step}
        error={gen.error}
        onSubmit={(url, prefs) => handleGenerate(url, prefs)}
      />

      {gen.result && (
        <>
          {gen.usedDemo && (
            <div className="mx-auto mt-8 flex max-w-7xl justify-center px-4 sm:px-6">
              <DemoBadge />
            </div>
          )}
          <ShortsGrid
            shorts={gen.result.shorts}
            platformCopy={gen.result.platformCopy}
            onEdit={(s) => setEditing(s)}
          />
        </>
      )}

      <Features />
      <HowItWorks />
      <Faq />
      <Footer />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={update}
      />
      <EditModal
        open={!!editing}
        onClose={() => setEditing(null)}
        short={editing}
        copy={gen.result?.platformCopy.find((c) => c.shortId === editing?.id)}
        onSave={(updated) => gen.updateShort(updated)}
      />
    </div>
  );
}
