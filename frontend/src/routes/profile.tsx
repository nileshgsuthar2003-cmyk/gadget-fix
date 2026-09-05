import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  HelpCircle,
  LogOut,
  MapPin,
  ClipboardList,
  Edit2,
  X,
  Loader2,
  Building2,
  Home as HomeIcon,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { CustomerNav, Header, Screen } from "@/components/shell";
import { inr } from "@/lib/data";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Fixly" },
      { name: "description", content: "Manage your Fixly profile, orders, and preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [repairsCount, setRepairsCount] = useState<number>(0);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);

  // Edit fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddrType, setNewAddrType] = useState("Home");
  const [newAddrLine, setNewAddrLine] = useState("");

  const loadProfile = async () => {
    try {
      const [userRes, repairsRes] = await Promise.allSettled([
        api.getMe(),
        api.getMyRepairs(),
      ]);

      if (userRes.status === "fulfilled" && userRes.value?.success && userRes.value?.user) {
        const u = userRes.value.user;
        setProfile(u);
        setFirstName(u.first_name || "");
        setLastName(u.last_name || "");
        setPhone(u.phone || "");
        setEmail(u.email || "");
        if (Array.isArray(u.addresses)) {
          setAddresses(u.addresses);
        }
      }

      if (repairsRes.status === "fulfilled" && repairsRes.value?.success && Array.isArray(repairsRes.value?.repairs)) {
        setRepairsCount(repairsRes.value.repairs.length);
      }
    } catch (e) {
      console.warn("Could not load profile:", e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !phone.trim()) {
      toast.error("Please enter first name and phone number");
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.updateProfile({
        user_id: profile?.id || 1,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });

      if (res && res.success && res.user) {
        setProfile(res.user);
        setIsEditOpen(false);
        toast.success("Profile updated.");
      } else {
        toast.error(res?.error || "Could not update profile.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddrLine.trim()) {
      toast.error("Please enter an address");
      return;
    }
    try {
      const res = await api.saveAddress({
        user_id: profile?.id || 1,
        type: newAddrType,
        line: newAddrLine.trim(),
        flat: newAddrLine.trim(),
        street: newAddrLine.trim(),
        city: "Mumbai",
        pincode: "400001",
      });
      if (res && res.success && Array.isArray(res.addresses)) {
        setAddresses(res.addresses);
        setNewAddrLine("");
        toast.success(`${newAddrType} address saved.`);
      } else {
        setAddresses((prev) => [
          ...prev,
          { id: String(Date.now()), type: newAddrType, line: newAddrLine.trim() },
        ]);
        setNewAddrLine("");
        toast.success(`${newAddrType} address added.`);
      }
    } catch (err) {
      setAddresses((prev) => [
        ...prev,
        { id: String(Date.now()), type: newAddrType, line: newAddrLine.trim() },
      ]);
      setNewAddrLine("");
      toast.success(`${newAddrType} address added.`);
    }
  };

  const handleLogout = () => {
    toast.success("Logged out");
    navigate({ to: "/login" });
  };

  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.name || "Customer" : "Customer";

  return (
    <Screen>
      <Header title="Profile" back="/home" />
      
      <div className="flex-1 px-4 py-8 max-w-lg mx-auto w-full space-y-6">
        
        {/* Clean Profile Header */}
        <div className="flex flex-col items-center text-center space-y-3 py-2">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-3xl font-black text-primary-foreground shadow-md shadow-primary/20">
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-foreground">{fullName}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {profile?.phone || "No phone set"} • {profile?.email || "No email set"}
            </p>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-2xs"
          >
            <Edit2 className="h-3 w-3 text-primary" /> Edit Profile
          </button>
        </div>

        {/* Section 1: Orders & Places */}
        <div className="space-y-2">
          <p className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Account & Activity
          </p>

          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden shadow-xs">
            <Link
              to="/repairs"
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-foreground">My Repair Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                  {repairsCount}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>

            <div
              onClick={() => setIsAddressOpen(true)}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-foreground">Saved Addresses</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Section 2: Support & Info */}
        <div className="space-y-2">
          <p className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Help
          </p>

          <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden shadow-xs">
            <div
              onClick={() => toast.info("Support: 1800-FIX-PHONE (support@fixly.com)")}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-foreground">Customer Support</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Section 3: Logout */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-card py-3.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors shadow-xs"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>

        <p className="text-[11px] text-center text-muted-foreground pt-4">Fixly v2.4</p>

      </div>

      {/* ---------- EDIT PROFILE MODAL ---------- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Edit Profile</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="py-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- ADDRESSES MODAL ---------- */}
      {isAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Saved Addresses</h3>
              <button
                onClick={() => setIsAddressOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-3 space-y-2 max-h-48 overflow-y-auto">
              {addresses.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No saved addresses yet.</p>
              ) : (
                addresses.map((a) => (
                  <div key={a.id} className="p-2.5 rounded-xl border border-border bg-muted/20">
                    <span className="text-[11px] font-bold text-primary">{a.type}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.line || a.flat || a.street}</p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex gap-2">
                {["Home", "Office", "Other"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewAddrType(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      newAddrType === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Address line..."
                  value={newAddrLine}
                  onChange={(e) => setNewAddrLine(e.target.value)}
                  className="h-9 flex-1 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomerNav />
    </Screen>
  );
}
