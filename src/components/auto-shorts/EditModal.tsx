import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { variation } from "@/lib/api";
import type { ShortCopy, ShortPlan } from "@/lib/types";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { PlatformTabs } from "./PlatformTabs";

interface Props {
  open: boolean;
  onClose: () => void;
  short: ShortPlan | null;
  copy: ShortCopy | undefined;
  onSave: (updated: ShortPlan) => void;
}

export function EditModal({ open, onClose, short, copy, onSave }: Props) {
  const [hook, setHook] = useState("");
  const [cta, setCta] = useState("");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<ShortPlan | null>(null);

  useEffect(() => {
    if (short) {
      setLocal(short);
      setHook(short.hook);
      setCta(short.cta);
      setInstruction("");
    }
  }, [short]);

  if (!local) return null;

  const handleSave = () => {
    onSave({ ...local, hook, cta });
    onClose();
  };

  const handleReangle = async () => {
    if (!instruction.trim()) return;
    setBusy(true);
    try {
      const { data } = await variation({ ...local, hook, cta }, instruction.trim());
      setLocal(data);
      setHook(data.hook);
      setCta(data.cta);
      setInstruction("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-white/10 bg-card">
        <DialogHeader>
          <DialogTitle>Edit short</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="tile-gradient-2 relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
              <div className="absolute inset-x-4 bottom-4 text-lg font-bold leading-snug text-white drop-shadow">
                {hook}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="hook">Hook</label>
              <Textarea
                id="hook"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                rows={3}
                className="bg-white/5"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="cta">CTA</label>
              <Input id="cta" value={cta} onChange={(e) => setCta(e.target.value)} className="bg-white/5" />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <label className="mb-2 block text-xs font-medium text-muted-foreground" htmlFor="instr">
                Re-angle with a new instruction
              </label>
              <div className="flex gap-2">
                <Input
                  id="instr"
                  placeholder="e.g. make it funnier, lead with the stat"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="bg-white/5"
                />
                <Button
                  onClick={handleReangle}
                  disabled={busy || !instruction.trim()}
                  className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white hover:opacity-90"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Re-angle
                </Button>
              </div>
            </div>
          </div>
        </div>

        {copy && (
          <div className="mt-2 rounded-2xl border border-white/10 bg-background/40 p-4">
            <PlatformTabs copies={copy.copies} />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
