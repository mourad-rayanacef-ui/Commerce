const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = {
  async getSalesDaily(days = 30) {
    const response = await fetch(`${API_BASE_URL}/api/sales/daily?days=${days}`);
    return response.json();
  },
  
  async getTopProducts(limit = 10) {
    const response = await fetch(`${API_BASE_URL}/api/sales/top-products?limit=${limit}`);
    return response.json();
  },
  
  async getInventoryStatus() {
    const response = await fetch(`${API_BASE_URL}/api/inventory/status`);
    return response.json();
  },
  
  async getForecast() {
    const response = await fetch(`${API_BASE_URL}/api/forecast/demand`);
    return response.json();
  },
  
  async reorderProduct(productId, quantity) {
    const response = await fetch(`${API_BASE_URL}/api/inventory/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    return response.json();
  }
 ,
async getForecastWithWindow(window = 7) {
  const response = await fetch(`${API_BASE_URL}/api/forecast/demand?window=${window}`);
  return response.json();
},

async getProductForecast(productId, days = 30) {
  const response = await fetch(`${API_BASE_URL}/api/forecast/product-forecast/${productId}?days=${days}`);
  return response.json();
},

async getReorderSuggestions() {
  const response = await fetch(`${API_BASE_URL}/api/forecast/reorder-suggestions`);
  return response.json();
},

async getSeasonalPattern() {
  const response = await fetch(`${API_BASE_URL}/api/forecast/seasonal-pattern`);
  return response.json();
},

async getLowStockItems() {
  const response = await fetch(`${API_BASE_URL}/api/inventory/low-stock`);
  return response.json();
},
};
