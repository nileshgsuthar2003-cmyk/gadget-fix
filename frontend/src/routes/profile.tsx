import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  User,
  Wrench,
  ClipboardList,
} from "lucide-react";
import { Card, IconTile } from "@/components/ui";
import { CustomerNav, Header, Screen } from "@/components/shell";
import { adminCustomers, CUSTOMER_NAME, inr } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Fixly" },
      { name: "description", content: "Manage your Fixly profile, addresses, and settings." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const customer = adminCustomers.find((c) => c.name === CUSTOMER_NAME) || {
    name: CUSTOMER_NAME,
    phone: "+91 98765 43210",
    repairs: 4,
    spent: 23496,
  };

  const menuItems = [
    { label: "Personal Information", icon: User, href: "/profile" },
    { label: "My Repairs", icon: ClipboardList, href: "/repairs" },
    { label: "Saved Addresses", icon: MapPin, href: "/profile" },
    { label: "Help & Support", icon: HelpCircle, href: "/profile" },
    { label: "Settings", icon: Settings, href: "/profile" },
  ];

  return (
    <Screen>
      <Header title="Profile" />
      <div className="flex-1 px-4 pb-6 pt-5">
        
        {/* User Info Card */}
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary-soft text-2xl font-bold text-primary">
            {customer.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-extrabold text-foreground">{customer.name}</h2>
            <p className="text-sm font-medium text-muted-foreground">{customer.phone}</p>
          </div>
        </Card>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconTile icon={<Wrench className="h-4 w-4" />} className="h-8 w-8" />
              <span className="text-xs font-semibold text-muted-foreground">Total Repairs</span>
            </div>
            <p className="text-xl font-extrabold text-foreground">{customer.repairs}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconTile icon={<CreditCard className="h-4 w-4" />} className="h-8 w-8" />
              <span className="text-xs font-semibold text-muted-foreground">Amount Spent</span>
            </div>
            <p className="text-xl font-extrabold text-foreground">{inr(customer.spent)}</p>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="mt-8 space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="animate-press flex items-center gap-4 rounded-2xl p-3 hover:bg-muted"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card border border-border text-muted-foreground shadow-[var(--shadow-card)]">
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <span className="flex-1 text-[15px] font-semibold text-foreground">{item.label}</span>
              <ChevronRight className="h-4.5 w-4.5 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-8">
          <button className="animate-press flex w-full items-center gap-4 rounded-2xl p-3 text-destructive hover:bg-destructive-soft">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-destructive/10">
              <LogOut className="h-4.5 w-4.5" />
            </div>
            <span className="flex-1 text-left text-[15px] font-semibold">Log Out</span>
          </button>
        </div>

      </div>
      <CustomerNav />
    </Screen>
  );
}
