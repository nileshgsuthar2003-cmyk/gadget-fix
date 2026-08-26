import { type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Home,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  Plus,
  User,
  Wrench,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Screen wrapper: mobile-first, centered column on larger viewports ---------- */

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-background", className)}>
      {children}
    </div>
  );
}

/* ---------- Page header with optional back ---------- */

export function Header({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean | string;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4">
        {back ? (
          typeof back === "string" ? (
            <Link
              to={back}
              className="animate-press -ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          ) : (
            <button
              onClick={() => navigate({ to: ".." as never })}
              className="animate-press -ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-bold text-foreground">{title}</h1>
          {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {right}
      </div>
    </header>
  );
}

/* ---------- Customer bottom navigation ---------- */

export function CustomerNav() {
  const item =
    "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-muted-foreground";
  const active = "text-primary";
  return (
    <nav className="sticky bottom-0 z-20 mt-auto border-t border-border bg-card shadow-[var(--shadow-nav)]">
      <div className="relative grid grid-cols-4 px-2">
        <Link to="/home" className={item} activeProps={{ className: cn(item, active) }}>
          <Home className="h-[22px] w-[22px]" />
          Home
        </Link>
        <Link to="/repairs" className={item} activeProps={{ className: cn(item, active) }}>
          <ClipboardList className="h-[22px] w-[22px]" />
          My Repairs
        </Link>
        <Link to="/book" className={item} activeProps={{ className: cn(item, active) }}>
          <Plus className="h-[22px] w-[22px]" />
          Book Repair
        </Link>
        <Link to="/profile" className={item} activeProps={{ className: cn(item, active) }}>
          <User className="h-[22px] w-[22px]" />
          Profile
        </Link>
      </div>
    </nav>
  );
}

/* ---------- Admin bottom navigation ---------- */

export function AdminNav() {
  const item =
    "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-muted-foreground";
  const active = "text-primary";
  return (
    <nav className="sticky bottom-0 z-20 mt-auto border-t border-border bg-card shadow-[var(--shadow-nav)]">
      <div className="grid grid-cols-5 px-1">
        <Link to={"/admin" as any} activeOptions={{ exact: true }} className={item} activeProps={{ className: cn(item, active) }}>
          <LayoutDashboard className="h-[22px] w-[22px]" />
          Dashboard
        </Link>
        <Link to={"/admin/requests" as any} className={item} activeProps={{ className: cn(item, active) }}>
          <Wrench className="h-[22px] w-[22px]" />
          Requests
        </Link>
        <Link to={"/admin/appointments" as any} className={item} activeProps={{ className: cn(item, active) }}>
          <CalendarDays className="h-[22px] w-[22px]" />
          Schedule
        </Link>
        <Link to={"/admin/inventory" as any} className={item} activeProps={{ className: cn(item, active) }}>
          <Package className="h-[22px] w-[22px]" />
          Inventory
        </Link>
        <Link to={"/admin/more" as any} className={item} activeProps={{ className: cn(item, active) }}>
          <MoreHorizontal className="h-[22px] w-[22px]" />
          More
        </Link>
      </div>
    </nav>
  );
}

/* ---------- Wizard step progress ---------- */

export function StepProgress({ step, total, label }: { step: number; total: number; label?: string }) {
  return (
    <div className="px-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-primary">
          Step {step} of {total}
        </span>
        {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Tracking timeline ---------- */

export function Timeline({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className="relative">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="relative flex gap-3.5 pb-6 last:pb-0">
            {i < steps.length - 1 ? (
              <span
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%-20px)] w-0.5 rounded-full",
                  done ? "bg-success" : "bg-border",
                )}
              />
            ) : null}
            <span
              className={cn(
                "z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2",
                done && "border-success bg-success text-success-foreground",
                active && "animate-pulse-dot border-primary bg-primary text-primary-foreground",
                !done && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : <span className="text-[11px] font-bold">{i + 1}</span>}
            </span>
            <div className="pt-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </p>
              {active ? <p className="mt-0.5 text-xs text-muted-foreground">In progress now</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
