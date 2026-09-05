import { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, Smartphone, Check, X, ShieldCheck, BatteryCharging, 
  Tag, Loader2, Package, Search 
} from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { inr } from "@/lib/data";

interface UsedPhone {
  id: number;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: string;
  battery_health: number;
  original_price: number;
  price: number;
  warranty: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  buy_requests_count?: number;
}

export function UsedPhonesTab() {
  const [phones, setPhones] = useState<UsedPhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<UsedPhone | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState("128 GB");
  const [color, setColor] = useState("Black");
  const [condition, setCondition] = useState("Good");
  const [batteryHealth, setBatteryHealth] = useState("90");
  const [originalPrice, setOriginalPrice] = useState("");
  const [price, setPrice] = useState("");
  const [warranty, setWarranty] = useState("6 Months Fixly Warranty");
  const [description, setDescription] = useState("");

  const fetchPhones = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsedPhones();
      if (res.success && res.phones) {
        setPhones(res.phones);
      }
    } catch (err) {
      toast.error("Failed to load used phones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhones();
  }, []);

  const resetForm = () => {
    setBrand("");
    setModel("");
    setStorage("128 GB");
    setColor("Black");
    setCondition("Good");
    setBatteryHealth("90");
    setOriginalPrice("");
    setPrice("");
    setWarranty("6 Months Fixly Warranty");
    setDescription("");
    setEditingPhone(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (phone: UsedPhone) => {
    setEditingPhone(phone);
    setBrand(phone.brand);
    setModel(phone.model);
    setStorage(phone.storage);
    setColor(phone.color);
    setCondition(phone.condition);
    setBatteryHealth(String(phone.battery_health));
    setOriginalPrice(String(phone.original_price));
    setPrice(String(phone.price));
    setWarranty(phone.warranty);
    setDescription(phone.description || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim() || !originalPrice || !price) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      brand: brand.trim(),
      model: model.trim(),
      storage,
      color: color.trim() || "Black",
      condition,
      battery_health: parseInt(batteryHealth) || 90,
      original_price: parseFloat(originalPrice),
      price: parseFloat(price),
      warranty: warranty.trim(),
      description: description.trim() || undefined,
    };

    setIsSaving(true);
    try {
      if (editingPhone) {
        const res = await api.updateUsedPhone(editingPhone.id, payload);
        if (res.success) {
          toast.success("Listing updated successfully.");
          setIsModalOpen(false);
          fetchPhones();
        } else {
          toast.error(res.error || "Failed to update listing.");
        }
      } else {
        const res = await api.createUsedPhone(payload);
        if (res.success) {
          toast.success("Phone listing added.");
          setIsModalOpen(false);
          fetchPhones();
        } else {
          toast.error(res.error || "Failed to add listing.");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await api.deleteUsedPhone(id);
      if (res.success) {
        toast.success(`${name} deleted.`);
        setPhones((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(res.error || "Failed to delete.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  const toggleActive = async (phone: UsedPhone) => {
    try {
      const res = await api.updateUsedPhone(phone.id, { is_active: !phone.is_active });
      if (res.success) {
        setPhones((prev) =>
          prev.map((p) => (p.id === phone.id ? { ...p, is_active: !phone.is_active } : p))
        );
        toast.success(`Listing ${!phone.is_active ? 'activated' : 'deactivated'}.`);
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const filteredPhones = phones.filter((p) =>
    `${p.brand} ${p.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-blue-600" />
            Used Phones Inventory
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage refurbished phones for the marketplace.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search brand or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
          </div>
          <button
            onClick={handleOpenAdd}
            className="h-10 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0 shadow-sm shadow-blue-600/20"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Phone</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 mt-4 font-medium">Loading inventory...</p>
        </div>
      ) : filteredPhones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No phones found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
            {searchQuery ? "No phones match your search." : "Your marketplace inventory is empty. Add a phone to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhones.map((phone) => (
            <Card key={phone.id} className={`overflow-hidden flex flex-col ${!phone.is_active ? 'opacity-75' : ''}`}>
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">{phone.brand} {phone.model}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{phone.storage} • {phone.color}</p>
                    </div>
                  </div>
                  {!phone.is_active && (
                    <StatusBadge status="Cancelled">Inactive</StatusBadge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                    Condition: {phone.condition}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold">
                    <BatteryCharging className="h-3 w-3" />
                    {phone.battery_health}%
                  </span>
                  {(phone.buy_requests_count ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-xs font-bold">
                      <Tag className="h-3 w-3" />
                      {phone.buy_requests_count} Requests
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
                  <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="line-clamp-1">{phone.warranty}</span>
                </div>

                <div className="flex items-end gap-2 mt-auto">
                  <span className="text-xl font-black text-slate-900">{inr(phone.price)}</span>
                  <span className="text-sm text-slate-400 font-medium line-through mb-0.5">
                    {inr(phone.original_price)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-end gap-2">
                <button
                  onClick={() => toggleActive(phone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    phone.is_active 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {phone.is_active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  {phone.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleOpenEdit(phone)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(phone.id, `${phone.brand} ${phone.model}`)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">
                {editingPhone ? "Edit Listing" : "Add Used Phone"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="phoneForm" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Brand *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Apple"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Model *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. iPhone 13"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storage</label>
                    <select
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    >
                      <option value="64 GB">64 GB</option>
                      <option value="128 GB">128 GB</option>
                      <option value="256 GB">256 GB</option>
                      <option value="512 GB">512 GB</option>
                      <option value="1 TB">1 TB</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Midnight"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Condition</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    >
                      <option value="Superb">Superb</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Battery Health (%)</label>
                    <input
                      type="number"
                      placeholder="90"
                      min="1"
                      max="100"
                      value={batteryHealth}
                      onChange={(e) => setBatteryHealth(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Original Price (₹) *</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 69900"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Selling Price (₹) *</label>
                    <input
                      required
                      type="number"
                      placeholder="e.g. 42999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Warranty</label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Months Fixly Warranty"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Any scratches, dents, or specific details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-none"
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                form="phoneForm"
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-blue-600/20"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingPhone ? "Update Listing" : "Add Phone"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
