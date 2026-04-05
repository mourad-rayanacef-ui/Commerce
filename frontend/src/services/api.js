const API_BASE_URL = '/api';

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

// Image uploads (multipart — do not set Content-Type; browser sets boundary)
export const uploadsAPI = {
  uploadImage: async (file, token) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE_URL}/uploads/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        typeof data.detail === 'string'
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
            : 'Upload failed';
      throw new Error(msg);
    }
    return data.url;
  },
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
const getSalesDaily = (days = 30) =>
  fetch(`/api/sales/daily?days=${days}`).then((r) => r.json());

const getTopProducts = (limit = 10) =>
  fetch(`/api/sales/top-products?limit=${limit}`).then((r) => r.json());

const getInventoryStatus = () =>
  fetch('/api/inventory/status').then((r) => r.json());

const getLowStockItems = () =>
  getInventoryStatus().then((list) =>
    Array.isArray(list)
      ? list.filter((i) => i.status === 'Critical' || i.status === 'Low')
      : []
  );

const reorderProduct = async (product_id, quantity) => {
  const res = await fetch(`${API_BASE_URL}/inventory/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id, quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.detail === 'string' ? data.detail : 'Reorder failed');
  }
  return data;
};

const api = {
  authAPI,
  productsAPI,
  ordersAPI,
  uploadsAPI,
  chatAPI,
  salesAPI,
  inventoryAPI,
  forecastAPI,
  getSalesDaily,
  getTopProducts,
  getInventoryStatus,
  getLowStockItems,
  reorderProduct,
};

export default api;