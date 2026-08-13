import { createFileRoute, Link } from "@tanstack/react-router";
import { Plane, LockKeyhole } from "lucide-react";
import { btn, Field, inputClass } from "@/components/uld-ui";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ULD Control" },
      { name: "description", content: "Sign in to the airline AKE and PMC management system." },
      { property: "og:title", content: "Sign in — ULD Control" },
      {
        property: "og:description",
        content: "Sign in to the airline AKE and PMC management system.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Plane className="size-4.5" />
          </span>
          <span className="font-display text-[15px] font-semibold text-sidebar-accent-foreground">
            ULD Control
          </span>
        </div>

        <div className="max-w-md">
          <h1 className="font-display text-[34px] font-semibold leading-tight text-sidebar-accent-foreground">
            Every container and pallet, accounted for.
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-sidebar-foreground/75">
            Track AKE baggage containers and PMC cargo pallets across headquarters and every
            outstation — stock levels, movements, condition history and reconciliation in one
            operational record.
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-6">
            {[
              ["1,054", "Units tracked"],
              ["8", "Stations"],
              ["24/7", "Movement log"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-[22px] font-semibold text-sidebar-accent-foreground tabular">
                  {v}
                </dt>
                <dd className="text-[12px] text-sidebar-foreground/65">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-[11px] text-sidebar-foreground/50">
          Authorised personnel only. All activity is logged.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Plane className="size-4.5" />
            </span>
            <span className="font-display text-[15px] font-semibold">ULD Control</span>
          </div>

          <h2 className="font-display text-[22px] font-semibold">Sign in</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Use your airline employee credentials.
          </p>

          <div className="mt-7 space-y-4">
            <Field label="Employee email">
              <input className={inputClass} placeholder="name@airline.com" type="email" />
            </Field>
            <Field label="Password">
              <input className={inputClass} placeholder="••••••••" type="password" />
            </Field>
            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="size-3.5 accent-[var(--primary)]" />
                Keep me signed in
              </label>
              <a href="#" className="font-semibold text-accent hover:underline">
                Forgot password?
              </a>
            </div>
            <Link to="/" className={`${btn.primary} w-full`}>
              <LockKeyhole className="size-4" />
              Sign in
            </Link>
          </div>

          <p className="mt-8 text-center text-[11px] text-muted-foreground">
            Access is granted per station by your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
