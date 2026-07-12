const API_BASE_URL = 'http://localhost:5000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('assetflow_token');
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data as T;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  serialNumber: string;
  location: string;
  status: 'AVAILABLE' | 'ALLOCATED' | 'RESERVED' | 'UNDER_MAINTENANCE' | 'LOST' | 'RETIRED' | 'DISPOSED';
  category: { id: string; name: string };
  createdAt: string;
}

export interface AssetsResponse {
  success: boolean;
  assets?: Asset[];
  message?: string;
}

export interface CreateAssetResponse {
  success: boolean;
  asset?: Asset;
  message?: string;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    signup: (name: string, email: string, password: string) =>
      request<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    getProfile: () =>
      request<AuthResponse>('/auth/me', {
        method: 'GET',
      }),
  },
  assets: {
    getAll: () =>
      request<AssetsResponse>('/assets', {
        method: 'GET',
      }),
    create: (assetData: {
      name: string;
      assetTag: string;
      serialNumber: string;
      location: string;
      status: string;
      categoryName: string;
    }) =>
      request<CreateAssetResponse>('/assets', {
        method: 'POST',
        body: JSON.stringify(assetData),
      }),
  },
};
