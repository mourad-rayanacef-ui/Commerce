// frontend/src/components/Store/ProductCard.jsx
import React from 'react';
import '../../styles/product-card.css';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={`https://via.placeholder.com/200?text=${product.name}`} alt={product.name} />
      </div>
      <div className="product-content">
        <h3>{product.name}</h3>
        <p className="description">{product.description}</p>
        <div className="product-footer">
          <span className="price">${product.price}</span>
          <span className="stock">Stock: {product.stock}</span>
        </div>
        <button
          onClick={onAddToCart}
          disabled={product.stock === 0}
          className="add-to-cart-btn"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;