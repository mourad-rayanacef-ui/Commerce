import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

export default function CartDrawer({ onClose }) {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>🛒 Shopping Cart</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>🛒</p>
            <p style={styles.emptyText}>Your cart is empty</p>
            <button onClick={onClose} style={styles.continueBtn}>Continue Shopping</button>
          </div>
        ) : (
          <>
            <div style={styles.items}>
              {items.map(item => (
                <div key={item.id} style={styles.item}>
                  <div style={styles.itemInfo}>
                    <div style={styles.itemName}>{item.name}</div>
                    <div style={styles.itemPrice}>${Number(item.price).toFixed(2)} each</div>
                  </div>
                  <div style={styles.itemControls}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>−</button>
                    <span style={styles.qty}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                    <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}>🗑</button>
                  </div>
                  <div style={styles.itemTotal}>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={styles.footer}>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total:</span>
                <span style={styles.totalValue}>${cartTotal.toFixed(2)}</span>
              </div>
              <Link to="/checkout" onClick={onClose} style={styles.checkoutBtn}>
                Proceed to Checkout →
              </Link>
              <Link to="/cart" onClick={onClose} style={styles.viewCartBtn}>
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' },
  drawer: { background: 'white', width: 400, maxWidth: '95vw', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.2)' },
  header: { padding: '20px', borderBottom: '1px solid #ecf0f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: 20, color: '#2c3e50' },
  closeBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#7f8c8d' },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyIcon: { fontSize: 60, margin: 0 },
  emptyText: { fontSize: 18, color: '#7f8c8d' },
  continueBtn: { padding: '10px 24px', background: '#3498db', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  items: { flex: 1, overflowY: 'auto', padding: '16px' },
  item: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #ecf0f1' },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: 600, fontSize: 14, color: '#2c3e50' },
  itemPrice: { fontSize: 12, color: '#7f8c8d', marginTop: 2 },
  itemControls: { display: 'flex', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, background: '#ecf0f1', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qty: { minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 15 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.7 },
  itemTotal: { fontWeight: 700, color: '#27ae60', minWidth: 60, textAlign: 'right' },
  footer: { padding: '20px', borderTop: '2px solid #ecf0f1', display: 'flex', flexDirection: 'column', gap: 10 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  totalLabel: { fontSize: 18, fontWeight: 600, color: '#2c3e50' },
  totalValue: { fontSize: 24, fontWeight: 800, color: '#27ae60' },
  checkoutBtn: { display: 'block', textAlign: 'center', padding: '14px', background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white', textDecoration: 'none', borderRadius: 10, fontWeight: 700, fontSize: 16 },
  viewCartBtn: { display: 'block', textAlign: 'center', padding: '10px', background: '#ecf0f1', color: '#2c3e50', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 },
};
