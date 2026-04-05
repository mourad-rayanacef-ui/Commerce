import React, { useEffect, useState } from 'react';
import  api  from '../../services/api';

export const LowStockAlert = () => {
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    api.getLowStockItems().then(setLowStockItems);
  }, []);

  if (lowStockItems.length === 0) {
    return (
      <div className="alert success">
        ✅ All inventory levels are healthy!
      </div>
    );
  }

  return (
    <div className="alert warning">
      <h4>⚠️ Low Stock Alert</h4>
      <ul>
        {lowStockItems.map((item, idx) => (
          <li key={idx}>
            <strong>{item.product_name || item.product}</strong>: {item.current_stock} units
            (reorder point {item.reorder_point})
            {item.units_to_order != null ? ` — suggest reorder ${item.units_to_order}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
};