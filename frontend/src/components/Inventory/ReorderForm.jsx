import React, { useState } from 'react';
import  api  from '../../services/api';

export const ReorderForm = ({ product, onReorderComplete, onCancel }) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate suggested order quantity based on reorder point and current stock
  const calculateSuggestedQuantity = () => {
    if (!product) return 20;
    const deficit = product.reorder_point - product.current_stock;
    // Order enough to reach 2x reorder point for safety
    const suggested = Math.max(deficit + product.reorder_point, product.reorder_point * 2);
    return Math.min(suggested, 500); // Cap at 500 units
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 0) {
      setQuantity(value);
      setError('');
    }
  };

  const handleUseSuggested = () => {
    setQuantity(calculateSuggestedQuantity());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await api.reorderProduct(product.product_id, quantity);
      setSuccess(`Successfully ordered ${quantity} units of ${product.product_name}`);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        if (onReorderComplete) onReorderComplete(result);
        setQuantity('');
        setSuccess('');
        if (onCancel) onCancel();
      }, 2000);
    } catch (err) {
      setError('Failed to place order. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="reorder-form error">
        <p>No product selected for reorder</p>
        <button onClick={onCancel}>Close</button>
      </div>
    );
  }

  return (
    <div className="reorder-form-overlay">
      <div className="reorder-form">
        <div className="form-header">
          <h3>Place Reorder Order</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="product-info">
          <h4>{product.product_name}</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>Current Stock:</label>
              <span className={product.current_stock < product.reorder_point ? 'warning' : ''}>
                {product.current_stock} units
              </span>
            </div>
            <div className="info-item">
              <label>Reorder Point:</label>
              <span>{product.reorder_point} units</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge ${product.status.toLowerCase()}`}>
                {product.status}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quantity">Order Quantity:</label>
            <div className="quantity-input-group">
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="Enter quantity"
                min="1"
                step="1"
                autoFocus
              />
              <button type="button" onClick={handleUseSuggested} className="suggested-btn">
                Use Suggested ({calculateSuggestedQuantity()})
              </button>
            </div>
            <small>Suggested based on reorder point and current stock levels</small>
          </div>

          <div className="form-group">
            <label>Estimated Cost:</label>
            <div className="cost-estimate">
              {(() => {
                const unit = Number(product.price);
                const qty = Number(quantity);
                const ok = !Number.isNaN(unit) && !Number.isNaN(qty) && qty > 0;
                return ok ? (
                  <span>
                    ${(unit * qty).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                ) : (
                  <span>—</span>
                );
              })()}
            </div>
            <small className="cost-estimate-hint">Uses catalog unit price × quantity</small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading || !quantity} className="submit-btn">
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>

        <div className="form-footer">
          <small>
            ⚡ Orders are processed immediately and will be added to inventory.
            Standard delivery time: 3-5 business days.
          </small>
        </div>
      </div>
    </div>
  );
};