import React, { useState, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { uploadsAPI } from '../services/api';
import '../styles/checkout.css';

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [shipping, setShipping] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [orderImageUrls, setOrderImageUrls] = useState([]);
  const [imgBusy, setImgBusy] = useState(false);
  const photoInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('You need to be logged in to place an order.');
      return;
    }
    if (!cartItems.length) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);

    const orderData = {
      items: cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      shipping_address: shipping,
      phone_number: phone,
      notes: notes || undefined,
      image_urls: orderImageUrls.length ? orderImageUrls : undefined,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        clearCart();
        navigate('/orders', { replace: true, state: { orderPlaced: true } });
        return;
      }

      const msg =
        typeof data.detail === 'string'
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail.map((d) => d.msg || d.type).join(', ')
            : 'Could not place order. Please try again.';
      setError(msg);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const addOrderPhotos = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (!picked.length || !token) return;
    const remaining = 5 - orderImageUrls.length;
    if (remaining <= 0) return;
    setImgBusy(true);
    setError('');
    try {
      const newUrls = [];
      for (const f of picked.slice(0, remaining)) {
        const url = await uploadsAPI.uploadImage(f, token);
        newUrls.push(url);
      }
      setOrderImageUrls((prev) => [...prev, ...newUrls]);
    } catch (err) {
      setError(err.message || 'Photo upload failed');
    } finally {
      setImgBusy(false);
    }
  };

  const removeOrderPhoto = (idx) => {
    setOrderImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  if (!cartItems.length) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h1>Checkout</h1>
          <p>Your cart is empty.</p>
          <Link to="/" className="checkout-btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <header className="checkout-hero">
        <div>
          <h1>Checkout</h1>
          <p className="checkout-hero-sub">Review your cart and enter shipping details — you stay signed in.</p>
        </div>
        <Link to="/cart" className="checkout-back">
          ← Back to cart
        </Link>
      </header>

      {error && (
        <div className="checkout-alert checkout-alert--error" role="alert">
          {error}
        </div>
      )}

      <div className="checkout-container">
        <form className="checkout-form-card" onSubmit={handleCheckout}>
          <h2>Shipping</h2>
          <p className="checkout-form-hint">We’ll use this for delivery updates.</p>
          <label className="checkout-label">
            Address
            <input
              type="text"
              placeholder="Street, city, postal code"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              required
              autoComplete="street-address"
            />
          </label>
          <label className="checkout-label">
            Phone
            <input
              type="tel"
              placeholder="For delivery questions"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </label>
          <label className="checkout-label">
            Notes <span className="checkout-optional">(optional)</span>
            <textarea
              placeholder="Delivery instructions, gift message…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </label>

          <div className="checkout-photos">
            <span className="checkout-label-text">
              Order photos <span className="checkout-optional">(optional, max 5)</span>
            </span>
            <p className="checkout-form-hint">Reference photos, receipts, or delivery spot — uploaded securely.</p>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="checkout-file-input"
              onChange={addOrderPhotos}
              aria-hidden
            />
            <div className="checkout-photos-row">
              <button
                type="button"
                className="checkout-photos-add"
                onClick={() => photoInputRef.current?.click()}
                disabled={imgBusy || orderImageUrls.length >= 5}
              >
                {imgBusy ? 'Uploading…' : orderImageUrls.length >= 5 ? 'Maximum 5 photos' : 'Add photos'}
              </button>
            </div>
            {orderImageUrls.length > 0 && (
              <ul className="checkout-photo-thumbs">
                {orderImageUrls.map((url, idx) => (
                  <li key={`${url}-${idx}`}>
                    <img src={url} alt="" />
                    <button type="button" className="checkout-photo-remove" onClick={() => removeOrderPhoto(idx)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="checkout-submit" disabled={loading}>
            {loading ? 'Placing order…' : `Pay ${getTotalPrice().toFixed(2)} — Place order`}
          </button>
        </form>

        <aside className="checkout-summary-card">
          <h2>Order summary</h2>
          <ul className="checkout-line-items">
            {cartItems.map((item) => (
              <li key={item.id} className="checkout-line-item">
                <div>
                  <span className="checkout-line-name">{item.name}</span>
                  <span className="checkout-line-qty">× {item.quantity}</span>
                </div>
                <span className="checkout-line-price">${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="checkout-total-row">
            <span>Total</span>
            <strong>${getTotalPrice().toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
