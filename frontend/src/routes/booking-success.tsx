import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Calendar, MapPin, Wrench, ArrowRight, Home, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { Screen, Header, CustomerNav } from "@/components/shell";
import { inr } from "@/lib/data";

export const Route = createFileRoute("/booking-success")({
  head: () => ({
    meta: [
      { title: "Booking Confirmed! — Cell Care" },
      { name: "description", content: "Your mobile repair booking has been confirmed with Cell Care." },
    ],
  }),
  component: BookingSuccessPage,
});

function BookingSuccessPage() {
  const bookingId = "REP-2026-001249";

  return (
    <Screen>
      <Header title="Booking Confirmed" />

      <div className="flex-1 px-4 py-8 md:py-16 max-w-2xl mx-auto w-full text-center space-y-6">
        
        {/* Success Icon */}
        <div className="relative inline-block">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-emerald-500/15 text-emerald-500 mx-auto shadow-lg shadow-emerald-500/10">
            <Check className="h-10 w-10" strokeWidth={3} />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> 6 Months Cell Care Warranty Included
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Repair Booked Successfully!</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Our certified technician has been assigned and will arrive at your scheduled time.
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="p-6 text-left border-border/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Booking ID</span>
              <p className="text-sm font-extrabold text-primary">#{bookingId}</p>
            </div>
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Confirmed
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Device & Service:</span>
              <span className="font-bold text-foreground">iPhone 13 • Screen Replacement</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Appointment:</span>
              <span className="font-semibold text-foreground">Tomorrow, 25 Aug 2026 at 11:00 AM</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Service Mode:</span>
              <span className="font-semibold text-foreground">Doorstep Pickup & Repair</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Pickup Location:</span>
              <span className="font-semibold text-foreground">B-42, Rose Apartments, Andheri West, Mumbai</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-bold text-foreground text-sm">
              <span>Estimated Total:</span>
              <span className="text-primary font-black">{inr(12598)}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/repairs/$repairId"
            params={{ repairId: "REP-2026-001245" }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95"
          >
            <Wrench className="h-4 w-4" /> Track Live Repair
          </Link>
          <Link
            to="/home"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-foreground hover:bg-accent transition-colors"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </div>

      </div>

      <CustomerNav />
    </Screen>
  );
}
