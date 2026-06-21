import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALL_PLATFORMS, PLATFORM_LABELS, type Platform } from "@/lib/types";
import type { GenStep } from "@/hooks/useGenerateShorts";
import { Loader2, Wand2 } from "lucide-react";
import { useState } from "react";

interface Props {
  step: GenStep;
  error: string | null;
  onSubmit: (url: string, prefs: { numShorts: number; platforms: Platform[] }) => void;
}

const steps: { key: GenStep; label: string }[] = [
  { key: "ingesting", label: "Ingesting" },
  { key: "transcribing", label: "Transcribing" },
  { key: "highlights", label: "Finding highlights" },
  { key: "writing", label: "Writing copy" },
];

export function Generator({ step, error, onSubmit }: Props) {
  const [url, setUrl] = useState("");
  const [num, setNum] = useState(4);
  const [platforms, setPlatforms] = useState<Platform[]>([...ALL_PLATFORMS]);

  const loading = step !== "idle" && step !== "done" && step !== "error";
  const stepIndex = steps.findIndex((s) => s.key === step);

  return (
    <section id="generate" className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="glass rounded-3xl border border-white/10 p-6 sm:p-8 ring-glow">
        <div className="mb-5 flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-fuchsia-400" />
          <h2 className="text-xl font-semibold">Generate shorts</h2>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (url.trim()) onSubmit(url.trim(), { numShorts: num, platforms });
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="gen-url" className="mb-2 block text-sm font-medium">Media URL</label>
            <Input
              id="gen-url"
              type="url"
              required
              placeholder="https://youtube.com/watch?v=…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 rounded-xl bg-white/5"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="num" className="mb-2 block text-sm font-medium">
                Number of shorts: <span className="text-muted-foreground">{num}</span>
              </label>
              <input
                id="num"
                type="range"
                min={1}
                max={10}
                value={num}
                onChange={(e) => setNum(parseInt(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
            </div>
            <div>
              <span className="mb-2 block text-sm font-medium">Target platforms</span>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map((p) => {
                  const active = platforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setPlatforms((prev) =>
                          prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
                        )
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        active
                          ? "border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-100"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {PLATFORM_LABELS[p]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-base font-medium text-white hover:opacity-90 sm:w-auto sm:px-8"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "Working…" : "Generate shorts"}
          </Button>
        </form>

        {loading && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {steps.map((s, i) => {
              const done = stepIndex > i;
              const active = stepIndex === i;
              return (
                <div
                  key={s.key}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    done
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : active
                      ? "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-100"
                      : "border-white/10 bg-white/5 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {active ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <span
                        className={`h-2 w-2 rounded-full ${
                          done ? "bg-emerald-400" : "bg-white/20"
                        }`}
                      />
                    )}
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}
      </div>
    </section>
  );
}
