import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Pencil, UserPlus, Users as UsersIcon, X } from "lucide-react";
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
import { roles, stations, users } from "@/lib/uld-data";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "User Management — ULD Control" },
      {
        name: "description",
        content:
          "Manage system users, their assigned stations, roles and credentials for the ULD network.",
      },
      { property: "og:title", content: "User Management — ULD Control" },
      {
        property: "og:description",
        content:
          "Manage system users, their assigned stations, roles and credentials for the ULD network.",
      },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const [editing, setEditing] = useState<string | null>(null);
  const active = users.find((u) => u.id === editing);

  return (
    <AppShell>
      <PageHeader
        title="User Management"
        description="A user only sees the stations attached to their profile. Assign stations carefully."
        actions={
          <button className={btn.primary} onClick={() => setEditing(users[1]!.id)}>
            <UserPlus className="size-4" />
            Add user
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={users.length} icon={<UsersIcon className="size-4" />} />
        <StatCard label="Active" value={users.filter((u) => u.status === "Active").length} tone="ok" />
        <StatCard label="Suspended" value={users.filter((u) => u.status === "Suspended").length} tone="alert" />
        <StatCard label="Roles configured" value={roles.length} />
      </div>

      <Panel className="mt-4" bodyClassName="p-0" title="All users">
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Employee ID</th>
              <th className={th}>Email</th>
              <th className={th}>Role</th>
              <th className={th}>Assigned stations</th>
              <th className={th}>Status</th>
              <th className={th}>Last login</th>
              <th className={`${th} w-20`}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface/60">
                <td className={`${td} font-semibold`}>{u.name}</td>
                <td className={`${td} tabular text-muted-foreground`}>{u.employeeId}</td>
                <td className={`${td} text-muted-foreground`}>{u.email}</td>
                <td className={td}>{u.role}</td>
                <td className={td}>
                  <div className="flex flex-wrap gap-1">
                    {u.stations.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                    {u.stations.length > 4 && (
                      <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        +{u.stations.length - 4}
                      </span>
                    )}
                  </div>
                </td>
                <td className={td}>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      u.status === "Active"
                        ? "border-ok/25 bg-ok/12 text-ok"
                        : "border-destructive/25 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className={`${td} tabular text-muted-foreground`}>{u.lastLogin}</td>
                <td className={td}>
                  <div className="flex gap-2">
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setEditing(u.id)}
                      title="Edit user"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground" title="Reset password">
                      <KeyRound className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-raised)]">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="font-display text-[14px] font-semibold">Edit user</h2>
                <p className="text-[11px] text-muted-foreground">{active.employeeId}</p>
              </div>
              <button className={btn.ghost} onClick={() => setEditing(null)}>
                <X className="size-4" />
              </button>
            </header>

            <div className="flex-1 space-y-3.5 overflow-y-auto p-4">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Full name">
                  <input className={inputClass} defaultValue={active.name} />
                </Field>
                <Field label="Employee ID">
                  <input className={inputClass} defaultValue={active.employeeId} />
                </Field>
              </div>
              <Field label="Email">
                <input className={inputClass} defaultValue={active.email} />
              </Field>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Role">
                  <select className={selectClass} defaultValue={active.role}>
                    {roles.map((r) => (
                      <option key={r.id}>{r.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select className={selectClass} defaultValue={active.status}>
                    <option>Active</option>
                    <option>Suspended</option>
                  </select>
                </Field>
              </div>

              <Field label="Assigned stations" hint="The user can only view and act on these stations.">
                <div className="grid grid-cols-4 gap-2 rounded-md border border-input p-3">
                  {stations.map((s) => (
                    <label key={s.code} className="flex items-center gap-1.5 text-[12px]">
                      <input
                        type="checkbox"
                        className="size-3.5 accent-[var(--primary)]"
                        defaultChecked={active.stations.includes(s.code)}
                      />
                      {s.code}
                    </label>
                  ))}
                </div>
              </Field>

              <div className="rounded-md border border-border bg-surface/50 p-3">
                <p className="text-[12px] font-semibold">Reset password</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  The user is required to change it at next sign-in.
                </p>
                <div className="mt-2.5 flex gap-2">
                  <input className={inputClass} type="password" placeholder="New password" />
                  <button className={btn.outline}>
                    <KeyRound className="size-4" />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <footer className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <button className={btn.outline} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className={btn.primary} onClick={() => setEditing(null)}>
                Save changes
              </button>
            </footer>
          </div>
        </div>
      )}
    </AppShell>
  );
}
