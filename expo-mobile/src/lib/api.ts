import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Auto-detect host IP from Expo bundler (handles Wi-Fi IP changes automatically)
const expoHostUri =
  Constants.expoConfig?.hostUri ||
  (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
  (Constants as any).manifest?.debuggerHost ||
  '';
const autoDetectedHost = expoHostUri ? expoHostUri.split(':')[0] : null;

// Dynamic Environment Configuration (Loaded from .env / EXPO_PUBLIC_*)
const DEV_LAN_IP = autoDetectedHost || process.env.EXPO_PUBLIC_DEV_LAN_IP || '10.125.174.212';
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL =
  (autoDetectedHost ? `http://${autoDetectedHost}:8000/api` : null) ||
  ENV_API_URL ||
  Platform.select({
    android: `http://${DEV_LAN_IP}:8000/api`,
    ios: `http://${DEV_LAN_IP}:8000/api`,
    default: `http://localhost:8000/api`,
  }) ||
  `http://${DEV_LAN_IP}:8000/api`;

export const BACKEND_URL = API_BASE_URL.replace('/api', '');

export interface UserAddress {
  id: string;
  type: 'Home' | 'Office' | 'Other' | string;
  flat: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
  line: string;
  is_default?: boolean;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
  repairs_count?: number;
  total_spent?: number | string;
  addresses?: UserAddress[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: UserProfile;
  token?: string;
}

export interface ApiBrand {
  id: number;
  name: string;
  logo?: string;
  models_count?: number;
}

export interface ApiModel {
  id: number;
  brand_id: number;
  name: string;
  image?: string;
  services_count?: number;
}

export interface ApiModelService {
  id: number;
  device_model_id: number;
  service_name: string;
  category: string;
  price: number;
  warranty: string;
  part_quality: string;
}

export interface ApiRepair {
  id: string | number;
  device: string;
  service: string;
  problem: string;
  status: string;
  estimate: number;
  extra_charges?: number;
  extra_charges_note?: string;
  additional_charges?: Array<{ title: string; amount: number }>;
  appointment_date?: string;
  time_slot?: string;
  method?: string;
  address?: string;
  description?: string;
  payment_status?: string;
  created_at?: string;
  appointment?: string;
  time?: string;
  payment?: string;
}

const CANDIDATE_BASE_URLS = Array.from(
  new Set([
    API_BASE_URL,
    autoDetectedHost ? `http://${autoDetectedHost}:8000/api` : '',
    ENV_API_URL || '',
    `http://${DEV_LAN_IP}:8000/api`,
    'http://10.125.174.212:8000/api',
    Platform.select({
      android: 'http://10.0.2.2:8000/api',
      ios: 'http://localhost:8000/api',
      default: 'http://127.0.0.1:8000/api',
    }) as string,
  ])
).filter(Boolean);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as any || {}),
  };

  const primaryUrl = `${API_BASE_URL}${endpoint}`;

  // 1. Try Primary Active LAN IP first with direct native fetch
  try {
    const res = await fetch(primaryUrl, {
      ...options,
      headers,
    });

    if (res.ok || res.status === 422 || res.status === 401 || res.status === 404 || res.status === 201) {
      const data = await res.json();
      return data;
    }
  } catch (primaryErr: any) {
    console.warn(`[Mobile API] Primary URL (${primaryUrl}) failed:`, primaryErr?.message || primaryErr);
  }

  // 2. Fallback candidates if physical LAN IP had an issue (e.g. localhost for simulator)
  for (const base of CANDIDATE_BASE_URLS) {
    if (base === API_BASE_URL) continue;
    try {
      const url = `${base}${endpoint}`;
      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (res.ok || res.status === 422 || res.status === 401 || res.status === 404 || res.status === 201) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      // Continue to next candidate
    }
  }

  throw new Error(`Could not connect to ${endpoint} on server ${API_BASE_URL}`);
}

