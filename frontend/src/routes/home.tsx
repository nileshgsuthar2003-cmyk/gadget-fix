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
} from "lucide-react";
import { Card, SectionTitle, StatusBadge } from "@/components/ui";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { CustomerNav, Screen } from "@/components/shell";
import { CUSTOMER_NAME, inr, popularServices, repairs } from "@/lib/data";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Fixly" },
      { name: "description", content: "Book a phone repair, browse services with transparent starting prices and track your current repair." },
      { property: "og:title", content: "Home — Fixly" },
      { property: "og:description", content: "Book a phone repair and track it live with Fixly." },
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
};

const browseServices = [
  { name: "Screen Replacement", from: 999, note: "Original & compatible parts" },
  { name: "Battery Replacement", from: 799, note: "6-month warranty" },
  { name: "Charging Repair", from: 499, note: "Same-day fix" },
];

function Home() {
  const current = repairs[0]!;
  const firstName = CUSTOMER_NAME.split(" ")[0];

  return (
    <Screen>
      <div className="flex-1 px-4 pb-6 pt-5">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hello, {firstName} 👋</p>
            <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-foreground">
              How can we help your phone today?
            </h1>
          </div>
          <button className="animate-press relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card" aria-label="Notifications">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </div>

        {/* Search */}
        <Link
          to="/book"
          className="mt-4 flex h-12 items-center gap-3 rounded-2xl border border-border bg-card px-4 text-sm text-muted-foreground shadow-[var(--shadow-card)]"
        >
          <Search className="h-4.5 w-4.5" />
          Search repair services...
        </Link>


        {/* Popular services */}
        <div className="mt-7">
          <SectionTitle title="Popular Services" />
          <div className="-mx-4">
            <Carousel opts={{ dragFree: true }} className="w-full">
              <CarouselContent className="px-4 pb-1">
                {popularServices.map((s) => {
                  const Icon = iconMap[s.icon] ?? Smartphone;
                  return (
                    <CarouselItem key={s.id} className="basis-[auto] pl-3 first:pl-0">
                      <Link
                        to="/book"
                        className="animate-press flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3.5 text-center shadow-[var(--shadow-card)]"
                      >
                        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-[11px] font-bold leading-tight text-foreground">{s.name}</span>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        {/* Current repair */}
        <div className="mt-7">
          <SectionTitle title="My Current Repair" />
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-primary">#{current.id.replace("REP-2026-", "REP")}</p>
                <p className="mt-1 truncate text-[15px] font-bold text-foreground">
                  {current.device} · {current.service}
                </p>
              </div>
              <StatusBadge status={current.status} />
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground">
                <span>Repair progress</span>
                <span>60%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[60%] rounded-full bg-primary" />
              </div>
            </div>
            <Link to="/repairs/$repairId" params={{ repairId: current.id }}>
              <span className="animate-press mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground">
                Track Repair
              </span>
            </Link>
          </Card>
        </div>

        {/* Browse services */}
        <div className="mt-7">
          <SectionTitle title="Browse Services" action={<Link to="/book" className="text-[13px] font-semibold text-primary">See all</Link>} />
          <div className="space-y-3">
            {browseServices.map((s) => (
              <Link key={s.name} to="/book" className="animate-press block">
                <Card className="flex items-center gap-3.5 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Smartphone className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">From</p>
                    <p className="text-sm font-extrabold text-primary">{inr(s.from)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent repairs */}
        <div className="mt-7">
          <SectionTitle title="Recent Repairs" action={<Link to="/repairs" className="text-[13px] font-semibold text-primary">View all</Link>} />
          <div className="space-y-3">
            {repairs.slice(1, 3).map((r) => (
              <Link key={r.id} to="/repairs/$repairId" params={{ repairId: r.id }} className="animate-press block">
                <Card className="flex items-center gap-3.5 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Smartphone className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{r.device}</p>
                    <p className="text-xs text-muted-foreground">{r.service}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <CustomerNav />
    </Screen>
  );
}
