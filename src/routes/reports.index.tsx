import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileBarChart } from "lucide-react";
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
} from "@/components/uld-ui";
import { shipments, stations, stationStocks, units, type UnitType } from "@/lib/uld-data";

export const Route = createFileRoute("/reports/")({
  head: () => ({
    meta: [
      { title: "Reports — ULD Control" },
      {
        name: "description",
        content:
          "AKE and PMC movement reports with date and station filters, plus downloadable stock summaries.",
      },
      { property: "og:title", content: "Reports — ULD Control" },
      {
        property: "og:description",
        content:
          "AKE and PMC movement reports with date and station filters, plus downloadable stock summaries.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const [tab, setTab] = useState<UnitType>("AKE");
  const [station, setStation] = useState("all");

  const stocks = useMemo(() => stationStocks(), []);
  const rows = station === "all" ? stocks : stocks.filter((s) => s.station.code === station);

  const typeUnits = units.filter((u) => u.type === tab);
  const movements = shipments.filter((s) =>
    station === "all" ? true : s.from === station || s.to === station,
  );

  return (
    <AppShell>
      <PageHeader
        title="Reports"
        description="Stock and movement reporting for AKE containers and PMC pallets, filtered by date range and station."
        actions={
          <button className={btn.primary}>
            <Download className="size-4" />
            Download {tab} report
          </button>
        }
      />

      <ReportNav active="stock" />

      <div className="mb-4 flex w-fit gap-1 rounded-lg border border-border bg-card p-1">
        {(["AKE", "PMC"] as UnitType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t} Report
          </button>
        ))}
      </div>

      <Panel className="mb-4" title="Filters">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="From date">
            <input className={inputClass} type="date" defaultValue="2026-07-01" />
          </Field>
          <Field label="To date">
            <input className={inputClass} type="date" defaultValue="2026-08-13" />
          </Field>
          <Field label="Station">
            <select
              className={selectClass}
              value={station}
              onChange={(e) => setStation(e.target.value)}
            >
              <option value="all">All stations</option>
              {stations.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.city}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Condition">
            <select className={selectClass} defaultValue="all">
              <option value="all">All conditions</option>
              <option>Active</option>
              <option>Under Repair</option>
              <option>Lite Damage</option>
              <option>Damage</option>
            </select>
          </Field>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Total ${tab} units`}
          value={typeUnits.length}
          hint="Across selected scope"
          icon={<FileBarChart className="size-4" />}
        />
        <StatCard
          label="Serviceable"
          value={typeUnits.filter((u) => u.condition === "Active").length}
          tone="ok"
        />
        <StatCard
          label="Movements in period"
          value={movements.length}
          hint="Send and receive events"
        />
        <StatCard
          label="Open discrepancies"
          value={movements.filter((s) => s.status === "Discrepancy").length}
          tone="alert"
        />
      </div>

      <Panel
        className="mt-4"
        bodyClassName="p-0"
        title={`${tab} stock by station`}
        description="Holding position at the end of the selected period."
      >
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Station</th>
              <th className={th}>Type</th>
              <th className={`${th} text-right`}>{tab} stock</th>
              <th className={`${th} text-right`}>Capacity</th>
              <th className={`${th} text-right`}>Utilisation</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.station.id} className="hover:bg-surface/60">
                <td className={td}>
                  <span className="font-display font-semibold">{r.station.code}</span>
                  <span className="ml-2 text-muted-foreground">{r.station.city}</span>
                </td>
                <td className={`${td} text-muted-foreground`}>{r.station.kind}</td>
                <td className={`${td} text-right tabular font-semibold`}>
                  {tab === "AKE" ? r.ake : r.pmc}
                </td>
                <td className={`${td} text-right tabular text-muted-foreground`}>
                  {r.station.capacity}
                </td>
                <td className={`${td} text-right tabular`}>{r.utilisation}%</td>
                <td className={td}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>

      <Panel
        className="mt-4"
        bodyClassName="p-0"
        title={`${tab} movement log`}
        description="Send and receive activity within the selected filters."
      >
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Reference</th>
              <th className={th}>Route</th>
              <th className={th}>Flight</th>
              <th className={th}>Sent</th>
              <th className={th}>Received</th>
              <th className={`${th} text-right`}>{tab} sent</th>
              <th className={`${th} text-right`}>{tab} received</th>
              <th className={th}>Variance</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((s) => {
              const sent = tab === "AKE" ? s.akeSent : s.pmcSent;
              const recv = tab === "AKE" ? s.akeReceived : s.pmcReceived;
              const variance = recv === undefined ? null : recv - sent;
              return (
                <tr key={s.id} className="hover:bg-surface/60">
                  <td className={`${td} font-medium`}>{s.reference}</td>
                  <td className={td}>
                    {s.from} → {s.to}
                  </td>
                  <td className={`${td} text-muted-foreground`}>{s.flight}</td>
                  <td className={`${td} tabular`}>{s.sentOn}</td>
                  <td className={`${td} tabular text-muted-foreground`}>{s.receivedOn ?? "—"}</td>
                  <td className={`${td} text-right tabular`}>{sent}</td>
                  <td className={`${td} text-right tabular`}>{recv ?? "—"}</td>
                  <td className={td}>
                    {variance === null ? (
                      <span className="text-muted-foreground">Pending</span>
                    ) : variance === 0 ? (
                      <span className="font-semibold text-ok">Matched</span>
                    ) : (
                      <span className="font-semibold text-destructive tabular">{variance}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </TableShell>
        </Panel>

      <Panel
        className="mt-4"
        bodyClassName="p-0"
        title={`${tab} condition breakdown`}
        description="Non-serviceable units requiring attention."
      >
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Unit number</th>
              <th className={th}>Station</th>
              <th className={th}>Condition</th>
              <th className={th}>Last movement</th>
            </tr>
          </thead>
          <tbody>
            {typeUnits
              .filter((u) => u.condition !== "Active")
              .filter((u) => (station === "all" ? true : u.stationCode === station))
              .slice(0, 12)
              .map((u) => (
                <tr key={u.id} className="hover:bg-surface/60">
                  <td className={`${td} font-display font-semibold`}>{u.number}</td>
                  <td className={td}>{u.stationCode}</td>
                  <td className={td}>
                    <ConditionBadge condition={u.condition} />
                  </td>
                  <td className={`${td} tabular text-muted-foreground`}>{u.lastMovement}</td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Panel>
    </AppShell>
  );
}
