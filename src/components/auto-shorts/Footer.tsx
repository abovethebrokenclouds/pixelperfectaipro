import { Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <div>Powered by the Auto-Shorts backend.</div>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/abovethebrokenclouds/Waterfall-Claude-OS/tree/main/auto-shorts"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
          <a
            href="mailto:support@waterfalltechnologies.net"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Mail className="h-4 w-4" /> support@waterfalltechnologies.net
          </a>
        </div>
      </div>
    </footer>
  );
}
