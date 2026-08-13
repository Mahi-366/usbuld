import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Condition, ShipmentStatus } from "@/lib/uld-data";

const conditionStyles: Record<Condition, string> = {
  Active: "bg-ok/12 text-ok border-ok/25",
  "Under Repair": "bg-warn/18 text-warn-foreground border-warn/40",
  "Lite Damage": "bg-alert/12 text-alert border-alert/30",
  Damage: "bg-destructive/10 text-destructive border-destructive/25",
};

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        conditionStyles[condition],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {condition}
    </span>
  );
}

const statusStyles: Record<ShipmentStatus, string> = {
  "In Transit": "bg-info/10 text-info border-info/25",
  Received: "bg-ok/12 text-ok border-ok/25",
  Discrepancy: "bg-destructive/10 text-destructive border-destructive/25",
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

export function TypeBadge({ type }: { type: "AKE" | "PMC" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wide",
        type === "AKE"
          ? "border-primary/25 bg-primary/8 text-primary"
          : "border-chart-2/30 bg-chart-2/10 text-chart-2",
      )}
    >
      {type}
    </span>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card shadow-[var(--shadow-panel)]",
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            {title && (
              <h2 className="font-display text-[14px] font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "ok" | "warn" | "alert";
}) {
  const tones = {
    default: "text-primary bg-primary/8",
    ok: "text-ok bg-ok/12",
    warn: "text-warn-foreground bg-warn/20",
    alert: "text-destructive bg-destructive/10",
  } as const;
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-panel)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {icon && (
          <span className={cn("flex size-8 items-center justify-center rounded-md", tones[tone])}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-[26px] font-semibold tabular leading-none text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[12px] font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40";

export const selectClass = inputClass;

export const btn = {
  primary:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
  outline:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-input bg-card px-3.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface",
  ghost:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
  danger:
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-destructive px-3.5 text-[13px] font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90",
};

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  );
}

export const th =
  "border-b border-border px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap";
export const td = "border-b border-border/70 px-3 py-2.5 align-middle";
