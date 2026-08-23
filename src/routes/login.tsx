import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Smartphone, Wrench } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Screen } from "@/components/shell";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Fixly" },
      { name: "description", content: "Sign in to Fixly with your mobile number and OTP to book and track phone repairs." },
      { property: "og:title", content: "Sign in — Fixly" },
      { property: "og:description", content: "Sign in to Fixly with your mobile number and OTP." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);

  const sendOtp = () => {
    if (phone.length < 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setOtpSent(true);
    toast.success(`OTP sent to +91 ${phone}`);
  };

  const verify = () => {
    if (otp.join("").length < 4) {
      toast.error("Enter the 4-digit OTP");
      return;
    }
    toast.success("Welcome back, Rahul!");
    navigate({ to: "/home" });
  };

  return (
    <Screen>
      <div className="flex flex-1 flex-col px-6 pb-8 pt-14">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary">
          <Wrench className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
          {otpSent ? "Verify OTP" : "Welcome to Fixly"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {otpSent
            ? `Enter the 4-digit code sent to +91 ${phone}`
            : "Sign in with your mobile number to book and track repairs."}
        </p>

        {!otpSent ? (
          <div className="mt-8 space-y-4">
            <div className="flex gap-2">
              <div className="flex h-12 items-center gap-1 rounded-xl border border-input bg-card px-3 text-sm font-semibold text-foreground">
                +91 <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="flex-1"
              />
            </div>
            <Button size="lg" className="w-full" onClick={sendOtp}>
              Continue with OTP
            </Button>
            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button variant="outline" size="lg" className="w-full" onClick={() => navigate({ to: "/home" })}>
              <Smartphone className="h-4 w-4" />
              Continue with Google
            </Button>
            <div className="flex items-center justify-between pt-2 text-[13px] font-semibold">
              <button className="text-muted-foreground" onClick={() => toast("Password reset link sent")}>
                Forgot Password?
              </button>
              <button className="text-primary" onClick={() => toast("Create account flow")}>Create Account</button>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="flex justify-between gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setOtp((prev) => prev.map((d, j) => (j === i ? v : d)));
                    if (v && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
                  }}
                  className="h-14 w-full rounded-xl border border-input bg-card text-center text-xl font-bold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              ))}
            </div>
            <Button size="lg" className="w-full" onClick={verify}>
              Verify & Sign In
            </Button>
            <p className="text-center text-[13px] text-muted-foreground">
              Didn't receive it?{" "}
              <button className="font-semibold text-primary" onClick={sendOtp}>
                Resend OTP
              </button>
            </p>
            <button className="mx-auto block text-[13px] font-semibold text-muted-foreground" onClick={() => setOtpSent(false)}>
              Change mobile number
            </button>
          </div>
        )}

        <p className="mt-auto pt-10 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing you agree to Fixly's{" "}
          <Link to="/login" className="font-semibold text-primary">Terms</Link> and{" "}
          <Link to="/login" className="font-semibold text-primary">Privacy Policy</Link>.
        </p>
      </div>
    </Screen>
  );
}
