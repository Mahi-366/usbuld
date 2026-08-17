export type UnitType = "AKE" | "PMC";
export type Condition = "Active" | "Under Repair" | "Lite Damage" | "Damage";
export type ShipmentStatus = "In Transit" | "Received" | "Discrepancy";

export const CONDITIONS: Condition[] = ["Active", "Under Repair", "Lite Damage", "Damage"];

export interface Station {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  kind: "Headquarter" | "Outstation";
  capacity: number;
  contactEmail: string;
}

export interface Unit {
  id: string;
  number: string;
  type: UnitType;
  stationCode: string;
  condition: Condition;
  lastMovement: string;
  ownerAirline: string;
}

export interface JourneyLeg {
  date: string;
  from: string;
  to: string;
  conditionOut: Condition;
  conditionIn: Condition;
  flight: string;
  remarks?: string;
}

export interface Shipment {
  id: string;
  reference: string;
  from: string;
  to: string;
  flight: string;
  sentOn: string;
  receivedOn?: string;
  sentBy: string;
  status: ShipmentStatus;
  akeSent: number;
  pmcSent: number;
  akeReceived?: number;
  pmcReceived?: number;
  remarks?: string;
  units: string[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  role: string;
  stations: string[];
  status: "Active" | "Suspended";
  lastLogin: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: Record<string, PermissionSet>;
}

export interface PermissionSet {
  view: boolean;
  create: boolean;
  edit: boolean;
  remove: boolean;
}

export const PERMISSION_MODULES = [
  "Dashboard",
  "Create",
  "Send",
  "Receive",
  "AKE & PMC",
  "Reports",
  "Stations",
  "Users",
  "Roles",
];

export const stations: Station[] = [
  {
    id: "st-dac",
    code: "DAC",
    name: "Hazrat Shahjalal Intl",
    city: "Dhaka",
    country: "Bangladesh",
    kind: "Headquarter",
    capacity: 640,
    contactEmail: "uld.dac@airline.com",
  },
  {
    id: "st-cgp",
    code: "CGP",
    name: "Shah Amanat Intl",
    city: "Chattogram",
    country: "Bangladesh",
    kind: "Outstation",
    capacity: 180,
    contactEmail: "uld.cgp@airline.com",
  },
  {
    id: "st-zyl",
    code: "ZYL",
    name: "Osmani Intl",
    city: "Sylhet",
    country: "Bangladesh",
    kind: "Outstation",
    capacity: 120,
    contactEmail: "uld.zyl@airline.com",
  },
  {
    id: "st-dxb",
    code: "DXB",
    name: "Dubai Intl",
    city: "Dubai",
    country: "UAE",
    kind: "Outstation",
    capacity: 220,
    contactEmail: "uld.dxb@airline.com",
  },
  {
    id: "st-sin",
    code: "SIN",
    name: "Changi",
    city: "Singapore",
    country: "Singapore",
    kind: "Outstation",
    capacity: 200,
    contactEmail: "uld.sin@airline.com",
  },
  {
    id: "st-lhr",
    code: "LHR",
    name: "Heathrow",
    city: "London",
    country: "United Kingdom",
    kind: "Outstation",
    capacity: 160,
    contactEmail: "uld.lhr@airline.com",
  },
  {
    id: "st-kul",
    code: "KUL",
    name: "Kuala Lumpur Intl",
    city: "Kuala Lumpur",
    country: "Malaysia",
    kind: "Outstation",
    capacity: 140,
    contactEmail: "uld.kul@airline.com",
  },
  {
    id: "st-jed",
    code: "JED",
    name: "King Abdulaziz Intl",
    city: "Jeddah",
    country: "Saudi Arabia",
    kind: "Outstation",
    capacity: 150,
    contactEmail: "uld.jed@airline.com",
  },
];

export const stationByCode = (code: string) => stations.find((s) => s.code === code);

/* Deterministic demo unit generation */
const distribution: Array<{ code: string; ake: number; pmc: number }> = [
  { code: "DAC", ake: 212, pmc: 148 },
  { code: "CGP", ake: 54, pmc: 31 },
  { code: "ZYL", ake: 33, pmc: 18 },
  { code: "DXB", ake: 76, pmc: 52 },
  { code: "SIN", ake: 61, pmc: 44 },
  { code: "LHR", ake: 48, pmc: 39 },
  { code: "KUL", ake: 37, pmc: 26 },
  { code: "JED", ake: 42, pmc: 33 },
];

function conditionFor(i: number): Condition {
  const m = i % 17;
  if (m === 3 || m === 11) return "Under Repair";
  if (m === 7) return "Lite Damage";
  if (m === 14) return "Damage";
  return "Active";
}

function dateFor(i: number) {
  const d = new Date(Date.UTC(2026, 6, 1 + (i % 43)));
  return d.toISOString().slice(0, 10);
}

function build(): Unit[] {
  const out: Unit[] = [];
  let seq = 0;
  for (const row of distribution) {
    for (let i = 0; i < row.ake; i++) {
      seq++;
      out.push({
        id: `u-${seq}`,
        number: `AKE ${10000 + seq} BG`,
        type: "AKE",
        stationCode: row.code,
        condition: conditionFor(seq),
        lastMovement: dateFor(seq),
        ownerAirline: "BG",
      });
    }
    for (let i = 0; i < row.pmc; i++) {
      seq++;
      out.push({
        id: `u-${seq}`,
        number: `PMC ${40000 + seq} BG`,
        type: "PMC",
        stationCode: row.code,
        condition: conditionFor(seq),
        lastMovement: dateFor(seq),
        ownerAirline: "BG",
      });
    }
  }
  return out;
}

export const units: Unit[] = build();

export const unitById = (id: string) => units.find((u) => u.id === id);

export interface StationStock {
  station: Station;
  ake: number;
  pmc: number;
  total: number;
  utilisation: number;
  status: "Healthy" | "Watch" | "Critical";
}

export function stationStocks(): StationStock[] {
  return stations.map((station) => {
    const own = units.filter((u) => u.stationCode === station.code);
    const ake = own.filter((u) => u.type === "AKE").length;
    const pmc = own.filter((u) => u.type === "PMC").length;
    const total = ake + pmc;
    const utilisation = Math.round((total / station.capacity) * 100);
    const status: StationStock["status"] =
      utilisation >= 85 ? "Critical" : utilisation >= 60 ? "Watch" : "Healthy";
    return { station, ake, pmc, total, utilisation, status };
  });
}

export const journeys: Record<string, JourneyLeg[]> = {
  default: [
    {
      date: "2026-05-04",
      from: "DAC",
      to: "DXB",
      conditionOut: "Active",
      conditionIn: "Active",
      flight: "BG 347",
      remarks: "Routine baggage build-up.",
    },
    {
      date: "2026-05-22",
      from: "DXB",
      to: "LHR",
      conditionOut: "Active",
      conditionIn: "Lite Damage",
      flight: "BG 201",
      remarks: "Corner rail scuffed during offload.",
    },
    {
      date: "2026-06-14",
      from: "LHR",
      to: "DAC",
      conditionOut: "Lite Damage",
      conditionIn: "Under Repair",
      flight: "BG 202",
      remarks: "Routed to HQ workshop for panel replacement.",
    },
    {
      date: "2026-07-09",
      from: "DAC",
      to: "CGP",
      conditionOut: "Active",
      conditionIn: "Active",
      flight: "BG 601",
      remarks: "Repair signed off, returned to rotation.",
    },
  ],
};

export const shipments: Shipment[] = [
  {
    id: "sh-1",
    reference: "ULD-2026-0841",
    from: "DXB",
    to: "DAC",
    flight: "BG 348",
    sentOn: "2026-08-12",
    sentBy: "Rezaul Karim",
    status: "In Transit",
    akeSent: 8,
    pmcSent: 5,
    remarks: "Two pallets carry oversized cargo nets.",
    units: ["AKE 10118 BG", "AKE 10119 BG", "PMC 40122 BG"],
  },
  {
    id: "sh-2",
    reference: "ULD-2026-0840",
    from: "SIN",
    to: "DAC",
    flight: "BG 585",
    sentOn: "2026-08-12",
    sentBy: "Nadia Rahman",
    status: "In Transit",
    akeSent: 6,
    pmcSent: 4,
    units: ["AKE 10203 BG", "PMC 40233 BG"],
  },
  {
    id: "sh-3",
    reference: "ULD-2026-0838",
    from: "DAC",
    to: "LHR",
    flight: "BG 201",
    sentOn: "2026-08-10",
    receivedOn: "2026-08-11",
    sentBy: "Imran Hossain",
    status: "Discrepancy",
    akeSent: 12,
    pmcSent: 7,
    akeReceived: 11,
    pmcReceived: 7,
    remarks: "One AKE not offloaded at destination.",
    units: ["AKE 10011 BG", "AKE 10012 BG"],
  },
  {
    id: "sh-4",
    reference: "ULD-2026-0836",
    from: "DAC",
    to: "CGP",
    flight: "BG 601",
    sentOn: "2026-08-09",
    receivedOn: "2026-08-09",
    sentBy: "Imran Hossain",
    status: "Received",
    akeSent: 9,
    pmcSent: 3,
    akeReceived: 9,
    pmcReceived: 3,
    units: ["AKE 10240 BG"],
  },
  {
    id: "sh-5",
    reference: "ULD-2026-0833",
    from: "JED",
    to: "DAC",
    flight: "BG 138",
    sentOn: "2026-08-07",
    receivedOn: "2026-08-08",
    sentBy: "Farhan Alam",
    status: "Received",
    akeSent: 5,
    pmcSent: 6,
    akeReceived: 5,
    pmcReceived: 6,
    units: ["PMC 40501 BG"],
  },
  {
    id: "sh-6",
    reference: "ULD-2026-0829",
    from: "KUL",
    to: "DAC",
    flight: "BG 089",
    sentOn: "2026-08-05",
    receivedOn: "2026-08-06",
    sentBy: "Sabrina Yeasmin",
    status: "Discrepancy",
    akeSent: 7,
    pmcSent: 5,
    akeReceived: 7,
    pmcReceived: 4,
    remarks: "One PMC arrived with a cracked base plate.",
    units: ["PMC 40611 BG"],
  },
];

export const users: AppUser[] = [
  {
    id: "us-1",
    name: "Imran Hossain",
    email: "imran.hossain@airline.com",
    employeeId: "EMP-10241",
    role: "System Administrator",
    stations: ["DAC", "CGP", "ZYL", "DXB", "SIN", "LHR", "KUL", "JED"],
    status: "Active",
    lastLogin: "2026-08-13 08:42",
  },
  {
    id: "us-2",
    name: "Nadia Rahman",
    email: "nadia.rahman@airline.com",
    employeeId: "EMP-10318",
    role: "Station Manager",
    stations: ["SIN", "KUL"],
    status: "Active",
    lastLogin: "2026-08-13 06:10",
  },
  {
    id: "us-3",
    name: "Rezaul Karim",
    email: "rezaul.karim@airline.com",
    employeeId: "EMP-10402",
    role: "Station Manager",
    stations: ["DXB", "JED"],
    status: "Active",
    lastLogin: "2026-08-12 21:55",
  },
  {
    id: "us-4",
    name: "Sabrina Yeasmin",
    email: "sabrina.yeasmin@airline.com",
    employeeId: "EMP-10455",
    role: "Cargo Officer",
    stations: ["KUL"],
    status: "Active",
    lastLogin: "2026-08-12 17:31",
  },
  {
    id: "us-5",
    name: "Farhan Alam",
    email: "farhan.alam@airline.com",
    employeeId: "EMP-10490",
    role: "Cargo Officer",
    stations: ["JED"],
    status: "Active",
    lastLogin: "2026-08-11 14:03",
  },
  {
    id: "us-6",
    name: "Tanvir Ahmed",
    email: "tanvir.ahmed@airline.com",
    employeeId: "EMP-10512",
    role: "Auditor",
    stations: ["DAC"],
    status: "Suspended",
    lastLogin: "2026-07-29 09:48",
  },
];

function perms(v: boolean, c: boolean, e: boolean, r: boolean): PermissionSet {
  return { view: v, create: c, edit: e, remove: r };
}

function matrix(fn: (m: string) => PermissionSet) {
  return Object.fromEntries(PERMISSION_MODULES.map((m) => [m, fn(m)]));
}

export const roles: Role[] = [
  {
    id: "role-1",
    name: "System Administrator",
    description: "Unrestricted access across every station and module.",
    users: 1,
    permissions: matrix(() => perms(true, true, true, true)),
  },
  {
    id: "role-2",
    name: "Station Manager",
    description: "Full operational control limited to assigned stations.",
    users: 2,
    permissions: matrix((m) =>
      ["Users", "Roles", "Stations"].includes(m)
        ? perms(true, false, false, false)
        : perms(true, true, true, false),
    ),
  },
  {
    id: "role-3",
    name: "Cargo Officer",
    description: "Day-to-day send and receive handling at one station.",
    users: 2,
    permissions: matrix((m) =>
      ["Send", "Receive", "Create"].includes(m)
        ? perms(true, true, false, false)
        : ["Users", "Roles", "Stations"].includes(m)
          ? perms(false, false, false, false)
          : perms(true, false, false, false),
    ),
  },
  {
    id: "role-4",
    name: "Auditor",
    description: "Read-only visibility for compliance and reconciliation.",
    users: 1,
    permissions: matrix(() => perms(true, false, false, false)),
  },
];

export const currentUser = users[0]!;

export const currentStation = "DAC";

export interface LoadPosition {
  id: string;
  code: string;
  deck: "Main Deck" | "Lower Deck";
  compartment: string;
  aircraft: string;
  unitTypes: UnitType[];
  active: boolean;
}

export const loadPositions: LoadPosition[] = [
  { id: "pos-1", code: "11L", deck: "Main Deck", compartment: "Forward", aircraft: "B777F", unitTypes: ["PMC"], active: true },
  { id: "pos-2", code: "11R", deck: "Main Deck", compartment: "Forward", aircraft: "B777F", unitTypes: ["PMC"], active: true },
  { id: "pos-3", code: "12P", deck: "Main Deck", compartment: "Forward", aircraft: "B777F", unitTypes: ["PMC"], active: true },
  { id: "pos-4", code: "21P", deck: "Main Deck", compartment: "Mid", aircraft: "B777F", unitTypes: ["PMC"], active: true },
  { id: "pos-5", code: "31P", deck: "Main Deck", compartment: "Aft", aircraft: "B777F", unitTypes: ["PMC"], active: true },
  { id: "pos-6", code: "41L", deck: "Lower Deck", compartment: "Forward hold", aircraft: "B787-9", unitTypes: ["AKE"], active: true },
  { id: "pos-7", code: "41R", deck: "Lower Deck", compartment: "Forward hold", aircraft: "B787-9", unitTypes: ["AKE"], active: true },
  { id: "pos-8", code: "42L", deck: "Lower Deck", compartment: "Forward hold", aircraft: "B787-9", unitTypes: ["AKE"], active: true },
  { id: "pos-9", code: "51L", deck: "Lower Deck", compartment: "Aft hold", aircraft: "B787-9", unitTypes: ["AKE"], active: true },
  { id: "pos-10", code: "52R", deck: "Lower Deck", compartment: "Aft hold", aircraft: "B787-9", unitTypes: ["AKE", "PMC"], active: true },
  { id: "pos-11", code: "PR", deck: "Lower Deck", compartment: "Bulk", aircraft: "A330-300", unitTypes: ["AKE"], active: false },
  { id: "pos-12", code: "PL", deck: "Lower Deck", compartment: "Bulk", aircraft: "A330-300", unitTypes: ["AKE"], active: true },
];
