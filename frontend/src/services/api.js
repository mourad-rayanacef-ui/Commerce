const API_BASE_URL = 'http://localhost:8000/api';

// Auth API calls
export const authAPI = {
  register: (email, username, password, full_name) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, full_name })
    }).then(r => r.json()),

  login: (username, password) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(r => r.json()),

  getCurrentUser: (token) =>
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
};

// Products API calls
export const productsAPI = {
  list: (search = '', skip = 0, limit = 10) =>
    fetch(`${API_BASE_URL}/products?search=${search}&skip=${skip}&limit=${limit}`)
      .then(r => r.json()),

  get: (id) =>
    fetch(`${API_BASE_URL}/products/${id}`)
      .then(r => r.json()),

  create: (product, token) =>
    fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(product)
    }).then(r => r.json()),

  update: (id, product, token) =>
    fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(product)
    }).then(r => r.json())
};

// Orders API calls
export const ordersAPI = {
  create: (order, token) =>
    fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(order)
    }).then(r => r.json()),

  list: (token) =>
    fetch(`${API_BASE_URL}/orders/my-orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  get: (id, token) =>
    fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
};

// Chat API calls
export const chatAPI = {
  sendMessage: (message, token) =>
    fetch(`${API_BASE_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(message)
    }).then(r => r.json()),

  getConversations: (token) =>
    fetch(`${API_BASE_URL}/chat/conversations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  getMessages: (userId, token) =>
    fetch(`${API_BASE_URL}/chat/messages/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  markAsRead: (messageId, token) =>
    fetch(`${API_BASE_URL}/chat/messages/${messageId}/read`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),

  getUnreadCount: (token) =>
    fetch(`${API_BASE_URL}/chat/unread-count`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
};

// Sales API calls
export const salesAPI = {
  daily: () =>
    fetch(`${API_BASE_URL}/sales/daily`)
      .then(r => r.json()),

  topProducts: () =>
    fetch(`${API_BASE_URL}/sales/top-products`)
      .then(r => r.json())
};

// Inventory API calls
export const inventoryAPI = {
  status: () =>
    fetch(`${API_BASE_URL}/inventory/status`)
      .then(r => r.json()),

  reorder: (data) =>
    fetch(`${API_BASE_URL}/inventory/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json())
};

// Forecast API calls
export const forecastAPI = {
  demand: () =>
    fetch(`${API_BASE_URL}/forecast/demand`)
      .then(r => r.json())
};
const api = {
  authAPI,
  productsAPI,
  ordersAPI,
  chatAPI,
  salesAPI,
  inventoryAPI,
  forecastAPI
};

export default api;