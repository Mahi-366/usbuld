import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BellRing, PlaneTakeoff, Search } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import {
  btn,
  ConditionBadge,
  Field,
  inputClass,
  Panel,
  selectClass,
  TableShell,
  td,
  th,
  TypeBadge,
} from "@/components/uld-ui";
import { currentStation, currentUser, stationByCode, stations, units } from "@/lib/uld-data";

export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Send AKE & PMC — ULD Control" },
      {
        name: "description",
        content:
          "Dispatch AKE containers and PMC pallets from your station and notify the receiving station.",
      },
      { property: "og:title", content: "Send AKE & PMC — ULD Control" },
      {
        property: "og:description",
        content:
          "Dispatch AKE containers and PMC pallets from your station and notify the receiving station.",
      },
    ],
  }),
  component: SendPage,
});

function SendPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [destination, setDestination] = useState("DXB");
  const [selected, setSelected] = useState<string[]>([]);

  const available = useMemo(
    () =>
      units
        .filter((u) => u.stationCode === currentStation && u.condition !== "Under Repair")
        .filter((u) => (typeFilter === "all" ? true : u.type === typeFilter))
        .filter((u) => u.number.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 40),
    [query, typeFilter],
  );

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const chosen = units.filter((u) => selected.includes(u.id));
  const akeCount = chosen.filter((u) => u.type === "AKE").length;
  const pmcCount = chosen.filter((u) => u.type === "PMC").length;
  const dest = stationByCode(destination);

  return (
    <AppShell>
      <PageHeader
        title="Send AKE & PMC"
        description="Your origin station is set from your profile. Select the units leaving today and confirm their condition at dispatch."
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Panel title="Movement details">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="From station" hint="Locked to your assigned station.">
                <input
                  className={`${inputClass} bg-surface text-muted-foreground`}
                  value={`${currentStation} — ${stationByCode(currentStation)?.city}`}
                  readOnly
                />
              </Field>
              <Field label="To station">
                <select
                  className={selectClass}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  {stations
                    .filter((s) => s.code !== currentStation)
                    .map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} — {s.city}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Flight number">
                <input className={inputClass} placeholder="BG 347" />
              </Field>
              <Field label="Dispatch date">
                <input className={inputClass} type="date" defaultValue="2026-08-13" />
              </Field>
              <Field label="Remarks" className="sm:col-span-2">
                <textarea
                  className={`${inputClass} h-20 resize-none py-2`}
                  placeholder="Anything the receiving station should know — packing, damage note, priority handling…"
                />
              </Field>
            </div>
          </Panel>

          <Panel
            bodyClassName="p-0"
            title={`Available units at ${currentStation}`}
            description="Units under repair are excluded from dispatch."
            actions={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    className={`${inputClass} h-8 w-44 pl-8`}
                    placeholder="Search number"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <select
                  className={`${selectClass} h-8 w-24`}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="AKE">AKE</option>
                  <option value="PMC">PMC</option>
                </select>
              </div>
            }
          >
            <div className="max-h-[440px] overflow-y-auto">
              <TableShell>
                <thead className="sticky top-0 bg-card">
                  <tr>
                    <th className={`${th} w-10`}></th>
                    <th className={th}>Unit number</th>
                    <th className={th}>Type</th>
                    <th className={th}>Condition</th>
                    <th className={th}>Last movement</th>
                  </tr>
                </thead>
                <tbody>
                  {available.map((u) => (
                    <tr
                      key={u.id}
                      className={`cursor-pointer hover:bg-surface/60 ${
                        selected.includes(u.id) ? "bg-primary/5" : ""
                      }`}
                      onClick={() => toggle(u.id)}
                    >
                      <td className={td}>
                        <input
                          type="checkbox"
                          className="size-3.5 accent-[var(--primary)]"
                          checked={selected.includes(u.id)}
                          readOnly
                        />
                      </td>
                      <td className={`${td} font-display font-semibold`}>{u.number}</td>
                      <td className={td}>
                        <TypeBadge type={u.type} />
                      </td>
                      <td className={td}>
                        <ConditionBadge condition={u.condition} />
                      </td>
                      <td className={`${td} text-muted-foreground`}>{u.lastMovement}</td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Dispatch summary">
            <div className="flex items-center justify-between rounded-md bg-surface px-3 py-2.5 text-[13px] font-semibold">
              <span>{currentStation}</span>
              <ArrowRight className="size-4 text-muted-foreground" />
              <span>{destination}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">AKE</p>
                <p className="font-display text-[24px] font-semibold tabular">{akeCount}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">PMC</p>
                <p className="font-display text-[24px] font-semibold tabular">{pmcCount}</p>
              </div>
            </div>

            <div className="mt-4 max-h-48 overflow-y-auto">
              {chosen.length === 0 ? (
                <p className="rounded-md border border-dashed border-input px-3 py-6 text-center text-[12px] text-muted-foreground">
                  No units selected yet.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {chosen.map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-2 rounded border border-border px-2.5 py-1.5 text-[12px]"
                    >
                      <span className="font-display font-semibold">{u.number}</span>
                      <ConditionBadge condition={u.condition} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className={`${btn.primary} mt-4 w-full`} disabled={chosen.length === 0}>
              <PlaneTakeoff className="size-4" />
              Confirm dispatch
            </button>
          </Panel>

          <Panel title="Automatic notification">
            <div className="flex gap-2.5 rounded-md border border-info/25 bg-info/6 p-3">
              <BellRing className="mt-0.5 size-4 shrink-0 text-info" />
              <div className="text-[12px] leading-relaxed">
                <p className="font-semibold text-foreground">
                  {dest?.code} — {dest?.city} will be notified on dispatch
                </p>
                <p className="mt-1 text-muted-foreground">
                  A CPM-style message is sent to <strong>{dest?.contactEmail}</strong> stating{" "}
                  <strong>
                    {akeCount} AKE and {pmcCount} PMC
                  </strong>{" "}
                  are inbound, with the unit numbers and their dispatch condition.
                </p>
                <p className="mt-2 text-muted-foreground">
                  Sent from {currentUser.email} on behalf of station {currentStation}.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
