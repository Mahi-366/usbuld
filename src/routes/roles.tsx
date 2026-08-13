import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { btn, Field, inputClass, Panel, TableShell, td, th } from "@/components/uld-ui";
import { PERMISSION_MODULES, roles } from "@/lib/uld-data";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions — ULD Control" },
      {
        name: "description",
        content:
          "Define roles and control which modules each role can view, create, edit or delete in the ULD system.",
      },
      { property: "og:title", content: "Roles & Permissions — ULD Control" },
      {
        property: "og:description",
        content:
          "Define roles and control which modules each role can view, create, edit or delete in the ULD system.",
      },
    ],
  }),
  component: RolesPage,
});

const actions = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "remove", label: "Delete" },
] as const;

function RolesPage() {
  const [activeId, setActiveId] = useState(roles[1]!.id);
  const active = roles.find((r) => r.id === activeId)!;

  return (
    <AppShell>
      <PageHeader
        title="Roles & Permissions"
        description="Control what each role can do, module by module. Permissions apply on top of the user's assigned stations."
      />

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <Panel bodyClassName="p-0" title="Roles" description={`${roles.length} roles defined`}>
            <ul className="divide-y divide-border">
              {roles.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => setActiveId(r.id)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-surface/60 ${
                      r.id === activeId ? "border-l-2 border-l-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-[13px] font-semibold">{r.name}</span>
                      <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] tabular text-muted-foreground">
                        {r.users}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {r.description}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="New role">
            <div className="space-y-3.5">
              <Field label="Role name">
                <input className={inputClass} placeholder="Ramp Supervisor" />
              </Field>
              <Field label="Description">
                <textarea
                  className={`${inputClass} h-20 resize-none py-2`}
                  placeholder="What this role is responsible for"
                />
              </Field>
              <button className={`${btn.primary} w-full`}>
                <Plus className="size-4" />
                Create role
              </button>
            </div>
          </Panel>
        </div>

        <Panel
          bodyClassName="p-0"
          title={`${active.name} — permission matrix`}
          description={active.description}
          actions={
            <button className={btn.primary}>
              <ShieldCheck className="size-4" />
              Save permissions
            </button>
          }
        >
          <TableShell>
            <thead>
              <tr>
                <th className={th}>Module</th>
                {actions.map((a) => (
                  <th key={a.key} className={`${th} text-center`}>
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MODULES.map((m) => {
                const p = active.permissions[m]!;
                return (
                  <tr key={m} className="hover:bg-surface/60">
                    <td className={`${td} font-medium`}>{m}</td>
                    {actions.map((a) => (
                      <td key={a.key} className={`${td} text-center`}>
                        <input
                          type="checkbox"
                          className="size-4 accent-[var(--primary)]"
                          checked={p[a.key]}
                          readOnly
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
          <p className="border-t border-border px-4 py-3 text-[12px] text-muted-foreground">
            A role with no <strong>View</strong> permission on a module hides that module from the
            sidebar entirely.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
