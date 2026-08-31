import { useMemo, useRef, useState, useEffect } from "react";
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
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button, Card, Field, IconTile, Input, KV, PriceRow, Textarea } from "@/components/ui";
import { Header, Screen, StepProgress } from "@/components/shell";
import {
  appointmentDays,
  brands as fallbackBrands,
  inr,
  modelsByBrand as fallbackModelsByBrand,
  problems,
  servicesForDevice as fallbackServices,
  timeSlots,
} from "@/lib/data";
import { api } from "@/lib/api";
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
  5: { title: "Service & Price", sub: "Model-specific transparent pricing" },
  6: { title: "Choose an appointment", sub: "Pick a convenient date & time" },
  7: { title: "Repair method", sub: "How should we repair your phone?" },
  8: { title: "Pickup address", sub: "Where should we collect your phone?" },
  9: { title: "Booking summary", sub: "Review and confirm" },
};

function BookWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Dynamic Catalog State
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [selectedBrandObj, setSelectedBrandObj] = useState<any>(null);
  const [brand, setBrand] = useState<string>("");

  const [modelsList, setModelsList] = useState<any[]>([]);
  const [selectedModelObj, setSelectedModelObj] = useState<any>(null);
  const [model, setModel] = useState<string>("");

  const [servicesList, setServicesList] = useState<any[]>([]);
  const [selectedServiceObj, setSelectedServiceObj] = useState<any>(null);
  const [serviceId, setServiceId] = useState<string>("");

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  const [brandQuery, setBrandQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState<string>("11:00 AM");
  const [method, setMethod] = useState<"store" | "pickup" | "">("pickup");
  const [addressId, setAddressId] = useState<string>("home");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Dynamic Brands from MySQL
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const res = await api.getBrands();
        if (res && res.brands && res.brands.length > 0) {
          setBrandsList(res.brands);
        } else {
          setBrandsList(fallbackBrands.map((name, i) => ({ id: i + 1, name })));
        }
      } catch (err) {
        setBrandsList(fallbackBrands.map((name, i) => ({ id: i + 1, name })));
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // 2. Fetch Dynamic Models when Brand is selected
  useEffect(() => {
    if (selectedBrandObj) {
      const fetchModels = async () => {
        try {
          setLoadingModels(true);
          const res = await api.getModels(selectedBrandObj.id);
          if (res && res.models && res.models.length > 0) {
            setModelsList(res.models);
          } else {
            const list = fallbackModelsByBrand[selectedBrandObj.name] || [];
            setModelsList(list.map((name, i) => ({ id: i + 1, name })));
          }
        } catch (e) {
          const list = fallbackModelsByBrand[selectedBrandObj.name] || [];
          setModelsList(list.map((name, i) => ({ id: i + 1, name })));
        } finally {
          setLoadingModels(false);
        }
      };
      fetchModels();
    }
  }, [selectedBrandObj]);

  // 3. Fetch Dynamic Model Services when Model is selected
  useEffect(() => {
    if (selectedModelObj) {
      const fetchServices = async () => {
        try {
          setLoadingServices(true);
          const res = await api.getModelServices(selectedModelObj.id);
          if (res && res.services && res.services.length > 0) {
            setServicesList(res.services);
            setSelectedServiceObj(res.services[0]);
            setServiceId(String(res.services[0].id));
          } else {
            setServicesList(fallbackServices.map((s, i) => ({
              id: i + 1,
              service_name: s.name,
              price: s.price,
              warranty: "6 Months",
              part_quality: "OEM Original",
            })));
            if (fallbackServices.length > 0 && fallbackServices[0]) {
              setSelectedServiceObj(fallbackServices[0]);
              setServiceId(String(fallbackServices[0].id));
            }
          }
        } catch (e) {
          setServicesList(fallbackServices.map((s, i) => ({
            id: i + 1,
            service_name: s.name,
            price: s.price,
            warranty: "6 Months",
            part_quality: "OEM Original",
          })));
        } finally {
          setLoadingServices(false);
        }
      };
      fetchServices();
    }
  }, [selectedModelObj]);

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
  const currentServicePrice = selectedServiceObj ? selectedServiceObj.price : 999;
  const total = Math.max(0, currentServicePrice + pickupFee - coupon);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).slice(0, 4).map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls].slice(0, 6));
  };

  return (
    <Screen>
      <Header title="Book a Repair" back={step > 1 ? true : "/home"} onBack={step > 1 ? back : undefined} onBackOverride />
      <StepProgress step={effectiveStep} total={TOTAL_STEPS} label={stepTitles[effectiveStep]?.sub} />

      <div key={step} className="animate-rise-in flex-1 px-4 pb-32 pt-5 max-w-2xl mx-auto w-full">
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

            {loadingBrands ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-xs">Loading brands from MySQL...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {brandsList
                  .filter((b) => b.name.toLowerCase().includes(brandQuery.toLowerCase()))
                  .map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setBrand(b.name);
                        setSelectedBrandObj(b);
                        setModel("");
                        setSelectedModelObj(null);
                      }}
                      className={cn(
                        "animate-press flex items-center gap-3 rounded-2xl border-2 bg-card p-4 text-left",
                        brand === b.name ? "border-primary bg-primary-soft" : "border-border",
                      )}
                    >
                      <IconTile icon={<Smartphone className="h-5 w-5" />} selected={brand === b.name} />
                      <span className="text-sm font-bold text-foreground">{b.name}</span>
                      {brand === b.name && <Check className="ml-auto h-4 w-4 text-primary" />}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — Model */}
        {step === 2 && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <IconTile icon={<Smartphone className="h-5 w-5" />} />
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Selected Brand</p>
                <p className="text-sm font-extrabold text-foreground">{brand}</p>
              </div>
            </div>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-input bg-card px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder={`Search ${brand} models...`}
                value={modelQuery}
                onChange={(e) => setModelQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {loadingModels ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-xs">Loading {brand} models from MySQL...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {modelsList
                  .filter((m) => m.name.toLowerCase().includes(modelQuery.toLowerCase()))
                  .map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setModel(m.name);
                        setSelectedModelObj(m);
                      }}
                      className={cn(
                        "animate-press flex w-full items-center justify-between rounded-2xl border-2 bg-card p-4 text-left",
                        model === m.name ? "border-primary bg-primary-soft" : "border-border",
                      )}
                    >
                      <span className="text-sm font-bold text-foreground">{m.name}</span>
                      {model === m.name && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Problems */}
        {step === 3 && (
          <div className="mt-5 space-y-2">
            <p className="text-xs text-muted-foreground font-medium mb-3">
              Select all issues you are experiencing with your {brand} {model}
            </p>
            {problems.map((p) => {
              const checked = selectedProblems.includes(p);
              return (
                <button
                  key={p}
                  onClick={() =>
                    setSelectedProblems((sp) =>
                      checked ? sp.filter((x) => x !== p) : [...sp, p],
                    )
                  }
                  className={cn(
                    "animate-press flex w-full items-center justify-between rounded-2xl border-2 bg-card p-4 text-left",
                    checked ? "border-primary bg-primary-soft" : "border-border",
                  )}
                >
                  <span className="text-sm font-bold text-foreground">{p}</span>
                  {checked && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 4 — Tell us more */}
        {step === 4 && (
          <div className="mt-5 space-y-4">
            <Field label="Problem Description (optional)">
              <Textarea
                placeholder="Describe what happened... e.g. screen flickers after dropping, water spilled, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </Field>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Add Photos of Device (optional)
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {photos.map((src, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-card">
                    <img src={src} alt="Device problem" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addPhotos(e.target.files)}
              />
            </div>
          </div>
        )}

        {/* STEP 5 — Dynamic Model-Specific Services & Prices */}
        {step === 5 && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <IconTile icon={<Smartphone className="h-5 w-5" />} />
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Device</p>
                <p className="text-sm font-extrabold text-foreground">{brand} {model}</p>
              </div>
            </div>

            {loadingServices ? (
              <div className="py-12 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-xs">Loading custom pricing for {model}...</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {servicesList.map((s) => {
                  const isSelected = serviceId === String(s.id);

                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setServiceId(String(s.id));
                        setSelectedServiceObj(s);
                      }}
                      className={cn(
                        "animate-press flex w-full items-center justify-between rounded-2xl border-2 bg-card p-4 text-left transition-all",
                        isSelected ? "border-primary bg-primary-soft shadow-xs" : "border-border",
                      )}
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-extrabold text-foreground block">
                          {s.service_name || s.name}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>⭐ {s.part_quality || "OEM Original"}</span>
                          <span>•</span>
                          <span>🛡️ {s.warranty || "6 Months Warranty"}</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-primary">{inr(s.price)}</span>
                        {isSelected && <Check className="ml-auto mt-1 h-4 w-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 6 — Appointment */}
        {step === 6 && (
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Select Appointment Date
              </p>
              <div className="grid grid-cols-5 gap-2">
                {appointmentDays.map((d, i) => (
                  <button
                    key={d.date}
                    onClick={() => setDay(i)}
                    className={cn(
                      "animate-press flex flex-col items-center justify-center rounded-2xl border-2 bg-card py-3 transition-all",
                      day === i ? "border-primary bg-primary text-primary-foreground font-black shadow-sm" : "border-border",
                    )}
                  >
                    <span className="text-[11px] font-semibold">{d.label}</span>
                    <span className="text-sm font-black mt-0.5">{d.date}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Choose Time Slot
              </p>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t.time}
                    disabled={!t.available}
                    onClick={() => setSlot(t.time)}
                    className={cn(
                      "animate-press rounded-xl border-2 bg-card py-2.5 text-xs font-bold transition-all",
                      slot === t.time ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      !t.available && "opacity-40 cursor-not-allowed bg-muted",
                    )}
                  >
                    {t.time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7 — Method */}
        {step === 7 && (
          <div className="mt-5 space-y-3">
            {[
              { id: "pickup", icon: Truck, title: "Doorstep Pickup & Delivery", sub: "Our verified executive collects your phone from your home or office (₹99)" },
              { id: "store", icon: Store, title: "Visit Fixly Service Hub", sub: "Walk in to our nearest certified repair workshop (Free)" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id as any)}
                className={cn(
                  "animate-press flex w-full items-start gap-3.5 rounded-2xl border-2 bg-card p-4 text-left",
                  method === m.id ? "border-primary bg-primary-soft shadow-xs" : "border-border",
                )}
              >
                <IconTile icon={<m.icon className="h-5 w-5" />} selected={method === m.id} />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-bold text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.sub}</p>
                </div>
                {method === m.id && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        )}

        {/* STEP 8 — Pickup Address */}
        {step === 8 && (
          <div className="mt-5 space-y-3">
            {[
              { id: "home", icon: HomeIcon, label: "Home", line: "B-42, Rose Apartments, Andheri West, Mumbai 400053" },
              { id: "office", icon: Building2, label: "Office", line: "3rd Floor, Trade View, Lower Parel, Mumbai 400013" },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setAddressId(a.id);
                  setShowAddressForm(false);
                }}
                className={cn(
                  "animate-press flex w-full items-start gap-3.5 rounded-2xl border-2 bg-card p-4 text-left",
                  addressId === a.id && !showAddressForm ? "border-primary bg-primary-soft" : "border-border",
                )}
              >
                <IconTile icon={<a.icon className="h-5 w-5" />} selected={addressId === a.id && !showAddressForm} />
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-bold text-foreground">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.line}</p>
                </div>
                {addressId === a.id && !showAddressForm && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="animate-press flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 text-sm font-bold text-primary"
            >
              + Add New Address
            </button>
          </div>
        )}

        {/* STEP 9 — Summary */}
        {step === 9 && (
          <div className="mt-5 space-y-4">
            <Card className="divide-y divide-border px-4 py-1">
              <KV k="Device" v={`${brand} ${model}`} />
              <KV k="Problem" v={selectedProblems.join(", ") || "Diagnostic Repair"} />
              <KV k="Service" v={selectedServiceObj?.service_name || "Screen Replacement"} />
              <KV k="Appointment" v={`${appointmentDays[day]!.date} 2026, ${slot || "11:00 AM"}`} />
              <KV k="Repair Method" v={method === "pickup" ? "Doorstep Pickup & Delivery" : "Visit Store"} />
            </Card>

            <Card className="px-4 py-3">
              <PriceRow label={`Estimated Service (${selectedServiceObj?.service_name || "Repair"})`} amount={inr(currentServicePrice)} />
              {method === "pickup" && <PriceRow label="Pickup Fee" amount={inr(pickupFee)} />}
              <PriceRow label="Coupon (FIX500)" amount={`-${inr(coupon)}`} tone="success" />
              <div className="my-2 border-t border-dashed border-border" />
              <PriceRow label="Estimated Total" amount={inr(total)} strong />
            </Card>

            <p className="rounded-xl bg-warning-soft px-4 py-3 text-xs font-medium text-warning-foreground">
              Final repair amount will be confirmed after physical inspection.
            </p>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 z-20 mt-auto border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md">
        <div className="max-w-2xl mx-auto w-full flex gap-3">
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
                navigate({ to: "/booking-success" as any });
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
