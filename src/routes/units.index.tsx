import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import {
  ConditionBadge,
  inputClass,
  Panel,
  selectClass,
  StatCard,
  TableShell,
  td,
  th,
  TypeBadge,
} from "@/components/uld-ui";
import { CONDITIONS, stations, units } from "@/lib/uld-data";

export const Route = createFileRoute("/units/")({
  head: () => ({
    meta: [
      { title: "AKE & PMC Registry — ULD Control" },
      {
        name: "description",
        content:
          "Master registry of every AKE container and PMC pallet with its current station, condition and movement history.",
      },
      { property: "og:title", content: "AKE & PMC Registry — ULD Control" },
      {
        property: "og:description",
        content:
          "Master registry of every AKE container and PMC pallet with its current station, condition and movement history.",
      },
    ],
  }),
  component: UnitsPage,
});

function UnitsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [station, setStation] = useState("all");
  const [condition, setCondition] = useState("all");

  const filtered = useMemo(
    () =>
      units
        .filter((u) => (type === "all" ? true : u.type === type))
        .filter((u) => (station === "all" ? true : u.stationCode === station))
        .filter((u) => (condition === "all" ? true : u.condition === condition))
        .filter((u) => u.number.toLowerCase().includes(query.toLowerCase())),
    [query, type, station, condition],
  );

  return (
    <AppShell>
      <PageHeader
        title="AKE & PMC Registry"
        description="Every unit in the fleet, where it is now, and what condition it is in. Open a unit to see its full journey."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Units in registry" value={units.length} hint="AKE and PMC combined" />
        <StatCard
          label="Serviceable"
          value={units.filter((u) => u.condition === "Active").length}
          hint="Available for dispatch"
          tone="ok"
        />
        <StatCard
          label="Under repair"
          value={units.filter((u) => u.condition === "Under Repair").length}
          hint="Held at workshop"
          tone="warn"
        />
        <StatCard
          label="Damaged"
          value={units.filter((u) => u.condition === "Damage" || u.condition === "Lite Damage").length}
          hint="Lite damage and damage"
          tone="alert"
        />
      </div>

      <Panel
        className="mt-4"
        bodyClassName="p-0"
        title="All units"
        description={`${filtered.length} matching units`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                className={`${inputClass} h-8 w-48 pl-8`}
                placeholder="Search unit number"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select className={`${selectClass} h-8 w-24`} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All types</option>
              <option value="AKE">AKE</option>
              <option value="PMC">PMC</option>
            </select>
            <select
              className={`${selectClass} h-8 w-32`}
              value={station}
              onChange={(e) => setStation(e.target.value)}
            >
              <option value="all">All stations</option>
              {stations.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code}
                </option>
              ))}
            </select>
            <select
              className={`${selectClass} h-8 w-36`}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="all">All conditions</option>
              {CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        }
      >
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Unit number</th>
              <th className={th}>Type</th>
              <th className={th}>Current station</th>
              <th className={th}>Condition</th>
              <th className={th}>Last movement</th>
              <th className={th}>Owner</th>
              <th className={`${th} w-10`}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 60).map((u) => (
              <tr key={u.id} className="hover:bg-surface/60">
                <td className={`${td} font-display font-semibold`}>{u.number}</td>
                <td className={td}>
                  <TypeBadge type={u.type} />
                </td>
                <td className={td}>
                  <span className="font-semibold">{u.stationCode}</span>
                  <span className="ml-1.5 text-[12px] text-muted-foreground">
                    {stations.find((s) => s.code === u.stationCode)?.city}
                  </span>
                </td>
                <td className={td}>
                  <ConditionBadge condition={u.condition} />
                </td>
                <td className={`${td} text-muted-foreground`}>{u.lastMovement}</td>
                <td className={`${td} text-muted-foreground`}>{u.ownerAirline}</td>
                <td className={td}>
                  <Link
                    to="/units/$unitId"
                    params={{ unitId: u.id }}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent hover:underline"
                  >
                    View
                    <ChevronRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
        {filtered.length > 60 && (
          <p className="border-t border-border px-4 py-3 text-[12px] text-muted-foreground">
            Showing first 60 of {filtered.length} units. Narrow the filters to see more.
          </p>
        )}
      </Panel>
    </AppShell>
  );
}
