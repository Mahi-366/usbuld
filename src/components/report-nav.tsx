import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function ReportNav({ active }: { active: "stock" | "uld" }) {
  return (
    <div className="mb-4 flex w-fit gap-1 rounded-lg border border-border bg-card p-1">
      <Link
        to="/reports"
        className={cn(
          "cursor-pointer rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors",
          active === "stock"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Stock &amp; movement
      </Link>
      <Link
        to="/reports/uld"
        className={cn(
          "cursor-pointer rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors",
          active === "uld"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        Aircraft ULD
      </Link>
    </div>
  );
}
