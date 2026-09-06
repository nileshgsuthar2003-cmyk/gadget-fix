import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Smartphone,
  Search,
  ShieldCheck,
  BatteryCharging,
  Sparkles,
  Check,
  X,
  Truck,
  CreditCard,
  Tag,
  Star,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";
import { CustomerNav, Header, Screen } from "@/components/shell";
import { refurbishedPhones, RefurbishedPhone, inr } from "@/lib/data";

export const Route = createFileRoute("/buy")({
  head: () => ({
    meta: [
      { title: "Buy Refurbished Phones — Cell Care" },
      { name: "description", content: "Buy certified refurbished iPhones, Samsung, and OnePlus devices with 6-month warranty and 32 quality checks passed." },
    ],
  }),
  component: BuyPage,
});

function BuyPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [selectedPhone, setSelectedPhone] = useState<RefurbishedPhone | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod" | "card">("upi");
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  const filtered = useMemo(() => {
    return refurbishedPhones.filter((phone) => {
      const matchBrand = selectedBrand === "All" || phone.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchCondition = selectedCondition === "All" || phone.condition.toLowerCase() === selectedCondition.toLowerCase();
      const matchSearch = phone.model.toLowerCase().includes(searchQuery.toLowerCase()) || phone.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBrand && matchCondition && matchSearch;
    });
  }, [selectedBrand, selectedCondition, searchQuery]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlaced(true);
  };

  return (
    <Screen>
      <Header title="Buy Refurbished" back="/home" />

      <div className="flex-1 px-4 py-6 md:px-8 max-w-7xl mx-auto w-full">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-accent border border-primary/20 p-6 md:p-8 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Cell Care Certified Refurbished
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Like-New Phones. <span className="text-primary">Unbeatable Prices.</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Every refurbished phone undergoes our 32-point rigorous hardware diagnostics and comes with a 6-Month Cell Care Warranty and 7-day hassle-free replacement.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> 6M Warranty</span>
              <span className="flex items-center gap-1.5"><BatteryCharging className="h-4 w-4 text-emerald-500" /> 85%+ Battery Health</span>
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-emerald-500" /> Free Doorstep Delivery</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by brand or model (e.g. iPhone 14, S23)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Brand Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {["All", "Apple", "Samsung", "OnePlus", "Google"].map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedBrand === brand
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filter Bar */}
        <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Condition Grade:</span>
          {["All", "Superb", "Good", "Fair"].map((cond) => (
            <button
              key={cond}
              onClick={() => setSelectedCondition(cond)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedCondition === cond
                  ? "bg-primary/10 text-primary font-bold border border-primary/30"
                  : "hover:text-foreground"
              }`}
            >
              {cond}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((phone) => {
            const savings = phone.originalPrice - phone.price;

            return (
              <Card key={phone.id} className="p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-border/80 group">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <Smartphone className="h-7 w-7" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <BatteryCharging className="h-3 w-3" />
                        {phone.batteryHealth}% Battery
                      </span>
                      <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {phone.condition} Condition
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground">{phone.brand}</p>
                    <h2 className="text-lg font-bold text-foreground">{phone.model}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{phone.storage} • {phone.color}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 p-2 rounded-xl mb-4">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>{phone.warranty}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-foreground">{inr(phone.price)}</span>
                      <span className="text-xs text-muted-foreground line-through">{inr(phone.originalPrice)}</span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Save {inr(savings)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPhone(phone);
                      setOrderPlaced(false);
                    }}
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-transform active:scale-95"
                  >
                    Buy Now
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">No Refurbished Phones Found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try resetting your brand or condition filters.</p>
          </div>
        )}

      </div>

      {/* Checkout Dialog Modal */}
      {selectedPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {orderPlaced ? "Order Confirmed! 🎉" : "Confirm Purchase"}
                </h3>
                <p className="text-xs text-muted-foreground">Cell Care Verified Refurbished Device</p>
              </div>
              <button
                onClick={() => setSelectedPhone(null)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {orderPlaced ? (
              <div className="py-8 text-center space-y-4">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-500 mx-auto">
                  <Check className="h-8 w-8" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-foreground">Thank you for your order!</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your {selectedPhone.model} ({selectedPhone.storage}) has been reserved.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Estimated Delivery: 2-3 Business Days • Tracking link sent via SMS.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhone(null)}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="py-4 space-y-5">
                {/* Item Details */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{selectedPhone.model}</p>
                    <p className="text-xs text-muted-foreground">{selectedPhone.storage} • {selectedPhone.color} • {selectedPhone.condition} Condition</p>
                    <p className="text-sm font-extrabold text-primary mt-0.5">{inr(selectedPhone.price)}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1.5">
                    Delivery Address
                  </label>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-background text-xs">
                    <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-relaxed">
                      B-42, Rose Apartments, Andheri West, Mumbai, Maharashtra 400053
                    </span>
                  </div>
                </div>

                {/* Payment Selection */}
                <div>
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "upi", label: "Instant UPI", icon: Sparkles },
                      { id: "cod", label: "Cash on Delivery", icon: Truck },
                      { id: "card", label: "Card / NetBanking", icon: CreditCard },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center gap-1.5 transition-all ${
                          paymentMethod === p.id
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <p.icon className="h-4 w-4" />
                        <span className="text-[11px] leading-tight">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-border pt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Phone Price</span>
                    <span className="font-semibold text-foreground">{inr(selectedPhone.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Doorstep Delivery</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>6 Months Cell Care Warranty</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">INCLUDED</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border text-sm font-extrabold text-foreground">
                    <span>Total Amount</span>
                    <span className="text-primary">{inr(selectedPhone.price)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95"
                >
                  Place Order • {inr(selectedPhone.price)}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <CustomerNav />
    </Screen>
  );
}
