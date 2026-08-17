import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Plus } from "lucide-react";
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
import {
  CONDITIONS,
  currentStation,
  stationByCode,
  stations,
  units,
  type Condition,
  type Unit,
} from "@/lib/uld-data";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create AKE & PMC — ULD Control" },
      {
        name: "description",
        content: "Register new AKE containers and PMC pallets, or bulk import them from a sheet.",
      },
      { property: "og:title", content: "Create AKE & PMC — ULD Control" },
      {
        property: "og:description",
        content: "Register new AKE containers and PMC pallets, or bulk import them from a sheet.",
      },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const [recent, setRecent] = useState<Unit[]>(units.slice(0, 8));

  const setCondition = (id: string, condition: Condition) =>
    setRecent((prev) => prev.map((u) => (u.id === id ? { ...u, condition } : u)));

  return (
    <AppShell>
      <PageHeader
        title="Create AKE & PMC"
        description="Register units individually or import an existing stock sheet. Condition can be revised at any time."
        actions={
          <button className={btn.outline}>
            <Mail className="size-4" />
            Send mail
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Panel title="New unit" description="Add a single AKE or PMC to the registry.">
            <div className="space-y-3.5">
              <Field label="Unit type">
                <select className={selectClass} defaultValue="AKE">
                  <option value="AKE">AKE — Baggage container</option>
                  <option value="PMC">PMC — Cargo pallet</option>
                </select>
              </Field>
              <Field label="Unit number" hint="Format: prefix, serial, owner code — e.g. AKE 12345 BG">
                <input className={inputClass} placeholder="AKE 12345 BG" />
              </Field>
              <Field label="Condition">
                <select className={selectClass} defaultValue="Active">
                  {CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="From station" hint="Locked to your assigned station.">
                <input
                  className={`${inputClass} bg-surface text-muted-foreground`}
                  value={`${currentStation} — ${stationByCode(currentStation)?.city}`}
                  readOnly
                />
              </Field>
              <Field label="To station" hint="Select the receiving station.">
                <select className={selectClass} defaultValue="">
                  <option value="" disabled>Select destination station</option>
                  {stations
                    .filter((s) => s.code !== currentStation)
                    .map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} — {s.city}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Remarks">
                <textarea
                  className={`${inputClass} h-20 resize-none py-2`}
                  placeholder="Optional note about this unit"
                />
              </Field>
              <button className={`${btn.primary} w-full`}>
                <Plus className="size-4" />
                Create unit
              </button>
            </div>
          </Panel>

        </div>

        <Panel
          bodyClassName="p-0"
          title="Recently created units"
          description="Change a unit's condition inline — the change is recorded in its journey."
        >
          <TableShell>
            <thead>
              <tr>
                <th className={th}>Unit number</th>
                <th className={th}>Type</th>
                <th className={th}>Station</th>
                <th className={th}>Condition</th>
                <th className={th}>Change condition</th>
                <th className={th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((u) => (
                <tr key={u.id} className="hover:bg-surface/60">
                  <td className={`${td} font-display font-semibold`}>{u.number}</td>
                  <td className={td}>
                    <TypeBadge type={u.type} />
                  </td>
                  <td className={td}>{u.stationCode}</td>
                  <td className={td}>
                    <ConditionBadge condition={u.condition} />
                  </td>
                  <td className={td}>
                    <select
                      className={`${selectClass} h-8 w-36`}
                      value={u.condition}
                      onChange={(e) => setCondition(u.id, e.target.value as Condition)}
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                  <td className={`${td} text-muted-foreground`}>{u.lastMovement}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>
      </div>
    </AppShell>
  );
}
