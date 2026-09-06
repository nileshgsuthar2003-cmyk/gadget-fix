import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Smartphone,
  Zap,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";
import { CustomerNav, Header, Screen, StepProgress } from "@/components/shell";
import { brands, modelsByBrand, sellBasePrices, inr, appointmentDays, timeSlots } from "@/lib/data";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell Old Phone — Instant Cash at Doorstep — Cell Care" },
      { name: "description", content: "Sell your used mobile phone for the best price. Instant valuation, free doorstep pickup, and instant cash transfer via UPI." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const [step, setStep] = useState<number>(1);
  const [brand, setBrand] = useState<string>("Apple");
  const [model, setModel] = useState<string>("iPhone 13");
  const [storage, setStorage] = useState<string>("128 GB");

  // Condition checks
  const [screenCondition, setScreenCondition] = useState<"flawless" | "good" | "cracked">("good");
  const [bodyCondition, setBodyCondition] = useState<"flawless" | "good" | "dented">("good");
  const [camerasWorking, setCamerasWorking] = useState<boolean>(true);
  const [hasBox, setHasBox] = useState<boolean>(true);
  const [hasBill, setHasBill] = useState<boolean>(true);

  // Pickup details
  const [day, setDay] = useState<number>(1);
  const [slot, setSlot] = useState<string>("11:00 AM");
  const [upiId, setUpiId] = useState<string>("rahul@okaxis");
  const [address, setAddress] = useState<string>("B-42, Rose Apartments, Andheri West, Mumbai");
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const models = useMemo(() => modelsByBrand[brand] ?? [], [brand]);

  const calculatedPrice = useMemo(() => {
    let base = sellBasePrices[model] || 22000;
    if (storage === "256 GB") base += 3500;
    if (storage === "512 GB") base += 7000;
    if (storage === "64 GB") base -= 2500;

    if (screenCondition === "flawless") base += 2000;
    if (screenCondition === "cracked") base -= 6500;

    if (bodyCondition === "flawless") base += 1000;
    if (bodyCondition === "dented") base -= 3000;

    if (!camerasWorking) base -= 3500;
    if (hasBox) base += 800;
    if (hasBill) base += 1200;

    return Math.max(base, 3000);
  }, [model, storage, screenCondition, bodyCondition, camerasWorking, hasBox, hasBill]);

  return (
    <Screen>
      <Header title="Sell Old Phone" back="/home" />

      <div className="flex-1 px-4 py-6 md:px-8 max-w-4xl mx-auto w-full">
        
        {/* Step Progress */}
        <StepProgress step={step} total={3} label={step === 1 ? "Select Model" : step === 2 ? "Condition" : "Get Valuation"} />

        {confirmed ? (
          <div className="mt-8 rounded-3xl border border-border bg-card p-8 text-center space-y-5 max-w-lg mx-auto shadow-xl">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-500 mx-auto">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Pickup Scheduled! 🎉</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our technician will inspect your <span className="font-bold text-foreground">{brand} {model}</span> on <span className="font-bold text-foreground">{appointmentDays[day]?.date} at {slot}</span>.
            </p>
            <div className="rounded-2xl border border-border bg-background p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Guaranteed Offer:</span>
                <span className="font-extrabold text-primary text-sm">{inr(calculatedPrice)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Instant Payout To:</span>
                <span className="font-semibold text-foreground">{upiId}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Pickup Address:</span>
                <span className="font-semibold text-foreground">{address}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setConfirmed(false);
                setStep(1);
              }}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Sell Another Phone
            </button>
          </div>
        ) : (
          <div className="mt-6">
            
            {/* STEP 1: Select Brand & Model */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-accent border border-amber-500/20 p-6">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm mb-1">
                    <Zap className="h-4 w-4" />
                    Instant Cash at Doorstep
                  </div>
                  <h1 className="text-2xl font-extrabold text-foreground">Sell your old phone in 3 simple steps</h1>
                  <p className="text-xs text-muted-foreground mt-1">Free doorstep pickup • Best price guaranteed • Instant UPI transfer</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-3">1. Select Brand</label>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBrand(b)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          brand === b
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-3">2. Select Model</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {models.map((m) => {
                      const est = (sellBasePrices[m] || 20000) + 4000;
                      const isSelected = model === m;

                      return (
                        <button
                          key={m}
                          onClick={() => setModel(m)}
                          className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-sm"
                              : "border-border bg-card text-foreground hover:bg-accent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Smartphone className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                            <div>
                              <p className="text-sm font-bold text-foreground">{m}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Get up to {inr(est)}</p>
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95"
                  >
                    Next: Device Condition <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Storage & Condition Assessment */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">{brand} {model}</h2>
                    <p className="text-xs text-muted-foreground">Select device storage and physical condition</p>
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">Storage Capacity</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["64 GB", "128 GB", "256 GB", "512 GB"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStorage(s)}
                        className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          storage === s
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Screen Condition */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">Screen Condition</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {[
                      { id: "flawless", label: "Flawless (No scratches, original display)" },
                      { id: "good", label: "Good (Minor hairline scratches)" },
                      { id: "cracked", label: "Cracked or Defective screen" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setScreenCondition(opt.id as any)}
                        className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          screenCondition === opt.id
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {screenCondition === opt.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Body Condition */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">Body Condition</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {[
                      { id: "flawless", label: "Flawless (Zero scratches/dents)" },
                      { id: "good", label: "Good (Minor normal signs of use)" },
                      { id: "dented", label: "Heavy dents or chipped edges" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setBodyCondition(opt.id as any)}
                        className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          bodyCondition === opt.id
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {bodyCondition === opt.id && <Check className="h-4 w-4 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessories */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">Accessories Available</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setHasBox(!hasBox)}
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        hasBox ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <span>Original Box (+{inr(800)})</span>
                      {hasBox && <Check className="h-4 w-4 text-primary" />}
                    </button>
                    <button
                      onClick={() => setHasBill(!hasBill)}
                      className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                        hasBill ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                      }`}
                    >
                      <span>Original Invoice (+{inr(1200)})</span>
                      {hasBill && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95"
                  >
                    Calculate Guaranteed Offer <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Guaranteed Valuation & Pickup Schedule */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Hero Valuation Box */}
                <div className="rounded-3xl bg-gradient-to-b from-primary/20 via-primary/10 to-card border-2 border-primary/40 p-8 text-center space-y-3 shadow-lg">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground">
                    <Sparkles className="h-3.5 w-3.5" /> Guaranteed Cash Valuation
                  </div>
                  <h3 className="text-base font-bold text-foreground">{brand} {model} ({storage})</h3>
                  <div className="text-4xl md:text-5xl font-black text-primary tracking-tight">
                    {inr(calculatedPrice)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Price locked for 7 days • Free doorstep evaluation & instant transfer upon device handover
                  </p>
                </div>

                {/* Pickup Schedule */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">Schedule Pickup Date</label>
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {appointmentDays.map((d, i) => (
                      <button
                        key={d.date}
                        onClick={() => setDay(i)}
                        className={`flex-1 min-w-[80px] p-3 rounded-2xl border text-center transition-all ${
                          day === i
                            ? "border-primary bg-primary text-primary-foreground font-bold shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <p className="text-[11px] opacity-80">{d.label}</p>
                        <p className="text-sm font-extrabold mt-0.5">{d.date}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2.5">Time Slot</label>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.filter(t => t.available).map((t) => (
                      <button
                        key={t.time}
                        onClick={() => setSlot(t.time)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          slot === t.time
                            ? "border-primary bg-primary text-primary-foreground font-bold"
                            : "border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t.time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payout info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1.5">UPI ID for Instant Transfer</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank"
                      className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1.5">Pickup Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter doorstep pickup address"
                      className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    onClick={() => setConfirmed(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform active:scale-95"
                  >
                    Confirm Pickup • Get {inr(calculatedPrice)}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
      <CustomerNav />
    </Screen>
  );
}
