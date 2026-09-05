import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Battery,
  Bell,
  Camera,
  ChevronRight,
  Droplets,
  Plug,
  Search,
  Smartphone,
  Speaker,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Wrench,
  Cpu,
} from "lucide-react";
import { Card, SectionTitle, StatusBadge } from "@/components/ui";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { CustomerNav, Header, Screen } from "@/components/shell";
import { inr } from "@/lib/data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Fixly — Fast, Reliable, Trusted Mobile Repair & Marketplace" },
      { name: "description", content: "Book doorstep mobile phone repairs, buy certified refurbished phones, or sell your old phone for instant cash." },
      { property: "og:title", content: "Fixly — Mobile Repair & Marketplace" },
      { property: "og:description", content: "Book phone repairs and buy refurbished devices with 6-month warranty." },
    ],
  }),
  component: Home,
});

const iconMap: Record<string, typeof Smartphone> = {
  smartphone: Smartphone,
  battery: Battery,
  plug: Plug,
  camera: Camera,
  speaker: Speaker,
  droplets: Droplets,
  cpu: Cpu,
  wrench: Wrench,
};

function Home() {
  const [liveServices, setLiveServices] = useState<any[]>([]);

  // Auto-fetch fresh live data on page navigation
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const servicesRes = await api.getServices().catch(() => null);
        if (servicesRes && servicesRes.success && Array.isArray(servicesRes.services)) {
          setLiveServices(servicesRes.services);
        } else {
          setLiveServices([]);
        }
      } catch (e) {
        setLiveServices([]);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <Screen>
      <Header title="Fixly" />

      <div className="flex-1 px-4 py-6 md:px-8 max-w-7xl mx-auto w-full space-y-10">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-card border border-border/80 p-6 md:p-12 shadow-sm">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> India's #1 Doorstep Device Service
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
              Fast, Reliable & Trusted <br className="hidden sm:inline" />
              <span className="text-primary">Phone Repairs</span> at Your Doorstep.
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
              Book certified doorstep repairs in 60 seconds, buy quality-checked refurbished phones, or get instant cash for your old phone.
            </p>

            {/* Quick CTAs */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95"
              >
                <Wrench className="h-4 w-4" /> Book Repair Now
              </Link>
              <Link
                to="/buy"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-bold text-foreground hover:bg-accent transition-colors"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-500" /> Buy Refurbished
              </Link>
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-bold text-foreground hover:bg-accent transition-colors"
              >
                <Zap className="h-4 w-4 text-amber-500" /> Sell Old Phone
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Marketplace Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Buy Card */}
          <Link
            to="/buy"
            className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 md:p-8 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  Up to 50% Off
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-foreground">Buy Refurbished Phones</h2>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed">
                32 Quality Checks Passed • 6 Months Fixly Warranty • 7 Days Replacement.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
              Browse Phones <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Sell Card */}
          <Link
            to="/sell"
            className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 md:p-8 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-105 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                  Instant Cash
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-foreground">Sell Your Old Phone</h2>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed">
                Instant calculated price valuation • Free doorstep pickup • Direct UPI transfer.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              Get Price Quote <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>

        {/* Popular Repair Services */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Popular Repair Services</h2>
              <p className="text-xs text-muted-foreground">Doorstep and express in-store service available</p>
            </div>
            <Link to="/book" className="text-xs font-bold text-primary hover:underline">View all</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {liveServices.slice(0, 6).map((s) => {
              const iconKey = (s.icon || 'smartphone').toLowerCase();
              const Icon = iconMap[iconKey] ?? Smartphone;
              return (
                <Link
                  key={s.id}
                  to="/book"
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-card text-center hover:shadow-md hover:border-primary/50 transition-all group"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform mb-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-foreground leading-tight">{s.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Live Repair Tracking Widget */}
        {current && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary">#{current.id}</span>
                  <StatusBadge status={current.status} />
                </div>
                <h3 className="text-lg font-bold text-foreground">{current.device} · {current.service}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Appointment: {current.appointment} at {current.time}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-48 hidden md:block">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>60%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-[60%]" />
                  </div>
                </div>

                <Link
                  to="/repairs/$repairId"
                  params={{ repairId: current.id }}
                  className="inline-flex items-center justify-center rounded-xl bg-secondary px-5 py-2.5 text-xs font-bold text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Track Repair
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Why Fixly Trust Guarantees */}
        <div className="pt-4">
          <h2 className="text-xl font-extrabold text-foreground text-center mb-6">Why Thousands Trust Fixly</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "6 Months Warranty", desc: "Comprehensive warranty on all replaced parts.", icon: ShieldCheck },
              { title: "30-Min Express Fix", desc: "Doorstep repairs completed in front of you.", icon: Clock },
              { title: "Certified Parts", desc: "100% genuine and high-grade tested components.", icon: CheckCircle2 },
              { title: "Zero Advance Payment", desc: "Pay only after you verify the repaired phone.", icon: Sparkles },
            ].map((g, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-border bg-card space-y-2">
                <g.icon className="h-6 w-6 text-primary mb-2" />
                <h3 className="text-sm font-bold text-foreground">{g.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <CustomerNav />
    </Screen>
  );
}
