import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Paperclip, TriangleAlert, PackageCheck, X, Send as SendIcon } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import {
  btn,
  ConditionBadge,
  Field,
  inputClass,
  Panel,
  selectClass,
  StatusBadge,
  TableShell,
  td,
  th,
} from "@/components/uld-ui";
import { CONDITIONS, currentUser, shipments, stationByCode } from "@/lib/uld-data";

export const Route = createFileRoute("/receive")({
  head: () => ({
    meta: [
      { title: "Receive AKE & PMC — ULD Control" },
      {
        name: "description",
        content:
          "Log received AKE and PMC units, record condition on arrival and attach evidence for any discrepancy.",
      },
      { property: "og:title", content: "Receive AKE & PMC — ULD Control" },
      {
        property: "og:description",
        content:
          "Log received AKE and PMC units, record condition on arrival and attach evidence for any discrepancy.",
      },
    ],
  }),
  component: ReceivePage,
});

function ReceivePage() {
  const inbound = shipments.filter((s) => s.to === "DAC" || s.status === "In Transit");
  const [activeId, setActiveId] = useState(inbound[0]!.id);
  const [akeReceived, setAkeReceived] = useState(7);
  const [pmcReceived, setPmcReceived] = useState(5);
  const [emailOpen, setEmailOpen] = useState(false);

  const active = shipments.find((s) => s.id === activeId)!;
  const akeGap = active.akeSent - akeReceived;
  const pmcGap = active.pmcSent - pmcReceived;
  const mismatch = akeGap !== 0 || pmcGap !== 0;
  const origin = stationByCode(active.from);

  return (
    <AppShell>
      <PageHeader
        title="Receive AKE & PMC"
        description="Confirm what physically arrived. Any difference against the dispatch record is flagged immediately."
      />

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <Panel bodyClassName="p-0" title="Inbound shipments" description="Awaiting your confirmation.">
          <ul className="divide-y divide-border">
            {inbound.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setActiveId(s.id)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-surface/60 ${
                    s.id === activeId ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-[13px] font-semibold">
                      {s.from} → {s.to}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {s.reference} · {s.flight} · sent {s.sentOn}
                  </p>
                  <p className="mt-1 text-[12px]">
                    <span className="font-semibold tabular">{s.akeSent}</span> AKE ·{" "}
                    <span className="font-semibold tabular">{s.pmcSent}</span> PMC
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          {mismatch && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/6 p-3.5">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="text-[12px] leading-relaxed">
                <p className="font-semibold text-destructive">Discrepancy detected</p>
                <p className="mt-0.5 text-foreground/80">
                  {akeGap !== 0 && (
                    <>
                      AKE: {active.akeSent} sent vs {akeReceived} received ({akeGap > 0 ? "−" : "+"}
                      {Math.abs(akeGap)}).{" "}
                    </>
                  )}
                  {pmcGap !== 0 && (
                    <>
                      PMC: {active.pmcSent} sent vs {pmcReceived} received ({pmcGap > 0 ? "−" : "+"}
                      {Math.abs(pmcGap)}).
                    </>
                  )}{" "}
                  Attach evidence and notify the origin station.
                </p>
              </div>
              <button className={`${btn.danger} ml-auto shrink-0`} onClick={() => setEmailOpen(true)}>
                <Mail className="size-4" />
                Report by email
              </button>
            </div>
          )}

          <Panel
            title={`Confirm receipt — ${active.reference}`}
            description={`From ${origin?.code} ${origin?.city} on flight ${active.flight}`}
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="AKE units received" hint={`${active.akeSent} declared at dispatch`}>
                <input
                  className={inputClass}
                  type="number"
                  value={akeReceived}
                  onChange={(e) => setAkeReceived(Number(e.target.value))}
                />
              </Field>
              <Field label="PMC units received" hint={`${active.pmcSent} declared at dispatch`}>
                <input
                  className={inputClass}
                  type="number"
                  value={pmcReceived}
                  onChange={(e) => setPmcReceived(Number(e.target.value))}
                />
              </Field>
              <Field label="Condition on arrival">
                <select className={selectClass} defaultValue="Active">
                  {CONDITIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Received on">
                <input className={inputClass} type="date" defaultValue="2026-08-13" />
              </Field>
              <Field label="Remarks" className="sm:col-span-2">
                <textarea
                  className={`${inputClass} h-20 resize-none py-2`}
                  placeholder="Describe what arrived, any damage, and where the units were stored."
                />
              </Field>
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-[12px] font-semibold">Evidence attachments</p>
              <div className="rounded-md border border-dashed border-input bg-surface/60 px-4 py-6 text-center">
                <Paperclip className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-2 text-[12px] font-medium">Attach photos or documents</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Damage photos, CPM printout, handover sheet — JPG, PNG or PDF
                </p>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {["damage-front-panel.jpg", "handover-sheet.pdf"].map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 rounded border border-border bg-surface px-2 py-1 text-[11px]"
                  >
                    <Paperclip className="size-3" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button className={btn.primary}>
                <PackageCheck className="size-4" />
                Confirm receipt
              </button>
              <button className={btn.outline} onClick={() => setEmailOpen(true)}>
                <Mail className="size-4" />
                Send email
              </button>
            </div>
          </Panel>

          <Panel bodyClassName="p-0" title="Units in this shipment">
            <TableShell>
              <thead>
                <tr>
                  <th className={th}>Unit number</th>
                  <th className={th}>Condition at dispatch</th>
                  <th className={th}>Condition on arrival</th>
                  <th className={th}>Note</th>
                </tr>
              </thead>
              <tbody>
                {active.units.map((n, i) => (
                  <tr key={n} className="hover:bg-surface/60">
                    <td className={`${td} font-display font-semibold`}>{n}</td>
                    <td className={td}>
                      <ConditionBadge condition="Active" />
                    </td>
                    <td className={td}>
                      <select className={`${selectClass} h-8 w-36`} defaultValue={i === 0 && mismatch ? "Lite Damage" : "Active"}>
                        {CONDITIONS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className={td}>
                      <input className={`${inputClass} h-8`} placeholder="Optional" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </Panel>
        </div>
      </div>

      {emailOpen && (
        <EmailComposer
          onClose={() => setEmailOpen(false)}
          to={origin?.contactEmail ?? ""}
          reference={active.reference}
          body={`Dear ${origin?.city} Station,

This is to report a discrepancy against shipment ${active.reference} received at DAC today.

Flight: ${active.flight}
Route: ${active.from} → ${active.to}
Dispatched on: ${active.sentOn}

Declared at dispatch: ${active.akeSent} AKE, ${active.pmcSent} PMC
Physically received: ${akeReceived} AKE, ${pmcReceived} PMC
Variance: ${akeGap} AKE, ${pmcGap} PMC

Units concerned:
${active.units.map((u) => `  • ${u}`).join("\n")}

Supporting evidence is attached. Please confirm the location of the missing units and advise on the damage claim.

Regards,
${currentUser.name}
${currentUser.role} — Station DAC
${currentUser.email}`}
        />
      )}
    </AppShell>
  );
}

function EmailComposer({
  onClose,
  to,
  reference,
  body,
}: {
  onClose: () => void;
  to: string;
  reference: string;
  body: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-raised)]">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="font-display text-[14px] font-semibold">Discrepancy report email</h2>
            <p className="text-[11px] text-muted-foreground">
              Template pre-filled from shipment {reference}
            </p>
          </div>
          <button onClick={onClose} className={btn.ghost}>
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <Field label="From">
            <input className={`${inputClass} bg-surface text-muted-foreground`} value={currentUser.email} readOnly />
          </Field>
          <Field label="To">
            <input className={inputClass} defaultValue={to} />
          </Field>
          <Field label="Cc">
            <input className={inputClass} defaultValue="uld.control@airline.com" />
          </Field>
          <Field label="Subject">
            <input
              className={inputClass}
              defaultValue={`[${reference}] ULD discrepancy report — action required`}
            />
          </Field>
          <Field label="Message">
            <textarea className={`${inputClass} h-64 resize-none py-2 font-mono text-[12px] leading-relaxed`} defaultValue={body} />
          </Field>
          <div className="flex flex-wrap gap-2">
            {["damage-front-panel.jpg", "handover-sheet.pdf"].map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1.5 rounded border border-border bg-surface px-2 py-1 text-[11px]"
              >
                <Paperclip className="size-3" />
                {f}
              </span>
            ))}
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button className={btn.outline} onClick={onClose}>
            Cancel
          </button>
          <button className={btn.primary} onClick={onClose}>
            <SendIcon className="size-4" />
            Send email
          </button>
        </footer>
      </div>
    </div>
  );
}
