const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getAuthToken() {
  return localStorage.getItem('securescan_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('securescan_token', token);
  } else {
    localStorage.removeItem('securescan_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('securescan_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('securescan_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('securescan_user');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const user = getStoredUser();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (user?.id) {
    headers['x-user-id'] = user.id;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || `HTTP error ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `HTTP error ${res.status}`);
    }
    return text;
  }
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => apiRequest('/auth/me'),
  getUsers: () => apiRequest('/auth/users'),
  switchUser: (userId) => apiRequest('/auth/switch-user', { method: 'POST', body: JSON.stringify({ userId }) }),
  updateProfile: (data) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Scan
  scan: (url) => apiRequest('/scan', { method: 'POST', body: JSON.stringify({ url }) }),
  getScan: (id) => apiRequest(`/scan/${id}`),
  getRecentScans: (limit = 10) => apiRequest(`/scan/list/recent?limit=${limit}`),

  // Sites
  getSites: () => apiRequest('/sites'),
  addSite: (data) => apiRequest('/sites', { method: 'POST', body: JSON.stringify(data) }),
  deleteSite: (id) => apiRequest(`/sites/${id}`, { method: 'DELETE' }),
  rescanSite: (id) => apiRequest(`/sites/${id}/scan`, { method: 'POST' }),
  checkAllSites: () => apiRequest('/sites/check-all', { method: 'POST' }),

  // History
  getHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/history?${query}`);
  },
  deleteHistoryItem: (id) => apiRequest(`/history/${id}`, { method: 'DELETE' }),
  clearHistory: () => apiRequest('/history', { method: 'DELETE' }),

  // Alerts & Notifications
  getAlertPreferences: () => apiRequest('/alerts/preferences'),
  updateAlertPreferences: (data) => apiRequest('/alerts/preferences', { method: 'PUT', body: JSON.stringify(data) }),
  getNotifications: () => apiRequest('/alerts/notifications'),
  markAllNotificationsRead: () => apiRequest('/alerts/notifications/read-all', { method: 'PUT' }),
  markNotificationRead: (id) => apiRequest(`/alerts/notifications/${id}/read`, { method: 'PUT' }),
  deleteNotification: (id) => apiRequest(`/alerts/notifications/${id}`, { method: 'DELETE' }),

  // Admin
  getTeamMembers: () => apiRequest('/admin/members'),
  inviteMember: (data) => apiRequest('/admin/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMemberRole: (id, role) => apiRequest(`/admin/members/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  removeMember: (id) => apiRequest(`/admin/members/${id}`, { method: 'DELETE' }),
  getAuditLogs: () => apiRequest('/admin/audit-logs'),

  // API Keys
  getApiKeys: () => apiRequest('/apikeys'),
  generateApiKey: (name) => apiRequest('/apikeys', { method: 'POST', body: JSON.stringify({ name }) }),
  revokeApiKey: (id) => apiRequest(`/apikeys/${id}`, { method: 'DELETE' })
};
