import { Request, Comment, User, Metrics, RequestStatus, ActivityItem } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let accessToken: string | null = null;

export const api = {
  setAccessToken(token: string | null) {
    accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  },

  getAccessToken(): string | null {
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
    }
    return accessToken;
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const token = this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Login endpoint
  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Login failed' } }));
      throw new Error(error.error?.message || 'Login failed');
    }

    const data = await response.json();
    this.setAccessToken(data.accessToken);
    return data;
  },

  // Health check
  async health() {
    return this.request<{ status: string; timestamp: string }>('/health');
  },

  // User endpoints
  async getMe(): Promise<User> {
    return this.request<User>('/api/auth/me');
  },

  // Request endpoints
  async createRequest(data: { title: string; description: string }): Promise<Request> {
    return this.request<Request>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getRequests(filters?: { status?: string; category?: string }): Promise<Request[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    const query = params.toString();
    return this.request<Request[]>(`/api/requests${query ? `?${query}` : ''}`);
  },

  async getRequest(id: string): Promise<Request> {
    return this.request<Request>(`/api/requests/${id}`);
  },

  async updateRequestStatus(id: string, status: RequestStatus): Promise<Request> {
    return this.request<Request>(`/api/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async addComment(requestId: string, message: string): Promise<Comment> {
    return this.request<Comment>(`/api/requests/${requestId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // Metrics endpoint
  async getMetrics(): Promise<Metrics> {
    return this.request<Metrics>('/api/metrics');
  },

  // Activity feed
  async getActivity(limit?: number): Promise<{ items: ActivityItem[] }> {
    const q = limit ? `?limit=${limit}` : '';
    return this.request<{ items: ActivityItem[] }>(`/api/activity${q}`);
  },
};
