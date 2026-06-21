import { Button } from "@/components/ui/button";
import { formatTimecode } from "@/lib/format";
import { isDownloadable, isPolling, renderButtonLabel } from "@/lib/render";
import { PLATFORM_LABELS, type ShortCopy, type ShortPlan } from "@/lib/types";
import { useRenderJob } from "@/hooks/useRenderJob";
import { motion } from "framer-motion";
import { Check, Copy, Download, Loader2, Pencil, Play } from "lucide-react";
import { useState } from "react";

interface Props {
  short: ShortPlan;
  copy: ShortCopy | undefined;
  index: number;
  onEdit: () => void;
}

const tileClasses = [
  "tile-gradient-1",
  "tile-gradient-2",
  "tile-gradient-3",
  "tile-gradient-4",
];

export function ShortCard({ short, copy, index, onEdit }: Props) {
  const { job, start, error } = useRenderJob(short.id);
  const [copied, setCopied] = useState(false);

  const status = job?.status;
  const polling = isPolling(status);
  const downloadable = isDownloadable(job);

  const handleCopy = async () => {
    const c = copy?.copies[0];
    if (!c) return;
    const text = `${c.title}\n\n${c.description}\n\n${c.hashtags.join(" ")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card"
    >
      <div className={`relative aspect-[9/16] ${tileClasses[index % tileClasses.length]}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
        <div className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
          {formatTimecode(short.durationSec)}
        </div>
        <div className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-white/30">
          <Play className="h-4 w-4 text-white" />
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <p className="text-base font-bold leading-snug text-white drop-shadow-md sm:text-lg">
            {short.hook}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold">{short.title}</h3>
        <div className="flex flex-wrap gap-1">
          {short.platforms.map((p) => (
            <span
              key={p}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {PLATFORM_LABELS[p]}
            </span>
          ))}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onEdit} className="border-white/10 bg-white/5">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>

          {downloadable ? (
            <Button
              asChild
              size="sm"
              className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
            >
              <a href={job!.outputUrl} download>
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={start}
              disabled={polling}
              className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white hover:opacity-90"
            >
              {polling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {renderButtonLabel(status)}
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy text"}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </motion.div>
  );
}
