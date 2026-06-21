import type { ShortCopy, ShortPlan } from "@/lib/types";
import { ShortCard } from "./ShortCard";

interface Props {
  shorts: ShortPlan[];
  platformCopy: ShortCopy[];
  onEdit: (short: ShortPlan) => void;
}

export function ShortsGrid({ shorts, platformCopy, onEdit }: Props) {
  if (!shorts.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">Your shorts</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shorts.map((s, i) => (
          <ShortCard
            key={s.id}
            short={s}
            index={i}
            copy={platformCopy.find((c) => c.shortId === s.id)}
            onEdit={() => onEdit(s)}
          />
        ))}
      </div>
    </section>
  );
}
