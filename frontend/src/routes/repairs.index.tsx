import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Smartphone, Loader2, Wrench } from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { CustomerNav, Header, Screen } from "@/components/shell";
import { inr } from "@/lib/data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/repairs/")({
  head: () => ({
    meta: [
      { title: "My Repairs — Cell Care" },
      { name: "description", content: "View all your past and active mobile phone repairs." },
    ],
  }),
  component: RepairsList,
});

function RepairsList() {
  const [loading, setLoading] = useState(true);
  const [repairList, setRepairList] = useState<any[]>([]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const res = await api.getMyRepairs();
      if (res && res.success && Array.isArray(res.repairs)) {
        setRepairList(res.repairs);
      } else {
        setRepairList([]);
      }
    } catch (e) {
      setRepairList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const activeRepairs = repairList.filter(r => r.status !== "Completed" && r.status !== "Cancelled");
  const pastRepairs = repairList.filter(r => r.status === "Completed" || r.status === "Cancelled");

  return (
    <Screen>
      <Header title="My Repairs" />
      <div className="flex-1 px-4 pb-6 pt-5 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs font-semibold">Loading live bookings from database...</p>
          </div>
        ) : repairList.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Wrench className="h-10 w-10 mx-auto mb-3 text-muted-foreground/60" />
            <p className="text-base font-bold text-foreground">No Repairs Booked Yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-5">Your scheduled and past repair orders will appear here.</p>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm"
            >
              Book a Repair Now
            </Link>
          </div>
        ) : (
          <>
            {activeRepairs.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-[15px] font-bold text-foreground">Active Repairs ({activeRepairs.length})</h2>
                <div className="space-y-3">
                  {activeRepairs.map((r) => (
                    <Link key={r.id} to="/repairs/$repairId" params={{ repairId: r.id }} className="animate-press block">
                      <Card className="flex items-center gap-3.5 p-4 hover:border-primary/40 transition-colors">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Smartphone className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">{r.device}</p>
                          <p className="text-xs text-muted-foreground">{r.service}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusBadge status={r.status} />
                          <span className="text-[11px] font-semibold text-muted-foreground">{r.appointment || r.created_at?.slice(0, 10)}</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {pastRepairs.length > 0 && (
              <div>
                <h2 className="mb-3 text-[15px] font-bold text-foreground">Past Repairs ({pastRepairs.length})</h2>
                <div className="space-y-3">
                  {pastRepairs.map((r) => (
                    <Link key={r.id} to="/repairs/$repairId" params={{ repairId: r.id }} className="animate-press block">
                      <Card className="flex items-center gap-3.5 p-4 hover:border-border transition-colors">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                          <Smartphone className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">{r.device}</p>
                          <p className="text-xs text-muted-foreground">{r.service}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusBadge status={r.status} />
                          <span className="text-[11px] font-semibold text-muted-foreground">{inr(r.estimate || r.cost || 0)}</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <CustomerNav />
    </Screen>
  );
}
