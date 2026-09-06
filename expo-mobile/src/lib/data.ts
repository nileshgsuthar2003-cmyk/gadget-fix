// Shared sample data for the Cell Care mobile repair prototype.

export const CUSTOMER_NAME = "Rahul Sharma";

export const brands = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Vivo",
  "Oppo",
  "Realme",
  "Motorola",
  "Google",
  "Nothing",
  "Other",
] as const;

export const modelsByBrand: Record<string, string[]> = {
  Apple: ["iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15", "iPhone 16"],
  Samsung: ["Galaxy S23", "Galaxy S24", "Galaxy A54", "Galaxy Note 20", "Galaxy Z Flip 5"],
  OnePlus: ["OnePlus 11", "OnePlus 12", "OnePlus Nord 3", "OnePlus 10 Pro"],
  Xiaomi: ["Redmi Note 13", "Xiaomi 14", "Poco X6", "Redmi 13C"],
  Vivo: ["Vivo V29", "Vivo X100", "Vivo Y200"],
  Oppo: ["Oppo Reno 11", "Oppo Find X7", "Oppo A78"],
  Realme: ["Realme 12 Pro", "Realme GT 6", "Realme C67"],
  Motorola: ["Moto G84", "Edge 40", "Moto G34"],
  Google: ["Pixel 7", "Pixel 8", "Pixel 8 Pro", "Pixel 9"],
  Nothing: ["Nothing Phone 2", "Nothing Phone 2a"],
  Other: ["Other model"],
};

export const problems = [
  "Broken Screen",
  "Display Not Working",
  "Battery Problem",
  "Charging Problem",
  "Camera Problem",
  "Speaker Problem",
  "Microphone Problem",
  "Water Damage",
  "Back Glass Broken",
  "Face ID Problem",
  "Software Problem",
  "Other",
] as const;

export interface ServiceOption {
  id: string;
  name: string;
  price: number;
  tag?: string;
}

export const servicesForDevice: ServiceOption[] = [
  { id: "screen", name: "Screen Replacement", price: 12999, tag: "Original" },
  { id: "battery", name: "Battery Replacement", price: 4999 },
  { id: "charging", name: "Charging Port Repair", price: 2499 },
  { id: "camera", name: "Camera Repair", price: 3499 },
  { id: "speaker", name: "Speaker Repair", price: 1499 },
];

export const popularServices = [
  { id: "screen", name: "Screen Replacement", icon: "smartphone", from: 999 },
  { id: "battery", name: "Battery Replacement", icon: "battery", from: 799 },
  { id: "charging", name: "Charging Problem", icon: "plug", from: 499 },
  { id: "camera", name: "Camera Repair", icon: "camera", from: 899 },
  { id: "speaker", name: "Speaker Repair", icon: "speaker", from: 599 },
  { id: "water", name: "Water Damage", icon: "droplets", from: 1299 },
] as const;

export type RepairStatus =
  | "Pending"
  | "Confirmed"
  | "Device Received"
  | "Inspection"
  | "Waiting Approval"
  | "Approved"
  | "Repairing"
  | "Quality Check"
  | "Ready"
  | "Delivered"
  | "Completed"
  | "Cancelled";

export const statusFlow: RepairStatus[] = [
  "Pending",
  "Confirmed",
  "Device Received",
  "Inspection",
  "Waiting Approval",
  "Approved",
  "Repairing",
  "Quality Check",
  "Ready",
  "Delivered",
  "Completed",
];

export const trackingSteps = [
  "Booking Created",
  "Appointment Confirmed",
  "Device Received",
  "Inspection",
  "Repair In Progress",
  "Quality Check",
  "Ready for Delivery",
  "Completed",
] as const;

export interface Repair {
  id: string;
  customer: string;
  phone: string;
  device: string;
  problem: string;
  service: string;
  status: RepairStatus;
  estimate: number;
  appointment: string;
  time: string;
  method: string;
  payment: "Paid" | "Pending" | "Partially Paid";
}

