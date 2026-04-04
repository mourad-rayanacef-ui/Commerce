import React, { useState, useEffect } from 'react';

const ReorderModal = ({ product, onClose, onReorder }) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productPrice, setProductPrice] = useState(0);

  // Fetch product price when modal opens
  useEffect(() => {
    const fetchProductPrice = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/products/${product.product_id}/price`);
        const data = await response.json();
        setProductPrice(data.price);
      } catch (err) {
        console.error('Error fetching price:', err);
        // Fallback to estimated price based on product name
        const estimatedPrices = {
          'Gaming Laptop': 1299.99,
          'Wireless Mouse': 49.99,
          'Mechanical Keyboard': 129.99,
          'Office Chair': 299.99,
          'Standing Desk': 499.99,
          'Notebook': 4.99,
          'Pen Set': 19.99,
          'Monitor 27inch': 349.99
        };
        setProductPrice(estimatedPrices[product.product_name] || 99.99);
      }
    };
    fetchProductPrice();
  }, [product.product_id, product.product_name]);

  const suggestedQuantity = () => {
    const deficit = product.reorder_point - product.current_stock;
    return Math.max(deficit + product.reorder_point, product.reorder_point * 2);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 0) {
      setQuantity(value);
      setError('');
    }
  };

  const handleUseSuggested = () => {
    setQuantity(suggestedQuantity());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      await onReorder(product.product_id, parseInt(quantity));
      onClose();
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total cost - FIXED
  const totalCost = productPrice * (quantity || 0);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Reorder Product</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.productInfo}>
          <h3 style={styles.productName}>{product.product_name}</h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <label>Current Stock:</label>
              <span style={{ 
                ...styles.infoValue, 
                color: product.current_stock < product.reorder_point ? '#f44336' : '#4caf50' 
              }}>
                {product.current_stock} units
              </span>
            </div>
            <div style={styles.infoItem}>
              <label>Reorder Point:</label>
              <span style={styles.infoValue}>{product.reorder_point} units</span>
            </div>
            <div style={styles.infoItem}>
              <label>Unit Price:</label>
              <span style={styles.infoValue}>${productPrice.toFixed(2)}</span>
            </div>
            <div style={styles.infoItem}>
              <label>Status:</label>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: 
                  product.status === 'Critical' ? '#dc3545' :
                  product.status === 'Low' ? '#ffc107' :
                  product.status === 'Healthy' ? '#28a745' : '#17a2b8'
              }}>
                {product.status}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Order Quantity:</label>
            <div style={styles.quantityContainer}>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="Enter quantity"
                min="1"
                step="1"
                autoFocus
                style={styles.input}
              />
              <button 
                type="button" 
                onClick={handleUseSuggested}
                style={styles.suggestedBtn}
              >
                Suggested: {suggestedQuantity()}
              </button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
          </div>

          {quantity > 0 && (
            <div style={styles.costSection}>
              <label>Estimated Cost:</label>
              <div style={styles.costValue}>
                ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <small style={styles.costDetail}>
                {quantity} units × ${productPrice.toFixed(2)} = ${totalCost.toFixed(2)}
              </small>
            </div>
          )}

          <div style={styles.actions}>
            <button 
              type="button" 
              onClick={onClose}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !quantity}
              style={styles.submitBtn}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </form>

        <div style={styles.footer}>
          <small>
            💡 Orders are processed immediately and added to inventory.<br />
            Expected delivery: 3-5 business days.
          </small>
        </div>
      </div>
    </div>
  );
};

// Add endpoint to get product price
// Add to backend/app/routes/products.py
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(3px)',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '550px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#2c3e50',
    color: 'white',
    borderRadius: '12px 12px 0 0',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: 'white',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  productInfo: {
    padding: '20px 24px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  },
  productName: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    color: '#2c3e50',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  infoValue: {
    fontWeight: '600',
    fontSize: '16px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    padding: '24px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
  },
  quantityContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
  },
  suggestedBtn: {
    padding: '10px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  costSection: {
    backgroundColor: '#e8f5e9',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  costValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: '8px',
  },
  costDetail: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  submitBtn: {
    padding: '10px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  error: {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '8px',
  },
  footer: {
    padding: '16px 24px',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #e0e0e0',
    fontSize: '12px',
    color: '#6c757d',
    borderRadius: '0 0 12px 12px',
  },
};

export default ReorderModal;