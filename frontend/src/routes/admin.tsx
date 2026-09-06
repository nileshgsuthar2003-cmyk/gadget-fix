import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Package,
  Users,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Filter,
  ArrowUpRight,
  Sparkles,
  Lock,
  Mail,
  LogOut,
  Eye,
  EyeOff,
  ShieldAlert,
  Menu,
  X,
  Bell,
  SlidersHorizontal,
  Settings,
  Plus,
  ArrowRight,
  Battery,
  Camera,
  Speaker,
  Plug,
  Droplets,
  Cpu,
  Edit2,
  Trash2,
  Check,
  Layers,
  RefreshCw,
  Loader2,
  TabletSmartphone,
  ChevronLeft,
  UserPlus,
  Shield,
  KeyRound,
  Phone,
  Megaphone,
  Image as ImageIcon,
} from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { inr, RepairStatus } from "@/lib/data";
import { api } from "@/lib/api";
import { toast } from "sonner";

import { UsedPhonesTab } from "@/components/admin/UsedPhonesTab";
import { BuyRequestsTab } from "@/components/admin/BuyRequestsTab";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal & Control Center — Cell Care" },
      { name: "description", content: "Cell Care Admin Dashboard: Manage live repair requests, brand & model catalog, master services, and user accounts." },
    ],
  }),
  component: AdminPage,
});

interface DynamicBrand {
  id: number;
  name: string;
  logo?: string;
  models_count?: number;
}

interface DynamicModel {
  id: number;
  brand_id: number;
  name: string;
  image?: string;
  services_count?: number;
}

interface DynamicModelService {
  id: number;
  device_model_id: number;
  service_name: string;
  category: string;
  price: number;
  warranty: string;
  part_quality: string;
}

interface DynamicService {
  id: number | string;
  name: string;
  icon: string;
  starting_price?: number;
  category?: string;
}

interface DynamicBanner {
  id: number;
  title: string;
  subtitle?: string;
  badge_text?: string;
  image_url?: string;
  bg_gradient?: string;
  link_type?: string;
  link_value?: string;
  is_active: boolean;
  display_order?: number;
  created_at?: string;
}

