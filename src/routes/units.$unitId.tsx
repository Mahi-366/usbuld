import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Wrench, Route as RouteIcon, Mail } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { btn, ConditionBadge, Panel, TypeBadge } from "@/components/uld-ui";
import { journeys, stationByCode, unitById } from "@/lib/uld-data";

export const Route = createFileRoute("/units/$unitId")({
  loader: ({ params }) => {
    const unit = unitById(params.unitId);
    if (!unit) throw notFound();
    return { unit };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unit not found — ULD Control" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.unit.number} — ULD Control`;
    const description = `Location, condition and full movement journey for ${loaderData.unit.type} unit ${loaderData.unit.number}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: UnitDetail,
  notFoundComponent: UnitNotFound,
});

function UnitNotFound() {
  return (
    <AppShell>
      <PageHeader title="Unit not found" description="This AKE or PMC number is not in the registry." />
      <Link to="/units" className={btn.outline}>
        <ArrowLeft className="size-4" />
        Back to registry
      </Link>
    </AppShell>
  );
}

function UnitDetail() {
  const { unit } = Route.useLoaderData();
  const legs = journeys.default!;
  const station = stationByCode(unit.stationCode);

  return (
    <AppShell>
      <Link
        to="/units"
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to registry
      </Link>

      <PageHeader
        title={unit.number}
        description={`${unit.type === "AKE" ? "Baggage container" : "Cargo pallet"} · owner code ${unit.ownerAirline}`}
        actions={
          <button className={btn.outline}>
            <Mail className="size-4" />
            Email unit history
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Panel title="Current status">
            <dl className="space-y-3.5 text-[13px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Type</dt>
                <dd>
                  <TypeBadge type={unit.type} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Condition</dt>
                <dd>
                  <ConditionBadge condition={unit.condition} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Station</dt>
                <dd className="text-right font-semibold">
                  {station?.code}
                  <span className="ml-1.5 font-normal text-muted-foreground">{station?.city}</span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Station type</dt>
                <dd className="font-medium">{station?.kind}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Last movement</dt>
                <dd className="tabular font-medium">{unit.lastMovement}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Total legs flown</dt>
                <dd className="tabular font-medium">{legs.length}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Quick facts">
            <ul className="space-y-3 text-[12px]">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  Currently held at <strong>{station?.name}</strong>, {station?.city}.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Wrench className="mt-0.5 size-4 shrink-0 text-warn-foreground" />
                <span>
                  Condition changed {legs.filter((l) => l.conditionOut !== l.conditionIn).length}{" "}
                  times over its recorded journey.
                </span>
              </li>
              <li className="flex gap-2.5">
                <RouteIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  Visited {new Set(legs.flatMap((l) => [l.from, l.to])).size} stations to date.
                </span>
              </li>
            </ul>
          </Panel>
        </div>

        <Panel
          title="Movement journey"
          description="Every station-to-station leg, with the condition recorded at dispatch and on arrival."
        >
          <ol className="relative space-y-6 pl-6">
            <span className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
            {legs.map((leg, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-6 top-1 flex size-3.5 items-center justify-center rounded-full border-2 border-card bg-primary" />
                <div className="rounded-md border border-border bg-surface/40 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-display text-[14px] font-semibold">
                      {leg.from} → {leg.to}
                    </p>
                    <p className="tabular text-[12px] text-muted-foreground">
                      {leg.date} · {leg.flight}
                    </p>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="text-muted-foreground">Dispatched as</span>
                    <ConditionBadge condition={leg.conditionOut} />
                    <span className="text-muted-foreground">→ arrived as</span>
                    <ConditionBadge condition={leg.conditionIn} />
                  </div>
                  {leg.remarks && (
                    <p className="mt-2.5 border-t border-border pt-2.5 text-[12px] text-muted-foreground">
                      {leg.remarks}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </AppShell>
  );
}
