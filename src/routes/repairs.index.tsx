import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Smartphone } from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { CustomerNav, Header, Screen } from "@/components/shell";
import { inr, repairs } from "@/lib/data";

export const Route = createFileRoute("/repairs/")({
  head: () => ({
    meta: [
      { title: "My Repairs — Fixly" },
      { name: "description", content: "View all your past and active mobile phone repairs." },
    ],
  }),
  component: RepairsList,
});

function RepairsList() {
  // In a real app, this would be a query
  const myRepairs = repairs.filter(r => r.customer === "Rahul Sharma");
  const activeRepairs = myRepairs.filter(r => r.status !== "Completed" && r.status !== "Cancelled");
  const pastRepairs = myRepairs.filter(r => r.status === "Completed" || r.status === "Cancelled");

  return (
    <Screen>
      <Header title="My Repairs" />
      <div className="flex-1 px-4 pb-6 pt-5">
        
        {activeRepairs.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-[15px] font-bold text-foreground">Active Repairs</h2>
            <div className="space-y-3">
              {activeRepairs.map((r) => (
                <Link key={r.id} to="/repairs/$repairId" params={{ repairId: r.id }} className="animate-press block">
                  <Card className="flex items-center gap-3.5 p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Smartphone className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{r.device}</p>
                      <p className="text-xs text-muted-foreground">{r.service}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={r.status} />
                      <span className="text-[11px] font-semibold text-muted-foreground">{r.appointment}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {pastRepairs.length > 0 && (
          <div>
            <h2 className="mb-3 text-[15px] font-bold text-foreground">Past Repairs</h2>
            <div className="space-y-3">
              {pastRepairs.map((r) => (
                <Link key={r.id} to="/repairs/$repairId" params={{ repairId: r.id }} className="animate-press block">
                  <Card className="flex items-center gap-3.5 p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                      <Smartphone className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{r.device}</p>
                      <p className="text-xs text-muted-foreground">{r.service}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={r.status} />
                      <span className="text-[11px] font-semibold text-muted-foreground">{inr(r.estimate)}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <CustomerNav />
    </Screen>
  );
}
