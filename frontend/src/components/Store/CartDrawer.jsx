import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import '../../styles/cart-drawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, getTotalPrice } = useContext(CartContext);

  return (
    <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h2>Shopping Cart ({cartItems.length})</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="drawer-items">
        {cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty</p>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="drawer-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-qty">x{item.quantity}</span>
              </div>
              <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="remove-btn"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="drawer-footer">
          <div className="drawer-total">
            Total: ${getTotalPrice().toFixed(2)}
          </div>
          <Link to="/cart" onClick={onClose} className="view-cart-link">
            View Full Cart
          </Link>
          <Link to="/checkout" onClick={onClose} className="checkout-link">
            Proceed to Checkout
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;