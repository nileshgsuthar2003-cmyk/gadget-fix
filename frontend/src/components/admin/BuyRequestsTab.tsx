import { useState, useEffect } from "react";
import { 
  ShoppingCart, Package, Loader2, CheckCircle2, Truck, XCircle, Clock,
  User, Phone, Mail, MapPin, CreditCard, Smartphone
} from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { inr } from "@/lib/data";

interface BuyRequest {
  id: number;
  used_phone_id: number;
  user_id?: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  address?: string;
  payment_method: string;
  total_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  used_phone?: {
    brand: string;
    model: string;
    storage: string;
    color: string;
    condition: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-700", bg: "bg-blue-100", icon: CheckCircle2 },
  delivered: { label: "Delivered", color: "text-emerald-700", bg: "bg-emerald-100", icon: Truck },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100", icon: XCircle },
};

export function BuyRequestsTab() {
  const [requests, setRequests] = useState<BuyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getBuyRequests();
      if (res.success && res.requests) {
        setRequests(res.requests);
      }
    } catch (err) {
      toast.error("Failed to load buy requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await api.updateBuyRequestStatus(id, newStatus);
      if (res.success) {
        toast.success(`Order marked as ${newStatus}`);
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
        );
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    }
  };

  const filteredRequests = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            Buy Requests
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage incoming orders for used phones.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-colors border ${
              filter === status
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 mt-4 font-medium">Loading orders...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
          <p className="text-slate-500 text-sm mt-1">
            {filter === 'all' ? "No buy requests have been submitted yet." : `No ${filter} requests.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredRequests.map((req) => {
            const statusConfig = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            const phone = req.used_phone;

            return (
              <Card key={req.id} className="overflow-hidden flex flex-col">
                <div className="p-5 flex-1 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.label}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-2">
                        Ordered on {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xl font-black text-slate-900">{inr(req.total_amount)}</span>
                  </div>

                  {phone && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-6">
                      <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Smartphone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{phone.brand} {phone.model}</h4>
                        <p className="text-xs text-slate-500">{phone.storage} • {phone.color} • {phone.condition}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div className="flex items-start gap-2 text-slate-600">
                      <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-900">{req.customer_name}</span>
                    </div>
                    {req.customer_phone && (
                      <div className="flex items-start gap-2 text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{req.customer_phone}</span>
                      </div>
                    )}
                    {req.customer_email && (
                      <div className="flex items-start gap-2 text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="break-all">{req.customer_email}</span>
                      </div>
                    )}
                    {req.address && (
                      <div className="flex items-start gap-2 text-slate-600 md:col-span-2">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{req.address}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-slate-600">
                      <CreditCard className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="uppercase font-medium text-slate-900">{req.payment_method || 'UPI'}</span>
                    </div>
                  </div>
                </div>

                {req.status !== 'delivered' && req.status !== 'cancelled' && (
                  <div className="bg-slate-50 p-4 flex flex-wrap gap-3">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(req.id, 'confirmed')}
                          className="flex-1 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl text-sm font-bold transition-colors"
                        >
                          Confirm Order
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, 'cancelled')}
                          className="flex-1 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-sm font-bold transition-colors"
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    {req.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(req.id, 'delivered')}
                          className="flex-1 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl text-sm font-bold transition-colors"
                        >
                          Mark Delivered
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, 'cancelled')}
                          className="flex-1 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl text-sm font-bold transition-colors"
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
