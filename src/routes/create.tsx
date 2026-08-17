import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail, PlaneTakeoff, Plus, TriangleAlert } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CONDITIONS,
  aircraftTypes,
  currentStation,
  departingFlights,
  loadPositions,
  stationByCode,
  stations,
  units,
  type Condition,
  type DepartingFlight,
  type Unit,
  type UnitType,
} from "@/lib/uld-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create AKE & PMC — ULD Control" },
      {
        name: "description",
        content:
          "Build AKE and PMC loads for every departing flight from your station — Yard, Load and Aircraft, per service.",
      },
      { property: "og:title", content: "Create AKE & PMC — ULD Control" },
      {
        property: "og:description",
        content:
          "Build AKE and PMC loads for every departing flight from your station — Yard, Load and Aircraft, per service.",
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
  flightId: string;
  yard: Condition;
  remarks: string;
  load: StageEntry;
  aircraft: StageEntry & { position: string };
}

function toFlow(unit: Unit, flightId: string, position = "", remarks = ""): FlowUnit {
  return {
    unit,
    flightId,
    yard: unit.condition,
    remarks,
    load: { condition: unit.condition, remarks: "", verified: false },
    aircraft: { condition: unit.condition, remarks: "", verified: false, position },
  };
}

function seedRows(): FlowUnit[] {
  const dacAke = units.filter((u) => u.stationCode === currentStation && u.type === "AKE");
  const dacPmc = units.filter((u) => u.stationCode === currentStation && u.type === "PMC");
  return [
    toFlow(dacPmc[0]!, "fl-bg201", "11L"),
    toFlow(dacPmc[1]!, "fl-bg201", "11R"),
    toFlow(dacPmc[2]!, "fl-bg201"),
    toFlow(dacAke[0]!, "fl-bg347", "41L"),
    toFlow(dacAke[1]!, "fl-bg347", "41R"),
    toFlow(dacAke[2]!, "fl-bg347"),
    toFlow(dacAke[3]!, "fl-bg601", "42L"),
    toFlow(dacAke[4]!, "fl-bg601"),
  ];
}

function progressOf(list: FlowUnit[]) {
  if (list.length === 0) return { label: "No units", tone: "muted" as const };
  if (list.every((r) => r.aircraft.verified && r.aircraft.position))
    return { label: "Loaded", tone: "ok" as const };
  if (list.every((r) => r.load.verified)) return { label: "On aircraft", tone: "info" as const };
  return { label: "In yard", tone: "default" as const };
}

const progressTone: Record<ReturnType<typeof progressOf>["tone"], string> = {
  muted: "bg-surface text-muted-foreground",
  default: "bg-primary/10 text-primary",
  info: "bg-info/12 text-info",
  ok: "bg-ok/12 text-ok",
};

