import React, { useState } from 'react';
import { ForecastChart } from '../components/Forecast/ForecastChart';
import { ForecastControls } from '../components/Forecast/ForecastControls';
import { api } from '../services/api';

export const ForecastPage = () => {
  const [reorderSuggestions, setReorderSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentForecast, setCurrentForecast] = useState(null);
  const [productForecast, setProductForecast] = useState(null);

  const loadSuggestions = async () => {
    const suggestions = await api.getReorderSuggestions();
    setReorderSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const handleForecastUpdate = (forecast) => {
    setCurrentForecast(forecast);
  };

  const handleProductSelect = (forecast) => {
    setProductForecast(forecast);
  };

  return (
    <div className="forecast-page">
      <h1>Demand Forecasting</h1>
      
      <ForecastControls 
        onForecastUpdate={handleForecastUpdate}
        onProductSelect={handleProductSelect}
      />
      
      {currentForecast && <ForecastChart forecast={currentForecast} />}
      {!currentForecast && <ForecastChart />}
      
      {productForecast && (
        <div className="product-forecast-details">
          <h3>📊 Product-Specific Forecast</h3>
          <div className="forecast-details">
            <p><strong>Product ID:</strong> {productForecast.product_id}</p>
            <p><strong>Method:</strong> {productForecast.method}</p>
            <p><strong>Total Forecast Units:</strong> {Math.round(productForecast.total_forecast_units)}</p>
            <p><strong>Daily Average:</strong> {(productForecast.total_forecast_units / productForecast.forecast_daily.length).toFixed(2)} units/day</p>
          </div>
        </div>
      )}
      
      <div className="forecast-actions">
        <button onClick={loadSuggestions} className="btn-primary">
          Generate Reorder Suggestions
        </button>
      </div>
      
      {showSuggestions && (
        <div className="reorder-suggestions">
          <h3>📋 Automated Reorder Suggestions</h3>
          <table className="suggestions-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Avg Daily Sales</th>
                <th>Recommended Order</th>
                <th>Urgency</th>
              </tr>
            </thead>
            <tbody>
              {reorderSuggestions.map((item, idx) => (
                <tr key={idx} className={`urgency-${item.urgency.toLowerCase()}`}>
                  <td>{item.product_name}</td>
                  <td>{item.current_stock}</td>
                  <td>{item.avg_daily_sales}</td>
                  <td>{item.recommended_order}</td>
                  <td>
                    <span className={`urgency-badge ${item.urgency.toLowerCase()}`}>
                      {item.urgency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};