import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, KV, PriceRow, StatusBadge } from "@/components/ui";
import { Header, Screen, Timeline } from "@/components/shell";
import { inr, statusFlow, trackingSteps } from "@/lib/data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/repairs/$repairId")({
  head: () => ({
    meta: [
      { title: "Track Repair — Fixly" },
      { name: "description", content: "Track your repair status." },
    ],
  }),
  component: RepairTracking,
});

function getTrackingCurrentStep(status: string): number {
  // Map statusFlow index to trackingSteps index roughly
  const statusIndex = statusFlow.indexOf(status as any);
  
  if (statusIndex === -1 || statusIndex === 0) return 0; // Booking Created
  if (statusIndex === 1) return 1; // Appointment Confirmed
  if (statusIndex === 2) return 2; // Device Received
  if (statusIndex === 3 || statusIndex === 4 || statusIndex === 5) return 3; // Inspection
  if (statusIndex === 6) return 4; // Repair In Progress
  if (statusIndex === 7) return 5; // Quality Check
  if (statusIndex >= 8 && statusIndex < 10) return 6; // Ready for Delivery
  if (statusIndex >= 10) return 8; // Completed
  return 0;
}

function RepairTracking() {
  const { repairId } = Route.useParams();
  const [repair, setRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await api.getRepair(repairId);
        if (isMounted && res && (res.repair || (res as any).success)) {
          setRepair(res.repair || res);
        }
      } catch (err) {
        console.warn("Could not fetch repair:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [repairId]);

  if (loading) {
    return (
      <Screen>
        <Header title="Track Repair" back="/repairs" />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-sm font-medium text-muted-foreground">Loading repair details from database...</p>
        </div>
      </Screen>
    );
  }

  if (!repair) {
    return (
      <Screen>
        <Header title="Repair Not Found" back="/repairs" />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">This repair order was not found in the database.</p>
        </div>
      </Screen>
    );
  }

  const currentStep = getTrackingCurrentStep(repair.status);
  const isPickup = repair.method === "Pickup & Delivery" || repair.method === "pickup";
  const pickupFee = isPickup ? 99 : 0;
  const estimateNum = Number(repair.estimate || 0);
  const apptStr = repair.appointment_date || repair.appointment || "Scheduled";
  const timeStr = repair.time_slot || repair.time || "";

  return (
    <Screen>
      <Header title="Track Repair" back="/repairs" />
      <div className="flex-1 px-4 pb-12 pt-5">
        
        {/* Summary Card */}
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-primary">#{String(repair.id).replace("REP-2026-", "REP-")}</p>
              <p className="mt-1 truncate text-[15px] font-bold text-foreground">
                {repair.device} · {repair.service}
              </p>
            </div>
            <StatusBadge status={repair.status} />
          </div>
        </Card>

        {/* Timeline */}
        <div className="mt-6 pl-1">
          <Timeline steps={trackingSteps} current={currentStep} />
        </div>

        {/* Details Card */}
        <div className="mt-8">
          <h2 className="mb-3 text-[15px] font-bold text-foreground">Booking Details</h2>
          <Card className="divide-y divide-border px-4 py-1">
            <KV k="Problem" v={repair.problem} />
            {repair.description ? <KV k="Note" v={repair.description} /> : null}
            {repair.address ? <KV k="Address" v={repair.address} /> : null}
            <KV k="Appointment" v={timeStr ? `${apptStr}, ${timeStr}` : apptStr} />
            <KV k="Repair Method" v={repair.method || "Doorstep Pickup & Delivery"} />
            <KV k="Payment Status" v={repair.payment_status || repair.payment || "Pending"} />
          </Card>
        </div>

        {/* Pricing Card */}
        <div className="mt-6">
          <h2 className="mb-3 text-[15px] font-bold text-foreground">
            {repair.status === "Completed" ? "Final Cost" : "Estimated Cost"}
          </h2>
          <Card className="px-4 py-3">
            <PriceRow label={`Service (${repair.service})`} amount={inr(Math.max(0, estimateNum - pickupFee))} />
            {isPickup && <PriceRow label="Pickup Fee" amount={inr(pickupFee)} />}
            <div className="my-2 border-t border-dashed border-border" />
            <PriceRow label={repair.status === "Completed" ? "Total Paid" : "Estimated Total"} amount={inr(estimateNum)} strong />
          </Card>
          
          {repair.status === "Completed" ? (
            <button
              className="animate-press mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-bold text-primary shadow-[var(--shadow-card)]"
              onClick={() => alert("Downloading Bill PDF...")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
              Download Bill (PDF)
            </button>
          ) : (
            <p className="mt-3 rounded-xl bg-warning-soft px-4 py-3 text-xs font-medium text-warning-foreground">
              Final repair amount will be confirmed after physical inspection.
            </p>
          )}
        </div>

      </div>
    </Screen>
  );
}
