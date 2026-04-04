import React, { useState } from 'react';
import  api  from '../../services/api';

export const ForecastControls = ({ onForecastUpdate, onProductSelect }) => {
  const [windowSize, setWindowSize] = useState(7);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [forecastDays, setForecastDays] = useState(30);

  // Fetch products on mount
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getTopProducts(50);
        setProducts(response);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleWindowChange = (e) => {
    const newWindow = parseInt(e.target.value);
    setWindowSize(newWindow);
  };

  const applyWindowSize = async () => {
    setLoading(true);
    try {
      // You would need to add this endpoint to your API
      const forecast = await api.getForecastWithWindow(windowSize);
      if (onForecastUpdate) onForecastUpdate(forecast);
    } catch (error) {
      console.error('Error updating forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = async (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    
    if (productId && onProductSelect) {
      setLoading(true);
      try {
        const productForecast = await api.getProductForecast(productId, forecastDays);
        onProductSelect(productForecast);
      } catch (error) {
        console.error('Error fetching product forecast:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForecastDaysChange = (e) => {
    setForecastDays(parseInt(e.target.value));
  };

  const applyForecastDays = async () => {
    if (selectedProduct) {
      setLoading(true);
      try {
        const productForecast = await api.getProductForecast(selectedProduct, forecastDays);
        if (onProductSelect) onProductSelect(productForecast);
      } catch (error) {
        console.error('Error updating forecast days:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="forecast-controls">
      <h3>Forecast Controls</h3>
      
      <div className="control-group">
        <label>Moving Average Window (days):</label>
        <div className="control-input-group">
          <input
            type="range"
            min="3"
            max="30"
            step="1"
            value={windowSize}
            onChange={handleWindowChange}
          />
          <span className="value-display">{windowSize} days</span>
          <button onClick={applyWindowSize} disabled={loading}>
            {loading ? 'Updating...' : 'Apply'}
          </button>
        </div>
        <small>Larger window = smoother but less responsive forecast</small>
      </div>

      <div className="control-group">
        <label>Select Product for Specific Forecast:</label>
        <div className="control-input-group">
          <select value={selectedProduct} onChange={handleProductSelect}>
            <option value="">-- Select a product --</option>
            {products.map((product, idx) => (
              <option key={idx} value={idx + 1}>
                {product.name} (${product.revenue.toLocaleString()} revenue)
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProduct && (
        <div className="control-group">
          <label>Forecast Horizon (days):</label>
          <div className="control-input-group">
            <select value={forecastDays} onChange={handleForecastDaysChange}>
              <option value="7">7 days (1 week)</option>
              <option value="14">14 days (2 weeks)</option>
              <option value="30">30 days (1 month)</option>
              <option value="60">60 days (2 months)</option>
              <option value="90">90 days (3 months)</option>
            </select>
            <button onClick={applyForecastDays} disabled={loading}>
              Update Forecast
            </button>
          </div>
        </div>
      )}

      <div className="control-info">
        <h4>ℹ️ How Forecast Works</h4>
        <p>
          This forecast uses <strong>Simple Moving Average</strong> to predict future demand.
          The algorithm analyzes historical sales patterns and calculates the average daily
          sales over your selected window size.
        </p>
        <ul>
          <li><strong>Small window (3-7 days)</strong>: Reacts quickly to recent changes</li>
          <li><strong>Medium window (8-14 days)</strong>: Balanced approach</li>
          <li><strong>Large window (15-30 days)</strong>: Smooths out noise, good for stable products</li>
        </ul>
      </div>
    </div>
  );
};