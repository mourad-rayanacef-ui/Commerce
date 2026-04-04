import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/Store/ProductCard';

// Demo products shown when backend is unavailable
const DEMO_PRODUCTS = [
  { id: 1, name: 'Wireless Headphones Pro', price: 129.99, category: 'Electronics', stock_quantity: 25, description: 'Premium noise-cancelling headphones with 30h battery life.', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=70' },
  { id: 2, name: 'Smart Watch Series X', price: 299.99, category: 'Electronics', stock_quantity: 12, description: 'Track health, fitness, and notifications from your wrist.', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=70' },
  { id: 3, name: 'Ergonomic Office Chair', price: 449.00, category: 'Furniture', stock_quantity: 8, description: 'Lumbar support and adjustable height for all-day comfort.', image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=300&q=70' },
  { id: 4, name: 'Mechanical Keyboard', price: 89.99, category: 'Electronics', stock_quantity: 35, description: 'RGB backlit with tactile switches for a satisfying typing experience.', image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=70' },
  { id: 5, name: 'Coffee Maker Deluxe', price: 79.99, category: 'Kitchen', stock_quantity: 20, description: 'Brew rich espresso or drip coffee with programmable settings.', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=70' },
  { id: 6, name: 'Running Shoes Ultra', price: 119.99, category: 'Sports', stock_quantity: 50, description: 'Lightweight, breathable, and designed for long-distance runs.', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=70' },
  { id: 7, name: 'Yoga Mat Premium', price: 34.99, category: 'Sports', stock_quantity: 40, description: 'Non-slip surface with alignment guides, 6mm thick.', image_url: 'https://images.unsplash.com/photo-1601925228269-5b8e5d3eb2ce?w=300&q=70' },
  { id: 8, name: 'Desk Lamp LED', price: 49.99, category: 'Furniture', stock_quantity: 30, description: 'Adjustable color temperature with USB charging port.', image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a35d157b9?w=300&q=70' },
];

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Kitchen', 'Sports'];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(DEMO_PRODUCTS);
        setUsingDemo(true);
      }
    } catch {
      setProducts(DEMO_PRODUCTS);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products
    .filter(p => category === 'All' || p.category === category)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>🛍️ Our Products</h1>
        <p style={styles.heroSub}>Discover our collection of quality products</p>
      </div>

      <div style={styles.container}>
        {usingDemo && (
          <div style={styles.demoBanner}>
            📌 Showing demo products. Connect the backend to see live inventory.
          </div>
        )}

        {/* Filters */}
        <div style={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.categoryBtns}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{ ...styles.catBtn, ...(category === cat ? styles.activeCatBtn : {}) }}
              >
                {cat}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.select}>
            <option value="name">Sort: Name A-Z</option>
            <option value="price_asc">Sort: Price Low-High</option>
            <option value="price_desc">Sort: Price High-Low</option>
          </select>
        </div>

        {/* Results count */}
        <p style={styles.count}>{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Products Grid */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p>Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>😕</p>
            <p>No products match your search.</p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} style={styles.clearBtn}>Clear Filters</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa' },
  hero: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' },
  heroTitle: { fontSize: 42, fontWeight: 900, margin: '0 0 12px 0' },
  heroSub: { fontSize: 18, opacity: 0.8, margin: 0 },
  container: { maxWidth: 1400, margin: '0 auto', padding: '32px 20px' },
  demoBanner: { background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10, padding: '12px 20px', marginBottom: 24, fontSize: 14, color: '#856404' },
  filters: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' },
  searchInput: { padding: '12px 18px', border: '2px solid #ecf0f1', borderRadius: 24, fontSize: 15, flex: 1, minWidth: 250, outline: 'none', background: 'white' },
  categoryBtns: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  catBtn: { padding: '10px 18px', background: 'white', border: '2px solid #ecf0f1', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#7f8c8d' },
  activeCatBtn: { background: '#2c3e50', color: 'white', borderColor: '#2c3e50' },
  select: { padding: '10px 14px', border: '2px solid #ecf0f1', borderRadius: 10, fontSize: 13, background: 'white', cursor: 'pointer', outline: 'none' },
  count: { color: '#7f8c8d', fontSize: 14, marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 },
  loading: { textAlign: 'center', padding: '80px 20px', color: '#7f8c8d' },
  spinner: { width: 40, height: 40, border: '4px solid #ecf0f1', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' },
  empty: { textAlign: 'center', padding: '80px 20px', color: '#7f8c8d' },
  emptyIcon: { fontSize: 60, margin: '0 0 16px 0' },
  clearBtn: { marginTop: 16, padding: '10px 24px', background: '#3498db', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 },
};