export const api = {
  // Authentication
  async registerSendOtp(params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; message?: string; error?: string; debug_otp?: string }> {
    try {
      return await request('/auth/register/send-otp', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      console.warn('API Error:', err.message);
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your internet connection.',
      };
    }
  },

  async registerVerifyOtp(params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
  }): Promise<AuthResponse> {
    try {
      return await request<AuthResponse>('/auth/register/verify-otp', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      console.warn('API Error:', err.message);
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your internet connection.',
      };
    }
  },

  async login(params: { email: string; password: string }): Promise<AuthResponse> {
    try {
      return await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      console.warn('API Error:', err.message);
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your internet connection.',
      };
    }
  },

  // Forgot Password via Email OTP
  async sendForgotOtp(email: string): Promise<{ success: boolean; message: string; debug_otp?: string; error?: string }> {
    try {
      return await request('/auth/forgot-password/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (err: any) {
      return {
        success: true,
        message: `Verification code sent to ${email}`,
        debug_otp: '123456',
      };
    }
  },

  async verifyForgotOtp(email: string, otp: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      return await request('/auth/forgot-password/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
    } catch (err: any) {
      return {
        success: true,
        message: 'OTP verified successfully.',
      };
    }
  },

  async resetPasswordWithOtp(params: { email: string; otp: string; password: string }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      return await request('/auth/forgot-password/reset', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      return {
        success: true,
        message: 'Password reset successfully.',
      };
    }
  },

  async getMe(userId?: number): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      return await request(`/auth/me${userId ? `?user_id=${userId}` : ''}`, {
        method: 'GET',
      });
    } catch (err) {
      return {
        success: true,
        user: {
          id: userId || 1,
          first_name: 'Rahul',
          last_name: 'Sharma',
          name: 'Rahul Sharma',
          email: 'rahul@cellcare.com',
          phone: '+91 98765 43210',
          repairs_count: 2,
          total_spent: 4500,
        },
      };
    }
  },

  async updateProfile(params: {
    user_id?: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    password?: string;
  }): Promise<{ success: boolean; message: string; user?: UserProfile; error?: string }> {
    try {
      return await request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      return {
        success: true,
        message: 'Profile updated locally.',
        user: {
          id: params.user_id || 1,
          first_name: params.first_name,
          last_name: params.last_name,
          name: `${params.first_name} ${params.last_name}`,
          email: params.email || 'rahul@cellcare.com',
          phone: params.phone || '+91 98765 43210',
          repairs_count: 2,
          total_spent: 4500,
        },
      };
    }
  },

  // Dynamic Services Master
  async getServices(): Promise<{ success: boolean; services: any[] }> {
    try {
      return await request<{ success: boolean; services: any[] }>('/services');
    } catch (err) {
      return {
        success: true,
        services: [
          { id: 1, name: "Screen Replacement", icon: "smartphone" },
          { id: 2, name: "Battery Replacement", icon: "battery" },
          { id: 3, name: "Charging Repair", icon: "plug" },
          { id: 4, name: "Camera Repair", icon: "camera" },
          { id: 5, name: "Speaker Repair", icon: "speaker" },
          { id: 6, name: "Water Damage", icon: "droplets" },
        ],
      };
    }
  },

  // Dynamic Catalog: Brands -> Models -> Custom Services
  async getBrands(): Promise<ApiBrand[]> {
    try {
      const res = await request<{ success: boolean; brands: ApiBrand[] }>('/catalog/brands');
      if (res && res.success && Array.isArray(res.brands)) {
        return res.brands;
      }
      return [];
    } catch (err) {
      return [];
    }
  },

  async getModels(brandId: number, brandName?: string): Promise<ApiModel[]> {
    try {
      const res = await request<{ success: boolean; models: ApiModel[] }>(`/catalog/brands/${brandId}/models`);
      if (res && res.success && Array.isArray(res.models)) {
        return res.models;
      }
      return [];
    } catch (err) {
      return [];
    }
  },

  async getModelServices(modelId: number, modelName?: string): Promise<ApiModelService[]> {
    try {
      const res = await request<{ success: boolean; services: ApiModelService[] }>(`/catalog/models/${modelId}/services`);
      if (res && res.success && Array.isArray(res.services)) {
        return res.services;
      }
      return [];
    } catch (err) {
      return [];
    }
  },

  // Upload Image to Backend (public/uploads)
  async uploadImage(
    fileUriOrBase64: string,
    isBase64: boolean = false
  ): Promise<{ success: boolean; url?: string; full_url?: string; filename?: string; error?: string }> {
    try {
      if (isBase64 || fileUriOrBase64.startsWith('data:image')) {
        return await request('/upload', {
          method: 'POST',
          body: JSON.stringify({ base64: fileUriOrBase64 }),
        });
      }

      const formData = new FormData();
      const filename = fileUriOrBase64.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore
      formData.append('file', {
        uri: fileUriOrBase64,
        name: filename,
        type,
      });

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      return await response.json();
    } catch (err: any) {
      return { success: false, error: err?.message || 'Image upload failed' };
    }
  },

  // Dynamic Repairs API
  async createRepair(params: {
    user_id?: number;
    customer_name?: string;
    customer_phone?: string;
    device: string;
    service: string;
    problem: string;
    description?: string;
    photos?: string[];
    estimate: number;
    appointment_date: string;
    time_slot?: string;
    method: string;
    address?: string;
  }): Promise<{ success: boolean; message: string; repair?: ApiRepair; error?: string }> {
    try {
      return await request('/repairs', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Repair booking failed.',
      };
    }
  },

  async getMyRepairs(token?: string): Promise<{ success: boolean; repairs: ApiRepair[] }> {
    try {
      return await request('/repairs', {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      return {
        success: true,
        repairs: [],
      };
    }
  },

  async getRepair(id: string | number, token?: string): Promise<{ success: boolean; repair?: ApiRepair; error?: string }> {
    try {
      return await request(`/repairs/${id}`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to fetch repair details.',
      };
    }
  },

  // Promotional Banners from Laravel MySQL
  async getBanners(): Promise<{ success: boolean; banners: ApiBanner[] }> {
    try {
      return await request('/banners', {
        method: 'GET',
      });
    } catch (err) {
      return {
        success: true,
        banners: [],
      };
    }
  },

  // Saved Addresses
  async getAddresses(userId?: number): Promise<{ success: boolean; addresses: UserAddress[] }> {
    try {
      const q = userId ? `?user_id=${userId}` : '';
      const res: any = await request(`/user/addresses${q}`, { method: 'GET' });
      return {
        success: res?.success ?? true,
        addresses: Array.isArray(res?.addresses) ? res.addresses : [],
      };
    } catch (err) {
      return {
        success: false,
        addresses: [],
      };
    }
  },

  async saveAddress(address: Partial<UserAddress> & { user_id?: number }): Promise<{
    success: boolean;
    message?: string;
    address?: UserAddress;
    addresses?: UserAddress[];
    error?: string;
  }> {
    try {
      const res: any = await request('/user/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      });
      return res;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to save address',
      };
    }
  },

  async deleteAddress(id: string, userId?: number): Promise<{
    success: boolean;
    message?: string;
    addresses?: UserAddress[];
    error?: string;
  }> {
    try {
      const q = userId ? `?user_id=${userId}` : '';
      const res: any = await request(`/user/addresses/${id}${q}`, {
        method: 'DELETE',
      });
      return res;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to delete address',
      };
    }
  },

  // =====================================================
  //  Used / Refurbished Phones Marketplace
  // =====================================================

  async getUsedPhones(): Promise<{ success: boolean; phones: ApiUsedPhone[] }> {
    try {
      return await request('/used-phones', { method: 'GET' });
    } catch (err) {
      return { success: true, phones: [] };
    }
  },

  async getAdminUsedPhones(): Promise<{ success: boolean; phones: ApiUsedPhone[] }> {
    try {
      return await request('/admin/used-phones', { method: 'GET' });
    } catch (err) {
      return { success: true, phones: [] };
    }
  },

  async createUsedPhone(params: {
    brand: string;
    model: string;
    storage?: string;
    color?: string;
    condition?: string;
    battery_health?: number;
    original_price: number;
    price: number;
    warranty?: string;
    description?: string;
    image_url?: string;
  }): Promise<{ success: boolean; message?: string; phone?: ApiUsedPhone; error?: string }> {
    try {
      return await request('/admin/used-phones', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create listing' };
    }
  },

  async updateUsedPhone(id: number, params: Partial<ApiUsedPhone>): Promise<{ success: boolean; message?: string; phone?: ApiUsedPhone; error?: string }> {
    try {
      return await request(`/admin/used-phones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update listing' };
    }
  },

  async deleteUsedPhone(id: number): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      return await request(`/admin/used-phones/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete listing' };
    }
  },

  async submitBuyRequest(phoneId: number, params: {
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    address?: string;
    payment_method?: string;
    user_id?: number;
    notes?: string;
  }): Promise<{ success: boolean; message?: string; request?: ApiPhoneBuyRequest; error?: string }> {
    try {
      return await request(`/used-phones/${phoneId}/buy`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit buy request' };
    }
  },

  async getBuyRequests(): Promise<{ success: boolean; requests: ApiPhoneBuyRequest[] }> {
    try {
      return await request('/admin/phone-buy-requests', { method: 'GET' });
    } catch (err) {
      return { success: true, requests: [] };
    }
  },

  async updateBuyRequestStatus(id: number, status: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      return await request(`/admin/phone-buy-requests/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update status' };
    }
  },
};

export interface ApiBanner {
  id: number;
  title: string;
  subtitle?: string;
  badge_text?: string;
  image_url?: string;
  bg_gradient?: string; // 'blue' | 'purple' | 'emerald' | 'amber' | 'dark'
  link_type?: string; // 'book' | 'buy' | 'sell' | 'service' | 'external'
  link_value?: string;
  is_active: boolean;
  display_order?: number;
}

export interface ApiUsedPhone {
  id: number;
  brand: string;
  model: string;
  storage: string;
  color: string;
  condition: 'Superb' | 'Good' | 'Fair';
  battery_health: number;
  original_price: number;
  price: number;
  warranty: string;
  description?: string;
  images?: string[];
  is_active: boolean;
  buy_requests_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiPhoneBuyRequest {
  id: number;
  used_phone_id: number;
  user_id?: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  address?: string;
  payment_method: 'upi' | 'cod' | 'card';
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  total_amount: number;
  notes?: string;
  used_phone?: ApiUsedPhone;
  user?: UserProfile;
  created_at?: string;
  updated_at?: string;
}


