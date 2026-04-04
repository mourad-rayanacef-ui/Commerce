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
            <strong>{item.product}</strong>: {item.current_stock} units left 
            (Reorder at {item.reorder_point}) - Order {item.units_to_order} units
          </li>
        ))}
      </ul>
    </div>
  );
};