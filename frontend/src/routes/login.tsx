import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Wrench, Mail, Lock, User, Phone, Eye, EyeOff, Check, X, KeyRound, Loader2, Sparkles } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Screen } from "@/components/shell";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In / Register — Fixly" },
      { name: "description", content: "Sign in to Fixly with your email and password to book and track phone repairs." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("rahul@fixly.com");
  const [loginPassword, setLoginPassword] = useState("password123");

  // Register form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Forgot Password via Email OTP States
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter your email and password");
      return;
    }
    toast.success("Signed in successfully! Welcome back.");
    navigate({ to: "/home" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !regEmail || !regPhone || !regPassword) {
      toast.error("Please fill in all registration fields");
      return;
    }
    toast.success(`Account created for ${firstName} ${lastName}! Welcome to Fixly.`);
    navigate({ to: "/home" });
  };

  // 1. Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await api.sendForgotOtp(forgotEmail.trim());
      if (res && res.success) {
        if (res.debug_otp) setDebugOtp(res.debug_otp);
        setForgotStep(2);
        toast.success(`6-digit code sent to ${forgotEmail}`);
      } else {
        toast.error(res?.error || "Could not send verification code.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send OTP code.");
    } finally {
      setForgotLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.trim().length < 4) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await api.verifyForgotOtp(forgotEmail.trim(), forgotOtp.trim());
      if (res && res.success) {
        setForgotStep(3);
        toast.success("Code verified! Set your new password.");
      } else {
        toast.error(res?.error || "Invalid or expired verification code.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to verify code.");
    } finally {
      setForgotLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await api.resetPasswordWithOtp({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        password: newPassword,
      });

      if (res && res.success) {
        toast.success("Password reset successfully! You can now sign in.");
        setLoginEmail(forgotEmail.trim());
        setLoginPassword(newPassword);
        setIsForgotOpen(false);
        setForgotStep(1);
        setForgotOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res?.error || "Could not reset password.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Screen>
      <div className="flex flex-1 items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xl">
          
          <div className="flex items-center gap-3 mb-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground">
                {tab === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-xs text-muted-foreground">Fixly Device Care & Marketplace</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-muted mb-6">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                tab === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                tab === "register"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-foreground">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setForgotStep(1);
                      setIsForgotOpen(true);
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl text-xs font-bold mt-2">
                Sign In to Fixly
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">First Name</label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Last Name</label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Email Address</label>
                <Input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Mobile Phone</label>
                <Input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Password</label>
                <Input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl text-xs font-bold mt-2">
                Create Free Account
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-border text-center">
            <Link to="/home" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              ← Continue as Guest
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- FORGOT PASSWORD MODAL (EMAIL OTP) ---------- */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {forgotStep === 1 && "Reset Password"}
                  {forgotStep === 2 && "Enter Verification Code"}
                  {forgotStep === 3 && "Set New Password"}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {forgotStep === 1 && "Step 1 of 3: Enter registered email"}
                  {forgotStep === 2 && `Step 2 of 3: Code sent to ${forgotEmail}`}
                  {forgotStep === 3 && "Step 3 of 3: Create new password"}
                </p>
              </div>
              <button
                onClick={() => setIsForgotOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="py-4 space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter registered email"
                      className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
                  >
                    {forgotLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Send OTP
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter 6-digit OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="py-4 space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="e.g. 884503"
                      className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs font-mono font-bold tracking-widest text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {debugOtp && (
                  <div className="p-2 rounded-xl bg-primary/10 text-center">
                    <p className="text-[11px] font-bold text-primary">✨ Test OTP Code: {debugOtp}</p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={forgotLoading}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Resend Code
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
                  >
                    {forgotLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Verify Code
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Set New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="py-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
                  >
                    {forgotLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Reset Password
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </Screen>
  );
}
