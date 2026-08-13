import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Pencil } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { btn, Field, inputClass, Panel, selectClass, StatCard, TableShell, td, th } from "@/components/uld-ui";
import { stationStocks, stations } from "@/lib/uld-data";

export const Route = createFileRoute("/stations")({
  head: () => ({
    meta: [
      { title: "Stations — ULD Control" },
      {
        name: "description",
        content:
          "Station master data for the ULD network: headquarters, outstations, capacity and contact details.",
      },
      { property: "og:title", content: "Stations — ULD Control" },
      {
        property: "og:description",
        content:
          "Station master data for the ULD network: headquarters, outstations, capacity and contact details.",
      },
    ],
  }),
  component: StationsPage,
});

function StationsPage() {
  const stocks = stationStocks();

  return (
    <AppShell>
      <PageHeader
        title="Stations"
        description="Master list of airports in the network. Every station added here appears in the send and receive dropdowns."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total stations" value={stations.length} icon={<Building2 className="size-4" />} />
        <StatCard label="Headquarter" value="DAC" hint="Dhaka — Hazrat Shahjalal Intl" tone="ok" />
        <StatCard
          label="Network capacity"
          value={stations.reduce((a, s) => a + s.capacity, 0)}
          hint="Combined AKE + PMC positions"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel bodyClassName="p-0" title="All stations" description={`${stations.length} stations configured`}>
          <TableShell>
            <thead>
              <tr>
                <th className={th}>Code</th>
                <th className={th}>Airport</th>
                <th className={th}>City / Country</th>
                <th className={th}>Type</th>
                <th className={`${th} text-right`}>Capacity</th>
                <th className={`${th} text-right`}>Held</th>
                <th className={th}>Contact email</th>
                <th className={`${th} w-10`}></th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(({ station, total }) => (
                <tr key={station.id} className="hover:bg-surface/60">
                  <td className={`${td} font-display font-semibold`}>{station.code}</td>
                  <td className={td}>{station.name}</td>
                  <td className={`${td} text-muted-foreground`}>
                    {station.city}, {station.country}
                  </td>
                  <td className={td}>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        station.kind === "Headquarter"
                          ? "border-primary/25 bg-primary/8 text-primary"
                          : "border-border bg-surface text-muted-foreground"
                      }`}
                    >
                      {station.kind}
                    </span>
                  </td>
                  <td className={`${td} text-right tabular`}>{station.capacity}</td>
                  <td className={`${td} text-right tabular font-semibold`}>{total}</td>
                  <td className={`${td} text-muted-foreground`}>{station.contactEmail}</td>
                  <td className={td}>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Pencil className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>

        <Panel title="Add station" description="New stations become selectable immediately.">
          <div className="space-y-3.5">
            <Field label="IATA code">
              <input className={inputClass} placeholder="BKK" maxLength={3} />
            </Field>
            <Field label="Airport name">
              <input className={inputClass} placeholder="Suvarnabhumi" />
            </Field>
            <Field label="City">
              <input className={inputClass} placeholder="Bangkok" />
            </Field>
            <Field label="Country">
              <input className={inputClass} placeholder="Thailand" />
            </Field>
            <Field label="Station type">
              <select className={selectClass} defaultValue="Outstation">
                <option>Headquarter</option>
                <option>Outstation</option>
              </select>
            </Field>
            <Field label="ULD capacity" hint="Maximum AKE + PMC positions available.">
              <input className={inputClass} type="number" placeholder="150" />
            </Field>
            <Field label="Contact email" hint="Receives automatic inbound notifications.">
              <input className={inputClass} type="email" placeholder="uld.bkk@airline.com" />
            </Field>
            <button className={`${btn.primary} w-full`}>
              <Plus className="size-4" />
              Add station
            </button>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
