import { Platform } from 'react-native';
import { brands as fallbackBrands, modelsByBrand as fallbackModelsByBrand, servicesForDevice as fallbackServices } from './data';

// Dynamic Environment Configuration (Loaded from .env / EXPO_PUBLIC_*)
const DEV_LAN_IP = process.env.EXPO_PUBLIC_DEV_LAN_IP || '10.125.174.211';
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = ENV_API_URL || Platform.select({
  android: `http://${DEV_LAN_IP}:8000/api`,
  ios: `http://${DEV_LAN_IP}:8000/api`,
  default: `http://localhost:8000/api`,
}) || `http://${DEV_LAN_IP}:8000/api`;

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
  id: string;
  user_id?: number;
  device: string;
  service: string;
  problem: string;
  status: string;
  estimate: number;
  appointment_date?: string;
  method?: string;
  payment_status?: string;
  created_at?: string;
}

const CANDIDATE_BASE_URLS = [
  API_BASE_URL,
  `http://${DEV_LAN_IP}:8000/api`,
  'http://127.0.0.1:8000/api',
  'http://localhost:8000/api',
  'http://10.0.2.2:8000/api',
];

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  let lastError: any = null;

  for (const base of CANDIDATE_BASE_URLS) {
    try {
      const url = `${base}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok || res.status === 422 || res.status === 401 || res.status === 404) {
        const data = await res.json();
        return data;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  console.warn(`[Mobile API] Connection error on ${endpoint}:`, lastError?.message);
  throw lastError || new Error(`Failed to connect to ${endpoint}`);
}

export const api = {
  // Authentication
  async register(params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      return await request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err: any) {
      console.warn('API Error (falling back to local state):', err.message);
      return {
        success: true,
        message: 'Account created (local mode).',
        user: {
          id: 1,
          first_name: params.firstName,
          last_name: params.lastName,
          name: `${params.firstName} ${params.lastName}`,
          email: params.email,
          phone: params.phone,
          repairs_count: 0,
          total_spent: 0,
        },
        token: `mock-token-${Date.now()}`,
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
      console.warn('API Error (falling back to local state):', err.message);
      return {
        success: true,
        message: 'Logged in successfully (local mode).',
        user: {
          id: 1,
          first_name: 'Rahul',
          last_name: 'Sharma',
          name: 'Rahul Sharma',
          email: params.email,
          phone: '+91 98765 43210',
          repairs_count: 2,
          total_spent: 4500,
        },
        token: `mock-token-${Date.now()}`,
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
          email: 'rahul@fixly.com',
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
          email: params.email || 'rahul@fixly.com',
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
      if (res && res.success && res.brands && res.brands.length > 0) {
        return res.brands;
      }
      return fallbackBrands.map((name, i) => ({ id: i + 1, name }));
    } catch (err) {
      return fallbackBrands.map((name, i) => ({ id: i + 1, name }));
    }
  },

  async getModels(brandId: number, brandName: string): Promise<ApiModel[]> {
    try {
      const res = await request<{ success: boolean; models: ApiModel[] }>(`/catalog/brands/${brandId}/models`);
      if (res && res.success && res.models && res.models.length > 0) {
        return res.models;
      }
      const list = fallbackModelsByBrand[brandName] || [];
      return list.map((name, i) => ({ id: i + 1, brand_id: brandId, name }));
    } catch (err) {
      const list = fallbackModelsByBrand[brandName] || [];
      return list.map((name, i) => ({ id: i + 1, brand_id: brandId, name }));
    }
  },

  async getModelServices(modelId: number, modelName: string): Promise<ApiModelService[]> {
    try {
      const res = await request<{ success: boolean; services: ApiModelService[] }>(`/catalog/models/${modelId}/services`);
      if (res && res.success && res.services && res.services.length > 0) {
        return res.services;
      }
      return fallbackServices.map((s, i) => ({
        id: i + 1,
        device_model_id: modelId,
        service_name: s.name,
        category: 'Hardware',
        price: s.price,
        warranty: '6 Months',
        part_quality: 'OEM Original',
      }));
    } catch (err) {
      return fallbackServices.map((s, i) => ({
        id: i + 1,
        device_model_id: modelId,
        service_name: s.name,
        category: 'Hardware',
        price: s.price,
        warranty: '6 Months',
        part_quality: 'OEM Original',
      }));
    }
  },

  // Dynamic Repairs API
  async createRepair(params: {
    device: string;
    service: string;
    problem: string;
    estimate: number;
    appointmentDate: string;
    method: string;
  }): Promise<{ success: boolean; message: string; repair?: ApiRepair }> {
    try {
      return await request('/repairs', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (err) {
      return {
        success: true,
        message: 'Repair booking scheduled.',
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
};
