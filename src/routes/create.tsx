import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Mail, Plus, TriangleAlert } from "lucide-react";
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
  loadPositions,
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
        content:
          "Register AKE containers and PMC pallets, then verify condition through the Yard, Load and Aircraft steps.",
      },
      { property: "og:title", content: "Create AKE & PMC — ULD Control" },
      {
        property: "og:description",
        content:
          "Register AKE containers and PMC pallets, then verify condition through the Yard, Load and Aircraft steps.",
      },
    ],
  }),
  component: CreatePage,
});

type StepKey = "yard" | "load" | "aircraft";

const STEPS: Array<{ key: StepKey; label: string; hint: string }> = [
  { key: "yard", label: "Yard", hint: "Register units and record the yard condition." },
  { key: "load", label: "Load ULD", hint: "Verify each unit before it leaves the yard." },
  { key: "aircraft", label: "Aircraft", hint: "Confirm position and final loaded condition." },
];

interface StageEntry {
  condition: Condition;
  remarks: string;
  verified: boolean;
}

interface FlowUnit {
  unit: Unit;
  yard: Condition;
  load: StageEntry;
  aircraft: StageEntry & { position: string };
}

function CreatePage() {
  const [step, setStep] = useState<StepKey>("yard");
  const [rows, setRows] = useState<FlowUnit[]>(() =>
    units.slice(0, 8).map((u) => ({
      unit: u,
      yard: u.condition,
      load: { condition: u.condition, remarks: "", verified: false },
      aircraft: { condition: u.condition, remarks: "", verified: false, position: "" },
    })),
  );

  const patch = (id: string, fn: (r: FlowUnit) => FlowUnit) =>
    setRows((prev) => prev.map((r) => (r.unit.id === id ? fn(r) : r)));

  const changeLog = useMemo(
    () =>
      rows.flatMap((r) => {
        const out: Array<{ id: string; number: string; stage: string; from: Condition; to: Condition; remarks: string }> = [];
        if (r.load.condition !== r.yard)
          out.push({
            id: `${r.unit.id}-load`,
            number: r.unit.number,
            stage: "Yard → Load",
            from: r.yard,
            to: r.load.condition,
            remarks: r.load.remarks,
          });
        if (r.aircraft.condition !== r.load.condition)
          out.push({
            id: `${r.unit.id}-air`,
            number: r.unit.number,
            stage: "Load → Aircraft",
            from: r.load.condition,
            to: r.aircraft.condition,
            remarks: r.aircraft.remarks,
          });
        return out;
      }),
    [rows],
  );

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const loadVerified = rows.filter((r) => r.load.verified).length;
  const airVerified = rows.filter((r) => r.aircraft.verified).length;

  return (
    <AppShell>
      <PageHeader
        title="Create AKE & PMC"
        description="Units move through three verification steps — Yard, Load ULD and Aircraft. Any condition change must carry a remark so the trail stays traceable."
        actions={
          <button className={btn.outline}>
            <Mail className="size-4" />
            Send mail
          </button>
        }
      />

      {/* Stepper */}
      <div className="mb-4 grid gap-2 rounded-lg border border-border bg-card p-2 shadow-[var(--shadow-panel)] sm:grid-cols-3">
        {STEPS.map((s, i) => {
          const active = s.key === step;
          const done = i < stepIndex;
          return (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition ${
                active
                  ? "border-primary/40 bg-primary/8"
                  : "border-transparent hover:bg-surface"
              }`}
            >
              <span
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  done
                    ? "bg-ok/15 text-ok"
                    : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span>
                <span className="block font-display text-[13px] font-semibold text-foreground">
                  {s.label}
                </span>
                <span className="block text-[11px] text-muted-foreground">{s.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {step === "yard" && (
        <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
          <Panel title="New unit" description="Add a single AKE or PMC to the yard registry.">
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
              <Field label="Yard condition">
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
              <Field label="Select position" hint="Aircraft position where this unit is planned to load.">
                <select className={selectClass} defaultValue="">
                  <option value="" disabled>Select load position</option>
                  {loadPositions
                    .filter((p) => p.active)
                    .map((p) => (
                      <option key={p.id} value={p.code}>
                        {p.code} — {p.deck}, {p.compartment} ({p.aircraft})
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

          <Panel
            bodyClassName="p-0"
            title="Yard stock — recently created"
            description="This is the baseline condition. The next steps compare against it."
            actions={
              <button className={btn.primary} onClick={() => setStep("load")}>
                Continue to Load ULD
                <ArrowRight className="size-4" />
              </button>
            }
          >
            <TableShell>
              <thead>
                <tr>
                  <th className={th}>Unit number</th>
                  <th className={th}>Type</th>
                  <th className={th}>Station</th>
                  <th className={th}>Yard condition</th>
                  <th className={th}>Change condition</th>
                  <th className={th}>Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.unit.id} className="hover:bg-surface/60">
                    <td className={`${td} font-display font-semibold`}>{r.unit.number}</td>
                    <td className={td}>
                      <TypeBadge type={r.unit.type} />
                    </td>
                    <td className={td}>{r.unit.stationCode}</td>
                    <td className={td}>
                      <ConditionBadge condition={r.yard} />
                    </td>
                    <td className={td}>
                      <select
                        className={`${selectClass} h-8 w-36`}
                        value={r.yard}
                        onChange={(e) =>
                          patch(r.unit.id, (row) => {
                            const c = e.target.value as Condition;
                            return {
                              ...row,
                              yard: c,
                              load: { ...row.load, condition: c },
                              aircraft: { ...row.aircraft, condition: c },
                            };
                          })
                        }
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className={`${td} text-muted-foreground`}>{r.unit.lastMovement}</td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </Panel>
        </div>
      )}

      {step === "load" && (
        <Panel
          bodyClassName="p-0"
          title="Step 2 — Load ULD verification"
          description={`Verify each unit as it is pulled from the yard. ${loadVerified} of ${rows.length} verified.`}
          actions={
            <div className="flex gap-2">
              <button className={btn.outline} onClick={() => setStep("yard")}>
                Back to Yard
              </button>
              <button className={btn.primary} onClick={() => setStep("aircraft")}>
                Continue to Aircraft
                <ArrowRight className="size-4" />
              </button>
            </div>
          }
        >
          <TableShell>
            <thead>
              <tr>
                <th className={th}>Verify</th>
                <th className={th}>Unit number</th>
                <th className={th}>Yard condition</th>
                <th className={th}>Load condition</th>
                <th className={th}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const changed = r.load.condition !== r.yard;
                return (
                  <tr key={r.unit.id} className={changed ? "bg-alert/5" : "hover:bg-surface/60"}>
                    <td className={td}>
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--color-primary)]"
                        checked={r.load.verified}
                        onChange={(e) =>
                          patch(r.unit.id, (row) => ({
                            ...row,
                            load: { ...row.load, verified: e.target.checked },
                          }))
                        }
                      />
                    </td>
                    <td className={`${td} font-display font-semibold`}>
                      <div className="flex items-center gap-2">
                        <TypeBadge type={r.unit.type} />
                        {r.unit.number}
                      </div>
                    </td>
                    <td className={td}>
                      <ConditionBadge condition={r.yard} />
                    </td>
                    <td className={td}>
                      <select
                        className={`${selectClass} h-8 w-36`}
                        value={r.load.condition}
                        onChange={(e) =>
                          patch(r.unit.id, (row) => {
                            const c = e.target.value as Condition;
                            return {
                              ...row,
                              load: { ...row.load, condition: c },
                              aircraft: { ...row.aircraft, condition: c },
                            };
                          })
                        }
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>
                    <td className={td}>
                      <input
                        className={`${inputClass} h-8 w-full min-w-56`}
                        placeholder={changed ? "Remark required for condition change" : "Optional remark"}
                        value={r.load.remarks}
                        onChange={(e) =>
                          patch(r.unit.id, (row) => ({
                            ...row,
                            load: { ...row.load, remarks: e.target.value },
                          }))
                        }
                      />
                      {changed && !r.load.remarks && (
                        <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-alert">
                          <TriangleAlert className="size-3" />
                          Condition changed — add a remark
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        </Panel>
      )}

      {step === "aircraft" && (
        <div className="space-y-4">
          <Panel
            bodyClassName="p-0"
            title="Step 3 — Aircraft loading"
            description={`Assign the loading position and confirm the final condition. ${airVerified} of ${rows.length} verified.`}
            actions={
              <div className="flex gap-2">
                <button className={btn.outline} onClick={() => setStep("load")}>
                  Back to Load
                </button>
                <button className={btn.primary}>
                  <Check className="size-4" />
                  Confirm loading
                </button>
              </div>
            }
          >
            <TableShell>
              <thead>
                <tr>
                  <th className={th}>Verify</th>
                  <th className={th}>Unit number</th>
                  <th className={th}>Load condition</th>
                  <th className={th}>Position</th>
                  <th className={th}>Aircraft condition</th>
                  <th className={th}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const changed = r.aircraft.condition !== r.load.condition;
                  return (
                    <tr key={r.unit.id} className={changed ? "bg-alert/5" : "hover:bg-surface/60"}>
                      <td className={td}>
                        <input
                          type="checkbox"
                          className="size-4 accent-[var(--color-primary)]"
                          checked={r.aircraft.verified}
                          onChange={(e) =>
                            patch(r.unit.id, (row) => ({
                              ...row,
                              aircraft: { ...row.aircraft, verified: e.target.checked },
                            }))
                          }
                        />
                      </td>
                      <td className={`${td} font-display font-semibold`}>
                        <div className="flex items-center gap-2">
                          <TypeBadge type={r.unit.type} />
                          {r.unit.number}
                        </div>
                      </td>
                      <td className={td}>
                        <ConditionBadge condition={r.load.condition} />
                      </td>
                      <td className={td}>
                        <select
                          className={`${selectClass} h-8 w-40`}
                          value={r.aircraft.position}
                          onChange={(e) =>
                            patch(r.unit.id, (row) => ({
                              ...row,
                              aircraft: { ...row.aircraft, position: e.target.value },
                            }))
                          }
                        >
                          <option value="">Select position</option>
                          {loadPositions
                            .filter((p) => p.active && p.unitTypes.includes(r.unit.type))
                            .map((p) => (
                              <option key={p.id} value={p.code}>
                                {p.code} — {p.deck}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className={td}>
                        <select
                          className={`${selectClass} h-8 w-36`}
                          value={r.aircraft.condition}
                          onChange={(e) =>
                            patch(r.unit.id, (row) => ({
                              ...row,
                              aircraft: { ...row.aircraft, condition: e.target.value as Condition },
                            }))
                          }
                        >
                          {CONDITIONS.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className={td}>
                        <input
                          className={`${inputClass} h-8 w-full min-w-56`}
                          placeholder={changed ? "Remark required for condition change" : "Optional remark"}
                          value={r.aircraft.remarks}
                          onChange={(e) =>
                            patch(r.unit.id, (row) => ({
                              ...row,
                              aircraft: { ...row.aircraft, remarks: e.target.value },
                            }))
                          }
                        />
                        {changed && !r.aircraft.remarks && (
                          <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-alert">
                            <TriangleAlert className="size-3" />
                            Condition changed — add a remark
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </TableShell>
          </Panel>

          <Panel
            bodyClassName="p-0"
            title="Condition change trail"
            description="Every difference recorded between Yard, Load and Aircraft."
          >
            {changeLog.length === 0 ? (
              <p className="px-4 py-6 text-[13px] text-muted-foreground">
                No condition changes recorded across the three steps.
              </p>
            ) : (
              <TableShell>
                <thead>
                  <tr>
                    <th className={th}>Unit number</th>
                    <th className={th}>Stage</th>
                    <th className={th}>From</th>
                    <th className={th}>To</th>
                    <th className={th}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {changeLog.map((c) => (
                    <tr key={c.id}>
                      <td className={`${td} font-display font-semibold`}>{c.number}</td>
                      <td className={`${td} text-muted-foreground`}>{c.stage}</td>
                      <td className={td}>
                        <ConditionBadge condition={c.from} />
                      </td>
                      <td className={td}>
                        <ConditionBadge condition={c.to} />
                      </td>
                      <td className={`${td} text-muted-foreground`}>
                        {c.remarks || "— remark pending —"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            )}
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
