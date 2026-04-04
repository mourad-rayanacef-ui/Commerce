// frontend/src/components/Store/CartDrawer.jsx
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
        {cartItems.map(item => (
          <div key={item.id} className="drawer-item">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="drawer-footer">
        <div>Total: ${getTotalPrice().toFixed(2)}</div>
        <Link to="/cart" onClick={onClose}>View Cart</Link>
      </div>
    </div>
  );
};

export default CartDrawer;