import { Button } from "@/components/ui/button";
import { Settings, Wand2 } from "lucide-react";

export function Nav({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500 ring-glow">
            <Wand2 className="h-4 w-4 text-white" />
          </span>
          <span>Auto-Shorts <span className="text-gradient">AI</span></span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#generate" className="hover:text-foreground transition-colors">Generate</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white hover:opacity-90"
          >
            <a href="#generate">Generate shorts</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
