# Airline Cargo Management System — UI Design & Export Plan

## Overview
Build a complete, high-fidelity UI for an airline cargo management tool, then export the screens as a shareable asset pack. The visual direction is a corporate sidebar dashboard: deep navy (Navy Trust palette), Sora headings, Manrope body, clean data-dense panels.

## Design Decisions
- **Palette**: Navy Trust — `#0f1b3d` (brand navy), `#1e3a5f` (secondary), `#3b6fa0` (accent), `#e8edf3` (surface). Tokens map to `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--muted`, `--card`, `--border`.
- **Typography**: Sora for headings and numbers; Manrope for body, labels, and table text.
- **Layout**: Persistent sidebar dashboard with a top bar, main content area, and a summary/stat cards on the home screen. Tables are the primary data surface.
- **Components**: sidebar navigation, top header, KPI cards, data tables, filters, status badges, form inputs, modal shells, toast/notification area.
- **No dark-mode toggle**: single light theme focused on corporate readability.

## Screens to Design & Export
1. **Login** — centered corporate login with brand navy, email/password, airline logo mark.
2. **Dashboard / Overview** — KPI row (active shipments, flights today, tonnage, revenue), recent shipments table, quick actions, alert panel.
3. **Shipments** — searchable/filterable shipments table with status badges, AWB number, origin/destination, weight, flight, and customer.
4. **Shipment Detail** — read-only summary card, cargo manifest, tracking timeline, document list, action buttons.
5. **Flight Schedule** — flight grid with route, aircraft, departure/arrival, available capacity, cut-off times.
6. **Warehouse / Inventory** — storage positions, ULD/pallet inventory, inbound/outbound activity.
7. **Customers** — customer directory with contact, volume tier, credit status, recent shipments.
8. **Reports / Analytics** — charts and summary tables (tonnage, revenue, top routes, delayed shipments).
9. **Settings** — account, users/roles, notifications, integrations.

## Export Deliverables
- PNG screenshots of each screen at 1440x900 desktop viewport.
- A single PDF deck containing all screens in order.
- All files saved to `/mnt/documents/cargo-ui-export/`.

## Implementation Steps
1. Set up design tokens in `src/styles.css` (Navy Trust palette, Sora + Manrope font imports).
2. Build the shared dashboard shell: sidebar, top bar, page header, and content wrapper.
3. Build reusable components: KPI cards, data tables, filters, status badges, form inputs, buttons.
4. Implement the route tree and screens listed above in `src/routes/`.
5. Seed representative cargo data so every screen looks realistic in screenshots.
6. Export each screen via Playwright to PNG, then assemble into a PDF.
7. Verify all exported screens for clipping, missing data, or layout issues.

## Scope Exclusions
- No real backend or database integration (use static/demo data for the export).
- No authentication logic; login screen is a visual shell.
- No interactive chart library if it complicates export; use simple stat cards and bar visuals where needed.
