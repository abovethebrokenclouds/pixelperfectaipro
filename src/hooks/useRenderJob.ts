import { useCallback, useEffect, useRef, useState } from "react";
import { getJob, renderShort } from "@/lib/api";
import { isPolling } from "@/lib/render";
import type { RenderJob } from "@/lib/types";

export function useRenderJob(shortId: string) {
  const [job, setJob] = useState<RenderJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const { data } = await renderShort(shortId);
      if (!mounted.current) return;
      setJob(data);
      stopPolling();
      timer.current = setInterval(async () => {
        try {
          const polled = await getJob(data.id);
          if (!mounted.current) return;
          setJob(polled.data);
          if (!isPolling(polled.data.status)) stopPolling();
        } catch (e: any) {
          setError(e?.message || "Polling failed");
          stopPolling();
        }
      }, 2000);
    } catch (e: any) {
      setError(e?.message || "Failed to start render");
    }
  }, [shortId, stopPolling]);

  return { job, error, start };
}
