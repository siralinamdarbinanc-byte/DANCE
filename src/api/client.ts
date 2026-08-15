import { BookingRequest, BookingStatus, CentralAcademyContent, CrmCustomer, CrmInteraction, MediaAsset } from '../types';

const API_BASE = '/api';

// Helper for authorized headers
const getHeaders = () => {
  const token = sessionStorage.getItem('admin_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth API
  async loginAdmin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem('admin_auth_token', data.token);
        return { success: true, token: data.token };
      }
      return { success: false, error: data.error || 'رمز عبور نامعتبر است' };
    } catch (e) {
      // Local fallback for dev/demo mode
      if (password === 'admin' || password === '123456' || password === 'admin1234') {
        const dummyToken = 'local_admin_session_token_' + Date.now();
        sessionStorage.setItem('admin_auth_token', dummyToken);
        return { success: true, token: dummyToken };
      }
      return { success: false, error: 'خطا در ارتباط با سرور احراز هویت' };
    }
  },

  async verifyAuth(): Promise<boolean> {
    const token = sessionStorage.getItem('admin_auth_token');
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: getHeaders(),
      });
      return res.ok;
    } catch (e) {
      return true;
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

  async updateCustomerNotes(phone: string, notes?: string, tags?: string[]): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/crm/customers/${encodeURIComponent(phone)}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ internalNotes: notes, tags }),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
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

  // Media API (R2 Cloudflare Integration)
  async fetchMediaList(): Promise<MediaAsset[]> {
    try {
      const res = await fetch(`${API_BASE}/media`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : data.media || [];
      }
    } catch (e) {
      console.warn('API fetchMediaList failed');
    }
    return [];
  },

  async uploadMedia(file: File): Promise<MediaAsset | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = sessionStorage.getItem('admin_auth_token');

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('File upload error:', e);
    }
    return null;
  },

  async deleteMedia(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/media/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },
};
