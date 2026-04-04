import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ shipping_address: '', phone_number: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return <div style={styles.gate}><p>Please <Link to="/login">login</Link> to checkout.</p></div>;
  if (items.length === 0) return <div style={styles.gate}><p>Your cart is empty. <Link to="/">Shop now</Link></p></div>;

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shipping_address.trim()) { setError('Shipping address is required'); return; }
    setLoading(true);
    setError('');
    try {
      const orderData = {
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity, price_at_time: i.price })),
        total_amount: cartTotal,
        shipping_address: form.shipping_address,
        phone_number: form.phone_number,
        notes: form.notes,
      };
      const order = await api.createOrder(orderData, token);
      clearCart();
      navigate(`/orders?success=true&order=${order.order_number || order.id}`);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>🛍️ Checkout</h1>

        <div style={styles.layout}>
          {/* Form */}
          <div>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>👤 Contact Info</h2>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}><span style={styles.infoLabel}>Name</span><span>{user.full_name || user.username}</span></div>
                <div style={styles.infoItem}><span style={styles.infoLabel}>Email</span><span>{user.email}</span></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>📦 Shipping Details</h2>
                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.field}>
                  <label style={styles.label}>Shipping Address *</label>
                  <textarea
                    value={form.shipping_address}
                    onChange={e => update('shipping_address', e.target.value)}
                    placeholder="Enter your full delivery address"
                    style={styles.textarea}
                    rows={3}
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone_number}
                    onChange={e => update('phone_number', e.target.value)}
                    placeholder="+1 234 567 8900"
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Order Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={e => update('notes', e.target.value)}
                    placeholder="Any special instructions..."
                    style={styles.textarea}
                    rows={2}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.placeBtn}>
                {loading ? '⏳ Placing Order...' : `✅ Place Order — $${cartTotal.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div style={styles.summary}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>
            <div style={styles.summaryItems}>
              {items.map(item => (
                <div key={item.id} style={styles.summaryItem}>
                  <span style={styles.summaryItemName}>{item.name}</span>
                  <span style={styles.summaryItemQty}>×{item.quantity}</span>
                  <span style={styles.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <hr style={styles.divider} />
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total</span>
              <span style={styles.totalValue}>${cartTotal.toFixed(2)}</span>
            </div>
            <div style={styles.secureNote}>🔒 Secure checkout • Free returns within 30 days</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa', paddingBottom: 60 },
  container: { maxWidth: 1000, margin: '0 auto', padding: '32px 20px' },
  title: { fontSize: 32, fontWeight: 800, color: '#2c3e50', marginBottom: 32 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' },
  section: { background: 'white', borderRadius: 16, padding: 28, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#2c3e50', margin: '0 0 20px 0' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  infoLabel: { fontSize: 12, color: '#7f8c8d', fontWeight: 600 },
  form: { display: 'flex', flexDirection: 'column' },
  error: { background: '#fde8e8', color: '#c0392b', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#2c3e50', marginBottom: 8 },
  input: { width: '100%', padding: '12px 14px', border: '2px solid #ecf0f1', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px 14px', border: '2px solid #ecf0f1', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  placeBtn: { width: '100%', padding: '18px', background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white', border: 'none', borderRadius: 14, fontSize: 18, fontWeight: 800, cursor: 'pointer' },
  summary: { background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: 80 },
  summaryTitle: { fontSize: 18, fontWeight: 700, color: '#2c3e50', margin: '0 0 20px 0' },
  summaryItems: { display: 'flex', flexDirection: 'column', gap: 12 },
  summaryItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 },
  summaryItemName: { flex: 1, color: '#2c3e50', fontWeight: 500 },
  summaryItemQty: { color: '#7f8c8d', fontSize: 13 },
  summaryItemPrice: { fontWeight: 700, color: '#2c3e50' },
  divider: { border: 'none', borderTop: '2px solid #ecf0f1', margin: '16px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 18, fontWeight: 700, color: '#2c3e50' },
  totalValue: { fontSize: 26, fontWeight: 900, color: '#27ae60' },
  secureNote: { marginTop: 16, fontSize: 12, color: '#7f8c8d', textAlign: 'center' },
  gate: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, gap: 8 },
};
