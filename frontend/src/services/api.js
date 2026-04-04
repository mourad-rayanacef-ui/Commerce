const API_BASE_URL = '/api';

function authHeaders(token) {
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export const api = {
  // ─── Existing Admin APIs ──────────────────────────────────────────────────
  async getSalesDaily(days = 30) {
    const res = await fetch(`${API_BASE_URL}/sales/daily?days=${days}`);
    return res.json();
  },
  async getTopProducts(limit = 10) {
    const res = await fetch(`${API_BASE_URL}/sales/top-products?limit=${limit}`);
    return res.json();
  },
  async getInventoryStatus() {
    const res = await fetch(`${API_BASE_URL}/inventory/status`);
    return res.json();
  },
  async getForecast() {
    const res = await fetch(`${API_BASE_URL}/forecast/demand`);
    return res.json();
  },
  async reorderProduct(productId, quantity) {
    const res = await fetch(`${API_BASE_URL}/inventory/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return res.json();
  },
  async getForecastWithWindow(window = 7) {
    const res = await fetch(`${API_BASE_URL}/forecast/demand?window=${window}`);
    return res.json();
  },
  async getProductForecast(productId, days = 30) {
    const res = await fetch(`${API_BASE_URL}/forecast/product-forecast/${productId}?days=${days}`);
    return res.json();
  },
  async getReorderSuggestions() {
    const res = await fetch(`${API_BASE_URL}/forecast/reorder-suggestions`);
    return res.json();
  },
  async getSeasonalPattern() {
    const res = await fetch(`${API_BASE_URL}/forecast/seasonal-pattern`);
    return res.json();
  },
  async getLowStockItems() {
    const res = await fetch(`${API_BASE_URL}/inventory/low-stock`);
    return res.json();
  },

  // ─── Auth ─────────────────────────────────────────────────────────────────
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
    return res.json();
  },
  async register(data) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Registration failed');
    return res.json();
  },
  async getMe(token) {
    const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: authHeaders(token) });
    return res.json();
  },

  // ─── Products ────────────────────────────────────────────────────────────
  async getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/products${qs ? '?' + qs : ''}`);
    return res.json();
  },
  async getProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    return res.json();
  },
  async createProduct(data, token) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
    return res.json();
  },
  async updateProduct(id, data, token) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
    return res.json();
  },

  // ─── Orders ───────────────────────────────────────────────────────────────
  async createOrder(data, token) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create order');
    return res.json();
  },
  async getMyOrders(token) {
    const res = await fetch(`${API_BASE_URL}/orders/my-orders`, { headers: authHeaders(token) });
    return res.json();
  },
  async getOrder(id, token) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, { headers: authHeaders(token) });
    return res.json();
  },
  async getAllOrders(token) {
    const res = await fetch(`${API_BASE_URL}/orders`, { headers: authHeaders(token) });
    return res.json();
  },
  async updateOrderStatus(id, status, token) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed');
    return res.json();
  },

  // ─── Chat ─────────────────────────────────────────────────────────────────
  async sendMessage(data, token) {
    const res = await fetch(`${API_BASE_URL}/chat/send`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },
  async getConversations(token) {
    const res = await fetch(`${API_BASE_URL}/chat/conversations`, { headers: authHeaders(token) });
    return res.json();
  },
  async getMessages(userId, token) {
    const res = await fetch(`${API_BASE_URL}/chat/messages/${userId}`, { headers: authHeaders(token) });
    return res.json();
  },
};
