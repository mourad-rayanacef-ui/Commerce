// frontend/src/pages/CartPage.jsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import '../styles/cart.css';

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useContext(CartContext);

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <button className="continue-btn" onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="cart-header">
        <h1>Shopping Cart</h1>
        <span className="cart-count">
          {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
        </span>
      </header>

      <div className="cart-body">
        {/* ── Item list ── */}
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              {/* Thumbnail (show if image_url exists) */}
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="cart-item-img"
                />
              )}

              <div className="item-info">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-unit-price">
                  ${Number(item.price).toFixed(2)} each
                </p>
              </div>

              {/* Quantity controls */}
              <div className="item-quantity">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ── Summary panel ── */}
        <aside className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal ({getTotalItems()} items)</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="free-shipping">Free</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>

          <button
            className="checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>

          <button
            className="clear-cart-btn"
            onClick={() => {
              if (window.confirm('Clear all items from your cart?')) clearCart();
            }}
          >
            Clear cart
          </button>

          <button className="continue-btn-secondary" onClick={() => navigate('/')}>
            ← Continue Shopping
          </button>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;