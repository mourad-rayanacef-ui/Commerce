import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: { bg: '#fff3cd', text: '#856404' },
  confirmed: { bg: '#cfe2ff', text: '#084298' },
  shipped: { bg: '#d1ecf1', text: '#0c5460' },
  delivered: { bg: '#d4edda', text: '#155724' },
  cancelled: { bg: '#f8d7da', text: '#721c24' },
};

export default function AdminOrdersPage() {
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadOrders();
  }, [isAdmin]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getAllOrders(token);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus, token);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  if (!isAdmin) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📋 Order Management</h1>
            <p style={styles.subtitle}>{orders.length} total orders</p>
          </div>
          <button onClick={loadOrders} style={styles.refreshBtn}>↻ Refresh</button>
        </div>

        {/* Status Filter */}
        <div style={styles.filterRow}>
          <button onClick={() => setFilter('all')} style={{ ...styles.filterBtn, ...(filter === 'all' ? styles.activeFilter : {}) }}>
            All <span style={styles.countBadge}>{orders.length}</span>
          </button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ ...styles.filterBtn, ...(filter === s ? styles.activeFilter : {}) }}>
              {s.charAt(0).toUpperCase() + s.slice(1)} <span style={styles.countBadge}>{counts[s]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.loading}><div style={styles.spinner} /><p>Loading orders...</p></div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}><p style={{ fontSize: 50 }}>📋</p><p>No orders found</p></div>
        ) : (
          <div style={styles.ordersList}>
            {filtered.map(order => {
              const sc = STATUS_COLORS[order.status] || { bg: '#ecf0f1', text: '#2c3e50' };
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderRow}>
                    <div style={styles.orderMain} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                      <div>
                        <div style={styles.orderNum}>Order #{order.order_number || order.id}</div>
                        <div style={styles.orderCustomer}>👤 {order.user_name || order.user_id}</div>
                        <div style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div style={styles.orderAmount}>${Number(order.total_amount).toFixed(2)}</div>
                    </div>
                    <div style={styles.statusControl}>
                      <span style={{ ...styles.statusBadge, background: sc.bg, color: sc.text }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        disabled={updating === order.id}
                        style={styles.statusSelect}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={styles.orderDetails}>
                      {order.items?.length > 0 && (
                        <div style={styles.itemsSection}>
                          <h4 style={styles.detailsTitle}>Items Ordered</h4>
                          {order.items.map((item, i) => (
                            <div key={i} style={styles.orderItem}>
                              <span>{item.product_name || `Product #${item.product_id}`}</span>
                              <span style={{ color: '#7f8c8d' }}>× {item.quantity}</span>
                              <span style={{ fontWeight: 700, color: '#27ae60' }}>${(item.price_at_time * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={styles.detailsGrid}>
                        {order.shipping_address && <div style={styles.detailItem}><span style={styles.detailKey}>📍 Address</span><span>{order.shipping_address}</span></div>}
                        {order.phone_number && <div style={styles.detailItem}><span style={styles.detailKey}>📞 Phone</span><span>{order.phone_number}</span></div>}
                        {order.notes && <div style={styles.detailItem}><span style={styles.detailKey}>📝 Notes</span><span>{order.notes}</span></div>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa', paddingBottom: 60 },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 800, color: '#2c3e50', margin: '0 0 4px 0' },
  subtitle: { fontSize: 14, color: '#7f8c8d', margin: 0 },
  refreshBtn: { padding: '10px 20px', background: 'white', color: '#2c3e50', border: '2px solid #ecf0f1', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  filterRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 },
  filterBtn: { padding: '8px 16px', background: 'white', border: '2px solid #ecf0f1', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: 6 },
  activeFilter: { background: '#2c3e50', color: 'white', borderColor: '#2c3e50' },
  countBadge: { background: 'rgba(0,0,0,0.1)', padding: '1px 6px', borderRadius: 10, fontSize: 11 },
  loading: { textAlign: 'center', padding: 60, color: '#7f8c8d' },
  spinner: { width: 40, height: 40, border: '4px solid #ecf0f1', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' },
  empty: { textAlign: 'center', padding: 60, color: '#7f8c8d' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: 12 },
  orderCard: { background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  orderRow: { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' },
  orderMain: { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', paddingRight: 20 },
  orderNum: { fontSize: 16, fontWeight: 700, color: '#2c3e50' },
  orderCustomer: { fontSize: 13, color: '#3498db', fontWeight: 600, marginTop: 2 },
  orderDate: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  orderAmount: { fontSize: 22, fontWeight: 900, color: '#27ae60' },
  statusControl: { display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', minWidth: 160 },
  statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  statusSelect: { padding: '8px 12px', border: '2px solid #ecf0f1', borderRadius: 8, fontSize: 13, cursor: 'pointer', outline: 'none', background: 'white' },
  orderDetails: { borderTop: '1px solid #ecf0f1', padding: '20px 24px' },
  itemsSection: { marginBottom: 16 },
  detailsTitle: { fontSize: 13, fontWeight: 700, color: '#7f8c8d', textTransform: 'uppercase', margin: '0 0 10px 0' },
  orderItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8f9fa', fontSize: 14 },
  detailsGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  detailItem: { display: 'flex', gap: 12, fontSize: 14 },
  detailKey: { fontWeight: 600, color: '#7f8c8d', minWidth: 100 },
};
