import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { RepairStatus } from "@/lib/data";

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        "animate-press inline-flex items-center justify-center gap-2 rounded-xl font-semibold disabled:pointer-events-none disabled:opacity-40",
        size === "sm" && "h-9 px-3.5 text-[13px]",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-[52px] px-6 text-[15px]",
        variant === "primary" && "bg-primary text-primary-foreground shadow-[var(--shadow-lifted)]",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border border-border bg-card text-foreground",
        variant === "ghost" && "text-primary",
        variant === "destructive" && "bg-destructive-soft text-destructive",
        variant === "success" && "bg-success text-success-foreground",
        className,
      )}
      {...props}
    />
  );
}

/* ---------- Card ---------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]", className)}>
      {children}
    </div>
  );
}

/* ---------- Section title ---------- */

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-foreground">{title}</h2>
      {action}
    </div>
  );
}

/* ---------- Status badge ---------- */

const statusStyles: Record<RepairStatus, string> = {
  Pending: "bg-warning-soft text-warning-foreground",
  Confirmed: "bg-info-soft text-info",
  "Device Received": "bg-info-soft text-info",
  Inspection: "bg-info-soft text-info",
  "Waiting Approval": "bg-warning-soft text-warning-foreground",
  Approved: "bg-primary-soft text-primary",
  Repairing: "bg-primary-soft text-primary",
  "Quality Check": "bg-primary-soft text-primary",
  Ready: "bg-success-soft text-success",
  Delivered: "bg-success-soft text-success",
  Completed: "bg-success-soft text-success",
  Cancelled: "bg-destructive-soft text-destructive",
};

export function StatusBadge({ status, className }: { status: RepairStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

/* ---------- Form fields ---------- */

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15",
        className,
      )}
      {...props}
    />
  );
}

/* ---------- Key-value row (details / summary screens) ---------- */

export function KV({ k, v, strong }: { k: string; v: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-[13px] text-muted-foreground">{k}</span>
      <span className={cn("text-right text-[13px] text-foreground", strong ? "font-bold" : "font-medium")}>{v}</span>
    </div>
  );
}

/* ---------- Price row ---------- */

export function PriceRow({
  label,
  amount,
  tone,
  strong,
}: {
  label: string;
  amount: string;
  tone?: "success" | "destructive";
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={cn("text-[13px]", strong ? "font-bold text-foreground" : "text-muted-foreground")}>{label}</span>
      <span
        className={cn(
          "text-[13px]",
          strong ? "text-base font-extrabold text-foreground" : "font-semibold text-foreground",
          tone === "success" && "text-success",
          tone === "destructive" && "text-destructive",
        )}
      >
        {amount}
      </span>
    </div>
  );
}

/* ---------- Empty selectable icon tile ---------- */

export function IconTile({
  icon,
  selected,
  className,
}: {
  icon: ReactNode;
  selected?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
        selected ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary",
        className,
      )}
    >
      {icon}
    </div>
  );
}
