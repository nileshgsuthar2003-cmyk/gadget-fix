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
  ShoppingBag,
  Zap,
  ShieldCheck,
  Phone,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CUSTOMER_NAME } from "@/lib/data";

/* ---------- Responsive Screen wrapper ---------- */

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <DesktopNav />
      <main className={cn("mx-auto w-full max-w-7xl flex-1 flex flex-col", className)}>
        {children}
      </main>
      <DesktopFooter />
    </div>
  );
}

/* ---------- Desktop Top Navigation Bar ---------- */

export function DesktopNav() {
  return (
    <header className="sticky top-0 z-40 hidden md:block border-b border-border/80 bg-card/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand Logo */}
        <Link to="/home" className="flex items-center gap-2.5 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
            <Wrench className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">Fixly</span>
            <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">Pro</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1 lg:gap-2">
          <Link
            to="/home"
            className="px-3.5 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            activeProps={{ className: "px-3.5 py-2 rounded-xl text-sm font-bold text-primary bg-primary/10" }}
          >
            Home
          </Link>
          <Link
            to="/book"
            className="px-3.5 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            activeProps={{ className: "px-3.5 py-2 rounded-xl text-sm font-bold text-primary bg-primary/10" }}
          >
            Book Repair
          </Link>
          <Link
            to="/buy"
            className="px-3.5 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
            activeProps={{ className: "px-3.5 py-2 rounded-xl text-sm font-bold text-primary bg-primary/10 flex items-center gap-1.5" }}
          >
            <ShoppingBag className="h-4 w-4 text-emerald-500" />
            Buy Refurbished
          </Link>
          <Link
            to="/sell"
            className="px-3.5 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
            activeProps={{ className: "px-3.5 py-2 rounded-xl text-sm font-bold text-primary bg-primary/10 flex items-center gap-1.5" }}
          >
            <Zap className="h-4 w-4 text-amber-500" />
            Sell Old Phone
          </Link>
          <Link
            to="/repairs"
            className="px-3.5 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            activeProps={{ className: "px-3.5 py-2 rounded-xl text-sm font-bold text-primary bg-primary/10" }}
          >
            My Repairs
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Book a Repair
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-1.5 hover:bg-accent transition-colors"
          >
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
              {CUSTOMER_NAME.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-foreground">{CUSTOMER_NAME.split(" ")[0]}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------- Desktop Footer ---------- */

export function DesktopFooter() {
  return (
    <footer className="mt-auto hidden md:block border-t border-border bg-card/60 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-foreground">Fixly</span>
            </div>
            <p className="text-xs leading-relaxed">
              India's fastest and most reliable mobile device repair, refurbished marketplace, and instant trade-in platform.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              6 Months Warranty on all repairs
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Repair Services</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/book" className="hover:text-foreground transition-colors">Screen Replacement</Link></li>
              <li><Link to="/book" className="hover:text-foreground transition-colors">Battery Replacement</Link></li>
              <li><Link to="/book" className="hover:text-foreground transition-colors">Charging Port Fix</Link></li>
              <li><Link to="/book" className="hover:text-foreground transition-colors">Camera & Lens Repair</Link></li>
              <li><Link to="/book" className="hover:text-foreground transition-colors">Water Damage Service</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Marketplace</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/buy" className="hover:text-foreground transition-colors">Buy Refurbished iPhones</Link></li>
              <li><Link to="/buy" className="hover:text-foreground transition-colors">Buy Refurbished Samsung</Link></li>
              <li><Link to="/sell" className="hover:text-foreground transition-colors">Sell Used Mobile Phone</Link></li>
              <li><Link to="/sell" className="hover:text-foreground transition-colors">Instant Cash Valuation</Link></li>
              <li><Link to="/repairs" className="hover:text-foreground transition-colors">Live Repair Tracking</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">Doorstep Coverage</h3>
            <p className="text-xs leading-relaxed mb-3">
              Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune, Chennai, Ahmedabad, Kolkata.
            </p>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs font-bold text-foreground">Need Urgent Support?</p>
              <p className="text-xs text-primary font-semibold mt-1">support@fixly.com • 1800-FIX-PHONE</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/80 pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Fixly Technologies Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Warranty Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Mobile Page header ---------- */

export function Header({
  title,
  subtitle,
  back,
  onBack,
  onBackOverride,
  right,
}: {
  title: string;
  subtitle?: string | undefined;
  back?: string | boolean | undefined;
  onBack?: (() => void) | undefined;
  onBackOverride?: boolean | undefined;
  right?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center gap-3 px-4">
        {back ? (
          onBack ? (
            <button
              onClick={onBack}
              className="animate-press -ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : typeof back === "string" ? (
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

/* ---------- Mobile bottom navigation ---------- */

export function CustomerNav() {
  const item =
    "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-muted-foreground transition-colors";
  const active = "text-primary font-bold";
  return (
    <nav className="sticky bottom-0 z-30 mt-auto border-t border-border bg-card/95 backdrop-blur-md shadow-lg md:hidden">
      <div className="relative grid grid-cols-5 px-1">
        <Link to="/home" className={item} activeProps={{ className: cn(item, active) }}>
          <Home className="h-[20px] w-[20px]" />
          Home
        </Link>
        <Link to="/buy" className={item} activeProps={{ className: cn(item, active) }}>
          <ShoppingBag className="h-[20px] w-[20px]" />
          Buy
        </Link>
        <Link to="/book" className={item} activeProps={{ className: cn(item, active) }}>
          <Plus className="h-[20px] w-[20px]" />
          Book
        </Link>
        <Link to="/sell" className={item} activeProps={{ className: cn(item, active) }}>
          <Zap className="h-[20px] w-[20px]" />
          Sell
        </Link>
        <Link to="/profile" className={item} activeProps={{ className: cn(item, active) }}>
          <User className="h-[20px] w-[20px]" />
          Profile
        </Link>
      </div>
    </nav>
  );
}

/* ---------- Wizard step progress ---------- */

export function StepProgress({ step, total, label }: { step: number; total: number; label?: string | undefined }) {
  return (
    <div className="px-4 pt-4 max-w-2xl mx-auto w-full">
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
