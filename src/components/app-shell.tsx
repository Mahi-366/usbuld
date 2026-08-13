import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PlusSquare,
  Send,
  Inbox,
  Boxes,
  FileBarChart,
  Building2,
  Users,
  ShieldCheck,
  Plane,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { currentUser, currentStation } from "@/lib/uld-data";

const nav = [
  { group: "Operations", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/create", label: "Create", icon: PlusSquare },
    { to: "/send", label: "Send", icon: Send },
    { to: "/receive", label: "Receive", icon: Inbox },
  ]},
  { group: "Inventory", items: [
    { to: "/units", label: "AKE & PMC", icon: Boxes },
    { to: "/reports", label: "Reports", icon: FileBarChart },
  ]},
  { group: "Administration", items: [
    { to: "/stations", label: "Stations", icon: Building2 },
    { to: "/users", label: "User Management", icon: Users },
    { to: "/roles", label: "Roles & Permissions", icon: ShieldCheck },
  ]},
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Plane className="size-4.5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-semibold text-sidebar-accent-foreground">
              ULD Control
            </span>
            <span className="block text-[11px] tracking-wide text-sidebar-foreground/70">
              AKE &amp; PMC Management
            </span>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {nav.map((section) => (
            <div key={section.group} className="mb-5">
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/45">
                {section.group}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active =
                    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-[11px] font-semibold text-sidebar-accent-foreground">
              IH
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13px] font-medium text-sidebar-accent-foreground">
                {currentUser.name}
              </span>
              <span className="block truncate text-[11px] text-sidebar-foreground/65">
                {currentUser.role}
              </span>
            </span>
            <Link to="/login" className="text-sidebar-foreground/60 hover:text-sidebar-accent-foreground">
              <LogOut className="size-4" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
          <div className="relative hidden max-w-sm flex-1 items-center md:flex">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <input
              placeholder="Search AKE / PMC number, shipment reference…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-[13px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-md bg-surface px-2.5 py-1.5 text-[12px] font-medium text-surface-foreground sm:flex">
              <Building2 className="size-3.5 text-muted-foreground" />
              Station: {currentStation} · Headquarter
            </span>
            <button className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
              <Bell className="size-4.5" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-alert" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
