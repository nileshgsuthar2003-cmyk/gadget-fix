// Fixly API Client connecting frontend with Laravel Backend

export const API_BASE_URL: string = (import.meta.env['VITE_API_BASE_URL'] as string) || "http://127.0.0.1:8000/api";

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("fixly_admin_token") : null;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`[API Client] Network error fetching ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Admin Auth
  async adminLogin(email: string, password: string) {
    return apiRequest<{ success: boolean; token?: string; error?: string; user?: any }>(
      "/auth/admin-login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
  },

  // Forgot Password via Email OTP
  async sendForgotOtp(email: string) {
    return apiRequest<{ success: boolean; message: string; debug_otp?: string; error?: string }>(
      "/auth/forgot-password/send-otp",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  },

  async verifyForgotOtp(email: string, otp: string) {
    return apiRequest<{ success: boolean; message: string; error?: string }>(
      "/auth/forgot-password/verify-otp",
      {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }
    );
  },

  async resetPasswordWithOtp(data: { email: string; otp: string; password: string }) {
    return apiRequest<{ success: boolean; message: string; error?: string }>(
      "/auth/forgot-password/reset",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  // User Profile
  async getMe(userId?: number) {
    return apiRequest<{ success: boolean; user?: any }>(`/auth/me${userId ? `?user_id=${userId}` : ''}`);
  },

  async updateProfile(data: { user_id?: number; first_name: string; last_name: string; email?: string; phone?: string; password?: string }) {
    return apiRequest<{ success: boolean; message: string; user?: any; error?: string }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Dynamic Admin Users Management
  async getAdminUsers(search?: string) {
    return apiRequest<{ success: boolean; users: any[]; stats: any }>(
      `/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`
    );
  },

  async createAdminUser(data: { first_name: string; last_name?: string; email: string; phone: string; password: string; role?: string }) {
    return apiRequest<{ success: boolean; message: string; user?: any; error?: string }>("/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateAdminUser(id: number | string, data: { first_name?: string; last_name?: string; email?: string; phone?: string; role?: string; password?: string }) {
    return apiRequest<{ success: boolean; message: string; user?: any; error?: string }>(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteAdminUser(id: number | string) {
    return apiRequest<{ success: boolean; message: string; error?: string }>(`/admin/users/${id}`, {
      method: "DELETE",
    });
  },

  // Dynamic Admin Repairs
  async getAdminRepairs() {
    return apiRequest<{ success: boolean; repairs: any[]; stats: any }>("/admin/repairs");
  },

  async updateRepairStatus(id: string, status: string) {
    return apiRequest<{ success: boolean; message: string; repair: any }>(
      `/admin/repairs/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );
  },

  // Dynamic Services Master
  async getServices() {
    return apiRequest<{ success: boolean; services: any[] }>("/services");
  },

  async createService(data: { name: string; icon?: string; starting_price?: number }) {
    return apiRequest<{ success: boolean; service: any; message: string }>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteService(id: string | number) {
    return apiRequest<{ success: boolean; message: string }>(`/services/${id}`, {
      method: "DELETE",
    });
  },

  // Dynamic Hierarchical Device Catalog: Brands -> Models -> Services & Pricing
  async getBrands() {
    return apiRequest<{ success: boolean; brands: any[] }>("/catalog/brands");
  },

  async createBrand(name: string, logo?: string) {
    return apiRequest<{ success: boolean; brand: any; message: string }>("/catalog/brands", {
      method: "POST",
      body: JSON.stringify({ name, logo }),
    });
  },

  async updateBrand(id: number | string, data: { name: string; logo?: string }) {
    return apiRequest<{ success: boolean; brand: any; message: string }>(`/catalog/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteBrand(id: number | string) {
    return apiRequest<{ success: boolean; message: string }>(`/catalog/brands/${id}`, {
      method: "DELETE",
    });
  },

  async getModels(brandId: number | string) {
    return apiRequest<{ success: boolean; models: any[] }>(`/catalog/brands/${brandId}/models`);
  },

  async createModel(brandId: number | string, name: string) {
    return apiRequest<{ success: boolean; model: any; message: string }>(
      `/catalog/brands/${brandId}/models`,
      {
        method: "POST",
        body: JSON.stringify({ name }),
      }
    );
  },

  async updateModel(id: number | string, data: { name: string; image?: string }) {
    return apiRequest<{ success: boolean; model: any; message: string }>(`/catalog/models/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteModel(id: number | string) {
    return apiRequest<{ success: boolean; message: string }>(`/catalog/models/${id}`, {
      method: "DELETE",
    });
  },

  async getModelServices(modelId: number | string) {
    return apiRequest<{ success: boolean; services: any[] }>(`/catalog/models/${modelId}/services`);
  },

  async createModelService(modelId: number | string, data: {
    service_name: string;
    price: number;
    category?: string;
    warranty?: string;
    part_quality?: string;
  }) {
    return apiRequest<{ success: boolean; model_service: any; message: string }>(
      `/catalog/models/${modelId}/services`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  async updateModelService(id: number | string, data: any) {
    return apiRequest<{ success: boolean; model_service: any; message: string }>(
      `/catalog/model-services/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  },

  async deleteModelService(id: number | string) {
    return apiRequest<{ success: boolean; message: string }>(`/catalog/model-services/${id}`, {
      method: "DELETE",
    });
  },

  // Dynamic Customers
  async getAdminCustomers() {
    return apiRequest<{ success: boolean; customers: any[] }>("/admin/customers");
  },
};
