import { Sparkles } from "lucide-react";

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300">
      <Sparkles className="h-3 w-3" />
      Demo data
    </span>
  );
}
