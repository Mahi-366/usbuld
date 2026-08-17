import { createFileRoute } from "@tanstack/react-router";
import { Grid3x3, Pencil, Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import {
  btn,
  Field,
  inputClass,
  Panel,
  selectClass,
  StatCard,
  TableShell,
  td,
  th,
} from "@/components/uld-ui";
import { loadPositions } from "@/lib/uld-data";

export const Route = createFileRoute("/positions")({
  head: () => ({
    meta: [
      { title: "Load Positions — ULD Control" },
      {
        name: "description",
        content:
          "Master list of aircraft load positions used when AKE containers and PMC pallets are loaded on board.",
      },
      { property: "og:title", content: "Load Positions — ULD Control" },
      {
        property: "og:description",
        content:
          "Master list of aircraft load positions used when AKE containers and PMC pallets are loaded on board.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PositionsPage,
});

function PositionsPage() {
  const active = loadPositions.filter((p) => p.active).length;

  return (
    <AppShell>
      <PageHeader
        title="Load Positions"
        description="Aircraft positions where AKE and PMC units are loaded. Every position added here appears in the Create module dropdown."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total positions" value={loadPositions.length} icon={<Grid3x3 className="size-4" />} />
        <StatCard label="Active" value={active} tone="ok" hint="Available for selection" />
        <StatCard
          label="Main deck"
          value={loadPositions.filter((p) => p.deck === "Main Deck").length}
          hint="Remaining positions are lower deck"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel
          bodyClassName="p-0"
          title="All load positions"
          description={`${loadPositions.length} positions configured`}
        >
          <TableShell>
            <thead>
              <tr>
                <th className={th}>Position</th>
                <th className={th}>Deck</th>
                <th className={th}>Compartment</th>
                <th className={th}>Aircraft</th>
                <th className={th}>Accepts</th>
                <th className={th}>Status</th>
                <th className={`${th} w-10`}></th>
              </tr>
            </thead>
            <tbody>
              {loadPositions.map((p) => (
                <tr key={p.id} className="hover:bg-surface/60">
                  <td className={`${td} font-display font-semibold`}>{p.code}</td>
                  <td className={td}>{p.deck}</td>
                  <td className={`${td} text-muted-foreground`}>{p.compartment}</td>
                  <td className={td}>{p.aircraft}</td>
                  <td className={`${td} text-muted-foreground`}>{p.unitTypes.join(" / ")}</td>
                  <td className={td}>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        p.active
                          ? "border-primary/25 bg-primary/8 text-primary"
                          : "border-border bg-surface text-muted-foreground"
                      }`}
                    >
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className={td}>
                    <button className="text-muted-foreground transition-colors hover:text-foreground">
                      <Pencil className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>

        <Panel title="Add position" description="Define a new aircraft load position.">
          <div className="space-y-3.5">
            <Field label="Position code" hint="e.g. 11L, 21P, 41R">
              <input className={inputClass} placeholder="11L" />
            </Field>
            <Field label="Deck">
              <select className={selectClass} defaultValue="Lower Deck">
                <option>Main Deck</option>
                <option>Lower Deck</option>
              </select>
            </Field>
            <Field label="Compartment">
              <input className={inputClass} placeholder="Forward hold" />
            </Field>
            <Field label="Aircraft type">
              <input className={inputClass} placeholder="B787-9" />
            </Field>
            <Field label="Accepts unit type">
              <select className={selectClass} defaultValue="AKE">
                <option value="AKE">AKE only</option>
                <option value="PMC">PMC only</option>
                <option value="BOTH">AKE and PMC</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={selectClass} defaultValue="Active">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </Field>
            <button className={`${btn.primary} w-full`}>
              <Plus className="size-4" />
              Add position
            </button>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
