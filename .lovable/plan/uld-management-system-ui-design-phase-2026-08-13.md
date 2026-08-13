# ULD Management System — UI Design Phase

Airline ULD (Unit Load Device) tracking system. AKE = baggage containers, PMC = cargo pallets. Dhaka is headquarters; all other airports are outstations.

This phase builds **every screen with realistic demo data** so you can review and approve the design and workflows. No backend yet — that comes after your approval.

## Design Direction
- **Palette**: Navy Trust — `#0f1b3d` navy, `#1e3a5f` secondary, `#3b6fa0` accent, `#e8edf3` surface
- **Typography**: Sora headings, Manrope body
- **Layout**: Persistent sidebar dashboard, corporate density, data tables as the primary surface
- Condition colors: Active (green), Under Repair (amber), Lite Damage (orange), Damage (red)

## Core Model
Every AKE/PMC is an individual numbered unit with a current **station** and current **condition**. Send and Receive are two halves of one Shipment record — the send opens it (In Transit), the receive closes it. Comparing the two halves is what detects mismatches (10 sent, 9 received) and condition downgrades. That comparison drives the email trigger.

## Screens

**Login** — corporate branded sign-in.

**Dashboard** — bar chart of total AKE vs PMC units, airport filter dropdown, HQ vs Outstation split cards, and a station table showing AKE stock, PMC stock, total capacity, and stock status per station.

**Create** — form to add an AKE/PMC by number with condition. Table of created units with inline condition change (Active / Under Repair / Lite Damage / Damage). Excel import panel with column mapping preview. Send-mail action.

**Send** — from-station auto-filled from the signed-in user's profile. Multi-select list of available units at that station, destination station dropdown, condition per unit, remarks field. Confirmation summary showing what will be sent and who gets notified.

**Receive** — inbound shipments list. Detail view to log received units, condition on arrival, remarks, and document/photo attachments as evidence. Mismatch banner appears automatically when received counts or conditions differ from sent. Send-email action opens the email composer.

**Email Composer** — preset template with sender's email, unit details, shipment info, and attachments prefilled. Used for mismatch and damage reporting.

**AKE & PMC Registry** — master list of all units with number, type, current station, condition, and last movement. Unit detail page shows the full journey timeline: every station-to-station move with condition at each step.

**Reports** — separate AKE Report and PMC Report tabs, with date range and station filters, summary totals, and download action.

**Stations** — station master data (code, name, city, HQ/Outstation, capacity, contact email). This list feeds every station dropdown in the system.

**User Management** — user list with details, assigned stations, and role. Admin can edit users and reset passwords.

**Roles & Permissions** — role list plus a permission matrix (view / create / edit / delete per module) so the admin controls access.

## Rules Reflected in the UI
- Station scoping: users only see stations assigned to their profile — dropdowns and lists are filtered accordingly.
- Receiver notification: on send, the receiving station's personnel are notified with the unit count and type (CPM-style message).
- Evidence: attachments available at receive for documenting damage or discrepancy.
- Every state change is recorded and shown in the unit journey.

## Technical Notes
- Design tokens in `src/styles.css`; Sora + Manrope loaded via the root route.
- Shared dashboard shell (sidebar + top bar + page header) wraps all authenticated screens.
- Reusable components: KPI card, data table with filters, condition badge, station selector, unit multi-select, timeline, file dropzone, permission matrix.
- Demo data in a typed fixtures module — swapped for real queries in the backend phase.
- Charts via a lightweight chart component using design tokens.

## Not in This Phase
- Database, authentication, real email sending, Excel parsing, file storage. All screens use demo data. Backend wiring follows your design approval.
