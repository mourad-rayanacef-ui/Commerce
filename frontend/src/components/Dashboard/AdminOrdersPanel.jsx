import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/admin-orders.css';

const AdminOrdersPanel = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/orders/admin/all?limit=75', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(typeof data.detail === 'string' ? data.detail : 'Could not load orders');
          setOrders([]);
          return;
        }
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) {
          setError('Network error');
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <section className="admin-orders-section">
        <h2 className="admin-orders-title">Recent orders</h2>
        <p className="admin-orders-muted">Loading orders…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-orders-section">
        <h2 className="admin-orders-title">Recent orders</h2>
        <p className="admin-orders-error">{error}</p>
      </section>
    );
  }

  return (
    <section className="admin-orders-section">
      <div className="admin-orders-head">
        <div>
          <h2 className="admin-orders-title">Recent orders</h2>
          <p className="admin-orders-sub">Newest customer checkouts across the store.</p>
        </div>
        <div className="admin-orders-head-actions">
          <span className="admin-orders-count">{orders.length} shown</span>
          <Link to="/admin/orders" className="admin-orders-view-all">
            View all orders →
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="admin-orders-muted">No orders yet. They will appear here when customers check out.</p>
      ) : (
        <div className="admin-orders-table-wrap">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Status</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="admin-orders-num">{o.order_number}</span>
                    <span className="admin-orders-id">#{o.id}</span>
                  </td>
                  <td>
                    <div className="admin-orders-customer">
                      {o.customer_full_name || o.customer_username}
                    </div>
                    <div className="admin-orders-email">{o.customer_email}</div>
                  </td>
                  <td>
                    <a className="admin-orders-phone" href={`tel:${o.phone_number}`}>
                      {o.phone_number}
                    </a>
                  </td>
                  <td className="admin-orders-money">${Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={`admin-orders-status admin-orders-status--${(o.status || 'pending').toLowerCase()}`}>
                      {o.status || 'pending'}
                    </span>
                  </td>
                  <td className="admin-orders-when">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminOrdersPanel;
