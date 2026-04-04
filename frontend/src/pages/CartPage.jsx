import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={styles.gate}>
        <p style={styles.gateIcon}>🔒</p>
        <h2>Login Required</h2>
        <p style={{ color: '#7f8c8d' }}>Please log in to view your cart.</p>
        <Link to="/login" style={styles.loginBtn}>Sign In</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>🛒</p>
            <h2 style={{ color: '#2c3e50' }}>Your cart is empty</h2>
            <p style={{ color: '#7f8c8d' }}>Add some products to get started!</p>
            <Link to="/" style={styles.shopBtn}>Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>🛒 Shopping Cart</h1>

        <div style={styles.layout}>
          {/* Items */}
          <div style={styles.itemsSection}>
            <div style={styles.itemsHeader}>
              <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              <button onClick={clearCart} style={styles.clearBtn}>Clear all</button>
            </div>
            {items.map(item => (
              <div key={item.id} style={styles.item}>
                <div style={styles.itemImageWrap}>
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=60'}
                    alt={item.name}
                    style={styles.itemImage}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=60'; }}
                  />
                </div>
                <div style={styles.itemInfo}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  {item.category && <span style={styles.itemCat}>{item.category}</span>}
                  <p style={styles.itemPrice}>${Number(item.price).toFixed(2)} each</p>
                </div>
                <div style={styles.itemQty}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>−</button>
                  <span style={styles.qty}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                </div>
                <div style={styles.itemSubtotal}>
                  <span style={styles.subtotalLabel}>Subtotal</span>
                  <span style={styles.subtotalValue}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}>✕</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={styles.summary}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>
            <div style={styles.summaryRows}>
              {items.map(item => (
                <div key={item.id} style={styles.summaryRow}>
                  <span style={styles.summaryItemName}>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr style={styles.summaryDivider} />
              <div style={styles.summaryTotal}>
                <span>Total</span>
                <span style={styles.totalValue}>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} style={styles.checkoutBtn}>
              Proceed to Checkout →
            </button>
            <Link to="/" style={styles.continueLink}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa', paddingBottom: 60 },
  container: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  title: { fontSize: 32, fontWeight: 800, color: '#2c3e50', marginBottom: 32 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' },
  itemsSection: { background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  itemsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #ecf0f1', color: '#7f8c8d', fontSize: 14 },
  clearBtn: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  item: { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderBottom: '1px solid #ecf0f1' },
  itemImageWrap: { flexShrink: 0 },
  itemImage: { width: 80, height: 80, objectFit: 'cover', borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 700, color: '#2c3e50', margin: '0 0 4px 0' },
  itemCat: { fontSize: 11, background: '#e8f4fd', color: '#3498db', padding: '2px 8px', borderRadius: 20, fontWeight: 600 },
  itemPrice: { fontSize: 13, color: '#7f8c8d', margin: '6px 0 0 0' },
  itemQty: { display: 'flex', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 32, height: 32, background: '#ecf0f1', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qty: { fontSize: 16, fontWeight: 700, minWidth: 30, textAlign: 'center' },
  itemSubtotal: { textAlign: 'right', minWidth: 80 },
  subtotalLabel: { display: 'block', fontSize: 11, color: '#7f8c8d' },
  subtotalValue: { fontSize: 18, fontWeight: 800, color: '#27ae60' },
  removeBtn: { background: 'none', border: 'none', fontSize: 16, color: '#bdc3c7', cursor: 'pointer' },
  summary: { background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: 80 },
  summaryTitle: { fontSize: 20, fontWeight: 800, color: '#2c3e50', margin: '0 0 20px 0' },
  summaryRows: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7f8c8d' },
  summaryItemName: { flex: 1, marginRight: 8 },
  summaryDivider: { border: 'none', borderTop: '2px solid #ecf0f1', margin: '8px 0' },
  summaryTotal: { display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#2c3e50' },
  totalValue: { color: '#27ae60', fontSize: 22, fontWeight: 900 },
  checkoutBtn: { width: '100%', padding: 16, background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 12 },
  continueLink: { display: 'block', textAlign: 'center', color: '#3498db', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  gate: { minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  gateIcon: { fontSize: 60, margin: 0 },
  loginBtn: { marginTop: 8, padding: '12px 32px', background: '#3498db', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700 },
  empty: { minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 80, margin: 0 },
  shopBtn: { marginTop: 12, padding: '14px 32px', background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16 },
};
