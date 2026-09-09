import React, { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { api } from "../../lib/api";

export function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [terms, setTerms] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res && res.settings) {
        setTerms(res.settings.terms_policy || "");
        setPrivacy(res.settings.privacy_policy || "");
        setReturnPolicy(res.settings.return_policy || "");
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await api.updateSettings({
        terms_policy: terms,
        privacy_policy: privacy,
        return_policy: returnPolicy,
      });
      if (res && res.success) {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Policies & Agreements</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage public facing legal and policy documents.</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="grid gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Terms & Conditions</h3>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Write the Terms and Conditions here..."
            className="w-full min-h-[250px] p-4 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Privacy Policy</h3>
          <textarea
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            placeholder="Write the Privacy Policy here..."
            className="w-full min-h-[250px] p-4 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Return Policy</h3>
          <textarea
            value={returnPolicy}
            onChange={(e) => setReturnPolicy(e.target.value)}
            placeholder="Write the Return Policy here..."
            className="w-full min-h-[250px] p-4 rounded-xl border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-y"
          />
        </div>
      </div>
    </div>
  );
}
