import { Coffee } from "lucide-react";

export function Navbar({ total }: { total: number }) {
  return (
    <header className="sticky top-0 z-20 border-b border-coffee-ink/10 bg-coffee-paper/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-coffee-cream ring-1 ring-coffee-ink/10">
            <Coffee className="h-4 w-4 text-coffee-accent" />
          </div>
          <span className="text-base font-semibold tracking-tight text-coffee-ink">
            Larica <span aria-hidden>🌊🚙</span>
          </span>
        </div>

        <div className="text-sm font-medium text-coffee-ink/70">
          Total: <span className="font-semibold text-coffee-ink">{total}</span>
        </div>
      </div>
    </header>
  );
}

