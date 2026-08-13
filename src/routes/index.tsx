import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,

  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Boxes, Container, Building2, TriangleAlert } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import {
  Panel,
  StatCard,
  TableShell,
  td,
  th,
  selectClass,
  StatusBadge,
} from "@/components/uld-ui";
import { shipments, stationStocks, stations, units } from "@/lib/uld-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ULD Control" },
      {
        name: "description",
        content:
          "Live AKE and PMC stock levels across headquarters and outstations, with capacity and movement status.",
      },
      { property: "og:title", content: "Dashboard — ULD Control" },
      {
        property: "og:description",
        content:
          "Live AKE and PMC stock levels across headquarters and outstations, with capacity and movement status.",
      },
    ],
  }),
  component: Dashboard,
});

const statusTone: Record<string, string> = {
  Healthy: "text-ok",
  Watch: "text-warn-foreground",
  Critical: "text-destructive",
};

function Dashboard() {
  const [filter, setFilter] = useState("all");
  const stocks = useMemo(() => stationStocks(), []);

  const visible = filter === "all" ? stocks : stocks.filter((s) => s.station.code === filter);

  const totalAke = units.filter((u) => u.type === "AKE").length;
  const totalPmc = units.filter((u) => u.type === "PMC").length;
  const hq = stocks.find((s) => s.station.kind === "Headquarter")!;
  const outstationTotal = stocks
    .filter((s) => s.station.kind === "Outstation")
    .reduce((a, s) => a + s.total, 0);
  const damaged = units.filter((u) => u.condition !== "Active").length;

  const chartData = visible.map((s) => ({
    name: s.station.code,
    AKE: s.ake,
    PMC: s.pmc,
  }));

  const inTransit = shipments.filter((s) => s.status === "In Transit");
  const discrepancies = shipments.filter((s) => s.status === "Discrepancy");

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Headquarter and outstation stock position for AKE baggage containers and PMC cargo pallets."
        actions={
          <select
            className={`${selectClass} w-52`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All airports</option>
            {stations.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} — {s.city}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total AKE units"
          value={totalAke}
          hint="Baggage containers in the fleet"
          icon={<Boxes className="size-4" />}
        />
        <StatCard
          label="Total PMC units"
          value={totalPmc}
          hint="Cargo pallets in the fleet"
          icon={<Container className="size-4" />}
        />
        <StatCard
          label="Headquarter stock"
          value={hq.total}
          hint={`DAC · ${outstationTotal} units held at outstations`}
          icon={<Building2 className="size-4" />}
          tone="ok"
        />
        <StatCard
          label="Not serviceable"
          value={damaged}
          hint="Under repair, lite damage or damaged"
          icon={<TriangleAlert className="size-4" />}
          tone="alert"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Panel
          title="AKE vs PMC units by airport"
          description={filter === "all" ? "All stations" : `Filtered to ${filter}`}
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "var(--surface)" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="AKE" fill="var(--chart-1)" radius={[3, 3, 0, 0]} maxBarSize={34} />
                <Bar dataKey="PMC" fill="var(--chart-2)" radius={[3, 3, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Headquarter vs Outstation">
            <div className="space-y-3">
              {[
                { label: "Headquarter (DAC)", value: hq.total, tone: "var(--chart-1)" },
                { label: "Outstations (7)", value: outstationTotal, tone: "var(--chart-2)" },
              ].map((row) => {
                const pct = Math.round((row.value / (hq.total + outstationTotal)) * 100);
                return (
                  <div key={row.label}>
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span className="font-medium">{row.label}</span>
                      <span className="tabular font-semibold">
                        {row.value}{" "}
                        <span className="text-[11px] font-normal text-muted-foreground">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: row.tone }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Open movements">
            <ul className="space-y-2.5">
              {[...inTransit, ...discrepancies].slice(0, 4).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">
                      {s.from} → {s.to}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.reference} · {s.akeSent} AKE / {s.pmcSent} PMC
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel
        className="mt-4"
        bodyClassName="p-0"
        title="Station stock position"
        description="AKE stock, PMC stock, total capacity and status per station."
      >
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Station</th>
              <th className={th}>Type</th>
              <th className={`${th} text-right`}>AKE stock</th>
              <th className={`${th} text-right`}>PMC stock</th>
              <th className={`${th} text-right`}>Total</th>
              <th className={`${th} text-right`}>Capacity</th>
              <th className={th}>Utilisation</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.station.id} className="hover:bg-surface/60">
                <td className={td}>
                  <span className="font-display font-semibold">{s.station.code}</span>
                  <span className="ml-2 text-muted-foreground">{s.station.city}</span>
                </td>
                <td className={td}>
                  <span className="text-[12px] text-muted-foreground">{s.station.kind}</span>
                </td>
                <td className={`${td} text-right tabular`}>{s.ake}</td>
                <td className={`${td} text-right tabular`}>{s.pmc}</td>
                <td className={`${td} text-right tabular font-semibold`}>{s.total}</td>
                <td className={`${td} text-right tabular text-muted-foreground`}>
                  {s.station.capacity}
                </td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(s.utilisation, 100)}%` }}
                      />
                    </div>
                    <span className="tabular text-[12px] text-muted-foreground">
                      {s.utilisation}%
                    </span>
                  </div>
                </td>
                <td className={`${td} font-semibold ${statusTone[s.status]}`}>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>
    </AppShell>
  );
}

