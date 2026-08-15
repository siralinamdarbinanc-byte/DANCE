import { BookingRequest, BookingStatus, CentralAcademyContent, CrmCustomer, CrmInteraction, MediaAsset } from '../types';

const WORKER_BASE_URL = 'https://dance.sir-alinamdar-binanc.workers.dev';

// Automatically resolve API URL:
// When running on GitHub Pages (github.io) or if custom API URL is set, direct requests to Cloudflare Worker backend.
// In local dev/proxy environments, default to /api or VITE_API_URL.
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('github.io')) {
      return `${WORKER_BASE_URL}/api`;
    }
  }
  return ((import.meta as any).env?.VITE_API_URL as string) || '/api';
};

const API_BASE = getApiBaseUrl();

// Helper for authorized headers using JWT stored in localStorage
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth API
  async loginAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success && data.token) {
        localStorage.setItem('admin_auth_token', data.token);
        return { success: true, token: data.token, user: data.user };
      }

      if (res.status === 401) {
        return { success: false, error: 'نام کاربری یا رمز عبور اشتباه است.' };
      }

      return { success: false, error: (data && data.error) || 'نام کاربری یا رمز عبور اشتباه است.' };
    } catch (e) {
      console.error('Login network error:', e);
      return { success: false, error: 'ارتباط با سرور برقرار نشد.' };
    }
  },

  async verifyAuth(): Promise<boolean> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.valid) {
          return true;
        }
      }
      // If token is invalid or expired, remove it
      localStorage.removeItem('admin_auth_token');
      return false;
    } catch (e) {
      console.warn('API verifyAuth network error:', e);
      localStorage.removeItem('admin_auth_token');
      return false;
    }
  },

  // Bookings API
  async fetchBookings(): Promise<BookingRequest[] | null> {
    try {
      const res = await fetch(`${API_BASE}/bookings`, { headers: getHeaders() });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API fetchBookings failed, fallback to local');
    }
    return null;
  },

  async createBooking(booking: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>): Promise<BookingRequest | null> {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
      if (res.ok) {
        const data = await res.json();
        return data.booking || data;
      }
    } catch (e) {
      console.warn('API createBooking failed, saving locally');
    }
    return null;
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async deleteBooking(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // CRM API
  async fetchCrmCustomers(): Promise<CrmCustomer[]> {
    try {
      const res = await fetch(`${API_BASE}/crm/customers`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data.customers || [];
      }
    } catch (e) {
      console.warn('API fetchCrmCustomers failed');
    }
    return [];
  },

  async updateCustomer(
    phone: string,
    data: { internalNotes?: string; tags?: string[]; isArchived?: boolean; status?: BookingStatus }
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/crm/customers/${encodeURIComponent(phone)}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async updateCustomerNotes(phone: string, notes?: string, tags?: string[]): Promise<boolean> {
    return this.updateCustomer(phone, { internalNotes: notes, tags });
  },

  async setCustomerArchiveStatus(phone: string, isArchived: boolean): Promise<boolean> {
    return this.updateCustomer(phone, { isArchived });
  },

  async fetchInteractions(phone: string): Promise<CrmInteraction[]> {
    try {
      const res = await fetch(`${API_BASE}/crm/customers/${encodeURIComponent(phone)}/interactions`, {
        headers: getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API fetchInteractions failed');
    }
    return [];
  },

  async addInteraction(phone: string, note: string, type: CrmInteraction['type'] = 'note'): Promise<CrmInteraction | null> {
    try {
      const res = await fetch(`${API_BASE}/crm/customers/${encodeURIComponent(phone)}/interactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ note, type, author: 'مدیریت' }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API addInteraction failed');
    }
    return null;
  },

  // CMS Content Sync API
  async fetchContent(): Promise<CentralAcademyContent | null> {
    try {
      const res = await fetch(`${API_BASE}/content`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.home) return data;
      }
    } catch (e) {
      console.warn('API fetchContent failed');
    }
    return null;
  },

  async syncContent(content: CentralAcademyContent): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/content`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(content),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  // Health Check & Cloudflare Bindings Status
  async checkHealth(): Promise<{ status: string; hasD1: boolean; hasR2: boolean; r2Status?: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API health check error');
    }
    return { status: 'ok', hasD1: true, hasR2: false, r2Status: 'optional_disabled' };
  },

  // Media API (GitHub Repository Contents API Integration & R2/URL Support)
  async fetchMediaStatus(): Promise<{
    githubConfigured: boolean;
    owner: string;
    repo: string;
    branch: string;
    directories: string[];
    maxSizeBytes: number;
  }> {
    try {
      const res = await fetch(`${API_BASE}/media/status`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API fetchMediaStatus failed');
    }
    return {
      githubConfigured: false,
      owner: 'aliinndd',
      repo: 'dance',
      branch: 'main',
      directories: ['public/images', 'public/audio', 'public/videos'],
      maxSizeBytes: 104857600,
    };
  },

  async fetchMediaList(category?: string, search?: string): Promise<MediaAsset[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`${API_BASE}/media${queryString}`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data.media || [];
      }
    } catch (e) {
      console.warn('API fetchMediaList failed');
    }
    return [];
  },

  async uploadMedia(
    file: File,
    folder?: 'public/images' | 'public/audio' | 'public/videos',
    customFilename?: string
  ): Promise<{ success: boolean; asset?: MediaAsset; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
      if (customFilename) formData.append('filename', customFilename);

      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_auth_token') : null;

      const res = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true, asset: data.asset || data };
      }
      return { success: false, error: data.error || 'خطا در آپلود فایل به مخزن' };
    } catch (e: any) {
      console.error('File upload error:', e);
      return { success: false, error: e?.message || 'خطای شبکه در هنگام آپلود فایل' };
    }
  },

  async renameMedia(
    oldPath: string,
    newFilename: string,
    targetFolder?: string
  ): Promise<{ success: boolean; asset?: MediaAsset; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/media/rename`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ oldPath, newFilename, targetFolder }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, asset: data.asset };
      }
      return { success: false, error: data.error || 'خطا در تغییر نام فایل' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'خطای ارتباط با سرور' };
    }
  },

  async deleteMedia(pathOrId: string, sha?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const params = new URLSearchParams();
      params.append('path', pathOrId);
      if (sha) params.append('sha', sha);

      const res = await fetch(`${API_BASE}/media?${params.toString()}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      }
      return { success: false, error: data.error || 'خطا در حذف فایل' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'خطا در برقراری ارتباط' };
    }
  },

  async addMediaUrl(url: string, filename: string, fileType: 'image' | 'audio' | 'video'): Promise<MediaAsset | null> {
    try {
      const res = await fetch(`${API_BASE}/media/add-url`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ url, filename, fileType }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.asset || null;
      }
    } catch (e) {
      console.error('API addMediaUrl error:', e);
    }
    return null;
  },
};
