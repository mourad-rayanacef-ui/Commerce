import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const CATEGORIES = ['Electronics', 'Furniture', 'Kitchen', 'Sports', 'Clothing', 'Books', 'Other'];

const EMPTY_FORM = { name: '', price: '', description: '', category: '', stock_quantity: '', image_url: '', is_active: true };

export default function AdminProductsPage() {
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadProducts();
  }, [isAdmin]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditProduct(null); setForm(EMPTY_FORM); setError(''); setShowForm(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ name: p.name, price: p.price, description: p.description || '', category: p.category || '', stock_quantity: p.stock_quantity, image_url: p.image_url || '', is_active: p.is_active !== false }); setError(''); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    setSaving(true); setError('');
    try {
      const data = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) || 0 };
      if (editProduct) {
        await api.updateProduct(editProduct.id, data, token);
        setSuccess('Product updated successfully!');
      } else {
        await api.createProduct(data, token);
        setSuccess('Product created successfully!');
      }
      setShowForm(false);
      await loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (!isAdmin) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📦 Product Management</h1>
            <p style={styles.subtitle}>{products.length} products in catalog</p>
          </div>
          <button onClick={openCreate} style={styles.addBtn}>+ Add Product</button>
        </div>

        {success && <div style={styles.successAlert}>{success}</div>}

        {loading ? (
          <div style={styles.loading}><div style={styles.spinner}/><p>Loading products...</p></div>
        ) : (
          <div style={styles.grid}>
            {products.map(p => (
              <div key={p.id} style={{ ...styles.card, ...(p.is_active === false ? styles.inactiveCard : {}) }}>
                <div style={styles.cardImageWrap}>
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=60'}
                    alt={p.name}
                    style={styles.cardImage}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=60'; }}
                  />
                  {p.is_active === false && <div style={styles.inactiveBadge}>Inactive</div>}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardCat}>{p.category || 'Uncategorized'}</div>
                  <h3 style={styles.cardName}>{p.name}</h3>
                  <div style={styles.cardRow}>
                    <span style={styles.cardPrice}>${Number(p.price).toFixed(2)}</span>
                    <span style={styles.cardStock}>Stock: {p.stock_quantity ?? '—'}</span>
                  </div>
                  <button onClick={() => openEdit(p)} style={styles.editBtn}>✏️ Edit</button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div style={styles.empty}>
                <p style={{ fontSize: 40 }}>📦</p>
                <p>No products yet. Add your first product!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editProduct ? '✏️ Edit Product' : '➕ New Product'}</h2>
              <button onClick={() => setShowForm(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              {error && <div style={styles.errorAlert}>{error}</div>}
              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Product Name *</label>
                  <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter product name" style={styles.input} required />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Price ($) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => update('price', e.target.value)} placeholder="0.00" style={styles.input} required />
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Category</label>
                  <select value={form.category} onChange={e => update('category', e.target.value)} style={styles.input}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Stock Quantity</label>
                  <input type="number" min="0" value={form.stock_quantity} onChange={e => update('stock_quantity', e.target.value)} placeholder="0" style={styles.input} />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Product description..." style={styles.textarea} rows={3} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Image URL</label>
                <input value={form.image_url} onChange={e => update('image_url', e.target.value)} placeholder="https://..." style={styles.input} />
              </div>
              <div style={styles.checkboxRow}>
                <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} />
                <label htmlFor="is_active" style={styles.checkLabel}>Active (visible in store)</label>
              </div>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>{saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa', paddingBottom: 60 },
  container: { maxWidth: 1400, margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: 32, fontWeight: 800, color: '#2c3e50', margin: '0 0 4px 0' },
  subtitle: { fontSize: 14, color: '#7f8c8d', margin: 0 },
  addBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #27ae60, #229954)', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 700 },
  successAlert: { background: '#d4edda', color: '#155724', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 },
  loading: { textAlign: 'center', padding: 60, color: '#7f8c8d' },
  spinner: { width: 40, height: 40, border: '4px solid #ecf0f1', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 },
  card: { background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  inactiveCard: { opacity: 0.6 },
  cardImageWrap: { position: 'relative', paddingTop: '60%', background: '#f8f9fa', overflow: 'hidden' },
  cardImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  inactiveBadge: { position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  cardBody: { padding: 16 },
  cardCat: { fontSize: 11, color: '#3498db', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 },
  cardName: { fontSize: 15, fontWeight: 700, color: '#2c3e50', margin: '0 0 10px 0' },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardPrice: { fontSize: 18, fontWeight: 800, color: '#27ae60' },
  cardStock: { fontSize: 12, color: '#7f8c8d', background: '#f0f0f0', padding: '3px 8px', borderRadius: 10 },
  editBtn: { width: '100%', padding: '10px', background: '#ecf0f1', color: '#2c3e50', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  empty: { gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#7f8c8d' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: 'white', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #ecf0f1', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', borderRadius: '16px 16px 0 0' },
  modalTitle: { margin: 0, fontSize: 20, fontWeight: 700 },
  closeBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  form: { padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#2c3e50' },
  input: { padding: '12px 14px', border: '2px solid #ecf0f1', borderRadius: 10, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  textarea: { padding: '12px 14px', border: '2px solid #ecf0f1', borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 10 },
  checkLabel: { fontSize: 14, color: '#2c3e50', cursor: 'pointer' },
  formActions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '12px 24px', background: '#ecf0f1', color: '#2c3e50', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  saveBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 },
  errorAlert: { background: '#fde8e8', color: '#c0392b', padding: '12px 16px', borderRadius: 10, fontSize: 14 },
};
