import { motion } from "framer-motion";
import {
  Captions,
  Download,
  Link2,
  PenLine,
  Sparkles,
  Wand2,
} from "lucide-react";

const features = [
  { icon: Link2, title: "URL ingestion", blurb: "YouTube, podcasts, direct video — paste a link and we handle the rest." },
  { icon: Sparkles, title: "AI highlight detection", blurb: "We surface the moments people will actually rewatch and share." },
  { icon: Wand2, title: "Short-form planner", blurb: "Hook, theme, layout and CTA — planned for vertical, scroll-stopping output." },
  { icon: PenLine, title: "Per-platform copy", blurb: "Tailored titles, descriptions and hashtags for each network." },
  { icon: Captions, title: "Auto captions", blurb: "Highlighted, styled captions burned in — accessible and high-retention." },
  { icon: Download, title: "One-click render", blurb: "Queued, rendered with FFmpeg, and ready to download as MP4." },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to ship shorts <span className="text-gradient">daily</span>.
        </h2>
        <p className="mt-3 text-muted-foreground">
          A complete pipeline — from raw URL to platform-ready vertical video.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="rounded-2xl border border-white/10 bg-card p-5 transition hover:border-fuchsia-400/30"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 ring-1 ring-white/10">
              <f.icon className="h-5 w-5 text-fuchsia-300" />
            </div>
            <h3 className="text-base font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.blurb}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