export const repairs: Repair[] = [
  {
    id: "REP-2026-001245",
    customer: "Rahul Sharma",
    phone: "+91 98765 43210",
    device: "iPhone 13",
    problem: "Screen Broken",
    service: "Screen Replacement",
    status: "Repairing",
    estimate: 12999,
    appointment: "25 Aug 2026",
    time: "11:00 AM",
    method: "Pickup & Delivery",
    payment: "Pending",
  },
  {
    id: "REP-2026-001238",
    customer: "Rahul Sharma",
    phone: "+91 98765 43210",
    device: "Samsung S23",
    problem: "Battery draining fast",
    service: "Battery Replacement",
    status: "Completed",
    estimate: 3499,
    appointment: "12 Aug 2026",
    time: "3:00 PM",
    method: "Visit Store",
    payment: "Paid",
  },
  {
    id: "REP-2026-001210",
    customer: "Rahul Sharma",
    phone: "+91 98765 43210",
    device: "OnePlus 11",
    problem: "Charging port loose",
    service: "Charging Port Repair",
    status: "Completed",
    estimate: 2499,
    appointment: "28 Jul 2026",
    time: "12:00 PM",
    method: "Visit Store",
    payment: "Paid",
  },
  {
    id: "REP-2026-001198",
    customer: "Rahul Sharma",
    phone: "+91 98765 43210",
    device: "iPhone 12",
    problem: "Water damage",
    service: "Water Damage Treatment",
    status: "Cancelled",
    estimate: 5999,
    appointment: "10 Jul 2026",
    time: "10:00 AM",
    method: "Pickup & Delivery",
    payment: "Pending",
  },
];

export const adminRequests: Repair[] = [
  { ...repairs[0]! },
  {
    id: "REP-2026-001246",
    customer: "Priya Nair",
    phone: "+91 98111 22334",
    device: "Galaxy S23",
    problem: "Display flickering",
    service: "Screen Replacement",
    status: "Pending",
    estimate: 11499,
    appointment: "23 Aug 2026",
    time: "12:00 PM",
    method: "Visit Store",
    payment: "Pending",
  },
  {
    id: "REP-2026-001247",
    customer: "Amit Verma",
    phone: "+91 99222 33445",
    device: "Pixel 8",
    problem: "Camera not focusing",
    service: "Camera Repair",
    status: "Pending",
    estimate: 4299,
    appointment: "23 Aug 2026",
    time: "2:00 PM",
    method: "Pickup & Delivery",
    payment: "Pending",
  },
  {
    id: "REP-2026-001241",
    customer: "Sneha Iyer",
    phone: "+91 98333 44556",
    device: "OnePlus 12",
    problem: "Speaker crackling",
    service: "Speaker Repair",
    status: "Inspection",
    estimate: 1799,
    appointment: "23 Aug 2026",
    time: "10:00 AM",
    method: "Visit Store",
    payment: "Pending",
  },
  {
    id: "REP-2026-001239",
    customer: "Vikram Rao",
    phone: "+91 97444 55667",
    device: "iPhone 14",
    problem: "Battery swelling",
    service: "Battery Replacement",
    status: "Waiting Approval",
    estimate: 5499,
    appointment: "23 Aug 2026",
    time: "11:00 AM",
    method: "Pickup & Delivery",
    payment: "Pending",
  },
  {
    id: "REP-2026-001236",
    customer: "Kavya Menon",
    phone: "+91 96555 66778",
    device: "Redmi Note 13",
    problem: "Charging Problem",
    service: "Charging Port Repair",
    status: "Ready",
    estimate: 1999,
    appointment: "22 Aug 2026",
    time: "4:00 PM",
    method: "Visit Store",
    payment: "Partially Paid",
  },
];

export const adminCustomers = [
  { name: "Rahul Sharma", phone: "+91 98765 43210", repairs: 4, spent: 23496, last: "25 Aug 2026" },
  { name: "Priya Nair", phone: "+91 98111 22334", repairs: 2, spent: 13998, last: "23 Aug 2026" },
  { name: "Amit Verma", phone: "+91 99222 33445", repairs: 1, spent: 4299, last: "23 Aug 2026" },
  { name: "Sneha Iyer", phone: "+91 98333 44556", repairs: 3, spent: 8497, last: "18 Aug 2026" },
  { name: "Vikram Rao", phone: "+91 97444 55667", repairs: 2, spent: 9498, last: "15 Aug 2026" },
  { name: "Kavya Menon", phone: "+91 96555 66778", repairs: 5, spent: 18995, last: "22 Aug 2026" },
];

export interface InventoryPart {
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  price: number;
}

