import { useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Check,
  ChevronRight,
  Home as HomeIcon,
  ImagePlus,
  MapPin,
  Search,
  Smartphone,
  Store,
  Truck,
  Video,
  X,
} from "lucide-react";
import { Button, Card, Field, IconTile, Input, KV, PriceRow, Textarea } from "@/components/ui";
import { Header, Screen, StepProgress } from "@/components/shell";
import {
  appointmentDays,
  brands,
  inr,
  modelsByBrand,
  problems,
  servicesForDevice,
  timeSlots,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Repair — Fixly" },
      { name: "description", content: "Book a mobile phone repair in a few steps: pick your device, describe the problem and choose an appointment." },
      { property: "og:title", content: "Book a Repair — Fixly" },
      { property: "og:description", content: "Book a mobile phone repair in a few steps with Fixly." },
    ],
  }),
  component: BookWizard,
});

const TOTAL_STEPS = 9;

const stepTitles: Record<number, { title: string; sub: string }> = {
  1: { title: "What phone do you use?", sub: "Select your mobile brand" },
  2: { title: "Select your model", sub: "Choose your exact device model" },
  3: { title: "What's wrong with your phone?", sub: "Select all that apply" },
  4: { title: "Tell us more", sub: "Help our technician prepare" },
  5: { title: "Service & Price", sub: "Transparent estimated pricing" },
  6: { title: "Choose an appointment", sub: "Pick a convenient date & time" },
  7: { title: "Repair method", sub: "How should we repair your phone?" },
  8: { title: "Pickup address", sub: "Where should we collect your phone?" },
  9: { title: "Booking summary", sub: "Review and confirm" },
};

function BookWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [brandQuery, setBrandQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState<string>("");
  const [method, setMethod] = useState<"store" | "pickup" | "">("");
  const [addressId, setAddressId] = useState<string>("home");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const models = useMemo(() => modelsByBrand[brand] ?? [], [brand]);
  const service = servicesForDevice.find((s) => s.id === serviceId);

  const effectiveStep = step === 8 && method === "store" ? 9 : step;
  const next = () => {
    if (step === 7 && method === "store") setStep(9);
    else setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const back = () => {
    if (step === 9 && method === "store") setStep(7);
    else setStep((s) => Math.max(s - 1, 1));
  };

  const canContinue =
    (step === 1 && !!brand) ||
    (step === 2 && !!model) ||
    (step === 3 && selectedProblems.length > 0) ||
    step === 4 ||
    (step === 5 && !!serviceId) ||
    (step === 6 && !!slot) ||
    (step === 7 && !!method) ||
    step === 8 ||
    step === 9;

  const pickupFee = method === "pickup" ? 99 : 0;
  const coupon = 500;
  const total = (service?.price ?? 0) + pickupFee - coupon;

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).slice(0, 4).map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls].slice(0, 6));
  };

  return (
    <Screen>
      <Header title="Book a Repair" back onBackOverride />
      <div className="hidden" />
      <StepProgress step={effectiveStep} total={TOTAL_STEPS} label={stepTitles[effectiveStep]?.sub} />

      <div key={step} className="animate-rise-in flex-1 px-4 pb-32 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">{stepTitles[effectiveStep]?.title}</h1>

        {/* STEP 1 — Brand */}
        {step === 1 && (
          <div className="mt-5 space-y-3">
            <div className="flex h-12 items-center gap-3 rounded-xl border border-input bg-card px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search brands..."
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {brands
                .filter((b) => b.toLowerCase().includes(brandQuery.toLowerCase()))
                .map((b) => (
                  <button
                    key={b}
                    onClick={() => setBrand(b)}
                    className={cn(
                      "animate-press flex items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left",
                      brand === b ? "border-primary bg-primary-soft" : "border-border",
                    )}
                  >
                    <IconTile icon={<Smartphone className="h-5 w-5" />} selected={brand === b} />
                    <span className="text-sm font-bold text-foreground">{b}</span>
                    {brand === b && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Model */}
        {step === 2 && (
          <div className="mt-5 space-y-3">
            <Card className="flex items-center gap-3 p-3.5">
              <IconTile icon={<Smartphone className="h-5 w-5" />} selected />
              <div>
                <p className="text-xs text-muted-foreground">Brand</p>
                <p className="text-sm font-bold text-foreground">{brand}</p>
              </div>
              <button className="ml-auto text-[13px] font-semibold text-primary" onClick={() => setStep(1)}>Change</button>
            </Card>
            <div className="flex h-12 items-center gap-3 rounded-xl border border-input bg-card px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search models..."
                value={modelQuery}
                onChange={(e) => setModelQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2.5">
              {models
                .filter((m) => m.toLowerCase().includes(modelQuery.toLowerCase()))
                .map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={cn(
                      "animate-press flex w-full items-center gap-3.5 rounded-2xl border-2 bg-card p-4 text-left",
                      model === m ? "border-primary bg-primary-soft" : "border-border",
                    )}
                  >
                    <IconTile icon={<Smartphone className="h-5 w-5" />} selected={model === m} />
                    <span className="text-sm font-bold text-foreground">{m}</span>
                    {model === m && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Problems (multi-select) */}
        {step === 3 && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {problems.map((p) => {
              const on = selectedProblems.includes(p);
              return (
                <button
                  key={p}
                  onClick={() =>
                    setSelectedProblems((prev) => (on ? prev.filter((x) => x !== p) : [...prev, p]))
                  }
                  className={cn(
                    "animate-press relative rounded-2xl border-2 bg-card p-4 text-left",
                    on ? "border-primary bg-primary-soft" : "border-border",
                  )}
                >
                  {on && (
                    <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </span>
                  )}
                  <p className="pr-6 text-[13px] font-bold leading-snug text-foreground">{p}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 4 — Describe */}
        {step === 4 && (
          <div className="mt-5 space-y-5">
            <Textarea
              placeholder="Describe the problem... e.g. screen cracked after a drop, touch works on top half only."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div>
              <p className="mb-2 text-[13px] font-semibold text-foreground">Add Photos</p>
              <div className="flex flex-wrap gap-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border">
                    <img src={p} alt={`Uploaded issue photo ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-foreground/70 text-background"
                      aria-label="Remove photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="animate-press grid h-20 w-20 place-items-center rounded-xl border-2 border-dashed border-input text-muted-foreground"
                >
                  <ImagePlus className="h-6 w-6" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Photos help us understand the issue before inspection.
              </p>
            </div>
            <button
              onClick={() => toast("Video upload coming soon in this prototype")}
              className="animate-press flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input text-sm font-semibold text-muted-foreground"
            >
              <Video className="h-4 w-4" /> Add Video (optional)
            </button>
          </div>
        )}

        {/* STEP 5 — Service & price */}
        {step === 5 && (
          <div className="mt-5 space-y-3">
            <Card className="flex items-center gap-3 p-3.5">
              <IconTile icon={<Smartphone className="h-5 w-5" />} selected />
              <div>
                <p className="text-xs text-muted-foreground">{brand}</p>
                <p className="text-sm font-bold text-foreground">{model}</p>
              </div>
            </Card>
            {servicesForDevice.map((s) => (
              <button
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={cn(
                  "animate-press flex w-full items-center gap-3.5 rounded-2xl border-2 bg-card p-4 text-left",
                  serviceId === s.id ? "border-primary bg-primary-soft" : "border-border",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{s.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.tag ? `${s.tag} estimate` : "Estimated Price"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-extrabold text-foreground">{inr(s.price)}</p>
                  {serviceId === s.id && <Check className="ml-auto mt-0.5 h-4 w-4 text-primary" />}
                </div>
              </button>
            ))}
            <p className="rounded-xl bg-warning-soft px-4 py-3 text-xs font-medium text-warning-foreground">
              Final price may change after physical inspection.
            </p>
          </div>
        )}

        {/* STEP 6 — Appointment */}
        {step === 6 && (
          <div className="mt-5 space-y-6">
            <div>
              <p className="mb-2.5 text-[13px] font-semibold text-foreground">Date</p>
              <div className="scrollbar-hide -mx-4 flex gap-2.5 overflow-x-auto px-4">
                {appointmentDays.map((d, i) => (
                  <button
                    key={d.date}
                    onClick={() => setDay(i)}
                    className={cn(
                      "animate-press w-[68px] shrink-0 rounded-2xl border-2 py-3 text-center",
                      day === i ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                    )}
                  >
                    <p className={cn("text-[11px] font-semibold", day === i ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {d.label}
                    </p>
                    <p className="mt-0.5 text-[13px] font-extrabold">{d.date}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2.5 text-[13px] font-semibold text-foreground">Time slot</p>
              <div className="grid grid-cols-3 gap-2.5">
                {timeSlots.map((t) => (
                  <button
                    key={t.time}
                    disabled={!t.available}
                    onClick={() => setSlot(t.time)}
                    className={cn(
                      "animate-press rounded-xl border-2 py-3 text-[13px] font-bold",
                      !t.available && "border-border bg-muted text-muted-foreground/50 line-through",
                      t.available && slot !== t.time && "border-border bg-card text-foreground",
                      t.available && slot === t.time && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {t.time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7 — Repair method */}
        {step === 7 && (
          <div className="mt-5 space-y-3">
            {(
              [
                { id: "store", icon: Store, title: "Visit Store", desc: "Bring your phone to our repair center." },
                { id: "pickup", icon: Truck, title: "Pickup & Delivery", desc: "We'll collect your phone and return it after repair." },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "animate-press flex w-full items-start gap-4 rounded-2xl border-2 bg-card p-5 text-left",
                  method === m.id ? "border-primary bg-primary-soft" : "border-border",
                )}
              >
                <IconTile icon={<m.icon className="h-5 w-5" />} selected={method === m.id} className="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-foreground">{m.title}</p>
                  <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{m.desc}</p>
                </div>
                {method === m.id && <Check className="h-5 w-5 shrink-0 text-primary" />}
              </button>
            ))}
          </div>
        )}

        {/* STEP 8 — Address (pickup only) */}
        {step === 8 && (
          <div className="mt-5 space-y-3">
            {[
              { id: "home", icon: HomeIcon, label: "Home", line: "B-42, Rose Apartments, Andheri West, Mumbai 400053" },
              { id: "office", icon: Building2, label: "Office", line: "3rd Floor, Trade View, Lower Parel, Mumbai 400013" },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => { setAddressId(a.id); setShowAddressForm(false); }}
                className={cn(
                  "animate-press flex w-full items-start gap-3.5 rounded-2xl border-2 bg-card p-4 text-left",
                  addressId === a.id && !showAddressForm ? "border-primary bg-primary-soft" : "border-border",
                )}
              >
                <IconTile icon={<a.icon className="h-5 w-5" />} selected={addressId === a.id && !showAddressForm} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{a.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.line}</p>
                </div>
                {addressId === a.id && !showAddressForm && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            ))}
            <button
              onClick={() => setShowAddressForm((v) => !v)}
              className="animate-press flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 text-sm font-bold text-primary"
            >
              + Add New Address
            </button>
            {showAddressForm && (
              <Card className="animate-rise-in space-y-3.5 p-4">
                <Field label="Full Name"><Input placeholder="Rahul Sharma" /></Field>
                <Field label="Phone"><Input placeholder="+91 98765 43210" inputMode="tel" /></Field>
                <Field label="House / Flat"><Input placeholder="B-42, Rose Apartments" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Street"><Input placeholder="Street" /></Field>
                  <Field label="Area"><Input placeholder="Area" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City"><Input placeholder="Mumbai" /></Field>
                  <Field label="State"><Input placeholder="Maharashtra" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pincode"><Input placeholder="400053" inputMode="numeric" /></Field>
                  <Field label="Landmark"><Input placeholder="Near metro station" /></Field>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* STEP 9 — Summary */}
        {step === 9 && (
          <div className="mt-5 space-y-4">
            <Card className="divide-y divide-border px-4 py-1">
              <KV k="Customer" v="Rahul Sharma" />
              <KV k="Device" v={model || "iPhone 13"} />
              <KV k="Problem" v={selectedProblems.join(", ") || "Screen Broken"} />
              <KV k="Service" v={service?.name ?? "Screen Replacement"} />
              <KV k="Appointment" v={`${appointmentDays[day]!.date} 2026, ${slot || "11:00 AM"}`} />
              <KV k="Repair Method" v={method === "pickup" ? "Pickup & Delivery" : "Visit Store"} />
              {method === "pickup" && (
                <KV
                  k="Pickup Address"
                  v={<span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {addressId === "home" ? "Home" : "Office"}</span>}
                />
              )}
            </Card>
            <Card className="px-4 py-3">
              <PriceRow label={`Estimated Service (${service?.name ?? "Screen Replacement"})`} amount={inr(service?.price ?? 12999)} />
              {method === "pickup" && <PriceRow label="Pickup Fee" amount={inr(pickupFee)} />}
              <PriceRow label="Coupon (FIX500)" amount={`-${inr(coupon)}`} tone="success" />
              <div className="my-2 border-t border-dashed border-border" />
              <PriceRow label="Estimated Total" amount={inr(total)} strong />
            </Card>
            <p className="rounded-xl bg-warning-soft px-4 py-3 text-xs font-medium text-warning-foreground">
              Final repair amount will be confirmed after inspection.
            </p>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 z-20 mt-auto border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md">
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" size="lg" className="w-24" onClick={back}>
              Back
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              size="lg"
              className="flex-1"
              disabled={!canContinue}
              onClick={() => {
                if (step === 4) toast.success("Details saved");
                next();
              }}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="flex-1"
              onClick={() => {
                toast.success("Repair booked successfully!");
                navigate({ to: "/booking-success" });
              }}
            >
              Confirm Booking · {inr(total)}
            </Button>
          )}
        </div>
      </div>
    </Screen>
  );
}
