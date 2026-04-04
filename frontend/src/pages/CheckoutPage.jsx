// frontend/src/pages/CheckoutPage.jsx
import React, { useState, useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/checkout.css';

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const [shipping, setShipping] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
      shipping_address: shipping,
      phone_number: phone,
      notes
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('Order placed successfully!');
        clearCart();
        window.location.href = '/orders';
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-container">
        <form onSubmit={handleCheckout}>
          <div className="shipping-info">
            <h2>Shipping Information</h2>
            <input
              type="text"
              placeholder="Shipping Address"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <textarea
              placeholder="Order Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>
          {cartItems.map(item => (
            <div key={item.id} className="summary-item">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-total">
            <strong>Total: ${getTotalPrice().toFixed(2)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;