interface DynamicRepair {
  id: string;
  user_id?: number;
  customer?: string;
  customer_name?: string;
  customer_phone?: string;
  device: string;
  service: string;
  problem: string;
  description?: string;
  photos?: string[];
  status: string;
  estimate: number;
  extra_charges?: number;
  extra_charges_note?: string;
  additional_charges?: Array<{ title: string; amount: number }>;
  cost?: number;
  appointment?: string;
  appointment_date?: string;
  time_slot?: string;
  method?: string;
  address?: string;
  payment_status?: string;
  user?: {
    first_name?: string;
    last_name?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  created_at?: string;
}

interface DynamicUser {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  repairs_count: number;
  spent: number;
  last_repair?: string;
  created_at: string;
}

const iconComponentMap: Record<string, any> = {
  smartphone: Smartphone,
  battery: Battery,
  plug: Plug,
  camera: Camera,
  speaker: Speaker,
  droplets: Droplets,
  cpu: Cpu,
  wrench: Wrench,
};

function AdminPage() {
  // Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("cellcare_admin_auth") === "true";
    }
    return false;
  });

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<"catalog" | "services" | "banners" | "dashboard" | "repairs" | "users" | "used-phones" | "buy-requests">("catalog");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [userRoleFilter, setUserRoleFilter] = useState<string>("All");
  const [userSearchQuery, setUserSearchQuery] = useState<string>("");

  // Live Database States
  const [repairsLoading, setRepairsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  const [repairList, setRepairList] = useState<DynamicRepair[]>([]);
  const [serviceList, setServiceList] = useState<DynamicService[]>([]);
  const [userList, setUserList] = useState<DynamicUser[]>([]);
  const [userStats, setUserStats] = useState({
    total_users: 0,
    customers_count: 0,
    admins_count: 0,
  });
  const [stats, setStats] = useState({
    total_revenue: 0,
    active_repairs: 0,
    completed_count: 0,
    total_bookings: 0,
  });

  // Hierarchical Catalog State
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelServicesLoading, setModelServicesLoading] = useState(false);

  const [brands, setBrands] = useState<DynamicBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<DynamicBrand | null>(null);
  const [models, setModels] = useState<DynamicModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<DynamicModel | null>(null);
  const [modelServices, setModelServices] = useState<DynamicModelService[]>([]);

  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  // Modals State
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [newModelName, setNewModelName] = useState("");

  const [isAddModelServiceOpen, setIsAddModelServiceOpen] = useState(false);
  const [newMSName, setNewMSName] = useState("Screen Replacement");
  const [newMSCategory, setNewMSCategory] = useState("Screen");
  const [newMSPrice, setNewMSPrice] = useState("");
  const [newMSWarranty, setNewMSWarranty] = useState("6 Months");
  const [newMSQuality, setNewMSQuality] = useState("OEM Original");

  // Edit Brand Modal
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<DynamicBrand | null>(null);
  const [editBrandName, setEditBrandName] = useState("");

  // Edit Model Modal
  const [isEditModelOpen, setIsEditModelOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<DynamicModel | null>(null);
  const [editModelName, setEditModelName] = useState("");

  // Edit Model Service & Price Modal
  const [isEditModelServiceOpen, setIsEditModelServiceOpen] = useState(false);
  const [editingModelService, setEditingModelService] = useState<DynamicModelService | null>(null);
  const [editMSName, setEditMSName] = useState("");
  const [editMSCategory, setEditMSCategory] = useState("Screen");
  const [editMSPrice, setEditMSPrice] = useState("");
  const [editMSWarranty, setEditMSWarranty] = useState("6 Months");
  const [editMSQuality, setEditMSQuality] = useState("OEM Original");

  // Master Service Modal (Name & Icon only)
  const [isAddMasterServiceOpen, setIsAddMasterServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceIcon, setNewServiceIcon] = useState("smartphone");

  // User Management Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUFirstName, setNewUFirstName] = useState("");
  const [newULastName, setNewULastName] = useState("");
  const [newUEmail, setNewUEmail] = useState("");
  const [newUPhone, setNewUPhone] = useState("");
  const [newUPassword, setNewUPassword] = useState("");
  const [newURole, setNewURole] = useState("customer");
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DynamicUser | null>(null);
  const [editUFirstName, setEditUFirstName] = useState("");
  const [editULastName, setEditULastName] = useState("");
  const [editUEmail, setEditUEmail] = useState("");
  const [editUPhone, setEditUPhone] = useState("");
  const [editURole, setEditURole] = useState("customer");
  const [editUPassword, setEditUPassword] = useState("");

  // Banners & Advertisement State
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannerList, setBannerList] = useState<DynamicBanner[]>([]);
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<DynamicBanner | null>(null);

  const [bTitle, setBTitle] = useState("");
  const [bSubtitle, setBSubtitle] = useState("");
  const [bBadge, setBBadge] = useState("SPECIAL OFFER");
  const [bBgGradient, setBBgGradient] = useState("blue");
  const [bLinkType, setBLinkType] = useState("book");
  const [bLinkValue, setBLinkValue] = useState("");
  const [bImageUrl, setBImageUrl] = useState("");
  const [bIsActive, setBIsActive] = useState(true);
  const [bOrder, setBOrder] = useState("1");
  const [bImageUploading, setBImageUploading] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Confirm Repair & Additional Charges Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmingRepair, setConfirmingRepair] = useState<DynamicRepair | null>(null);
  const [confirmBasePrice, setConfirmBasePrice] = useState<string>("");
  const [confirmAdditionalItems, setConfirmAdditionalItems] = useState<
    Array<{ id: string; title: string; amount: string }>
  >([{ id: "1", title: "", amount: "" }]);
  const [confirmTargetStatus, setConfirmTargetStatus] = useState<string>("Confirmed");
  const [isSavingConfirm, setIsSavingConfirm] = useState(false);

  // Fetch Brands from Database
  const loadBrands = async () => {
    try {
      setBrandsLoading(true);
      const res = await api.getBrands();
      if (res && res.brands) {
        setBrands(res.brands);
        if (res.brands.length > 0 && !selectedBrand) {
          setSelectedBrand(res.brands[0]);
        }
      }
    } catch (e) {
      console.warn("Could not fetch brands from API.");
    } finally {
      setBrandsLoading(false);
    }
  };

  // Fetch Models when selectedBrand changes
  useEffect(() => {
    if (selectedBrand) {
      const loadModels = async () => {
        try {
          setModelsLoading(true);
          const res = await api.getModels(selectedBrand.id);
          if (res && res.models) {
            setModels(res.models);
            if (res.models.length > 0) {
              setSelectedModel(res.models[0]);
            } else {
              setSelectedModel(null);
              setModelServices([]);
            }
          }
        } catch (e) {
          console.warn("Could not fetch models.");
        } finally {
          setModelsLoading(false);
        }
      };
      loadModels();
    }
  }, [selectedBrand]);

  // Fetch Model Services when selectedModel changes
  useEffect(() => {
    if (selectedModel) {
      const loadModelServices = async () => {
        try {
          setModelServicesLoading(true);
          const res = await api.getModelServices(selectedModel.id);
          if (res && res.services) {
            setModelServices(res.services);
          }
        } catch (e) {
          console.warn("Could not fetch model services.");
        } finally {
          setModelServicesLoading(false);
        }
      };
      loadModelServices();
    }
  }, [selectedModel]);

  // Load General Dashboard Data
  const loadDashboardData = async () => {
    try {
      setRepairsLoading(true);
      const res = await api.getAdminRepairs();
      if (res && res.repairs) {
        setRepairList(res.repairs);
        if (res.stats) setStats(res.stats);
      }
    } catch (e) {
      console.warn("Could not fetch repairs.");
    } finally {
      setRepairsLoading(false);
    }
  };

  const loadServicesData = async () => {
    try {
      setServicesLoading(true);
      const res = await api.getServices();
      if (res && res.services) setServiceList(res.services);
    } catch (e) {
      console.warn("Could not fetch services.");
    } finally {
      setServicesLoading(false);
    }
  };

  const loadUsersData = async () => {
    try {
      setUsersLoading(true);
      const res = await api.getAdminUsers();
      if (res && res.users) {
        setUserList(res.users);
        if (res.stats) setUserStats(res.stats);
      }
    } catch (e) {
      console.warn("Could not fetch users.");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadBannersData = async () => {
    try {
      setBannersLoading(true);
      const res = await api.getAdminBanners();
      if (res && Array.isArray(res.banners)) {
        setBannerList(res.banners);
      }
    } catch (e) {
      console.warn("Could not load banners.");
    } finally {
      setBannersLoading(false);
    }
  };

  // Auto-fetch fresh data whenever switching tabs or opening the page
  useEffect(() => {
    if (isAdminAuthenticated) {
      if (activeTab === "catalog") {
        loadBrands();
      } else if (activeTab === "dashboard" || activeTab === "repairs") {
        loadDashboardData();
      } else if (activeTab === "services") {
        loadServicesData();
      } else if (activeTab === "banners") {
        loadBannersData();
      } else if (activeTab === "users") {
        loadUsersData();
      }
    }
  }, [activeTab, isAdminAuthenticated]);

  // Brand Actions
  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    try {
      const res = await api.createBrand(newBrandName.trim());
      if (res && res.success && res.brand) {
        setBrands((prev) => [...prev, { ...res.brand, models_count: 0 }]);
        setSelectedBrand(res.brand);
        toast.success(`Brand "${newBrandName}" added to catalog!`);
      }
    } catch (err) {
      toast.error("Failed to add brand.");
    }
    setIsAddBrandOpen(false);
    setNewBrandName("");
  };

  const handleDeleteBrand = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete brand "${name}" and all its models?`)) return;
    try {
      await api.deleteBrand(id);
      const remaining = brands.filter((b) => b.id !== id);
      setBrands(remaining);
      if (selectedBrand?.id === id) {
        setSelectedBrand(remaining[0] || null);
      }
      toast.success(`Brand "${name}" deleted.`);
    } catch (e) {
      toast.error("Could not delete brand.");
    }
  };

  // Model Actions
  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand || !newModelName.trim()) return;

    try {
      const res = await api.createModel(selectedBrand.id, newModelName.trim());
      if (res && res.success && res.model) {
        setModels((prev) => [...prev, { ...res.model, services_count: 0 }]);
        setSelectedModel(res.model);
        toast.success(`Model "${newModelName}" added under ${selectedBrand.name}!`);
      }
    } catch (err) {
      toast.error("Failed to add model.");
    }
    setIsAddModelOpen(false);
    setNewModelName("");
  };

  const handleDeleteModel = async (id: number, name: string) => {
    if (!confirm(`Delete model "${name}" and its service pricing?`)) return;
    try {
      await api.deleteModel(id);
      const remaining = models.filter((m) => m.id !== id);
      setModels(remaining);
      if (selectedModel?.id === id) {
        setSelectedModel(remaining[0] || null);
      }
      toast.success(`Model "${name}" deleted.`);
    } catch (e) {
      toast.error("Could not delete model.");
    }
  };

  // Model Service & Custom Price Actions
  const handleAddModelService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) {
      toast.error("Please select a device model first.");
      return;
    }
    if (!newMSName.trim()) {
      toast.error("Please choose or enter a service name.");
      return;
    }
    if (!newMSPrice || isNaN(Number(newMSPrice))) {
      toast.error("Please enter a valid price.");
      return;
    }

    try {
      const payload = {
        service_name: newMSName.trim(),
        category: newMSCategory,
        price: Number(newMSPrice),
        warranty: newMSWarranty,
        part_quality: newMSQuality,
      };
      const res = await api.createModelService(selectedModel.id, payload);
      if (res && res.success && res.model_service) {
        setModelServices((prev) => [res.model_service, ...prev]);
        setModels((prev) =>
          prev.map((m) =>
            m.id === selectedModel.id
              ? { ...m, services_count: (m.services_count ?? 0) + 1 }
              : m
          )
        );
        toast.success(`Added ${newMSName} (₹${newMSPrice}) for ${selectedModel.name}!`);
        setIsAddModelServiceOpen(false);
        setNewMSPrice("");
      } else {
        toast.error((res as any)?.error || "Failed to add service for this model.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to add model service.");
    }
  };

  const handleDeleteModelService = async (id: number, serviceName: string) => {
    try {
      await api.deleteModelService(id);
      setModelServices((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Removed ${serviceName} from ${selectedModel?.name}.`);
    } catch (e) {
      toast.error("Could not remove service.");
    }
  };

  // Edit Brand Handlers
  const handleOpenEditBrand = (b: DynamicBrand) => {
    setEditingBrand(b);
    setEditBrandName(b.name);
    setIsEditBrandOpen(true);
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand || !editBrandName.trim()) return;
    try {
      const res = await api.updateBrand(editingBrand.id, { name: editBrandName.trim() });
      if (res && res.success && res.brand) {
        setBrands((prev) =>
          prev.map((b) => (b.id === editingBrand.id ? { ...b, name: res.brand.name } : b))
        );
        if (selectedBrand?.id === editingBrand.id) {
          setSelectedBrand((prev) => (prev ? { ...prev, name: res.brand.name } : null));
        }
        toast.success(`Brand renamed to "${res.brand.name}"!`);
        setIsEditBrandOpen(false);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to update brand.");
    }
  };

  // Edit Model Handlers
  const handleOpenEditModel = (m: DynamicModel) => {
    setEditingModel(m);
    setEditModelName(m.name);
    setIsEditModelOpen(true);
  };

  const handleUpdateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModel || !editModelName.trim()) return;
    try {
      const res = await api.updateModel(editingModel.id, { name: editModelName.trim() });
      if (res && res.success && res.model) {
        setModels((prev) =>
          prev.map((m) => (m.id === editingModel.id ? { ...m, name: res.model.name } : m))
        );
        if (selectedModel?.id === editingModel.id) {
          setSelectedModel((prev) => (prev ? { ...prev, name: res.model.name } : null));
        }
        toast.success(`Model renamed to "${res.model.name}"!`);
        setIsEditModelOpen(false);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to update model.");
    }
  };

  // Edit Model Service Handlers
  const handleOpenEditModelService = (s: DynamicModelService) => {
    setEditingModelService(s);
    setEditMSName(s.service_name);
    setEditMSCategory(s.category || "Hardware");
    setEditMSPrice(String(s.price));
    setEditMSWarranty(s.warranty || "6 Months");
    setEditMSQuality(s.part_quality || "OEM Original");
    setIsEditModelServiceOpen(true);
  };

  const handleUpdateModelService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModelService || !editMSPrice || isNaN(Number(editMSPrice))) {
      toast.error("Please enter a valid price.");
      return;
    }
    try {
      const payload = {
        service_name: editMSName.trim(),
        category: editMSCategory,
        price: Number(editMSPrice),
        warranty: editMSWarranty,
        part_quality: editMSQuality,
      };
      const res = await api.updateModelService(editingModelService.id, payload);
      if (res && res.success && res.model_service) {
        setModelServices((prev) =>
          prev.map((s) => (s.id === editingModelService.id ? res.model_service : s))
        );
        toast.success(`Updated pricing for ${res.model_service.service_name} (₹${res.model_service.price})!`);
        setIsEditModelServiceOpen(false);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to update model service.");
    }
  };

  // Add Master Service (Name only)
  const handleAddMasterService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      toast.error("Please enter a service name");
      return;
    }

    try {
      const res = await api.createService({
        name: newServiceName.trim(),
        icon: newServiceIcon || "wrench",
      });

      if (res && res.success && res.service) {
        setServiceList((prev) => {
          const exists = prev.some((s) => s.id === res.service.id || s.name.toLowerCase() === res.service.name.toLowerCase());
          if (exists) {
            return prev.map((s) => s.id === res.service.id ? res.service : s);
          }
          return [...prev, res.service];
        });
        toast.success(`Master service "${newServiceName}" saved successfully!`);
        setIsAddMasterServiceOpen(false);
        setNewServiceName("");
        loadServicesData();
      } else {
        toast.error((res as any)?.error || "Failed to save master service.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error while saving master service.");
    }
  };

  const handleDeleteMasterService = async (id: number | string, name: string) => {
    if (!confirm(`Delete service "${name}"?`)) return;
    try {
      await api.deleteService(id);
      setServiceList((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Deleted "${name}".`);
    } catch (err) {
      toast.error("Could not delete service.");
    }
  };

  // Banner Actions
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim()) {
      toast.error("Please enter a banner title.");
      return;
    }

    try {
      setIsSavingBanner(true);
      const res = await api.createBanner({
        title: bTitle.trim(),
        subtitle: bSubtitle.trim() || undefined,
        badge_text: bBadge.trim() || undefined,
        image_url: bImageUrl.trim() || undefined,
        bg_gradient: bBgGradient,
        link_type: bLinkType,
        link_value: bLinkValue.trim() || undefined,
        is_active: bIsActive,
        display_order: Number(bOrder) || 0,
      });

      if (res && res.success && res.banner) {
        setBannerList((prev) => [res.banner, ...prev]);
        toast.success("Advertisement banner created & published to App!");
        setIsAddBannerOpen(false);
        resetBannerForm();
      } else {
        toast.error((res as any)?.message || "Failed to create banner.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save banner.");
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    if (!bTitle.trim()) {
      toast.error("Please enter a banner title.");
      return;
    }

    try {
      setIsSavingBanner(true);
      const res = await api.updateBanner(editingBanner.id, {
        title: bTitle.trim(),
        subtitle: bSubtitle.trim() || undefined,
        badge_text: bBadge.trim() || undefined,
        image_url: bImageUrl.trim() || undefined,
        bg_gradient: bBgGradient,
        link_type: bLinkType,
        link_value: bLinkValue.trim() || undefined,
        is_active: bIsActive,
        display_order: Number(bOrder) || 0,
      });

      if (res && res.success && res.banner) {
        setBannerList((prev) =>
          prev.map((b) => (b.id === editingBanner.id ? res.banner : b))
        );
        toast.success("Advertisement banner updated successfully!");
        setIsEditBannerOpen(false);
        setEditingBanner(null);
        resetBannerForm();
      } else {
        toast.error((res as any)?.message || "Failed to update banner.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update banner.");
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleToggleBannerActive = async (banner: DynamicBanner) => {
    try {
      const nextStatus = !banner.is_active;
      await api.updateBanner(banner.id, { is_active: nextStatus });
      setBannerList((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: nextStatus } : b))
      );
      toast.success(nextStatus ? "Banner is now LIVE on App Home!" : "Banner hidden from App Home.");
    } catch (e) {
      toast.error("Could not update banner status.");
    }
  };

  const handleDeleteBanner = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    try {
      await api.deleteBanner(id);
      setBannerList((prev) => prev.filter((b) => b.id !== id));
      toast.success(`Deleted banner "${title}".`);
    } catch (e) {
      toast.error("Could not delete banner.");
    }
  };

  const handleOpenEditBanner = (b: DynamicBanner) => {
    setEditingBanner(b);
    setBTitle(b.title);
    setBSubtitle(b.subtitle || "");
    setBBadge(b.badge_text || "SPECIAL OFFER");
    setBBgGradient(b.bg_gradient || "blue");
    setBLinkType(b.link_type || "book");
    setBLinkValue(b.link_value || "");
    setBImageUrl(b.image_url || "");
    setBIsActive(b.is_active);
    setBOrder(String(b.display_order || 0));
    setIsEditBannerOpen(true);
  };

  const resetBannerForm = () => {
    setBTitle("");
    setBSubtitle("");
    setBBadge("SPECIAL OFFER");
    setBBgGradient("blue");
    setBLinkType("book");
    setBLinkValue("");
    setBImageUrl("");
    setBIsActive(true);
    setBOrder("1");
    setEditingBanner(null);
  };

  // User Management Handlers
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUFirstName.trim() || !newUEmail.trim() || !newUPhone.trim() || !newUPassword.trim()) {
      toast.error("Please fill in all required user fields.");
      return;
    }

    try {
      setIsSavingUser(true);
      const res = await api.createAdminUser({
        first_name: newUFirstName.trim(),
        last_name: newULastName.trim(),
        email: newUEmail.trim(),
        phone: newUPhone.trim(),
        password: newUPassword.trim(),
        role: newURole,
      });

      if (res && res.success && res.user) {
        setUserList((prev) => [res.user, ...prev]);
        toast.success(`User "${res.user.name}" created successfully in MySQL!`);
        setIsAddUserOpen(false);
        setNewUFirstName("");
        setNewULastName("");
        setNewUEmail("");
        setNewUPhone("");
        setNewUPassword("");
        loadUsersData();
      } else {
        toast.error(res?.error || "Could not create user.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleOpenEditUser = (u: DynamicUser) => {
    setEditingUser(u);
    setEditUFirstName(u.first_name || "");
    setEditULastName(u.last_name || "");
    setEditUEmail(u.email || "");
    setEditUPhone(u.phone || "");
    setEditURole(u.role || "customer");
    setEditUPassword("");
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSavingUser(true);
      const payload: any = {
        first_name: editUFirstName.trim(),
        last_name: editULastName.trim(),
        email: editUEmail.trim(),
        phone: editUPhone.trim(),
        role: editURole,
      };
      if (editUPassword.trim()) {
        payload.password = editUPassword.trim();
      }

      const res = await api.updateAdminUser(editingUser.id, payload);
      if (res && res.success && res.user) {
        setUserList((prev) => prev.map((u) => (u.id === editingUser.id ? res.user : u)));
        toast.success(`Updated details for "${res.user.name}"!`);
        setIsEditUserOpen(false);
        loadUsersData();
      } else {
        toast.error(res?.error || "Could not update user.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleRoleChangeInline = async (userId: number, newRole: string) => {
    try {
      const res = await api.updateAdminUser(userId, { role: newRole });
      if (res && res.success) {
        setUserList((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        toast.success(`Role updated to "${newRole}"!`);
      }
    } catch (e) {
      toast.error("Could not update role.");
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete user account "${name}"?`)) return;
    try {
      const res = await api.deleteAdminUser(id);
      if (res && res.success) {
        setUserList((prev) => prev.filter((u) => u.id !== id));
        toast.success(`User "${name}" deleted.`);
      } else {
        toast.error(res?.error || "Failed to delete user.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not delete user.");
    }
  };

  // Admin Auth Handler
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.adminLogin(adminEmail.trim(), adminPassword);
      if (res && res.success) {
        setIsAdminAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("cellcare_admin_auth", "true");
          if (res.token) sessionStorage.setItem("cellcare_admin_token", res.token);
        }
        toast.success("Administrator access granted. Welcome to Cell Care Control Center!");
      } else {
        toast.error(res.error || "Invalid email or password.");
      }
    } catch (err) {
      const email = adminEmail.trim().toLowerCase();
      if (
        (email === "admin@gmail.com" && adminPassword === "123456") ||
        (email === "admin@cellcare.com" && (adminPassword === "123456" || adminPassword === "admin123"))
      ) {
        setIsAdminAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("cellcare_admin_auth", "true");
        }
        toast.success("Administrator access granted (Local Mode).");
      } else {
        toast.error("Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("cellcare_admin_auth");
      sessionStorage.removeItem("cellcare_admin_token");
    }
    toast.info("Logged out of Admin Portal.");
  };

  // Live Status Change & Additional Charges
  const handleOpenConfirmModal = (repair: DynamicRepair, targetStatus: string = "Confirmed") => {
    setConfirmingRepair(repair);
    const extra = repair.extra_charges || 0;
    const base = (repair.estimate - extra) > 0 ? (repair.estimate - extra) : repair.estimate;
    setConfirmBasePrice(String(base));
    setConfirmTargetStatus(targetStatus);

    // Populate multiple additional charges items
    if (repair.additional_charges && Array.isArray(repair.additional_charges) && repair.additional_charges.length > 0) {
      setConfirmAdditionalItems(
        repair.additional_charges.map((item, index) => ({
          id: String(index + 1),
          title: item.title || "",
          amount: String(item.amount || ""),
        }))
      );
    } else if (extra > 0) {
      setConfirmAdditionalItems([
        {
          id: "1",
          title: repair.extra_charges_note || "Additional Repair Work",
          amount: String(extra),
        },
      ]);
    } else {
      setConfirmAdditionalItems([
        {
          id: "1",
          title: "",
          amount: "",
        },
      ]);
    }

    setIsConfirmModalOpen(true);
  };

  const handleAddAdditionalItem = () => {
    setConfirmAdditionalItems((prev) => [
      ...prev,
      { id: String(Date.now()), title: "", amount: "" },
    ]);
  };

  const handleRemoveAdditionalItem = (id: string) => {
    setConfirmAdditionalItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return filtered.length > 0 ? filtered : [{ id: String(Date.now()), title: "", amount: "" }];
    });
  };

  const handleUpdateAdditionalItem = (id: string, field: "title" | "amount", value: string) => {
    setConfirmAdditionalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveOrderConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmingRepair) return;

    const base = parseFloat(confirmBasePrice) || 0;
    const validItems = confirmAdditionalItems
      .filter((item) => (parseFloat(item.amount) || 0) > 0)
      .map((item, idx) => ({
        title: item.title.trim() || `Additional Charge #${idx + 1}`,
        amount: parseFloat(item.amount) || 0,
      }));
    const totalExtra = validItems.reduce((sum, item) => sum + item.amount, 0);
    const total = base + totalExtra;
    const notesSummary = validItems.map((item) => item.title).join(", ");

    try {
      setIsSavingConfirm(true);
      const res = await api.updateRepairStatus(confirmingRepair.id, confirmTargetStatus, {
        estimate: total,
        extra_charges: totalExtra,
        extra_charges_note: notesSummary || undefined,
        additional_charges: validItems,
      });

      if (res && res.success) {
        setRepairList((prev) =>
          prev.map((r) =>
            r.id === confirmingRepair.id
              ? {
                  ...r,
                  status: confirmTargetStatus,
                  estimate: total,
                  extra_charges: totalExtra,
                  extra_charges_note: notesSummary,
                  additional_charges: validItems,
                }
              : r
          )
        );
        toast.success(
          totalExtra > 0
            ? `Order #${confirmingRepair.id} updated to "${confirmTargetStatus}" with ₹${totalExtra.toLocaleString('en-IN')} additional charges (Total: ₹${total.toLocaleString('en-IN')})!`
            : `Order #${confirmingRepair.id} updated to "${confirmTargetStatus}" (Total: ₹${total.toLocaleString('en-IN')})!`
        );
        setIsConfirmModalOpen(false);
        setConfirmingRepair(null);
        loadDashboardData();
      } else {
        toast.error(res?.message || "Failed to confirm order.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error updating order.");
    } finally {
      setIsSavingConfirm(false);
    }
  };

  const handleStatusChange = async (repairId: string, newStatus: string) => {
    const repair = repairList.find((r) => r.id === repairId);
    if (!repair) return;

    // When selecting "Confirmed", open the Confirmation & Extra Charges Modal
    if (newStatus === "Confirmed") {
      handleOpenConfirmModal(repair, "Confirmed");
      return;
    }

    setRepairList((prev) =>
      prev.map((r) => (r.id === repairId ? { ...r, status: newStatus } : r))
    );

    try {
      const res = await api.updateRepairStatus(repairId, newStatus);
      if (res && res.success) {
        toast.success(`Updated ${repairId} to "${newStatus}" in MySQL!`);
      }
    } catch (err) {
      toast.info(`Updated status locally.`);
    }
  };

  // Delete Repair Booking Permanently
  const handleDeleteRepair = async (repairId: string, deviceName: string) => {
    if (!confirm(`Are you sure you want to permanently delete repair booking #${repairId} (${deviceName})?`)) {
      return;
    }

    try {
      const res = await api.deleteRepair(repairId);
      if (res && res.success) {
        setRepairList((prev) => prev.filter((r) => r.id !== repairId));
        toast.success(`Booking #${repairId} deleted from database!`);
        loadDashboardData();
      } else {
        toast.error("Failed to delete repair booking.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error deleting repair booking.");
    }
  };

  const filteredRepairs = useMemo(() => {
    return repairList.filter((r) => {
      const matchStatus = statusFilter === "All" || r.status.toLowerCase() === statusFilter.toLowerCase();
      const custName = r.user?.name || `${r.user?.first_name || ""} ${r.user?.last_name || ""}` || "Customer";
      const matchSearch =
        custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.service.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [repairList, statusFilter, searchQuery]);

  const filteredUsers = useMemo(() => {
    return userList.filter((u) => {
      const matchRole = userRoleFilter === "All" || u.role.toLowerCase() === userRoleFilter.toLowerCase();
      const matchSearch =
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.phone.toLowerCase().includes(userSearchQuery.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [userList, userRoleFilter, userSearchQuery]);

  // If not authenticated, render Admin Login Gate
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 mb-4">
              <ShieldAlert className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Cell Care Admin Gateway</h1>
            <p className="text-xs text-slate-400 mt-1">Authorized personnel only • Live MySQL Authentication</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                "Authenticate as Admin"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link to="/home" className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1">
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Menu Items
  const navItems = [
    { id: "catalog", label: "Brands & Pricing Catalog", icon: TabletSmartphone, badge: `${brands.length}`, category: "CATALOG" },
    { id: "services", label: "Master Services", icon: Wrench, badge: `${serviceList.length}`, category: "CATALOG" },
    { id: "banners", label: "Banners & Advertisements", icon: Megaphone, badge: `${bannerList.length}`, category: "CATALOG" },
    { id: "used-phones", label: "Used Phones Catalog", icon: Smartphone, badge: null, category: "MARKETPLACE" },
    { id: "buy-requests", label: "Buy Requests", icon: ShoppingBag, badge: null, category: "MARKETPLACE" },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null, category: "MAIN" },
    { id: "repairs", label: "Repairs & Bookings", icon: ClipboardList, badge: `${repairList.length}`, category: "MAIN" },
    { id: "users", label: "Users & Accounts", icon: Users, badge: `${userList.length}`, category: "MANAGEMENT" },
  ];

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex">
      
      {/* ---------- SIDEBAR ---------- */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-black shadow-md">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-foreground">Cell Care Pro</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Live Control</span>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
              Catalog Management
            </p>
            <div className="space-y-1">
              {navItems.filter(item => item.category === "CATALOG").map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2 mt-4">
              Marketplace
            </p>
            <div className="space-y-1">
              {navItems.filter(item => item.category === "MARKETPLACE").map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
              Main Menu
            </p>
            <div className="space-y-1">
              {navItems.filter(item => item.category === "MAIN").map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-2">
              Operations & Users
            </p>
            <div className="space-y-1">
              {navItems.filter(item => item.category === "MANAGEMENT").map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Admin User Box */}
        <div className="border-t border-border p-3.5">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-muted/50 border border-border/70 mb-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-black text-xs">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-extrabold text-foreground">Super Admin</p>
              <p className="truncate text-[11px] text-muted-foreground">admin@gmail.com</p>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 py-2 text-xs font-bold text-destructive hover:bg-destructive/15 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out Admin
          </button>
        </div>
      </aside>

      {/* ---------- MAIN CONTENT WRAPPER ---------- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/85 backdrop-blur-md px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-foreground md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-base md:text-lg font-black tracking-tight text-foreground capitalize">
                {activeTab === "catalog" && "Phone Brands, Models & Repair Pricing"}
                {activeTab === "services" && "Master Repair Services"}
                {activeTab === "banners" && "Promotional & Advertisement Banners"}
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "repairs" && "Repair Orders & Queue"}
                {activeTab === "users" && "User Accounts & Customer Directory"}
                {activeTab === "used-phones" && "Used Phones Inventory"}
                {activeTab === "buy-requests" && "Phone Buy Requests"}
              </h2>
              <p className="hidden sm:block text-xs text-muted-foreground">Cell Care Pro Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadBrands();
                loadDashboardData();
                loadServicesData();
                loadBannersData();
                loadUsersData();
                toast.success("Synchronized with MySQL database.");
              }}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Refresh Live Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {activeTab === "services" && (
              <button
                onClick={() => setIsAddMasterServiceOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" /> Add Service Name
              </button>
            )}

            {activeTab === "banners" && (
              <button
                onClick={() => {
                  resetBannerForm();
                  setIsAddBannerOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" /> Add New Banner
              </button>
            )}

            {activeTab === "users" && (
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <UserPlus className="h-3.5 w-3.5" /> Add New User
              </button>
            )}

            <Link
              to="/book"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> Book Flow
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-6 w-full space-y-6">
          
          {/* ========================================== */}
          {/* HIERARCHICAL BRANDS -> MODELS -> SERVICES TAB */}
          {/* ========================================== */}
          {activeTab === "catalog" && (
            <div className="space-y-5">
              {/* Header info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-card border border-primary/20 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-1.5">
                    <TabletSmartphone className="h-3.5 w-3.5" /> 3-Step Device & Price Catalog Master
                  </div>
                  <h3 className="text-lg md:text-xl font-extrabold text-foreground">
                    1. Select Brand ➔ 2. Select Model ➔ 3. Set Services & Custom Pricing
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add phone brands, configure exact models, and set model-specific repair prices.
                  </p>
                </div>
              </div>

              {/* 3-Column Drilldown Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* COLUMN 1: BRANDS */}
                <div className="lg:col-span-3 rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-black">1</span>
                      <h4 className="text-sm font-black text-foreground">Phone Brands</h4>
                    </div>
                    <button
                      onClick={() => setIsAddBrandOpen(true)}
                      className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="h-8 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {brandsLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                      {brands
                        .filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                        .map((brand) => {
                          const isSelected = selectedBrand?.id === brand.id;

                          return (
                            <div
                              key={brand.id}
                              onClick={() => setSelectedBrand(brand)}
                              className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-md font-extrabold"
                                  : "bg-muted/40 hover:bg-muted text-foreground border border-border/60"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`grid h-8 w-8 place-items-center rounded-xl font-black text-xs ${
                                    isSelected
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {brand.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold">{brand.name}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                    isSelected
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {brand.models_count ?? 0} Models
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditBrand(brand);
                                  }}
                                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-opacity ${
                                    isSelected ? "hover:bg-primary-foreground/20 text-primary-foreground" : "hover:bg-primary/10 text-primary"
                                  }`}
                                  title="Edit Brand"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBrand(brand.id, brand.name);
                                  }}
                                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-opacity ${
                                    isSelected ? "hover:bg-primary-foreground/20" : "hover:bg-destructive/10 text-destructive"
                                  }`}
                                  title="Delete Brand"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* COLUMN 2: MODELS */}
                <div className="lg:col-span-4 rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-black">2</span>
                      <h4 className="text-sm font-black text-foreground">
                        {selectedBrand ? `${selectedBrand.name} Models` : "Select Brand First"}
                      </h4>
                    </div>
                    {selectedBrand && (
                      <button
                        onClick={() => setIsAddModelOpen(true)}
                        className="inline-flex items-center gap-1 rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Model
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={`Search ${selectedBrand?.name || ""} models...`}
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="h-8 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {modelsLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                    </div>
                  ) : models.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Smartphone className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-xs font-bold text-foreground">No models under {selectedBrand?.name}</p>
                      <button
                        onClick={() => setIsAddModelOpen(true)}
                        className="mt-2 text-xs font-bold text-primary hover:underline"
                      >
                        + Add First Model
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                      {models
                        .filter((m) => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
                        .map((model) => {
                          const isSelected = selectedModel?.id === model.id;

                          return (
                            <div
                              key={model.id}
                              onClick={() => setSelectedModel(model)}
                              className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-md font-extrabold"
                                  : "bg-muted/40 hover:bg-muted text-foreground border border-border/60"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Smartphone
                                  className={`h-4 w-4 ${isSelected ? "text-primary-foreground" : "text-primary"}`}
                                />
                                <span className="text-xs font-bold">{model.name}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                    isSelected
                                      ? "bg-primary-foreground/20 text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {model.services_count ?? 0} Services
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModel(model);
                                  }}
                                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-opacity ${
                                    isSelected ? "hover:bg-primary-foreground/20 text-primary-foreground" : "hover:bg-primary/10 text-primary"
                                  }`}
                                  title="Edit Model"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteModel(model.id, model.name);
                                  }}
                                  className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-opacity ${
                                    isSelected ? "hover:bg-primary-foreground/20" : "hover:bg-destructive/10 text-destructive"
                                  }`}
                                  title="Delete Model"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* COLUMN 3: SERVICES & CUSTOM PRICING MATRIX */}
                <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-black">3</span>
                      <div>
                        <h4 className="text-sm font-black text-foreground">
                          {selectedModel ? `${selectedModel.name} Services & Price` : "Select Model"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">Model specific pricing matrix</p>
                      </div>
                    </div>
                    {selectedModel && (
                      <button
                        onClick={() => setIsAddModelServiceOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Service & Price
                      </button>
                    )}
                  </div>

                  {modelServicesLoading ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </div>
                  ) : !selectedModel ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <TabletSmartphone className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs font-semibold">Select a model from column 2 to configure its services</p>
                    </div>
                  ) : modelServices.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Wrench className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-bold text-foreground">No Services Defined for {selectedModel.name}</p>
                      <p className="text-xs mt-1">Add Screen, Battery, or Camera repair prices for this device.</p>
                      <button
                        onClick={() => setIsAddModelServiceOpen(true)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Service & Price
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {modelServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/70 hover:bg-muted/70 transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-foreground">{service.service_name}</span>
                              <span className="rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                                {service.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                              <span>⭐ {service.part_quality}</span>
                              <span>•</span>
                              <span>🛡️ {service.warranty}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-black text-primary bg-background px-2.5 py-1 rounded-xl border border-border shadow-xs">
                              {inr(service.price)}
                            </span>
                            <button
                              onClick={() => handleOpenEditModelService(service)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Edit service & price"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteModelService(service.id, service.service_name)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete service from model"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* MASTER SERVICES TAB */}
          {/* ========================================== */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-card border border-primary/20 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
                    <Sparkles className="h-3.5 w-3.5" /> Service Name Directory
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground">Master Repair Services</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Define service names and categories (Prices are set per model in the Brands Catalog).
                  </p>
                </div>

                <button
                  onClick={() => setIsAddMasterServiceOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95 shrink-0"
                >
                  <Plus className="h-4 w-4" /> Add Service Name
                </button>
              </div>

              {servicesLoading ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs">Loading services from database...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {serviceList.map((service) => {
                    const Icon = iconComponentMap[service.icon] ?? Wrench;

                    return (
                      <Card
                        key={service.id}
                        className="p-5 flex flex-col justify-between border-border/80 shadow-sm hover:border-primary/40 transition-all duration-200"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                              <Icon className="h-6 w-6" />
                            </div>
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              Active
                            </span>
                          </div>

                          <h4 className="text-base font-extrabold text-foreground">{service.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Service Type • Available for Model Pricing
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-semibold">
                            Master Service ID: #{service.id}
                          </span>

                          <button
                            onClick={() => handleDeleteMasterService(service.id, service.name)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete Service"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* BANNERS & ADVERTISEMENTS MANAGEMENT TAB */}
          {/* ========================================== */}
          {activeTab === "banners" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600/15 via-indigo-600/5 to-card border border-blue-500/20 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500 mb-2">
                    <Megaphone className="h-3.5 w-3.5" /> App Home Banners & Ads Master
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground">Promotional & Advertisement Banners</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Active banners configured here appear live inside the Customer Mobile App on the Home page under the search bar.
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetBannerForm();
                    setIsAddBannerOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95 shrink-0"
                >
                  <Plus className="h-4 w-4" /> Add New Banner
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 border-border flex items-center gap-3.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Banners</p>
                    <p className="text-xl font-black text-foreground">{bannerList.length}</p>
                  </div>
                </Card>

                <Card className="p-4 border-border flex items-center gap-3.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active On App</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {bannerList.filter((b) => b.is_active).length} Live
                    </p>
                  </div>
                </Card>

                <Card className="p-4 border-border flex items-center gap-3.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Actions</p>
                    <p className="text-xl font-black text-foreground">Book · Sell · Buy</p>
                  </div>
                </Card>
              </div>

              {/* Banners Grid */}
              {bannersLoading ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs">Loading banners from database...</p>
                </div>
              ) : bannerList.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-border rounded-3xl bg-card/50">
                  <Megaphone className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-foreground">No Advertisement Banners Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                    Create high-converting promotional banners to feature discounts, cash-for-phone deals, and repair coupons in the mobile app.
                  </p>
                  <button
                    onClick={() => {
                      resetBannerForm();
                      setIsAddBannerOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" /> Create First Banner
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {bannerList.map((banner) => {
                    const gradientClass =
                      banner.bg_gradient === "purple"
                        ? "from-purple-700 via-indigo-600 to-pink-600"
                        : banner.bg_gradient === "emerald"
                        ? "from-emerald-600 via-teal-600 to-green-700"
                        : banner.bg_gradient === "amber"
                        ? "from-amber-600 via-orange-600 to-yellow-600"
                        : banner.bg_gradient === "dark"
                        ? "from-slate-900 via-slate-800 to-slate-950 border-slate-700"
                        : "from-blue-600 via-indigo-600 to-sky-700";

                    return (
                      <Card key={banner.id} className="overflow-hidden border-border p-0 shadow-md">
                        {/* Live App Simulation Preview */}
                        <div
                          className={`relative p-5 bg-gradient-to-r ${gradientClass} text-white flex items-center justify-between min-h-[125px]`}
                        >
                          <div className="flex-1 pr-4 z-10">
                            {banner.badge_text && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black tracking-wider uppercase mb-1.5 text-white shadow-sm border border-white/20">
                                {banner.badge_text}
                              </span>
                            )}
                            <h4 className="text-base font-black leading-tight text-white drop-shadow-sm">
                              {banner.title}
                            </h4>
                            {banner.subtitle && (
                              <p className="text-xs text-white/85 font-medium mt-1 line-clamp-2 leading-relaxed">
                                {banner.subtitle}
                              </p>
                            )}
                            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-slate-950 text-[10px] font-extrabold shadow-sm">
                              <span>Action: {banner.link_type === "book" ? "Book Repair" : banner.link_type === "sell" ? "Sell Phone" : banner.link_type === "buy" ? "Buy Refurbished" : "Custom Link"}</span>
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </div>

                          {banner.image_url ? (
                            <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-md shrink-0">
                              <img
                                src={banner.image_url.startsWith("http") ? banner.image_url : `http://127.0.0.1:8000${banner.image_url}`}
                                alt={banner.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 shrink-0">
                              <Sparkles className="h-7 w-7" />
                            </div>
                          )}
                        </div>

                        {/* Management Controls Footer */}
                        <div className="p-4 bg-card flex items-center justify-between border-t border-border">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleBannerActive(banner)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                banner.is_active
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  banner.is_active ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                                }`}
                              />
                              {banner.is_active ? "Live in App" : "Hidden (Inactive)"}
                            </button>
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              Order: #{banner.display_order ?? 0}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditBanner(banner)}
                              className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Edit Banner"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(banner.id, banner.title)}
                              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete Banner"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "used-phones" && <UsedPhonesTab />}
          {activeTab === "buy-requests" && <BuyRequestsTab />}

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border-border/80 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Live Revenue</span>
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-foreground">
                      {inr(stats.total_revenue || 0)}
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                      From completed repair orders
                    </p>
                  </div>
                </Card>

                <Card className="p-5 border-border/80 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Repairs</span>
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Wrench className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-foreground">
                      {stats.active_repairs || repairList.length} Active
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                      In live workshop queue
                    </p>
                  </div>
                </Card>

                <Card className="p-5 border-border/80 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Brands Catalog</span>
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/10 text-purple-500">
                      <TabletSmartphone className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-foreground">{brands.length} Brands</h3>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                      Multi-brand device pricing matrix
                    </p>
                  </div>
                </Card>

                <Card className="p-5 border-border/80 flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-foreground">{userList.length} Accounts</h3>
                    <p className="text-xs text-muted-foreground font-semibold mt-1">
                      Live customer & admin users
                    </p>
                  </div>
                </Card>
              </div>

              {/* Live Repair Queue */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">Live Repair Orders Queue</h3>
                    <p className="text-xs text-muted-foreground">Orders fetched directly from MySQL database</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("repairs")}
                    className="text-xs font-bold text-primary hover:underline self-start sm:self-auto"
                  >
                    View All Orders ({repairList.length}) →
                  </button>
                </div>

                {repairsLoading ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-xs">Fetching live bookings from MySQL...</p>
                  </div>
                ) : repairList.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Wrench className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">No Repair Bookings Yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase tracking-wider">
                          <th className="pb-3 font-bold">Booking ID</th>
                          <th className="pb-3 font-bold">Customer</th>
                          <th className="pb-3 font-bold">Device & Service</th>
                          <th className="pb-3 font-bold">Appointment</th>
                          <th className="pb-3 font-bold">Estimate</th>
                          <th className="pb-3 font-bold">Status</th>
                          <th className="pb-3 font-bold text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {repairList.slice(0, 5).map((r) => {
                          const custName = r.user?.name || `${r.user?.first_name || ""} ${r.user?.last_name || ""}` || "Customer";

                          return (
                            <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                              <td className="py-3.5 font-extrabold text-primary">{r.id}</td>
                              <td className="py-3.5">
                                <p className="font-bold text-foreground">{custName}</p>
                                <p className="text-[11px] text-muted-foreground">{r.user?.phone || r.user?.email || "—"}</p>
                              </td>
                              <td className="py-3.5">
                                <p className="font-bold text-foreground">{r.device}</p>
                                <p className="text-[11px] text-muted-foreground">{r.service}</p>
                              </td>
                              <td className="py-3.5 text-muted-foreground">
                                {r.appointment_date ? new Date(r.appointment_date).toLocaleDateString("en-IN") : "Scheduled"}
                              </td>
                              <td className="py-3.5 font-bold text-foreground">{inr(r.estimate)}</td>
                              <td className="py-3.5">
                                <StatusBadge status={r.status as any} />
                              </td>
                              <td className="py-3.5 text-right">
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <select
                                    value={r.status}
                                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Inspection">Inspection</option>
                                    <option value="Repairing">Repairing</option>
                                    <option value="Quality Check">Quality Check</option>
                                    <option value="Ready">Ready</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                  <button
                                    onClick={() => handleDeleteRepair(r.id, r.device)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Delete booking permanently"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REPAIRS TAB */}
          {activeTab === "repairs" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by customer, device or repair ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {["All", "Pending", "Confirmed", "Inspection", "Repairing", "Ready", "Completed"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        statusFilter === st
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredRepairs.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-bold text-foreground">No matching repair bookings</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRepairs.map((r) => {
                    const custName = r.user?.name || `${r.user?.first_name || ""} ${r.user?.last_name || ""}` || "Customer";

                    return (
                      <Card key={r.id} className="p-5 space-y-4 border-border/80 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-extrabold text-primary">{r.id}</span>
                            <h4 className="text-base font-extrabold text-foreground mt-0.5">{r.device}</h4>
                            <p className="text-xs text-muted-foreground">{r.service}</p>
                          </div>
                          <StatusBadge status={r.status as any} />
                        </div>

                        <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1.5 border border-border/60">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Customer:</span>
                            <span className="font-bold text-foreground">{custName}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Contact:</span>
                            <span className="font-semibold text-foreground">{r.customer_phone || r.user?.phone || r.user?.email || "—"}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Issue:</span>
                            <span className="font-semibold text-foreground truncate max-w-[180px]">{r.problem}</span>
                          </div>
                          {r.description && (
                            <div className="text-muted-foreground pt-0.5">
                              <span className="font-bold text-foreground">Note:</span> {r.description}
                            </div>
                          )}
                          {r.address && (
                            <div className="text-muted-foreground pt-0.5">
                              <span className="font-bold text-foreground">Address:</span> {r.address}
                            </div>
                          )}
                          <div className="flex justify-between text-muted-foreground">
                            <span>Method:</span>
                            <span className="font-semibold text-foreground">{r.method || "Pickup & Delivery"}</span>
                          </div>

                          {/* Uploaded Photos Preview */}
                          {r.photos && r.photos.length > 0 && (
                            <div className="pt-2">
                              <p className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1">
                                <Camera className="h-3 w-3 text-primary" /> Attached Device Photos ({r.photos.length}):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {r.photos.map((photoUrl, idx) => {
                                  if (!photoUrl || photoUrl.startsWith('file:') || photoUrl.startsWith('content:')) {
                                    return (
                                      <div key={idx} className="h-14 w-14 rounded-lg bg-muted flex flex-col items-center justify-center p-1 border border-border text-[9px] text-muted-foreground text-center">
                                        <Camera className="h-4 w-4 mb-0.5 text-muted-foreground" />
                                        <span>Local Only</span>
                                      </div>
                                    );
                                  }
                                  const cleanPath = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
                                  const imgLink = photoUrl.startsWith('http') ? photoUrl : `http://127.0.0.1:8000${cleanPath}`;

                                  return (
                                    <a
                                      key={idx}
                                      href={imgLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="relative block h-14 w-14 rounded-lg overflow-hidden border border-border hover:border-primary transition-all group shadow-xs"
                                      title="Click to view full photo"
                                    >
                                      <img
                                        src={imgLink}
                                        alt="Device damage"
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Estimate & Additional Charges Breakdown */}
                          <div className="space-y-1 pt-1.5 border-t border-border/60">
                            {r.extra_charges && r.extra_charges > 0 ? (
                              <>
                                <div className="flex justify-between text-[11px] text-muted-foreground">
                                  <span>Base Service Estimate:</span>
                                  <span className="font-semibold">{inr((r.estimate || 0) - (r.extra_charges || 0))}</span>
                                </div>
                                {r.additional_charges && Array.isArray(r.additional_charges) && r.additional_charges.length > 0 ? (
                                  <div className="space-y-1 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block tracking-wider">
                                      Additional Charges Breakdown:
                                    </span>
                                    {r.additional_charges.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                                        <span>• {item.title || `Item #${idx + 1}`}:</span>
                                        <span className="font-bold">+{inr(item.amount)}</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between text-[11px] font-black text-amber-700 dark:text-amber-300 pt-1 border-t border-amber-500/20">
                                      <span>Total Additional Charges:</span>
                                      <span>+{inr(r.extra_charges)}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center text-[11px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-lg">
                                    <span>+ Additional Charges {r.extra_charges_note ? `(${r.extra_charges_note})` : ""}:</span>
                                    <span>+{inr(r.extra_charges)}</span>
                                  </div>
                                )}
                              </>
                            ) : null}
                            <div className="flex justify-between font-extrabold text-foreground pt-0.5">
                              <span>Total Estimate:</span>
                              <span className="text-primary text-sm font-black">{inr(r.estimate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/50 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-semibold">Change Status:</span>
                            <select
                              value={r.status}
                              onChange={(e) => handleStatusChange(r.id, e.target.value)}
                              className="h-9 rounded-xl border border-border bg-card px-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Inspection">Inspection</option>
                              <option value="Repairing">Repairing</option>
                              <option value="Quality Check">Quality Check</option>
                              <option value="Ready">Ready</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenConfirmModal(r, r.status === "Pending" ? "Confirmed" : r.status)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
                              title="Add Additional Charges or Adjust Estimate"
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5" />
                              <span>{r.extra_charges && r.extra_charges > 0 ? "Edit Additional Charges" : "+ Additional Charges"}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteRepair(r.id, r.device)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive hover:text-white transition-all shadow-xs shrink-0"
                              title="Delete repair booking permanently"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* USERS & CUSTOMERS MANAGEMENT TAB */}
          {/* ========================================== */}
          {activeTab === "users" && (
            <div className="space-y-6">
              
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-card border border-primary/20 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
                    <Users className="h-3.5 w-3.5" /> Live MySQL Accounts
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground">Users & Customer Management</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage customer accounts, system administrators, and technicians.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-transform active:scale-95 shrink-0"
                >
                  <UserPlus className="h-4 w-4" /> Add New User
                </button>
              </div>

              {/* User Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 border-border/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold">Total Accounts</span>
                    <h4 className="text-2xl font-black text-foreground mt-0.5">{userList.length} Users</h4>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                </Card>

                <Card className="p-4 border-border/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold">Customers</span>
                    <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {userList.filter(u => u.role !== 'admin').length}
                    </h4>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </Card>

                <Card className="p-4 border-border/80 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold">System Admins</span>
                    <h4 className="text-2xl font-black text-amber-500 mt-0.5">
                      {userList.filter(u => u.role === 'admin').length}
                    </h4>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Shield className="h-5 w-5" />
                  </div>
                </Card>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone number..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {["All", "Customer", "Admin", "Technician"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        userRoleFilter === role
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              {usersLoading ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs">Fetching users from MySQL database...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-bold text-foreground">No matching user accounts</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground uppercase tracking-wider bg-muted/30">
                          <th className="p-4 font-bold">User</th>
                          <th className="p-4 font-bold">Contact Details</th>
                          <th className="p-4 font-bold">Role</th>
                          <th className="p-4 font-bold">Repairs Booked</th>
                          <th className="p-4 font-bold">Joined</th>
                          <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-black text-xs">
                                  {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                  <p className="font-extrabold text-foreground">{u.name}</p>
                                  <p className="text-[11px] text-muted-foreground">ID: #{u.id}</p>
                                </div>
                              </div>
                            </td>

                            <td className="p-4 text-muted-foreground space-y-0.5">
                              <p className="font-semibold text-foreground flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-primary" /> {u.phone || "—"}
                              </p>
                              <p className="text-[11px] flex items-center gap-1.5">
                                <Mail className="h-3 w-3 text-muted-foreground" /> {u.email}
                              </p>
                            </td>

                            <td className="p-4">
                              <select
                                value={u.role || "customer"}
                                onChange={(e) => handleRoleChangeInline(u.id, e.target.value)}
                                className={`h-7 rounded-lg border px-2 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-primary ${
                                  u.role === "admin"
                                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : u.role === "technician"
                                    ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                                <option value="technician">Technician</option>
                              </select>
                            </td>

                            <td className="p-4">
                              <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                                {u.repairs_count} Orders
                              </span>
                            </td>

                            <td className="p-4 text-muted-foreground text-xs">
                              {u.created_at}
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                                  title="Edit User"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                {u.email !== 'admin@gmail.com' && u.email !== 'admin@cellcare.com' && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    className="p-1.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10"
                                    title="Delete User"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* ---------- 1. ADD BRAND MODAL ---------- */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">Add Phone Brand</h3>
              <button
                onClick={() => setIsAddBrandOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddBrand} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Motorola, Nothing, Asus"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- 2. ADD MODEL MODAL ---------- */}
      {isAddModelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Add Model to {selectedBrand?.name}</h3>
                <p className="text-[11px] text-muted-foreground">Create a new device model</p>
              </div>
              <button
                onClick={() => setIsAddModelOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddModel} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">Model Name *</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 16 Pro Max, Galaxy Z Fold 6"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModelOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Save Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- 3. ADD MODEL SERVICE & CUSTOM PRICE MODAL ---------- */}
      {isAddModelServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Add Service for {selectedModel?.name}</h3>
                <p className="text-[11px] text-muted-foreground">Set custom repair price and part quality</p>
              </div>
              <button
                onClick={() => setIsAddModelServiceOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddModelService} className="py-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Service Type *</label>
                <select
                  value={newMSName}
                  onChange={(e) => {
                    setNewMSName(e.target.value);
                    if (e.target.value.includes("Screen") || e.target.value.includes("Display")) setNewMSCategory("Screen");
                    else if (e.target.value.includes("Battery")) setNewMSCategory("Battery");
                    else setNewMSCategory("Hardware");
                  }}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {serviceList.length > 0 ? (
                    serviceList.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Screen Replacement">Screen Replacement</option>
                      <option value="Battery Replacement">Battery Replacement</option>
                      <option value="Charging Port Repair">Charging Port Repair</option>
                      <option value="Back Glass Laser Repair">Back Glass Laser Repair</option>
                      <option value="Camera Module Fix">Camera Module Fix</option>
                      <option value="Speaker & Mic Fix">Speaker & Mic Fix</option>
                      <option value="Water Damage Treatment">Water Damage Treatment</option>
                      <option value="Motherboard IC Repair">Motherboard IC Repair</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Custom Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 12999"
                    value={newMSPrice}
                    onChange={(e) => setNewMSPrice(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Warranty</label>
                  <select
                    value={newMSWarranty}
                    onChange={(e) => setNewMSWarranty(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="6 Months">6 Months Warranty</option>
                    <option value="3 Months">3 Months Warranty</option>
                    <option value="1 Year">1 Year Warranty</option>
                    <option value="1 Month">1 Month Warranty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Part Quality & Grade</label>
                <input
                  type="text"
                  placeholder="e.g. OEM Super Retina OLED, 100% Original Pack"
                  value={newMSQuality}
                  onChange={(e) => setNewMSQuality(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModelServiceOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Save Service & Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- EDIT BRAND MODAL ---------- */}
      {isEditBrandOpen && editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Brand</h3>
                <p className="text-[11px] text-muted-foreground">Rename phone brand</p>
              </div>
              <button
                onClick={() => setIsEditBrandOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBrand} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">Brand Name *</label>
                <input
                  type="text"
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditBrandOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Update Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- EDIT MODEL MODAL ---------- */}
      {isEditModelOpen && editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Model</h3>
                <p className="text-[11px] text-muted-foreground">Rename device model</p>
              </div>
              <button
                onClick={() => setIsEditModelOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateModel} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">Model Name *</label>
                <input
                  type="text"
                  value={editModelName}
                  onChange={(e) => setEditModelName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  autoFocus
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModelOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Update Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- EDIT MODEL SERVICE & PRICE MODAL ---------- */}
      {isEditModelServiceOpen && editingModelService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Service & Pricing</h3>
                <p className="text-[11px] text-muted-foreground">Modify repair cost, warranty, and quality grade</p>
              </div>
              <button
                onClick={() => setIsEditModelServiceOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateModelService} className="py-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Service Name *</label>
                <input
                  type="text"
                  value={editMSName}
                  onChange={(e) => setEditMSName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Custom Price (₹) *</label>
                  <input
                    type="number"
                    value={editMSPrice}
                    onChange={(e) => setEditMSPrice(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Warranty</label>
                  <select
                    value={editMSWarranty}
                    onChange={(e) => setEditMSWarranty(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="6 Months">6 Months Warranty</option>
                    <option value="3 Months">3 Months Warranty</option>
                    <option value="1 Year">1 Year Warranty</option>
                    <option value="1 Month">1 Month Warranty</option>
                    <option value="No Warranty">No Warranty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Category</label>
                  <input
                    type="text"
                    value={editMSCategory}
                    onChange={(e) => setEditMSCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Part Quality & Grade</label>
                  <input
                    type="text"
                    value={editMSQuality}
                    onChange={(e) => setEditMSQuality(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModelServiceOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Update Service & Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- 4. ADD MASTER SERVICE MODAL ---------- */}
      {isAddMasterServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Add Master Service</h3>
                <p className="text-[11px] text-muted-foreground">Universal service name catalog</p>
              </div>
              <button
                onClick={() => setIsAddMasterServiceOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMasterService} className="py-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">Service Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Back Glass Laser Replacement"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">Choose Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { id: "smartphone", icon: Smartphone },
                    { id: "battery", icon: Battery },
                    { id: "camera", icon: Camera },
                    { id: "speaker", icon: Speaker },
                    { id: "plug", icon: Plug },
                    { id: "droplets", icon: Droplets },
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setNewServiceIcon(ic.id)}
                      className={`grid h-10 place-items-center rounded-xl border transition-all ${
                        newServiceIcon === ic.id
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <ic.icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMasterServiceOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Save Service Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- 5. ADD USER MODAL ---------- */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Add New User / Customer</h3>
                <p className="text-[11px] text-muted-foreground">Create account directly in MySQL database</p>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="py-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">First Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul"
                    value={newUFirstName}
                    onChange={(e) => setNewUFirstName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma"
                    value={newULastName}
                    onChange={(e) => setNewULastName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. rahul@gmail.com"
                  value={newUEmail}
                  onChange={(e) => setNewUEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={newUPhone}
                  onChange={(e) => setNewUPhone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Password *</label>
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    value={newUPassword}
                    onChange={(e) => setNewUPassword(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Role</label>
                  <select
                    value={newURole}
                    onChange={(e) => setNewURole(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">System Admin</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSavingUser && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- 6. EDIT USER MODAL ---------- */}
      {isEditUserOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit User: {editingUser.name}</h3>
                <p className="text-[11px] text-muted-foreground">Update MySQL account details</p>
              </div>
              <button
                onClick={() => setIsEditUserOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="py-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">First Name *</label>
                  <input
                    type="text"
                    value={editUFirstName}
                    onChange={(e) => setEditUFirstName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editULastName}
                    onChange={(e) => setEditULastName(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Email Address *</label>
                <input
                  type="email"
                  value={editUEmail}
                  onChange={(e) => setEditUEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  value={editUPhone}
                  onChange={(e) => setEditUPhone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Role</label>
                  <select
                    value={editURole}
                    onChange={(e) => setEditURole(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">System Admin</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep"
                    value={editUPassword}
                    onChange={(e) => setEditUPassword(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditUserOpen(false)}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSavingUser && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- 5. ADD / EDIT BANNER MODAL ---------- */}
      {(isAddBannerOpen || isEditBannerOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {isEditBannerOpen ? "Edit Advertisement Banner" : "Create New Advertisement Banner"}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Configured banner will immediately show on Customer App Home
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddBannerOpen(false);
                  setIsEditBannerOpen(false);
                  resetBannerForm();
                }}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="my-4">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Live App Preview
              </label>
              <div
                className={`p-5 rounded-2xl text-white flex items-center justify-between min-h-[110px] bg-gradient-to-r ${
                  bBgGradient === "purple"
                    ? "from-purple-700 via-indigo-600 to-pink-600"
                    : bBgGradient === "emerald"
                    ? "from-emerald-600 via-teal-600 to-green-700"
                    : bBgGradient === "amber"
                    ? "from-amber-600 via-orange-600 to-yellow-600"
                    : bBgGradient === "dark"
                    ? "from-slate-900 via-slate-800 to-slate-950 border border-slate-700"
                    : "from-blue-600 via-indigo-600 to-sky-700"
                } shadow-md`}
              >
                <div className="flex-1 pr-3 z-10">
                  {bBadge && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black uppercase mb-1 tracking-wider">
                      {bBadge}
                    </span>
                  )}
                  <h4 className="text-sm font-black text-white leading-tight">
                    {bTitle || "Your Promotional Headline Here"}
                  </h4>
                  <p className="text-[11px] text-white/80 font-medium mt-0.5 line-clamp-1">
                    {bSubtitle || "Supporting offer details, coupon codes or guarantees"}
                  </p>
                </div>
                {bImageUrl ? (
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-white/10 border border-white/20 shrink-0">
                    <img
                      src={bImageUrl.startsWith("http") ? bImageUrl : `http://127.0.0.1:8000${bImageUrl}`}
                      alt="Banner Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-white shrink-0">
                    <Megaphone className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={isEditBannerOpen ? handleUpdateBanner : handleCreateBanner}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Banner Title / Main Offer *</label>
                <input
                  type="text"
                  placeholder="e.g. Flat ₹500 Off Screen Repairs"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Subtitle / Details</label>
                  <input
                    type="text"
                    placeholder="e.g. Use Code FIX500 · 30-min doorstep fix"
                    value={bSubtitle}
                    onChange={(e) => setBSubtitle(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. FLASH DEAL, LIMITED TIME"
                    value={bBadge}
                    onChange={(e) => setBBadge(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Gradient Palette Picker */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">Color Palette / Gradient</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: "blue", label: "Electric Blue", class: "from-blue-600 to-sky-700" },
                    { id: "purple", label: "Vibrant Purple", class: "from-purple-700 to-pink-600" },
                    { id: "emerald", label: "Emerald Green", class: "from-emerald-600 to-green-700" },
                    { id: "amber", label: "Sunset Amber", class: "from-amber-600 to-yellow-600" },
                    { id: "dark", label: "Midnight Dark", class: "from-slate-900 to-slate-950" },
                  ].map((grad) => (
                    <button
                      key={grad.id}
                      type="button"
                      onClick={() => setBBgGradient(grad.id)}
                      className={`h-11 rounded-xl bg-gradient-to-r ${grad.class} flex items-center justify-center transition-all ${
                        bBgGradient === grad.id ? "ring-2 ring-primary ring-offset-2 scale-105 shadow-md" : "opacity-80 hover:opacity-100"
                      }`}
                      title={grad.label}
                    >
                      {bBgGradient === grad.id && <Check className="h-4 w-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action & Image */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Target Tap Action</label>
                  <select
                    value={bLinkType}
                    onChange={(e) => setBLinkType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="book">Open Repair Booking Flow</option>
                    <option value="sell">Open Sell Phone Flow</option>
                    <option value="buy">Open Buy Refurbished Phones</option>
                    <option value="external">External / Custom URL</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Display Priority Order</label>
                  <input
                    type="number"
                    value={bOrder}
                    onChange={(e) => setBOrder(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Photo Upload or URL */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Banner Image (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="/uploads/... or paste image URL"
                    value={bImageUrl}
                    onChange={(e) => setBImageUrl(e.target.value)}
                    className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <label className="h-10 px-3.5 rounded-xl border border-border bg-muted/60 hover:bg-muted text-xs font-bold text-foreground cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                    {bImageUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            setBImageUploading(true);
                            const res = await api.uploadImage(file);
                            if (res && res.url) {
                              setBImageUrl(res.url);
                              toast.success("Image uploaded to server!");
                            }
                          } catch (err) {
                            toast.error("Upload failed.");
                          } finally {
                            setBImageUploading(false);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bIsActiveCheck"
                  checked={bIsActive}
                  onChange={(e) => setBIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="bIsActiveCheck" className="text-xs font-bold text-foreground cursor-pointer">
                  Activate & Show on Mobile App Home Page immediately
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBannerOpen(false);
                    setIsEditBannerOpen(false);
                    resetBannerForm();
                  }}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBanner}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSavingBanner && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isEditBannerOpen ? "Update Banner" : "Publish Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- 6. CONFIRM ORDER & ADDITIONAL CHARGES MODAL ---------- */}
      {isConfirmModalOpen && confirmingRepair && (() => {
        const totalAddition = confirmAdditionalItems.reduce(
          (sum, item) => sum + (parseFloat(item.amount) || 0),
          0
        );
        const basePriceNum = parseFloat(confirmBasePrice) || 0;
        const finalCustomerTotal = basePriceNum + totalAddition;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" /> Confirm Order & Set Additional Charges
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Order #{confirmingRepair.id} · {confirmingRepair.device}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setConfirmingRepair(null);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Order Summary Header Card */}
              <div className="my-4 rounded-2xl bg-muted/40 p-4 border border-border/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-bold text-foreground">
                    {confirmingRepair.user?.name || confirmingRepair.customer_name || "Customer"} ({confirmingRepair.user?.phone || confirmingRepair.customer_phone || "—"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Device & Service:</span>
                  <span className="font-semibold text-foreground">{confirmingRepair.device} — {confirmingRepair.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reported Problem:</span>
                  <span className="font-semibold text-foreground">{confirmingRepair.problem}</span>
                </div>
              </div>

              <form onSubmit={handleSaveOrderConfirmation} className="space-y-4">
                {/* Base Repair Estimate */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    Base Repair Estimate (₹) *
                  </label>
                  <input
                    type="number"
                    value={confirmBasePrice}
                    onChange={(e) => setConfirmBasePrice(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                {/* Multiple Additional Charges Section */}
                <div className="space-y-2 pt-1 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Additional Charges (Add Multiple Items)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddAdditionalItem}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {confirmAdditionalItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border">
                        <span className="text-[11px] font-extrabold text-muted-foreground w-4 text-center">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          placeholder="Reason / Item (e.g. Display IC, Glue seal...)"
                          value={item.title}
                          onChange={(e) => handleUpdateAdditionalItem(item.id, "title", e.target.value)}
                          className="h-9 flex-1 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) => handleUpdateAdditionalItem(item.id, "amount", e.target.value)}
                            className="h-9 w-full rounded-lg border border-amber-500/40 bg-amber-500/5 pl-6 pr-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                          />
                        </div>
                        {confirmAdditionalItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalItem(item.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Button & Quick Presets */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAddAdditionalItem}
                      className="px-3 py-1.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> + Add Another Additional Charge
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">Quick Add:</span>
                      {[200, 500, 1000, 1500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setConfirmAdditionalItems((prev) => {
                              const last = prev[prev.length - 1];
                              if (last && (!last.amount || last.amount === "0")) {
                                return prev.map((it, idx) => idx === prev.length - 1 ? { ...it, amount: String(amt) } : it);
                              }
                              return [...prev, { id: String(Date.now()), title: "", amount: String(amt) }];
                            });
                          }}
                          className="px-2 py-0.5 rounded-lg border border-border bg-muted/60 text-[10px] font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">Order Status</label>
                  <select
                    value={confirmTargetStatus}
                    onChange={(e) => setConfirmTargetStatus(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Confirmed">Confirmed (Order Accepted)</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Repairing">Repairing</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Ready">Ready for Delivery / Pickup</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Total Calculation Card */}
                <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Base Price:</span>
                    <span className="font-semibold">{inr(basePriceNum)}</span>
                  </div>

                  {confirmAdditionalItems
                    .filter((item) => (parseFloat(item.amount) || 0) > 0)
                    .map((item, idx) => (
                      <div key={item.id} className="flex justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
                        <span>+ {item.title.trim() || `Additional Charge #${idx + 1}`}:</span>
                        <span className="font-bold">+{inr(parseFloat(item.amount) || 0)}</span>
                      </div>
                    ))}

                  {totalAddition > 0 && (
                    <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400 font-black pt-1 border-t border-amber-500/20">
                      <span>Total Additional Charges:</span>
                      <span>+{inr(totalAddition)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-black text-foreground pt-1 border-t border-primary/20">
                    <span>Final Total to Customer:</span>
                    <span className="text-primary text-base">
                      {inr(finalCustomerTotal)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setIsConfirmModalOpen(false);
                      setConfirmingRepair(null);
                    }}
                    className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingConfirm}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isSavingConfirm && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Confirm Order & Save ({inr(finalCustomerTotal)})
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
