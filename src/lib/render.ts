import type { RenderJob, RenderStatus } from "./types";

export function isDownloadable(job: RenderJob | null | undefined): boolean {
  return !!job && job.status === "done" && !!job.outputUrl;
}

export function isPolling(status: RenderStatus | undefined): boolean {
  return status === "queued" || status === "rendering";
}

export function renderButtonLabel(status: RenderStatus | undefined): string {
  switch (status) {
    case "queued":
      return "Queued…";
    case "rendering":
      return "Rendering…";
    case "done":
      return "Download";
    case "failed":
      return "Retry render";
    default:
      return "Render";
  }
}
