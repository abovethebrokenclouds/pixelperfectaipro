import { motion } from "framer-motion";

const steps = [
  { n: 1, title: "Paste URL", desc: "Drop in any YouTube, podcast, or video link." },
  { n: 2, title: "Transcribe", desc: "Whisper produces a word-accurate transcript." },
  { n: 3, title: "Detect highlights", desc: "Claude finds the most clip-worthy moments." },
  { n: 4, title: "Plan + write copy", desc: "Hook, CTA, captions and per-platform copy." },
  { n: 5, title: "Render & download", desc: "FFmpeg renders 9:16 MP4s ready to post." },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
        <p className="mt-3 text-muted-foreground">Five steps. About a minute of your attention.</p>
      </div>
      <ol className="grid gap-4 md:grid-cols-5">
        {steps.map((s, i) => (
          <motion.li
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="relative rounded-2xl border border-white/10 bg-card p-5"
          >
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-sm font-bold text-white">
              {s.n}
            </div>
            <h3 className="text-sm font-semibold">{s.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
