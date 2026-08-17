import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, LayoutGrid, PlaneTakeoff } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { ReportNav } from "@/components/report-nav";
import {
  btn,
  ConditionBadge,
  Field,
  inputClass,
  Panel,
  selectClass,
  StatCard,
  TableShell,
  td,
  th,
  TypeBadge,
} from "@/components/uld-ui";
import {
  NIL_ULD,
  aircraftUldReport,
  departingFlights,
  stationByCode,
  stations,
  type UnitType,
} from "@/lib/uld-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports/uld")({
  head: () => ({
    meta: [
      { title: "Aircraft ULD Report — ULD Control" },
      {
        name: "description",
        content:
          "Full aircraft load sheet for AKE and PMC: every allocated position with the loaded ULD, or N if nil.",
      },
      { property: "og:title", content: "Aircraft ULD Report — ULD Control" },
      {
        property: "og:description",
        content:
          "Full aircraft load sheet for AKE and PMC: every allocated position with the loaded ULD, or N if nil.",
      },
    ],
  }),
  component: AircraftUldReportPage,
});

function AircraftUldReportPage() {
  const [date, setDate] = useState("2026-08-17");
  const [origin, setOrigin] = useState("DAC");
  const [flightId, setFlightId] = useState("fl-bg347");
  const [uldType, setUldType] = useState<UnitType | "all">("all");

  const flights = useMemo(
    () =>
      departingFlights
        .filter((f) => f.date === date && f.from === origin)
        .sort((a, b) => a.std.localeCompare(b.std)),
    [date, origin],
  );

  const selected = flights.find((f) => f.id === flightId) ?? flights[0];
  const rows = selected ? aircraftUldReport(selected.id, uldType) : [];
  const occupied = rows.filter((r) => r.occupied);
  const nilCount = rows.length - occupied.length;
  const dest = selected ? stationByCode(selected.to) : undefined;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = `${row.position.deck} · ${row.position.compartment}`;
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [rows]);

  return (
    <AppShell>
      <PageHeader
        title="Aircraft ULD report"
        description="Every allocated aircraft position for the selected flight. Occupied seats show the AKE or PMC number. Empty seats are reported as N."
        actions={
          <button className={btn.primary} disabled={!selected}>
            <Download className="size-4" />
            Download load sheet
          </button>
        }
      />

      <ReportNav active="uld" />

      <Panel className="mb-4" title="Filters">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Operating date">
            <input
              className={inputClass}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Origin station">
            <select
              className={selectClass}
              value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                setFlightId("");
              }}
            >
              {stations.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.city}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Flight">
            <select
              className={selectClass}
              value={selected?.id ?? ""}
              onChange={(e) => setFlightId(e.target.value)}
              disabled={flights.length === 0}
            >
              {flights.length === 0 && <option value="">No flights</option>}
              {flights.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.number} · {f.std} · {f.to}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ULD type" hint="All positions, or only seats that accept AKE or PMC.">
            <select
              className={selectClass}
              value={uldType}
              onChange={(e) => setUldType(e.target.value as UnitType | "all")}
            >
              <option value="all">AKE &amp; PMC</option>
              <option value="AKE">AKE only</option>
              <option value="PMC">PMC only</option>
            </select>
          </Field>
        </div>
      </Panel>

      {!selected ? (
        <Panel>
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <PlaneTakeoff className="size-8 text-muted-foreground" />
            <p className="font-display text-[14px] font-semibold">No departing flight in this filter</p>
            <p className="max-w-md text-[13px] text-muted-foreground">
              Choose another date or origin to generate the aircraft ULD report.
            </p>
          </div>
        </Panel>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-card px-4 py-2.5 text-[12px] shadow-[var(--shadow-panel)]">
            <span className="flex items-center gap-1.5 font-display text-[13px] font-semibold">
              <PlaneTakeoff className="size-4 text-primary" />
              {selected.number}
            </span>
            <span className="text-muted-foreground">
              {selected.from} → {selected.to}
              {dest ? ` (${dest.city})` : ""}
            </span>
            <span className="text-muted-foreground">{selected.aircraft}</span>
            <span className="text-muted-foreground">STD {selected.std}</span>
            <span className="ml-auto text-muted-foreground">
              Nil positions coded <span className="font-display font-semibold text-foreground">N</span>
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Allocated positions"
              value={rows.length}
              hint={uldType === "all" ? "Full aircraft" : `${uldType} seats only`}
              icon={<LayoutGrid className="size-4" />}
            />
            <StatCard label="Occupied" value={occupied.length} tone="ok" hint="ULD number shown" />
            <StatCard label="Nil (N)" value={nilCount} tone="warn" hint="Empty allocated seats" />
            <StatCard
              label="Occupancy"
              value={rows.length ? `${Math.round((occupied.length / rows.length) * 100)}%` : "0%"}
            />
          </div>

          <Panel
            className="mt-4"
            title="Aircraft load plan"
            description="Every allocated box on this aircraft. N means the position is empty."
          >
            <div className="space-y-5">
              {grouped.map(([section, seats]) => (
                <div key={section}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {section}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                    {seats.map((seat) => (
                      <div
                        key={seat.position.id}
                        className={cn(
                          "rounded-md border px-3 py-2.5",
                          seat.occupied
                            ? "border-primary/30 bg-primary/5"
                            : "border-dashed border-border bg-surface/60",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-[13px] font-semibold tabular">
                            {seat.position.code}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {seat.position.unitTypes.join(" / ")}
                          </span>
                        </div>
                        {seat.occupied ? (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <TypeBadge type={seat.unitType!} />
                            <span className="font-display text-[12px] font-semibold">{seat.uld}</span>
                          </div>
                        ) : (
                          <p className="mt-1.5 font-display text-[22px] font-semibold leading-none text-muted-foreground">
                            N
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            className="mt-4"
            bodyClassName="p-0"
            title="Position register"
            description="Tabular load sheet. Empty allocated positions are N, not omitted."
          >
            <TableShell>
              <thead>
                <tr>
                  <th className={th}>Position</th>
                  <th className={th}>Deck</th>
                  <th className={th}>Compartment</th>
                  <th className={th}>Accepts</th>
                  <th className={th}>ULD</th>
                  <th className={th}>Type</th>
                  <th className={th}>Condition</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.position.id}
                    className={r.occupied ? "hover:bg-surface/60" : "bg-surface/40"}
                  >
                    <td className={`${td} font-display font-semibold tabular`}>{r.position.code}</td>
                    <td className={`${td} text-muted-foreground`}>{r.position.deck}</td>
                    <td className={td}>{r.position.compartment}</td>
                    <td className={`${td} text-muted-foreground`}>
                      {r.position.unitTypes.join(" / ")}
                    </td>
                    <td className={td}>
                      {r.occupied ? (
                        <span className="font-display font-semibold">{r.uld}</span>
                      ) : (
                        <span className="font-display font-bold text-muted-foreground">{NIL_ULD}</span>
                      )}
                    </td>
                    <td className={td}>{r.unitType ? <TypeBadge type={r.unitType} /> : NIL_ULD}</td>
                    <td className={td}>
                      {r.condition ? <ConditionBadge condition={r.condition} /> : NIL_ULD}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </Panel>
        </>
      )}
    </AppShell>
  );
}
