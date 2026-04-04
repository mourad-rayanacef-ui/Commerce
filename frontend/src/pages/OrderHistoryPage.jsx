import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const STATUS_COLORS = {
  pending: { bg: '#fff3cd', text: '#856404', label: '⏳ Pending' },
  confirmed: { bg: '#cfe2ff', text: '#084298', label: '✅ Confirmed' },
  shipped: { bg: '#d1ecf1', text: '#0c5460', label: '🚚 Shipped' },
  delivered: { bg: '#d4edda', text: '#155724', label: '📦 Delivered' },
  cancelled: { bg: '#f8d7da', text: '#721c24', label: '❌ Cancelled' },
};

export default function OrderHistoryPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const successOrderNum = params.get('success') ? params.get('order') : null;

  useEffect(() => {
    if (user && token) loadOrders();
  }, [user, token]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getMyOrders(token);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={styles.gate}>
        <p style={styles.gateIcon}>🔒</p>
        <h2>Login Required</h2>
        <p style={{ color: '#7f8c8d' }}>Please log in to view your orders.</p>
        <Link to="/login" style={styles.loginBtn}>Sign In</Link>
      </div>
    );
  }

  const statusInfo = (status) => STATUS_COLORS[status] || { bg: '#ecf0f1', text: '#2c3e50', label: status };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>📋 My Orders</h1>

        {successOrderNum && (
          <div style={styles.successBanner}>
            🎉 <strong>Order placed successfully!</strong> Order #{successOrderNum} is being processed.
          </div>
        )}

        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>📦</p>
            <h2>No orders yet</h2>
            <p style={{ color: '#7f8c8d' }}>You haven't placed any orders. Start shopping!</p>
            <Link to="/" style={styles.shopBtn}>Browse Products</Link>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {orders.map(order => {
              const s = statusInfo(order.status);
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                    <div style={styles.orderMeta}>
                      <span style={styles.orderNum}>Order #{order.order_number || order.id}</span>
                      <span style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div style={styles.orderRight}>
                      <span style={{ ...styles.statusBadge, background: s.bg, color: s.text }}>{s.label}</span>
                      <span style={styles.orderTotal}>${Number(order.total_amount).toFixed(2)}</span>
                      <span style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={styles.orderBody}>
                      {order.items && order.items.length > 0 && (
                        <div style={styles.orderItems}>
                          <h4 style={styles.orderItemsTitle}>Items</h4>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={styles.orderItem}>
                              <span>{item.product_name || `Product #${item.product_id}`}</span>
                              <span>× {item.quantity}</span>
                              <span>${(item.price_at_time * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={styles.orderDetails}>
                        {order.shipping_address && (
                          <div style={styles.detailRow}><span style={styles.detailLabel}>📍 Shipping Address</span><span>{order.shipping_address}</span></div>
                        )}
                        {order.phone_number && (
                          <div style={styles.detailRow}><span style={styles.detailLabel}>📞 Phone</span><span>{order.phone_number}</span></div>
                        )}
                        {order.notes && (
                          <div style={styles.detailRow}><span style={styles.detailLabel}>📝 Notes</span><span>{order.notes}</span></div>
                        )}
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
  container: { maxWidth: 900, margin: '0 auto', padding: '32px 20px' },
  title: { fontSize: 32, fontWeight: 800, color: '#2c3e50', marginBottom: 24 },
  successBanner: { background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '16px 20px', borderRadius: 12, marginBottom: 24, fontSize: 15 },
  loading: { textAlign: 'center', padding: '80px 20px', color: '#7f8c8d' },
  spinner: { width: 40, height: 40, border: '4px solid #ecf0f1', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' },
  empty: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: 70, margin: '0 0 16px 0' },
  shopBtn: { display: 'inline-block', marginTop: 16, padding: '14px 32px', background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16 },
  ordersList: { display: 'flex', flexDirection: 'column', gap: 16 },
  orderCard: { background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', cursor: 'pointer' },
  orderMeta: { display: 'flex', flexDirection: 'column', gap: 4 },
  orderNum: { fontSize: 16, fontWeight: 700, color: '#2c3e50' },
  orderDate: { fontSize: 13, color: '#7f8c8d' },
  orderRight: { display: 'flex', alignItems: 'center', gap: 16 },
  statusBadge: { padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 },
  orderTotal: { fontSize: 20, fontWeight: 800, color: '#27ae60' },
  expandIcon: { color: '#7f8c8d', fontSize: 12 },
  orderBody: { borderTop: '1px solid #ecf0f1', padding: '20px 24px' },
  orderItems: { marginBottom: 16 },
  orderItemsTitle: { fontSize: 14, fontWeight: 700, color: '#7f8c8d', marginBottom: 10, margin: '0 0 10px 0' },
  orderItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8f9fa', fontSize: 14, color: '#2c3e50' },
  orderDetails: { display: 'flex', flexDirection: 'column', gap: 8 },
  detailRow: { display: 'flex', gap: 12, fontSize: 14, alignItems: 'flex-start' },
  detailLabel: { fontWeight: 600, color: '#7f8c8d', minWidth: 140 },
  gate: { minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  gateIcon: { fontSize: 60, margin: 0 },
  loginBtn: { marginTop: 8, padding: '12px 32px', background: '#3498db', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700 },
};
