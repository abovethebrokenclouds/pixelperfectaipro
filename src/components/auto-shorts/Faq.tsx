import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "What links work?", a: "YouTube videos, public podcast RSS items, and direct video URLs (MP4, etc.)." },
  { q: "How long does it take?", a: "Most 20-minute sources are ingested and planned in under a minute. Rendering a single short is typically 10–30 seconds." },
  { q: "Which platforms are supported?", a: "TikTok, Instagram Reels, YouTube Shorts, Facebook, and X — each gets its own tailored title, description and hashtags." },
  { q: "Do I need an API key?", a: "No. The hosted Auto-Shorts backend handles transcription and the AI pipeline. You only point this app at the backend URL." },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">FAQ</h2>
      <Accordion type="single" collapsible className="rounded-2xl border border-white/10 bg-card px-4">
        {faqs.map((f) => (
          <AccordionItem key={f.q} value={f.q} className="border-white/10">
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
