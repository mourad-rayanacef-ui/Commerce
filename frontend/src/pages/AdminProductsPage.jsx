import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import AdminShell from '../components/Admin/AdminShell';
import { uploadsAPI } from '../services/api';
import '../styles/admin-products.css';

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '' };

const AdminProductsPage = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [imgUploading, setImgUploading] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const q = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/products?limit=200${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage(null);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      stock: String(p.stock),
      image_url: p.image_url || '',
    });
    setMessage(null);
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) return;
    setImgUploading(true);
    setMessage(null);
    try {
      const url = await uploadsAPI.uploadImage(file, token);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      setMessage(err.message || 'Image upload failed');
    } finally {
      setImgUploading(false);
    }
  };

  const clearImage = () => setForm((prev) => ({ ...prev, image_url: '' }));

  const submit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage(null);
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      image_url: form.image_url?.trim() || null,
    };
    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail =
          typeof data.detail === 'string'
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
              : 'Could not save product';
        setMessage(detail);
        return;
      }
      setMessage(editingId ? 'Product updated.' : 'Product created.');
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setMessage('Network error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!token || !window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage('Product deleted.');
        if (editingId === id) {
          setEditingId(null);
          setForm(emptyForm);
        }
        await load();
      } else {
        const data = await res.json();
        setMessage(data.detail || 'Delete failed');
      }
    } catch {
      setMessage('Delete failed');
    }
  };

  return (
    <AdminShell
      title="Products"
      subtitle="Create, edit, and remove catalog items. Changes apply to the storefront immediately."
    >
      <div className="admin-products">
        {message && (
          <div
            className={`admin-products-banner ${
              message.includes('fail') ||
              message.includes('Could not') ||
              message.includes('upload') ||
              message.includes('Image') ||
              message.includes('image_url') ||
              message.includes('Network')
                ? 'admin-products-banner--err'
                : ''
            }`}
          >
            {message}
          </div>
        )}

        <div className="admin-products-grid">
          <section className="admin-products-panel admin-products-panel--form">
            <div className="admin-products-panel-head">
              <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
              {editingId && (
                <button type="button" className="admin-products-text-btn" onClick={openCreate}>
                  New product instead
                </button>
              )}
            </div>
            <form className="admin-products-form" onSubmit={submit}>
              <div className="admin-products-image-field">
                <span className="admin-products-image-label">Product image</span>
                <div className="admin-products-image-preview-wrap">
                  {form.image_url ? (
                    <img src={form.image_url} alt="" className="admin-products-image-preview" />
                  ) : (
                    <div className="admin-products-image-placeholder" aria-hidden>
                      No image
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="admin-products-file-input"
                  onChange={onPickImage}
                  aria-hidden
                />
                <div className="admin-products-image-actions">
                  <button
                    type="button"
                    className="admin-products-image-btn"
                    onClick={() => fileRef.current?.click()}
                    disabled={imgUploading}
                  >
                    {imgUploading ? 'Uploading…' : form.image_url ? 'Replace image' : 'Upload image'}
                  </button>
                  {form.image_url ? (
                    <button type="button" className="admin-products-image-btn admin-products-image-btn--ghost" onClick={clearImage}>
                      Remove
                    </button>
                  ) : null}
                </div>
                <p className="admin-products-image-hint">JPEG, PNG, WebP, or GIF (max 5MB). Uses your Cloudinary config when set.</p>
              </div>

              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Wireless mouse"
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Short description for the store"
                />
              </label>
              <div className="admin-products-form-row">
                <label>
                  Price ($)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </label>
              </div>
              <button type="submit" className="admin-products-submit" disabled={saving || imgUploading}>
                {saving ? 'Saving…' : editingId ? 'Update product' : 'Add to catalog'}
              </button>
            </form>
          </section>

          <section className="admin-products-panel admin-products-panel--table">
            <div className="admin-products-panel-head">
              <h2>Catalog</h2>
              <input
                type="search"
                className="admin-products-search"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <p className="admin-products-muted">Loading products…</p>
            ) : products.length === 0 ? (
              <p className="admin-products-muted">No products match your search.</p>
            ) : (
              <div className="admin-products-table-wrap">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th className="admin-products-col-thumb" aria-label="Image" />
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="admin-products-col-thumb">
                          {p.image_url ? (
                            <img src={p.image_url} alt="" className="admin-products-thumb" />
                          ) : (
                            <div className="admin-products-thumb admin-products-thumb--empty" aria-hidden>
                              {(p.name || '?').slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="admin-products-name">{p.name}</div>
                          <div className="admin-products-desc">{p.description}</div>
                        </td>
                        <td>${Number(p.price).toFixed(2)}</td>
                        <td>{p.stock}</td>
                        <td className="admin-products-actions">
                          <button type="button" onClick={() => openEdit(p)}>
                            Edit
                          </button>
                          <button type="button" className="danger" onClick={() => remove(p.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminProductsPage;
