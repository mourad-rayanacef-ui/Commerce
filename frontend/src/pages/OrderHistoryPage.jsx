// frontend/src/pages/OrderHistoryPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import '../styles/orders.css';

const statusLabel = (s) => (s ? s.replace(/_/g, ' ') : 'pending');

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const location = useLocation();
  const justPlaced = location.state?.orderPlaced;

  // Clear the cart when landing here after a successful order
  useEffect(() => {
    if (justPlaced) {
      clearCart();
    }
  }, [justPlaced]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setOrders([]);
      return;
    }
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setError(null);
    try {
      const response = await fetch('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders (${response.status})`);
      }

      const data = await response.json();
      // Sort newest first (defensive — backend should already do this)
      const sorted = Array.isArray(data)
        ? [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setOrders(sorted);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Could not load your orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="orders-spinner" aria-hidden />
          <p>Loading your orders…</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="orders-page">
        <div className="orders-empty">
          <p>Please log in to view your orders.</p>
          <Link to="/login" className="orders-cta">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <header className="orders-hero">
        <div>
          <h1>Order history</h1>
          <p className="orders-hero-sub">Track shipments and totals in one place.</p>
        </div>
        <Link to="/" className="orders-shop-link">
          Continue shopping →
        </Link>
      </header>

      {justPlaced && (
        <div className="orders-success-banner" role="status">
          ✅ Order placed successfully — thank you! It should appear in the list below.
        </div>
      )}

      {error && (
        <div className="orders-error-banner" role="alert">
          {error}
          <button onClick={fetchOrders} className="orders-retry-btn">
            Retry
          </button>
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="orders-empty">
          <p>You have not placed any orders yet.</p>
          <Link to="/" className="orders-cta">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3 className="order-number">{order.order_number}</h3>
                  <time className="order-date" dateTime={order.created_at}>
                    {new Date(order.created_at).toLocaleString()}
                  </time>
                </div>
                <span
                  className={`status-pill status-${(order.status || 'pending').toLowerCase()}`}
                >
                  {statusLabel(order.status)}
                </span>
              </div>

              <dl className="order-meta">
                <div>
                  <dt>Total</dt>
                  <dd>${Number(order.total_amount).toFixed(2)}</dd>
                </div>
                <div>
                  <dt>Ship to</dt>
                  <dd>{order.shipping_address}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{order.phone_number}</dd>
                </div>
                {order.notes && (
                  <div>
                    <dt>Notes</dt>
                    <dd>{order.notes}</dd>
                  </div>
                )}
              </dl>

              {Array.isArray(order.image_urls) && order.image_urls.length > 0 && (
                <div className="order-attachments">
                  <h4 className="order-attachments-title">Photos</h4>
                  <div className="order-attachments-grid">
                    {order.image_urls.map((src, i) => (
                      <a
                        key={`${order.id}-img-${i}`}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src={src} alt={`Attachment ${i + 1}`} className="order-attachment-thumb" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;