export const inventory: InventoryPart[] = [
  { name: "iPhone 13 Display", sku: "DSP-IP13-ORG", stock: 5, minStock: 4, price: 9000 },
  { name: "iPhone 13 Battery", sku: "BAT-IP13-ORG", stock: 8, minStock: 4, price: 2800 },
  { name: "Charging Port (Universal)", sku: "CHG-UNI-01", stock: 12, minStock: 6, price: 900 },
  { name: "Galaxy S23 Display", sku: "DSP-S23-ORG", stock: 3, minStock: 4, price: 8200 },
  { name: "Pixel 8 Camera Module", sku: "CAM-PX8-ORG", stock: 2, minStock: 3, price: 3100 },
  { name: "OnePlus 12 Speaker", sku: "SPK-OP12-01", stock: 9, minStock: 4, price: 750 },
];

export const timeSlots = [
  { time: "10:00 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "12:00 PM", available: false },
  { time: "2:00 PM", available: true },
  { time: "3:00 PM", available: false },
  { time: "4:00 PM", available: true },
];

export function getUpcomingDays(count = 7) {
  const days = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    let label = "";
    if (i === 1) label = "Tomorrow";
    else {
      label = d.toLocaleDateString("en-US", { weekday: "short" });
    }

    const date = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    const fullDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    days.push({ label, date, fullDate, year: d.getFullYear() });
  }
  return days;
}

export const appointmentDays = getUpcomingDays(7);

export function inr(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

export interface RefurbishedPhone {
  id: string;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: "Superb" | "Good" | "Fair";
  batteryHealth: number;
  originalPrice: number;
  price: number;
  warranty: string;
  featured?: boolean;
}

export const refurbishedPhones: RefurbishedPhone[] = [
  {
    id: "RF-IP14-128",
    brand: "Apple",
    model: "iPhone 14",
    storage: "128 GB",
    color: "Midnight Black",
    condition: "Superb",
    batteryHealth: 94,
    originalPrice: 69900,
    price: 43999,
    warranty: "6 Months Cell Care Warranty",
    featured: true,
  },
  {
    id: "RF-IP13-128",
    brand: "Apple",
    model: "iPhone 13",
    storage: "128 GB",
    color: "Starlight White",
    condition: "Good",
    batteryHealth: 89,
    originalPrice: 59900,
    price: 36499,
    warranty: "6 Months Cell Care Warranty",
    featured: true,
  },
  {
    id: "RF-S23-256",
    brand: "Samsung",
    model: "Galaxy S23 5G",
    storage: "256 GB",
    color: "Phantom Black",
    condition: "Superb",
    batteryHealth: 96,
    originalPrice: 79999,
    price: 45999,
    warranty: "6 Months Cell Care Warranty",
    featured: true,
  },
  {
    id: "RF-OP11-256",
    brand: "OnePlus",
    model: "OnePlus 11 5G",
    storage: "256 GB",
    color: "Titan Black",
    condition: "Superb",
    batteryHealth: 92,
    originalPrice: 61999,
    price: 34999,
    warranty: "6 Months Cell Care Warranty",
  },
  {
    id: "RF-PX8-128",
    brand: "Google",
    model: "Pixel 8",
    storage: "128 GB",
    color: "Hazel Green",
    condition: "Good",
    batteryHealth: 91,
    originalPrice: 75999,
    price: 38999,
    warranty: "6 Months Cell Care Warranty",
  },
  {
    id: "RF-IP12-64",
    brand: "Apple",
    model: "iPhone 12",
    storage: "64 GB",
    color: "Deep Blue",
    condition: "Fair",
    batteryHealth: 85,
    originalPrice: 49900,
    price: 24999,
    warranty: "3 Months Cell Care Warranty",
  },
  {
    id: "RF-S22-128",
    brand: "Samsung",
    model: "Galaxy S22",
    storage: "128 GB",
    color: "Green",
    condition: "Good",
    batteryHealth: 88,
    originalPrice: 57999,
    price: 26999,
    warranty: "6 Months Cell Care Warranty",
  },
];

export const sellBasePrices: Record<string, number> = {
  "iPhone 15": 42000,
  "iPhone 14": 34000,
  "iPhone 13": 26000,
  "iPhone 12": 19000,
  "iPhone 11": 14000,
  "Galaxy S24": 46000,
  "Galaxy S23": 33000,
  "Galaxy A54": 15000,
  "OnePlus 12": 39000,
  "OnePlus 11": 25000,
  "Pixel 8": 28000,
  "Pixel 7": 19000,
  "Redmi Note 13": 9500,
  "Vivo X100": 31000,
};

