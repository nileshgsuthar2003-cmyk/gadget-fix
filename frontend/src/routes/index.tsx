import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fixly — Fast, Reliable, Trusted Mobile Repair" },
      {
        name: "description",
        content:
          "Book doorstep or in-store mobile phone repairs, track your repair live, approve estimates and pay securely — all in one app.",
      },
      { property: "og:title", content: "Fixly — Mobile Repair Service" },
      {
        property: "og:description",
        content: "Fast. Reliable. Trusted Mobile Repair. Book, track and pay for phone repairs in one app.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/login" }), 2000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-6">
      <div className="relative">
        <span className="animate-splash-ring absolute inset-0 rounded-3xl bg-primary-foreground/30" />
        <div className="animate-pop-in relative grid h-24 w-24 place-items-center rounded-3xl bg-card shadow-[var(--shadow-lifted)]">
          <Wrench className="h-11 w-11 text-primary" strokeWidth={2.2} />
        </div>
      </div>
      <h1 className="animate-rise-in mt-8 text-4xl font-extrabold tracking-tight text-primary-foreground">
        Fixly
      </h1>
      <p className="animate-rise-in mt-2 text-center text-sm font-medium text-primary-foreground/80 [animation-delay:150ms]">
        Fast. Reliable. Trusted Mobile Repair.
      </p>
      <div className="animate-rise-in mt-12 flex gap-1.5 [animation-delay:300ms]">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground/70"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
