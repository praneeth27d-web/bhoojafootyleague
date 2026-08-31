import { Link } from "@tanstack/react-router";
import { Menu, Table2, CalendarDays, BarChart3, Newspaper, ArrowLeftRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import logo from "@/assets/bfl-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/table", label: "Table", icon: Table2 },
  { to: "/fixtures-results", label: "Fixtures & Results", icon: CalendarDays },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/news", label: "News", icon: Newspaper, soon: true },
  { to: "/transfer-rumours", label: "Transfer Rumours", icon: ArrowLeftRight, soon: true },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
        >
          <item.icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{item.label}</span>
          {item.soon && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Soon
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link to="/" onClick={onNavigate} className="flex items-center gap-3" aria-label="Bhooja Football League home">
      <img src={logo} alt="Bhooja Football League crest" width={40} height={40} className="size-10" />
      <span className="leading-tight">
        <span className="block text-sm font-extrabold">Bhooja</span>
        <span className="block text-xs text-muted-foreground">Football League</span>
      </span>
    </Link>
  );
}

export function AppShell({
  title,
  subtitle,
  badge = "Halfway through league",
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string | null;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
        <Brand />
        <div className="mt-8 flex-1">
          <NavList />
        </div>
        <p className="text-[11px] text-muted-foreground">Season 2026 · Matchday 3 of 5</p>
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Open navigation"
            className="rounded-md border border-border p-2 text-foreground"
          >
            <Menu className="size-4" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar px-4 py-6">
            <Brand onNavigate={() => setOpen(false)} />
            <div className="mt-8">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Brand />
      </header>

      <div className="lg:pl-60">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {badge && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {badge}
              </span>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card-surface overflow-hidden", className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold">{title}</h2>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatusPill({ status }: { status: "completed" | "upcoming" }) {
  return status === "completed" ? (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      Full time
    </span>
  ) : (
    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
      Upcoming
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card-surface flex min-h-56 items-center justify-center px-6 py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
