import { Button } from "@/components/ui/button";
import { PLATFORM_LABELS, type PlatformCopy } from "@/lib/types";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function PlatformTabs({ copies }: { copies: PlatformCopy[] }) {
  const [active, setActive] = useState(copies[0]?.platform);
  const [copied, setCopied] = useState(false);

  const current = copies.find((c) => c.platform === active) || copies[0];
  if (!current) return null;

  const text = `${current.title}\n\n${current.description}\n\n${current.hashtags.join(" ")}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-white/10 pb-2">
        {copies.map((c) => (
          <button
            key={c.platform}
            onClick={() => setActive(c.platform)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              active === c.platform
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {PLATFORM_LABELS[c.platform]}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-3 text-sm">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</div>
          <div className="mt-1 rounded-lg bg-white/5 p-2.5">{current.title}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</div>
          <div className="mt-1 whitespace-pre-wrap rounded-lg bg-white/5 p-2.5">{current.description}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Hashtags</div>
          <div className="mt-1 rounded-lg bg-white/5 p-2.5 text-fuchsia-300">{current.hashtags.join(" ")}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">CTA</div>
          <div className="mt-1 rounded-lg bg-white/5 p-2.5">{current.cta}</div>
        </div>
        <Button onClick={handleCopy} size="sm" variant="outline" className="border-white/10 bg-white/5">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy text"}
        </Button>
      </div>
    </div>
  );
}
