// frontend/src/pages/AdminOrdersPage.jsx
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import AdminShell from '../components/Admin/AdminShell';
import '../styles/admin-orders.css';
import '../styles/admin-orders-page.css';

const VALID_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'];

const AdminOrdersPage = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detailById, setDetailById] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null); // order id being updated
  const [statusError, setStatusError] = useState({}); // { [orderId]: errorMsg }

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/admin/all?limit=500', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Could not load orders');
        setOrders([]);
        return;
      }
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setError('Network error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const blob = [
        o.order_number,
        o.customer_username,
        o.customer_email,
        o.customer_full_name,
        o.phone_number,
        o.shipping_address,
        o.notes,
        String(o.id),
        String(o.user_id),
        o.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  }, [orders, search]);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (detailById[id]) return;
    setDetailLoading(id);
    try {
      const res = await fetch(`/api/orders/admin/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDetailById((prev) => ({ ...prev, [id]: data }));
      }
    } catch {
      /* ignore */
    } finally {
      setDetailLoading(null);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    setStatusError((prev) => ({ ...prev, [orderId]: null }));
    try {
      const res = await fetch(`/api/orders/admin/order/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusError((prev) => ({
          ...prev,
          [orderId]: typeof data.detail === 'string' ? data.detail : 'Update failed',
        }));
        return;
      }
      // Update the order in local state — no need to refetch everything
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: data.status } : o))
      );
    } catch {
      setStatusError((prev) => ({ ...prev, [orderId]: 'Network error' }));
    } finally {
      setStatusUpdating(null);
    }
  };

  return (
    <AdminShell
      title="Orders"
      subtitle="Every checkout: customer, delivery phone, address, notes, and line items."
    >
      <div className="admin-orders-page">
        {/* ── Toolbar ── */}
        <div className="admin-orders-page-toolbar">
          <input
            type="search"
            className="admin-orders-page-search"
            placeholder="Search by order #, name, email, phone, address, notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter orders"
          />
          <div className="admin-orders-page-meta">
            <span>
              Showing <strong>{filtered.length}</strong>
              {search.trim() ? ` of ${orders.length}` : ''} orders
            </span>
            <button
              type="button"
              className="admin-orders-page-refresh"
              onClick={loadOrders}
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && <p className="admin-orders-error">{error}</p>}

        {loading ? (
          <p className="admin-orders-muted">Loading orders…</p>
        ) : filtered.length === 0 ? (
          <p className="admin-orders-muted">
            {orders.length === 0 ? 'No orders yet.' : 'No orders match your search.'}
          </p>
        ) : (
          <div className="admin-orders-page-table-wrap">
            <table className="admin-orders-table admin-orders-table--wide">
              <thead>
                <tr>
                  <th className="admin-orders-col-expand" aria-label="Details" />
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Delivery phone</th>
                  <th>Shipping address</th>
                  <th>Notes</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <React.Fragment key={`order-${o.id}`}>
                    <tr className={expandedId === o.id ? 'admin-orders-row--open' : ''}>
                      {/* Expand toggle */}
                      <td className="admin-orders-col-expand">
                        <button
                          type="button"
                          className="admin-orders-expand-btn"
                          onClick={() => toggleExpand(o.id)}
                          aria-expanded={expandedId === o.id}
                        >
                          {expandedId === o.id ? '▼' : '▶'}
                        </button>
                      </td>

                      {/* Order number */}
                      <td>
                        <span className="admin-orders-num">{o.order_number}</span>
                        <span className="admin-orders-id">#{o.id}</span>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="admin-orders-customer">
                          {o.customer_full_name || o.customer_username}
                        </div>
                        <div className="admin-orders-email">{o.customer_username}</div>
                        <div className="admin-orders-email">{o.customer_email}</div>
                        <div className="admin-orders-account-id">User ID {o.user_id}</div>
                      </td>

                      {/* Phone */}
                      <td>
                        <a className="admin-orders-phone" href={`tel:${o.phone_number}`}>
                          {o.phone_number}
                        </a>
                      </td>

                      {/* Address */}
                      <td className="admin-orders-address">{o.shipping_address}</td>

                      {/* Notes */}
                      <td className="admin-orders-notes-cell">
                        {o.notes ? (
                          <span title={o.notes}>
                            {o.notes.length > 80 ? `${o.notes.slice(0, 80)}…` : o.notes}
                          </span>
                        ) : (
                          <span className="admin-orders-muted-inline">—</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="admin-orders-money">
                        ${Number(o.total_amount).toFixed(2)}
                      </td>

                      {/* ── Status dropdown ── */}
                      <td className="admin-orders-status-cell">
                        <select
                          className={`admin-orders-status-select admin-orders-status-select--${(o.status || 'pending').toLowerCase()}`}
                          value={o.status || 'pending'}
                          disabled={statusUpdating === o.id}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          aria-label={`Change status for order ${o.order_number}`}
                        >
                          {VALID_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        {statusUpdating === o.id && (
                          <span className="admin-orders-status-saving">Saving…</span>
                        )}
                        {statusError[o.id] && (
                          <span className="admin-orders-status-err">{statusError[o.id]}</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="admin-orders-when">
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                    </tr>

                    {/* ── Expandable detail row ── */}
                    {expandedId === o.id && (
                      <tr className="admin-orders-detail-row">
                        <td colSpan={9}>
                          <div className="admin-orders-detail-panel">
                            {detailLoading === o.id ? (
                              <p className="admin-orders-muted">Loading line items…</p>
                            ) : detailById[o.id]?.items?.length ||
                              (Array.isArray(detailById[o.id]?.image_urls) &&
                                detailById[o.id].image_urls.length > 0) ? (
                              <>
                                {/* Photos */}
                                {Array.isArray(detailById[o.id]?.image_urls) &&
                                  detailById[o.id].image_urls.length > 0 && (
                                    <div className="admin-orders-photos">
                                      <strong>Order photos</strong>
                                      <div className="admin-orders-photos-grid">
                                        {detailById[o.id].image_urls.map((src, pi) => (
                                          <a
                                            key={`${o.id}-p-${pi}`}
                                            href={src}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <img src={src} alt={`Order photo ${pi + 1}`} />
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                {/* Line items */}
                                {detailById[o.id]?.items?.length > 0 && (
                                  <table className="admin-orders-lines">
                                    <thead>
                                      <tr>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Unit price</th>
                                        <th>Line total</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {detailById[o.id].items.map((line, idx) => (
                                        <tr key={`${o.id}-line-${idx}`}>
                                          <td>{line.product_name}</td>
                                          <td>{line.quantity}</td>
                                          <td>${Number(line.price_at_time).toFixed(2)}</td>
                                          <td>${Number(line.line_total).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </>
                            ) : (
                              <p className="admin-orders-muted">No line items loaded.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="admin-orders-page-foot">
          <Link to="/admin/dashboard">← Back to dashboard</Link>
        </p>
      </div>
    </AdminShell>
  );
};

export default AdminOrdersPage;