import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { testConnection, type Settings } from "@/lib/api";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
}

export function SettingsModal({ open, onClose, settings, onUpdate }: Props) {
  const [url, setUrl] = useState(settings.baseUrl);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<null | boolean>(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    onUpdate({ baseUrl: url });
    const ok = await testConnection();
    setResult(ok);
    setTesting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-white/10 bg-card">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure the Auto-Shorts backend.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div>
            <label htmlFor="baseUrl" className="mb-2 block text-sm font-medium">
              API base URL
            </label>
            <Input
              id="baseUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:4000"
              className="bg-white/5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Persisted to localStorage. Overrides VITE_API_BASE_URL.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleTest} disabled={testing} variant="outline" className="border-white/10 bg-white/5">
              {testing && <Loader2 className="h-4 w-4 animate-spin" />}
              Test connection
            </Button>
            {result === true && (
              <span className="flex items-center gap-1 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Connected
              </span>
            )}
            {result === false && (
              <span className="flex items-center gap-1 text-sm text-destructive">
                <XCircle className="h-4 w-4" /> Unreachable
              </span>
            )}
          </div>
          <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <div>
              <div className="text-sm font-medium">Force demo mode</div>
              <p className="text-xs text-muted-foreground">
                Always use bundled fixtures, never hit the backend.
              </p>
            </div>
            <Switch
              checked={settings.forceDemo}
              onCheckedChange={(v) => onUpdate({ forceDemo: v })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button
              onClick={() => {
                onUpdate({ baseUrl: url });
                onClose();
              }}
              className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