function CreatePage() {
  const [operatingDate, setOperatingDate] = useState("2026-08-17");
  const [flights, setFlights] = useState<DepartingFlight[]>(() =>
    departingFlights.filter((f) => f.from === currentStation),
  );
  const [selectedId, setSelectedId] = useState("fl-bg347");
  const [step, setStep] = useState<StepKey>("yard");
  const [rows, setRows] = useState<FlowUnit[]>(seedRows);
  const [addOpen, setAddOpen] = useState(false);
  const [formError, setFormError] = useState("");

  const [draft, setDraft] = useState({
    type: "AKE" as UnitType,
    number: "",
    condition: "Active" as Condition,
    position: "",
    remarks: "",
  });

  const visibleFlights = useMemo(
    () => flights.filter((f) => f.date === operatingDate).sort((a, b) => a.std.localeCompare(b.std)),
    [flights, operatingDate],
  );

  const selected = visibleFlights.find((f) => f.id === selectedId) ?? visibleFlights[0];
  const activeId = selected?.id ?? "";
  const dest = selected ? stationByCode(selected.to) : undefined;
  const flightRows = rows.filter((r) => r.flightId === activeId);

  const patch = (id: string, fn: (r: FlowUnit) => FlowUnit) =>
    setRows((prev) => prev.map((r) => (r.unit.id === id ? fn(r) : r)));

  const changeLog = useMemo(
    () =>
      flightRows.flatMap((r) => {
        const out: Array<{
          id: string;
          number: string;
          stage: string;
          from: Condition;
          to: Condition;
          remarks: string;
        }> = [];
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
    [flightRows],
  );

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const loadVerified = flightRows.filter((r) => r.load.verified).length;
  const airVerified = flightRows.filter((r) => r.aircraft.verified).length;

  const aircraftPositions = (type: UnitType, exceptUnitId?: string) => {
    const taken = new Set(
      flightRows
        .filter((r) => r.unit.id !== exceptUnitId && r.aircraft.position)
        .map((r) => r.aircraft.position),
    );
    return loadPositions.filter(
      (p) =>
        p.active &&
        p.aircraft === selected?.aircraft &&
        p.unitTypes.includes(type) &&
        !taken.has(p.code),
    );
  };

  const createUnit = (e: FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setFormError("Select or add a departing flight first.");
      return;
    }
    const number = draft.number.trim().toUpperCase();
    if (!number) {
      setFormError("Unit number is required.");
      return;
    }
    if (rows.some((r) => r.unit.number.toUpperCase() === number)) {
      setFormError("That unit number is already on today's build.");
      return;
    }
    setFormError("");
    const unit: Unit = {
      id: `created-${Date.now()}`,
      number,
      type: draft.type,
      stationCode: currentStation,
      condition: draft.condition,
      lastMovement: operatingDate,
      ownerAirline: "BG",
    };
    setRows((prev) => [toFlow(unit, selected.id, draft.position, draft.remarks.trim()), ...prev]);
    setDraft({ type: draft.type, number: "", condition: "Active", position: "", remarks: "" });
  };

  const addFlight = (flight: DepartingFlight) => {
    setFlights((prev) => [...prev, flight]);
    setSelectedId(flight.id);
    setOperatingDate(flight.date);
    setStep("yard");
    setAddOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Create AKE & PMC"
        description="Each departing flight is its own build. Switch services at any time — Yard, Load ULD and Aircraft stay independent per flight."
        actions={
          <button className={btn.outline}>
            <Mail className="size-4" />
            Send mail
          </button>
        }
      />

      <Panel
        className="mb-4"
        title="Departing flights"
        description={`${currentStation} · ${visibleFlights.length} service${visibleFlights.length === 1 ? "" : "s"} on this date. Select a flight, then build its ULD load.`}
        actions={
          <div className="flex items-center gap-2">
            <input
              type="date"
              className={`${inputClass} h-9 w-auto`}
              value={operatingDate}
              onChange={(e) => setOperatingDate(e.target.value)}
            />
            <button className={btn.primary} onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add flight
            </button>
          </div>
        }
      >
        {visibleFlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <PlaneTakeoff className="size-8 text-muted-foreground" />
            <p className="font-display text-[14px] font-semibold">No departing flights on this date</p>
            <p className="max-w-sm text-[13px] text-muted-foreground">
              Add every service leaving {currentStation} so units can be registered against the correct
              aircraft and destination.
            </p>
            <button className={`${btn.primary} mt-2`} onClick={() => setAddOpen(true)}>
              <Plus className="size-4" />
              Add first flight
            </button>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {visibleFlights.map((f) => {
              const list = rows.filter((r) => r.flightId === f.id);
              const progress = progressOf(list);
              const ake = list.filter((r) => r.unit.type === "AKE").length;
              const pmc = list.filter((r) => r.unit.type === "PMC").length;
              const active = f.id === activeId;
              const city = stationByCode(f.to)?.city;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedId(f.id)}
                  className={cn(
                    "min-w-[188px] shrink-0 rounded-md border px-3 py-2.5 text-left transition",
                    active
                      ? "border-primary/50 bg-primary/8 ring-1 ring-primary/25"
                      : "border-border bg-card hover:bg-surface",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-[14px] font-semibold tabular">{f.number}</span>
                    <span className="text-[11px] font-semibold tabular text-muted-foreground">{f.std}</span>
                  </span>
                  <span className="mt-0.5 block text-[12px] text-foreground">
                    {f.from} → {f.to}
                    {city ? ` · ${city}` : ""}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{f.aircraft}</span>
                  <span className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {list.length === 0
                        ? "Empty"
                        : `${ake ? `${ake} AKE` : ""}${ake && pmc ? " · " : ""}${pmc ? `${pmc} PMC` : ""}`}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        progressTone[progress.tone],
                      )}
                    >
                      {progress.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Panel>

      <AddFlightDialog open={addOpen} onOpenChange={setAddOpen} date={operatingDate} existing={flights} onAdd={addFlight} />

      {!selected ? null : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-card px-4 py-2.5 text-[12px] shadow-[var(--shadow-panel)]">
            <span className="flex items-center gap-1.5 font-display text-[13px] font-semibold">
              <PlaneTakeoff className="size-4 text-primary" />
              Working {selected.number}
            </span>
            <span className="text-muted-foreground">
              {selected.from} → {selected.to}
              {dest ? ` (${dest.city})` : ""}
            </span>
            <span className="text-muted-foreground">Aircraft {selected.aircraft}</span>
            <span className="text-muted-foreground">STD {selected.std}</span>
            <span className="ml-auto tabular text-muted-foreground">
              {flightRows.length} unit{flightRows.length === 1 ? "" : "s"} on this flight
            </span>
          </div>

          <div className="mb-4 grid gap-2 rounded-lg border border-border bg-card p-2 shadow-[var(--shadow-panel)] sm:grid-cols-3">
            {STEPS.map((s, i) => {
              const active = s.key === step;
              const done = i < stepIndex;
              return (
                <button
                  key={s.key}
                  onClick={() => setStep(s.key)}
                  className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition ${
                    active ? "border-primary/40 bg-primary/8" : "border-transparent hover:bg-surface"
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
              <Panel
                title="New unit"
                description={`Added to ${selected.number}. Destination and aircraft come from the flight.`}
              >
                <form className="space-y-3.5" onSubmit={createUnit}>
                  <Field label="Unit type">
                    <select
                      className={selectClass}
                      value={draft.type}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, type: e.target.value as UnitType, position: "" }))
                      }
                    >
                      <option value="AKE">AKE — Baggage container</option>
                      <option value="PMC">PMC — Cargo pallet</option>
                    </select>
                  </Field>
                  <Field label="Unit number" hint="Format: prefix, serial, owner code — e.g. AKE 12345 BG">
                    <input
                      className={inputClass}
                      placeholder="AKE 12345 BG"
                      value={draft.number}
                      onChange={(e) => setDraft((d) => ({ ...d, number: e.target.value }))}
                    />
                  </Field>
                  <Field label="Yard condition">
                    <select
                      className={selectClass}
                      value={draft.condition}
                      onChange={(e) => setDraft((d) => ({ ...d, condition: e.target.value as Condition }))}
                    >
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
                  <Field label="To station" hint={`Locked to ${selected.number}'s destination. Switch flight to load a different station.`}>
                    <input
                      className={`${inputClass} bg-surface text-muted-foreground`}
                      value={`${selected.to} — ${dest?.city ?? selected.to}`}
                      readOnly
                    />
                  </Field>
                  <Field
                    label="Select position"
                    hint={`Positions for ${selected.aircraft}. Already assigned seats on this flight are hidden.`}
                  >
                    <select
                      className={selectClass}
                      value={draft.position}
                      onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value }))}
                    >
                      <option value="">Select load position</option>
                      {aircraftPositions(draft.type).map((p) => (
                        <option key={p.id} value={p.code}>
                          {p.code} — {p.deck}, {p.compartment}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Remarks">
                    <textarea
                      className={`${inputClass} h-20 resize-none py-2`}
                      placeholder="Optional note about this unit"
                      value={draft.remarks}
                      onChange={(e) => setDraft((d) => ({ ...d, remarks: e.target.value }))}
                    />
                  </Field>
                  {formError && (
                    <p className="flex items-center gap-1.5 text-[12px] font-semibold text-alert">
                      <TriangleAlert className="size-3.5" />
                      {formError}
                    </p>
                  )}
                  <button type="submit" className={`${btn.primary} w-full`}>
                    <Plus className="size-4" />
                    Create unit on {selected.number}
                  </button>
                </form>
              </Panel>

              <Panel
                bodyClassName="p-0"
                title={`Yard stock — ${selected.number}`}
                description="Baseline condition for this flight. The next steps compare against it."
                actions={
                  <button className={btn.primary} onClick={() => setStep("load")} disabled={flightRows.length === 0}>
                    Continue to Load ULD
                    <ArrowRight className="size-4" />
                  </button>
                }
              >
                {flightRows.length === 0 ? (
                  <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                    No units on {selected.number} yet. Create the first AKE or PMC for this service.
                  </p>
                ) : (
                  <TableShell>
                    <thead>
                      <tr>
                        <th className={th}>Unit number</th>
                        <th className={th}>Type</th>
                        <th className={th}>Position</th>
                        <th className={th}>Yard condition</th>
                        <th className={th}>Change condition</th>
                        <th className={th}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flightRows.map((r) => (
                        <tr key={r.unit.id} className="hover:bg-surface/60">
                          <td className={`${td} font-display font-semibold`}>{r.unit.number}</td>
                          <td className={td}>
                            <TypeBadge type={r.unit.type} />
                          </td>
                          <td className={`${td} tabular text-muted-foreground`}>
                            {r.aircraft.position || "—"}
                          </td>
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
                )}
              </Panel>
            </div>
          )}

          {step === "load" && (
            <Panel
              bodyClassName="p-0"
              title={`Step 2 — Load ULD · ${selected.number}`}
              description={
                flightRows.length === 0
                  ? `No units on this flight to verify.`
                  : `Verify each unit pulled for ${selected.number}. ${loadVerified} of ${flightRows.length} verified.`
              }
              actions={
                <div className="flex gap-2">
                  <button className={btn.outline} onClick={() => setStep("yard")}>
                    Back to Yard
                  </button>
                  <button
                    className={btn.primary}
                    onClick={() => setStep("aircraft")}
                    disabled={flightRows.length === 0}
                  >
                    Continue to Aircraft
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              }
            >
              {flightRows.length === 0 ? (
                <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                  Add units on the Yard step for {selected.number}, or switch to another departing flight.
                </p>
              ) : (
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
                    {flightRows.map((r) => {
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
              )}
            </Panel>
          )}

          {step === "aircraft" && (
            <div className="space-y-4">
              <Panel
                bodyClassName="p-0"
                title={`Step 3 — Aircraft loading · ${selected.number}`}
                description={
                  flightRows.length === 0
                    ? `No units on this flight to load.`
                    : `Assign ${selected.aircraft} positions for ${selected.number}. ${airVerified} of ${flightRows.length} verified.`
                }
                actions={
                  <div className="flex gap-2">
                    <button className={btn.outline} onClick={() => setStep("load")}>
                      Back to Load
                    </button>
                    <button className={btn.primary} disabled={flightRows.length === 0}>
                      <Check className="size-4" />
                      Confirm {selected.number}
                    </button>
                  </div>
                }
              >
                {flightRows.length === 0 ? (
                  <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                    Add units on the Yard step for {selected.number}, or switch to another departing flight.
                  </p>
                ) : (
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
                      {flightRows.map((r) => {
                        const changed = r.aircraft.condition !== r.load.condition;
                        const options = aircraftPositions(r.unit.type, r.unit.id);
                        const currentPos = loadPositions.find(
                          (p) => p.code === r.aircraft.position && p.aircraft === selected.aircraft,
                        );
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
                                {currentPos && !options.some((p) => p.code === currentPos.code) && (
                                  <option value={currentPos.code}>
                                    {currentPos.code} — {currentPos.deck}
                                  </option>
                                )}
                                {options.map((p) => (
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
                                    aircraft: {
                                      ...row.aircraft,
                                      condition: e.target.value as Condition,
                                    },
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
                )}
              </Panel>

              <Panel
                bodyClassName="p-0"
                title={`Condition change trail — ${selected.number}`}
                description="Every difference recorded between Yard, Load and Aircraft on this flight."
              >
                {changeLog.length === 0 ? (
                  <p className="px-4 py-6 text-[13px] text-muted-foreground">
                    No condition changes recorded on {selected.number}.
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
        </>
      )}
    </AppShell>
  );
}

function AddFlightDialog({
  open,
  onOpenChange,
  date,
  existing,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  existing: DepartingFlight[];
  onAdd: (flight: DepartingFlight) => void;
}) {
  const [number, setNumber] = useState("");
  const [to, setTo] = useState("");
  const [aircraft, setAircraft] = useState(aircraftTypes[0] ?? "");
  const [std, setStd] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setNumber("");
    setTo("");
    setAircraft(aircraftTypes[0] ?? "");
    setStd("");
    setError("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const flightNo = number.trim().toUpperCase();
    if (!flightNo) {
      setError("Flight number is required.");
      return;
    }
    if (!to) {
      setError("Select a destination station.");
      return;
    }
    if (!std) {
      setError("Scheduled departure time is required.");
      return;
    }
    const clash = existing.some(
      (f) => f.date === date && f.number.replace(/\s+/g, "") === flightNo.replace(/\s+/g, ""),
    );
    if (clash) {
      setError("That flight is already listed for this date.");
      return;
    }
    onAdd({
      id: `fl-${Date.now()}`,
      number: flightNo,
      from: currentStation,
      to,
      aircraft,
      std,
      date,
    });
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Add departing flight</DialogTitle>
            <DialogDescription>
              Register another service leaving {currentStation}. Units you create will attach to this
              flight, not to a shared pool.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 sm:grid-cols-2">
            <Field label="Flight number">
              <input
                className={inputClass}
                placeholder="BG 585"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                autoFocus
              />
            </Field>
            <Field label="Scheduled departure">
              <input
                type="time"
                className={inputClass}
                value={std}
                onChange={(e) => setStd(e.target.value)}
              />
            </Field>
            <Field label="Destination">
              <select className={selectClass} value={to} onChange={(e) => setTo(e.target.value)}>
                <option value="" disabled>
                  Select station
                </option>
                {stations
                  .filter((s) => s.code !== currentStation)
                  .map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} — {s.city}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Aircraft" hint="Load positions are filtered to this type.">
              <select
                className={selectClass}
                value={aircraft}
                onChange={(e) => setAircraft(e.target.value)}
              >
                {aircraftTypes.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {error && (
            <p className="mb-3 flex items-center gap-1.5 text-[12px] font-semibold text-alert">
              <TriangleAlert className="size-3.5" />
              {error}
            </p>
          )}
          <DialogFooter>
            <button type="button" className={btn.outline} onClick={() => onOpenChange(false)}>
              Cancel
            </button>
            <button type="submit" className={btn.primary}>
              <Plus className="size-4" />
              Add flight
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
