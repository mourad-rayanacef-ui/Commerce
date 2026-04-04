import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

// Reuse existing dashboard tabs via App.jsx logic but scoped to admin
export default function AdminDashboardPage() {
  const { user, token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sales, products, inv] = await Promise.allSettled([
        api.getSalesDaily(),
        api.getTopProducts(),
        api.getInventoryStatus(),
      ]);
      if (sales.status === 'fulfilled') setSalesData(sales.value);
      if (products.status === 'fulfilled') setTopProducts(products.value || []);
      if (inv.status === 'fulfilled') setInventory(inv.value || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  const totalRevenue = salesData?.amounts?.reduce((a, b) => a + b, 0) || 0;
  const totalSold = topProducts.reduce((a, b) => a + (b.quantity || 0), 0);
  const lowStockCount = inventory.filter(i => i.status === 'Low' || i.status === 'Critical').length;
  const dailySales = salesData?.amounts || [];
  const maxSales = Math.max(...dailySales, 1);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>⚙️ Admin Dashboard</h1>
            <p style={styles.subtitle}>Welcome back, {user?.username}</p>
          </div>
          <div style={styles.adminLinks}>
            <Link to="/admin/products" style={styles.adminLink}>📦 Products</Link>
            <Link to="/admin/orders" style={styles.adminLink}>📋 Orders</Link>
            <Link to="/chat" style={styles.adminLink}>💬 Chat</Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['overview', 'inventory', 'forecast'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ ...styles.tab, ...(activeTab === t ? styles.activeTab : {}) }}>
              {t === 'overview' ? '📊 Overview' : t === 'inventory' ? '📦 Inventory' : '🔮 Forecast'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.loading}><div style={styles.spinner} /><p>Loading analytics...</p></div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div>
                {/* KPI Cards */}
                <div style={styles.kpiGrid}>
                  <div style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    <div style={styles.kpiLabel}>Total Revenue</div>
                    <div style={styles.kpiValue}>${totalRevenue.toFixed(2)}</div>
                    <div style={styles.kpiSub}>Last 30 days</div>
                  </div>
                  <div style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                    <div style={styles.kpiLabel}>Products Sold</div>
                    <div style={styles.kpiValue}>{totalSold}</div>
                    <div style={styles.kpiSub}>Total units</div>
                  </div>
                  <div style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                    <div style={styles.kpiLabel}>Low Stock Alerts</div>
                    <div style={styles.kpiValue}>{lowStockCount}</div>
                    <div style={styles.kpiSub}>Need attention</div>
                  </div>
                  <div style={{ ...styles.kpiCard, background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
                    <div style={styles.kpiLabel}>Avg Order Value</div>
                    <div style={styles.kpiValue}>${totalSold > 0 ? (totalRevenue / totalSold).toFixed(2) : '0.00'}</div>
                    <div style={styles.kpiSub}>Per transaction</div>
                  </div>
                </div>

                {/* Sales Chart */}
                {dailySales.length > 0 && (
                  <div style={styles.chartCard}>
                    <h3 style={styles.chartTitle}>📈 Sales Trend (Last 30 Days)</h3>
                    <div style={styles.barChart}>
                      {dailySales.slice(0, 30).map((amount, idx) => (
                        <div key={idx} style={styles.barWrapper}>
                          <div style={{ ...styles.bar, height: `${(amount / maxSales) * 140}px`, backgroundColor: amount > maxSales * 0.7 ? '#27ae60' : amount > maxSales * 0.4 ? '#f39c12' : '#e74c3c' }}>
                            <span style={styles.barTip}>${amount.toFixed(0)}</span>
                          </div>
                          <div style={styles.barLabel}>D{idx + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Products */}
                {topProducts.length > 0 && (
                  <div style={styles.tableCard}>
                    <h3 style={styles.tableTitle}>🏆 Top Selling Products</h3>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.thead}>
                          <th style={styles.th}>Rank</th>
                          <th style={styles.th}>Product</th>
                          <th style={styles.th}>Units Sold</th>
                          <th style={styles.th}>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.slice(0, 8).map((p, i) => (
                          <tr key={i} style={styles.tr}>
                            <td style={styles.td}><span style={styles.rank}>#{i + 1}</span></td>
                            <td style={{ ...styles.td, fontWeight: 600 }}>{p.name}</td>
                            <td style={styles.td}>{p.quantity}</td>
                            <td style={{ ...styles.td, color: '#27ae60', fontWeight: 700 }}>${p.revenue?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div>
                <div style={styles.kpiGrid}>
                  {[
                    { label: 'Critical', count: inventory.filter(i => i.status === 'Critical').length, color: '#e74c3c' },
                    { label: 'Low Stock', count: inventory.filter(i => i.status === 'Low').length, color: '#f39c12' },
                    { label: 'Healthy', count: inventory.filter(i => i.status === 'Healthy').length, color: '#27ae60' },
                    { label: 'Excess', count: inventory.filter(i => i.status === 'Excess').length, color: '#3498db' },
                  ].map(s => (
                    <div key={s.label} style={{ ...styles.smallKpi, borderLeft: `4px solid ${s.color}` }}>
                      <div style={{ color: s.color, fontSize: 28, fontWeight: 800 }}>{s.count}</div>
                      <div style={{ color: '#7f8c8d', fontSize: 14, fontWeight: 600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={styles.tableCard}>
                  <h3 style={styles.tableTitle}>📋 Inventory Status</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.thead}>
                          <th style={styles.th}>Product</th>
                          <th style={styles.th}>Current Stock</th>
                          <th style={styles.th}>Reorder Point</th>
                          <th style={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item, i) => (
                          <tr key={i} style={styles.tr}>
                            <td style={{ ...styles.td, fontWeight: 600 }}>{item.product_name}</td>
                            <td style={styles.td}>{item.current_stock}</td>
                            <td style={styles.td}>{item.reorder_point}</td>
                            <td style={styles.td}>
                              <span style={{ ...styles.badge, background: item.status === 'Critical' ? '#fde8e8' : item.status === 'Low' ? '#fff3cd' : item.status === 'Healthy' ? '#d4edda' : '#cfe2ff', color: item.status === 'Critical' ? '#c0392b' : item.status === 'Low' ? '#856404' : item.status === 'Healthy' ? '#155724' : '#084298' }}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'forecast' && (
              <div style={styles.forecastPlaceholder}>
                <p style={{ fontSize: 40 }}>🔮</p>
                <h3>Demand Forecast</h3>
                <p style={{ color: '#7f8c8d' }}>Visit the <Link to="/admin/forecast" style={{ color: '#3498db' }}>Forecast Page</Link> for detailed predictions.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa', paddingBottom: 60 },
  container: { maxWidth: 1400, margin: '0 auto', padding: '32px 20px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 32, fontWeight: 800, color: '#2c3e50', margin: '0 0 4px 0' },
  subtitle: { fontSize: 15, color: '#7f8c8d', margin: 0 },
  adminLinks: { display: 'flex', gap: 10 },
  adminLink: { padding: '10px 20px', background: 'white', color: '#2c3e50', textDecoration: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  tabs: { display: 'flex', gap: 8, marginBottom: 28, background: 'white', padding: 6, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: 'fit-content' },
  tab: { padding: '10px 20px', background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#7f8c8d' },
  activeTab: { background: '#2c3e50', color: 'white' },
  loading: { textAlign: 'center', padding: 60, color: '#7f8c8d' },
  spinner: { width: 40, height: 40, border: '4px solid #ecf0f1', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 },
  kpiCard: { color: 'white', padding: '24px', borderRadius: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  kpiLabel: { fontSize: 14, opacity: 0.9, marginBottom: 8 },
  kpiValue: { fontSize: 32, fontWeight: 900 },
  kpiSub: { fontSize: 12, opacity: 0.7, marginTop: 4 },
  smallKpi: { background: 'white', padding: '20px 24px', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chartCard: { background: 'white', padding: '24px', borderRadius: 14, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  chartTitle: { fontSize: 18, fontWeight: 700, color: '#2c3e50', margin: '0 0 20px 0' },
  barChart: { display: 'flex', alignItems: 'flex-end', gap: 3, overflowX: 'auto', padding: '20px 0', minHeight: 200 },
  barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 },
  bar: { width: 28, borderRadius: '4px 4px 0 0', position: 'relative', minHeight: 4 },
  barTip: { position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 9, whiteSpace: 'nowrap', color: '#7f8c8d' },
  barLabel: { fontSize: 9, marginTop: 4, color: '#7f8c8d' },
  tableCard: { background: 'white', padding: '24px', borderRadius: 14, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  tableTitle: { fontSize: 18, fontWeight: 700, color: '#2c3e50', margin: '0 0 16px 0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { borderBottom: '2px solid #ecf0f1' },
  th: { padding: '12px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#7f8c8d', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f8f9fa' },
  td: { padding: '14px 12px', fontSize: 14, color: '#2c3e50' },
  rank: { background: '#f0f0f0', padding: '3px 8px', borderRadius: 6, fontWeight: 700, fontSize: 13 },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  forecastPlaceholder: { background: 'white', padding: 60, borderRadius: 14, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
};
