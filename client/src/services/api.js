const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('launchpad_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Health
  async getHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch (err) {
      console.warn('API health check error:', err);
      return { status: 'offline', database: { mode: 'offline' } };
    }
  },

  // Opportunities
  async getOpportunities(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });

    const res = await fetch(`${BASE_URL}/opportunities?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to load opportunities');
    return await res.json();
  },

  async getOpportunityById(id) {
    const res = await fetch(`${BASE_URL}/opportunities/${id}`);
    if (!res.ok) throw new Error('Opportunity not found');
    return await res.json();
  },

  async getFeaturedOpportunities() {
    const res = await fetch(`${BASE_URL}/opportunities/featured`);
    if (!res.ok) throw new Error('Failed to load featured opportunities');
    return await res.json();
  },

  // Events
  async getEvents(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });

    const res = await fetch(`${BASE_URL}/events?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to load events');
    return await res.json();
  },

  async getEventById(id) {
    const res = await fetch(`${BASE_URL}/events/${id}`);
    if (!res.ok) throw new Error('Event not found');
    return await res.json();
  },

  // Open Source
  async getOpenSource(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });

    const res = await fetch(`${BASE_URL}/open-source?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Failed to load open source programs');
    return await res.json();
  },

  async getOpenSourceById(id) {
    const res = await fetch(`${BASE_URL}/open-source/${id}`);
    if (!res.ok) throw new Error('Open source program not found');
    return await res.json();
  },

  // User Tracking
  async getMyOpportunities(status) {
    const url = status && status !== 'All' 
      ? `${BASE_URL}/me/opportunities?status=${status}` 
      : `${BASE_URL}/me/opportunities`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load tracked opportunities');
    return await res.json();
  },

  async saveOpportunity(data) {
    const res = await fetch(`${BASE_URL}/me/opportunities`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save opportunity');
    return await res.json();
  },

  async updateOpportunityStatus(id, applicationStatus, notes) {
    const res = await fetch(`${BASE_URL}/me/opportunities/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ applicationStatus, notes }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  },

  async removeOpportunity(id) {
    const res = await fetch(`${BASE_URL}/me/opportunities/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete opportunity');
    return await res.json();
  },

  // User & Profile
  async getProfile() {
    const res = await fetch(`${BASE_URL}/auth/profile`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return await res.json();
  },

  async updateProfile(data) {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return await res.json();
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return await res.json();
  },

  async register(data) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    return await res.json();
  }
};
