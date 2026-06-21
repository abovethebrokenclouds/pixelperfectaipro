import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useState } from "react";

interface Props {
  onGenerate: (url: string) => void;
  onDemo: () => void;
}

const floatTiles = [
  { cls: "tile-gradient-1", hook: "The 5-second rule that changed everything", time: "0:44" },
  { cls: "tile-gradient-2", hook: "Why most creators quit at month 3", time: "0:53" },
  { cls: "tile-gradient-3", hook: "AI is replacing this skill first", time: "0:58" },
];

export function Hero({ onGenerate, onDemo }: Props) {
  const [url, setUrl] = useState("");

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Powered by the Auto-Shorts backend
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
          >
            Turn any link into <span className="text-gradient">scroll-stopping</span> shorts.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Paste a YouTube video, podcast, or any media URL. We find the highlights, write
            per-platform copy, and render captioned 9:16 clips ready for TikTok, Reels & Shorts.
          </motion.p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (url.trim()) onGenerate(url.trim());
            }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="hero-url" className="sr-only">Media URL</label>
            <Input
              id="hero-url"
              type="url"
              required
              placeholder="https://youtube.com/watch?v=…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 flex-1 rounded-xl bg-white/5 text-base placeholder:text-muted-foreground/70"
            />
            <Button
              type="submit"
              className="h-12 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-6 text-base font-medium text-white hover:opacity-90"
            >
              Generate shorts <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-3">
            <Button variant="ghost" onClick={onDemo} className="text-muted-foreground hover:text-foreground">
              <Play className="h-4 w-4" /> Try the demo
            </Button>
          </div>
        </div>

        <div className="relative h-[440px] md:h-[520px]">
          {floatTiles.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
              className="absolute"
              style={{
                top: `${i * 60 + 20}px`,
                left: `${i * 50 + (i === 1 ? 140 : 0)}px`,
                zIndex: 3 - i,
              }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                className={`relative aspect-[9/16] w-44 overflow-hidden rounded-2xl ${t.cls} ring-glow border border-white/10 sm:w-56`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute right-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                  {t.time}
                </div>
                <div className="absolute inset-x-3 bottom-3 text-sm font-semibold leading-tight text-white drop-shadow">
                  {t.hook}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
