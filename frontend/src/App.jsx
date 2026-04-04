// NOTE: Legacy App.jsx replaced with routing version below
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import { Navbar } from './components/Common/Navbar.jsx';

// Pages
import ProductsPage from './pages/ProductsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminProductsPage from './pages/AdminProductsPage.jsx';
import AdminOrdersPage from './pages/AdminOrdersPage.jsx';

// Protected route wrapper
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer routes */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>} />
        <Route path="/admin/chat" element={<ProtectedRoute adminOnly><ChatPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

/*
 * ─── LEGACY CODE BELOW (not used) ───
 */
// eslint-disable-next-line no-unused-vars
function _LegacyApp_UNUSED() {

function App() {
  // State variables
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [profitMargins, setProfitMargins] = useState([]);
  const [turnoverRates, setTurnoverRates] = useState([]);
  const [abcAnalysis, setAbcAnalysis] = useState({});
  const [salesVelocity, setSalesVelocity] = useState([]);
  const [seasonalIndex, setSeasonalIndex] = useState([]);
  const [selectedChart, setSelectedChart] = useState('revenue');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic data first
      const salesRes = await fetch('http://localhost:8000/api/sales/daily');
      const productsRes = await fetch('http://localhost:8000/api/sales/top-products');
      const inventoryRes = await fetch('http://localhost:8000/api/inventory/status');
      const forecastRes = await fetch('http://localhost:8000/api/forecast/demand');
      const suggestionsRes = await fetch('http://localhost:8000/api/forecast/reorder-suggestions');
      
      const salesJson = await salesRes.json();
      const productsJson = await productsRes.json();
      const inventoryJson = await inventoryRes.json();
      const forecastJson = await forecastRes.json();
      const suggestionsJson = await suggestionsRes.json();
      
      setSalesData(salesJson);
      setTopProducts(productsJson);
      setInventory(inventoryJson);
      setForecast(forecastJson);
      setReorderSuggestions(suggestionsJson);
      setDailySales(salesJson.amounts || []);
      
      // Try to fetch analytics data (optional - if fails, just show empty)
      try {
        const categoryRes = await fetch('http://localhost:8000/api/analytics/by-category');
        const trendRes = await fetch('http://localhost:8000/api/analytics/weekly-trend');
        const profitRes = await fetch('http://localhost:8000/api/analytics/profit-margins');
        const turnoverRes = await fetch('http://localhost:8000/api/analytics/turnover-rates');
        const abcRes = await fetch('http://localhost:8000/api/analytics/abc-analysis');
        const velocityRes = await fetch('http://localhost:8000/api/analytics/sales-velocity');
        const seasonalRes = await fetch('http://localhost:8000/api/analytics/seasonal-index');
        
        setCategoryAnalysis(await categoryRes.json());
        setWeeklyTrend(await trendRes.json());
        setProfitMargins(await profitRes.json());
        setTurnoverRates(await turnoverRes.json());
        setAbcAnalysis(await abcRes.json());
        setSalesVelocity(await velocityRes.json());
        setSeasonalIndex(await seasonalRes.json());
      } catch (analyticsErr) {
        console.log('Analytics data not available yet');
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Make sure backend is running on port 8000');
    } finally {
      setLoading(false);
    }
  };

  const handleReorderClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleReorder = async (productId, quantity) => {
    const response = await fetch('http://localhost:8000/api/inventory/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity: parseInt(quantity) })
    });
    
    if (!response.ok) throw new Error('Reorder failed');
    
    await fetchAllData();
    alert(`Order placed successfully! Added ${quantity} units.`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  // Calculations for dashboard
  const totalRevenue = salesData?.amounts?.reduce((a, b) => a + b, 0) || 0;
  const totalProductsSold = topProducts.reduce((a, b) => a + (b.quantity || 0), 0);
  const lowStockCount = inventory.filter(i => i.status === 'Low' || i.status === 'Critical').length;
  const avgOrderValue = totalProductsSold > 0 ? totalRevenue / totalProductsSold : 0;
  const maxSales = Math.max(...(dailySales || [0]), 1);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading analytics dashboard...</p>
        <p style={{fontSize: '12px', marginTop: '10px'}}>Make sure backend is running on port 8000</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchAllData} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Sales & Inventory Intelligence Platform</h1>

      <div style={styles.tabContainer}>
        <button onClick={() => setActiveTab('dashboard')} style={{...styles.tab, ...(activeTab === 'dashboard' ? styles.activeTab : {})}}>📈 Dashboard</button>
        <button onClick={() => setActiveTab('inventory')} style={{...styles.tab, ...(activeTab === 'inventory' ? styles.activeTab : {})}}>📦 Inventory</button>
        <button onClick={() => setActiveTab('analytics')} style={{...styles.tab, ...(activeTab === 'analytics' ? styles.activeTab : {})}}>📊 Analytics</button>
        <button onClick={() => setActiveTab('forecast')} style={{...styles.tab, ...(activeTab === 'forecast' ? styles.activeTab : {})}}>🔮 Forecast</button>
        <button onClick={() => setActiveTab('insights')} style={{...styles.tab, ...(activeTab === 'insights' ? styles.activeTab : {})}}>💡 Insights</button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={styles.cardGrid}>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h3 style={styles.cardTitle}>Total Revenue</h3>
              <p style={styles.cardValue}>${totalRevenue.toFixed(2)}</p>
              <small>Last 30 days</small>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
              <h3 style={styles.cardTitle}>Products Sold</h3>
              <p style={styles.cardValue}>{totalProductsSold}</p>
              <small>Total units</small>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
              <h3 style={styles.cardTitle}>Low Stock Items</h3>
              <p style={styles.cardValue}>{lowStockCount}</p>
              <small>Need attention</small>
            </div>
            <div style={{...styles.statCard, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
              <h3 style={styles.cardTitle}>Avg Order Value</h3>
              <p style={styles.cardValue}>${avgOrderValue.toFixed(2)}</p>
              <small>Per transaction</small>
            </div>
          </div>

          <div style={styles.chartCard}>
            <h3>📈 Sales Trend (Last 30 Days)</h3>
            <div style={styles.barChart}>
              {dailySales && dailySales.slice(0, 30).map((amount, idx) => (
                <div key={idx} style={styles.barWrapper}>
                  <div style={{...styles.bar, height: `${(amount / maxSales) * 150}px`, backgroundColor: amount > maxSales * 0.7 ? '#4caf50' : amount > maxSales * 0.4 ? '#ff9800' : '#f44336'}}>
                    <span style={styles.barValue}>${amount.toFixed(0)}</span>
                  </div>
                  <div style={styles.barLabel}>Day {idx + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.tableContainer}>
            <h3>🏆 Top Selling Products</h3>
            <table style={styles.table}>
              <thead><tr style={styles.tableHeader}><th style={styles.th}>Rank</th><th style={styles.th}>Product Name</th><th style={styles.th}>Quantity Sold</th><th style={styles.th}>Revenue</th></tr></thead>
              <tbody>
                {topProducts.slice(0, 5).map((product, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.td}>#{idx + 1}</td>
                    <td style={{...styles.td, fontWeight: 'bold'}}>{product.name}</td>
                    <td style={styles.td}>{product.quantity}</td>
                    <td style={{...styles.td, color: '#28a745'}}>${product.revenue?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div>
          <div style={styles.cardGrid}>
            <div style={{...styles.smallCard, background: '#dc3545', color: 'white'}}><h4>Critical</h4><p style={{fontSize: '24px', margin: '0'}}>{inventory.filter(i => i.status === 'Critical').length}</p></div>
            <div style={{...styles.smallCard, background: '#ffc107', color: '#333'}}><h4>Low Stock</h4><p style={{fontSize: '24px', margin: '0'}}>{inventory.filter(i => i.status === 'Low').length}</p></div>
            <div style={{...styles.smallCard, background: '#28a745', color: 'white'}}><h4>Healthy</h4><p style={{fontSize: '24px', margin: '0'}}>{inventory.filter(i => i.status === 'Healthy').length}</p></div>
            <div style={{...styles.smallCard, background: '#17a2b8', color: 'white'}}><h4>Excess</h4><p style={{fontSize: '24px', margin: '0'}}>{inventory.filter(i => i.status === 'Excess').length}</p></div>
          </div>

          <div style={styles.tableContainer}>
            <h3>📋 Current Inventory Status</h3>
            <table style={styles.table}>
              <thead><tr style={styles.tableHeader}><th style={styles.th}>Product</th><th style={styles.th}>Current Stock</th><th style={styles.th}>Reorder Point</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead>
              <tbody>
                {inventory.map((item, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={{...styles.td, fontWeight: 'bold'}}>{item.product_name}</td>
                    <td style={styles.td}>{item.current_stock}</td>
                    <td style={styles.td}>{item.reorder_point}</td>
                    <td style={styles.td}><span style={{...styles.statusBadge, backgroundColor: item.status === 'Critical' ? '#dc3545' : item.status === 'Low' ? '#ffc107' : item.status === 'Healthy' ? '#28a745' : '#17a2b8'}}>{item.status}</span></td>
                    <td style={styles.td}><button onClick={() => handleReorderClick(item)} style={styles.reorderBtn}>Reorder</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div>
          <div style={styles.analyticsNav}>
            <button onClick={() => setSelectedChart('revenue')} style={{...styles.analyticsBtn, ...(selectedChart === 'revenue' ? styles.activeAnalyticsBtn : {})}}>💰 Revenue</button>
            <button onClick={() => setSelectedChart('category')} style={{...styles.analyticsBtn, ...(selectedChart === 'category' ? styles.activeAnalyticsBtn : {})}}>📂 Categories</button>
            <button onClick={() => setSelectedChart('weekly')} style={{...styles.analyticsBtn, ...(selectedChart === 'weekly' ? styles.activeAnalyticsBtn : {})}}>📅 Weekly</button>
            <button onClick={() => setSelectedChart('profit')} style={{...styles.analyticsBtn, ...(selectedChart === 'profit' ? styles.activeAnalyticsBtn : {})}}>💰 Profit</button>
            <button onClick={() => setSelectedChart('turnover')} style={{...styles.analyticsBtn, ...(selectedChart === 'turnover' ? styles.activeAnalyticsBtn : {})}}>🔄 Turnover</button>
          </div>

          {selectedChart === 'revenue' && (
            <div style={styles.chartCard}>
              <h3>💰 Revenue by Product</h3>
              {topProducts.map((product, idx) => {
                const maxRevenue = Math.max(...topProducts.map(p => p.revenue || 0));
                const width = ((product.revenue || 0) / maxRevenue) * 100;
                return (
                  <div key={idx} style={styles.analyticsBar}>
                    <div style={styles.analyticsLabel}><span>{product.name}</span><span>${(product.revenue || 0).toFixed(2)}</span></div>
                    <div style={styles.analyticsBg}><div style={{...styles.analyticsFill, width: `${width}%`, backgroundColor: '#4caf50'}} /></div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedChart === 'category' && categoryAnalysis.length > 0 && (
            <div style={styles.chartCard}>
              <h3>📂 Sales by Category</h3>
              {categoryAnalysis.map((cat, idx) => {
                const total = categoryAnalysis.reduce((sum, c) => sum + c.value, 0);
                const percent = (cat.value / total) * 100;
                return (
                  <div key={idx} style={styles.analyticsBar}>
                    <div style={styles.analyticsLabel}><span>{cat.name}</span><span>${cat.value.toFixed(2)} ({percent.toFixed(1)}%)</span></div>
                    <div style={styles.analyticsBg}><div style={{...styles.analyticsFill, width: `${percent}%`, backgroundColor: cat.color || '#667eea'}} /></div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedChart === 'weekly' && weeklyTrend.length > 0 && (
            <div style={styles.chartCard}>
              <h3>📅 Weekly Sales Pattern</h3>
              <div style={styles.weeklyChart}>
                {weeklyTrend.map((day, idx) => {
                  const maxWeekly = Math.max(...weeklyTrend.map(d => d.sales));
                  const height = (day.sales / maxWeekly) * 200;
                  return (
                    <div key={idx} style={styles.weeklyBarWrapper}>
                      <div style={{...styles.weeklyBar, height: `${height}px`, backgroundColor: day.sales === maxWeekly ? '#4caf50' : '#2196f3'}}><span style={styles.weeklyValue}>{day.sales}</span></div>
                      <div style={styles.weeklyLabel}>{day.day.slice(0, 3)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedChart === 'profit' && profitMargins.length > 0 && (
            <div style={styles.chartCard}>
              <h3>💰 Profit Margins by Product</h3>
              {profitMargins.map((product, idx) => (
                <div key={idx} style={styles.analyticsBar}>
                  <div style={styles.analyticsLabel}><span>{product.name}</span><span style={{color: product.margin > 50 ? '#28a745' : product.margin > 30 ? '#ff9800' : '#dc3545'}}>{product.margin}% margin</span></div>
                  <div style={styles.analyticsBg}><div style={{...styles.analyticsFill, width: `${product.margin}%`, backgroundColor: product.margin > 50 ? '#28a745' : product.margin > 30 ? '#ff9800' : '#dc3545'}} /></div>
                </div>
              ))}
            </div>
          )}

          {selectedChart === 'turnover' && turnoverRates.length > 0 && (
            <div style={styles.chartCard}>
              <h3>🔄 Inventory Turnover Rate</h3>
              {turnoverRates.map((item, idx) => (
                <div key={idx} style={styles.analyticsBar}>
                  <div style={styles.analyticsLabel}><span>{item.name}</span><span>{item.turnover_rate} turns/year</span></div>
                  <div style={styles.analyticsBg}><div style={{...styles.analyticsFill, width: `${Math.min((item.turnover_rate / 12) * 100, 100)}%`, backgroundColor: item.turnover_rate > 6 ? '#28a745' : item.turnover_rate > 3 ? '#ff9800' : '#dc3545'}} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORECAST TAB */}
      {activeTab === 'forecast' && (
        <div>
          <div style={styles.chartCard}>
            <h3>🔮 7-Day Demand Forecast</h3>
            {forecast && forecast.forecast_values ? (
              <>
                <div style={styles.forecastChart}>
                  {forecast.forecast_values.map((value, idx) => (
                    <div key={idx} style={styles.forecastBarWrapper}>
                      <div style={{...styles.forecastBar, height: `${(value / Math.max(...forecast.forecast_values)) * 200}px`, backgroundColor: '#9c27b0'}}>
                        <span style={styles.forecastValue}>{Math.round(value)}</span>
                      </div>
                      <div style={styles.forecastLabel}>Day {idx + 1}</div>
                    </div>
                  ))}
                </div>
                <div style={styles.forecastStats}>
                  <div style={styles.forecastStat}><strong>Total:</strong> {Math.round(forecast.forecast_values.reduce((a,b) => a+b, 0))} units</div>
                  <div style={styles.forecastStat}><strong>Daily Avg:</strong> {Math.round(forecast.forecast_values.reduce((a,b) => a+b, 0) / 7)} units/day</div>
                </div>
              </>
            ) : <p>No forecast data available</p>}
          </div>

          <div style={styles.tableContainer}>
            <h3>📋 Reorder Suggestions</h3>
            {reorderSuggestions.length > 0 ? (
              <table style={styles.table}>
                <thead><tr style={styles.tableHeader}><th style={styles.th}>Product</th><th style={styles.th}>Current Stock</th><th style={styles.th}>Reorder Point</th><th style={styles.th}>Recommended</th><th style={styles.th}>Urgency</th></tr></thead>
                <tbody>
                  {reorderSuggestions.map((item, idx) => (
                    <tr key={idx} style={styles.tableRow}>
                      <td style={styles.td}>{item.product_name}</td>
                      <td style={styles.td}>{item.current_stock}</td>
                      <td style={styles.td}>{item.reorder_point}</td>
                      <td style={styles.td}>{item.recommended_order}</td>
                      <td style={styles.td}><span style={{...styles.urgencyBadge, backgroundColor: item.urgency === 'High' ? '#dc3545' : '#ffc107'}}>{item.urgency}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>No reorder suggestions</p>}
          </div>
        </div>
      )}

      {/* INSIGHTS TAB */}
      {activeTab === 'insights' && (
        <div>
          <div style={styles.insightsContainer}>
            <h2>💡 Business Insights</h2>
            <div style={styles.insightsGrid}>
              <div style={styles.insightCard}><div style={styles.insightIcon}>🎯</div><h3>Top Product</h3><p><strong>{topProducts[0]?.name || 'N/A'}</strong></p><p>${topProducts[0]?.revenue?.toFixed(2) || 0} revenue</p></div>
              <div style={styles.insightCard}><div style={styles.insightIcon}>⚠️</div><h3>Critical Items</h3><p><strong>{inventory.filter(i => i.status === 'Critical').length}</strong></p><p>Need immediate reorder</p></div>
              <div style={styles.insightCard}><div style={styles.insightIcon}>📈</div><h3>Best Day</h3><p><strong>{weeklyTrend.reduce((a,b) => a.sales > b.sales ? a : b)?.day || 'N/A'}</strong></p><p>Highest sales day</p></div>
            </div>
          </div>

          <div style={styles.recommendationBox}>
            <h3>🎯 Recommendations</h3>
            <ul style={styles.recommendationList}>
              {lowStockCount > 0 && <li>⚠️ Order {lowStockCount} low stock items immediately!</li>}
              {profitMargins.filter(p => p.margin < 20).length > 0 && <li>💰 Review pricing for low-margin products</li>}
              <li>🎯 Focus marketing on {topProducts[0]?.name || 'top products'}</li>
            </ul>
          </div>
        </div>
      )}

      {showModal && selectedProduct && <ReorderModal product={selectedProduct} onClose={closeModal} onReorder={handleReorder} />}
    </div>
  );
}

// Styles (same as before)
const styles = {
  container: { padding: '20px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' },
  title: { color: '#2c3e50', marginBottom: '30px', fontSize: '28px' },
  tabContainer: { display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', flexWrap: 'wrap' },
  tab: { padding: '10px 20px', backgroundColor: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' },
  activeTab: { backgroundColor: '#2c3e50', color: 'white' },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' },
  spinner: { border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '20px' },
  errorContainer: { padding: '20px', textAlign: 'center', color: '#dc3545' },
  retryBtn: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { color: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  smallCard: { padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  cardTitle: { margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 },
  cardValue: { fontSize: '28px', margin: '0', fontWeight: 'bold' },
  chartCard: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  barChart: { display: 'flex', alignItems: 'flex-end', gap: '2px', overflowX: 'auto', padding: '20px 0', minHeight: '250px' },
  barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' },
  bar: { width: '30px', transition: 'height 0.3s', borderRadius: '4px 4px 0 0', position: 'relative' },
  barValue: { position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', whiteSpace: 'nowrap' },
  barLabel: { fontSize: '10px', marginTop: '5px' },
  tableContainer: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' },
  th: { padding: '12px', textAlign: 'left', fontWeight: '600' },
  tableRow: { borderBottom: '1px solid #dee2e6' },
  td: { padding: '12px' },
  statusBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: 'white' },
  reorderBtn: { padding: '6px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  analyticsNav: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  analyticsBtn: { padding: '10px 16px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  activeAnalyticsBtn: { backgroundColor: '#2c3e50', color: 'white' },
  analyticsBar: { marginBottom: '15px' },
  analyticsLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' },
  analyticsBg: { backgroundColor: '#e0e0e0', borderRadius: '4px', height: '30px', overflow: 'hidden' },
  analyticsFill: { height: '100%', transition: 'width 0.3s', display: 'flex', alignItems: 'center', paddingLeft: '10px', color: 'white', fontSize: '12px' },
  weeklyChart: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '20px', padding: '20px 0', minHeight: '300px' },
  weeklyBarWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  weeklyBar: { width: '60px', transition: 'height 0.3s', borderRadius: '4px 4px 0 0', position: 'relative' },
  weeklyValue: { position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 'bold' },
  weeklyLabel: { marginTop: '8px', fontSize: '12px', fontWeight: 'bold' },
  forecastChart: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '20px', padding: '20px 0', minHeight: '300px' },
  forecastBarWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  forecastBar: { width: '60px', transition: 'height 0.3s', borderRadius: '4px 4px 0 0', position: 'relative' },
  forecastValue: { position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 'bold' },
  forecastLabel: { marginTop: '8px', fontSize: '12px' },
  forecastStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' },
  forecastStat: { padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '8px', textAlign: 'center' },
  urgencyBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: 'white' },
  insightsContainer: { background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' },
  insightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' },
  insightCard: { padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', textAlign: 'center' },
  insightIcon: { fontSize: '40px', marginBottom: '10px' },
  recommendationBox: { padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '10px', marginTop: '20px' },
  recommendationList: { marginTop: '10px', paddingLeft: '20px' },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);
}