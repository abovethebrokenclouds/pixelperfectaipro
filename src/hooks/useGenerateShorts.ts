import { useCallback, useState } from "react";
import { generateShorts } from "@/lib/api";
import { demoResult } from "@/lib/demoData";
import type { GenerateShortsResult, Platform, ShortPlan } from "@/lib/types";

export type GenStep = "idle" | "ingesting" | "transcribing" | "highlights" | "writing" | "done" | "error";

export function useGenerateShorts() {
  const [result, setResult] = useState<GenerateShortsResult | null>(null);
  const [usedDemo, setUsedDemo] = useState(false);
  const [step, setStep] = useState<GenStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (url: string, prefs?: { numShorts?: number; platforms?: Platform[] }) => {
      setError(null);
      setResult(null);
      try {
        setStep("ingesting");
        await delay(500);
        setStep("transcribing");
        const promise = generateShorts(url, prefs);
        await delay(700);
        setStep("highlights");
        await delay(500);
        setStep("writing");
        const r = await promise;
        setResult(r.data);
        setUsedDemo(r.usedDemo);
        setStep("done");
      } catch (e: any) {
        setError(e?.message || "Failed to generate");
        setStep("error");
      }
    },
    [],
  );

  const loadDemo = useCallback(() => {
    setResult(demoResult);
    setUsedDemo(true);
    setStep("done");
    setError(null);
  }, []);

  const updateShort = useCallback((updated: ShortPlan) => {
    setResult((prev) =>
      prev
        ? { ...prev, shorts: prev.shorts.map((s) => (s.id === updated.id ? updated : s)) }
        : prev,
    );
  }, []);

  return { result, usedDemo, step, error, run, loadDemo, updateShort };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
