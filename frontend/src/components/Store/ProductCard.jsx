import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

  return (
    <div style={styles.card}>
      <div style={styles.imageWrap}>
        <img
          src={product.image_url || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=70`}
          alt={product.name}
          style={styles.image}
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=70'; }}
        />
        {isOutOfStock && <div style={styles.outOfStockBadge}>Out of Stock</div>}
        {product.category && <div style={styles.categoryBadge}>{product.category}</div>}
      </div>
      <div style={styles.body}>
        <h3 style={styles.name}>{product.name}</h3>
        {product.description && (
          <p style={styles.description}>{product.description.slice(0, 80)}{product.description.length > 80 ? '...' : ''}</p>
        )}
        <div style={styles.footer}>
          <span style={styles.price}>${Number(product.price).toFixed(2)}</span>
          {product.stock_quantity !== undefined && product.stock_quantity > 0 && (
            <span style={styles.stock}>In stock: {product.stock_quantity}</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          style={{ ...styles.addBtn, ...(added ? styles.addedBtn : {}), ...(isOutOfStock ? styles.disabledBtn : {}) }}
        >
          {added ? '✓ Added!' : isOutOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: { background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column' },
  imageWrap: { position: 'relative', paddingTop: '65%', background: '#f8f9fa', overflow: 'hidden' },
  image: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
  outOfStockBadge: { position: 'absolute', top: 10, left: 10, background: 'rgba(231,76,60,0.9)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  categoryBadge: { position: 'absolute', top: 10, right: 10, background: 'rgba(52,152,219,0.9)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  body: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 },
  name: { fontSize: 16, fontWeight: 700, color: '#2c3e50', margin: 0 },
  description: { fontSize: 13, color: '#7f8c8d', margin: 0, lineHeight: 1.5 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  price: { fontSize: 20, fontWeight: 800, color: '#27ae60' },
  stock: { fontSize: 12, color: '#95a5a6', background: '#f0f0f0', padding: '3px 8px', borderRadius: 10 },
  addBtn: { width: '100%', padding: '10px', background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, marginTop: 8, transition: 'all 0.2s' },
  addedBtn: { background: 'linear-gradient(135deg, #27ae60, #229954)' },
  disabledBtn: { background: '#bdc3c7', cursor: 'not-allowed' },
};
