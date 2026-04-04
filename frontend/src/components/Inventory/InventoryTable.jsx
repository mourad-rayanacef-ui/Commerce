import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ReorderForm } from './ReorderForm';

export const InventoryTable = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReorderForm, setShowReorderForm] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const data = await api.getInventoryStatus();
    setInventory(data);
    setLoading(false);
  };

  const handleReorder = (product) => {
    setSelectedProduct(product);
    setShowReorderForm(true);
  };

  const handleReorderComplete = async (result) => {
    await fetchInventory(); // Refresh inventory
    setShowReorderForm(false);
    setSelectedProduct(null);
  };

  const handleCancelReorder = () => {
    setShowReorderForm(false);
    setSelectedProduct(null);
  };

  if (loading) return <div>Loading inventory...</div>;

  return (
    <div className="inventory-table-container">
      <h3>Current Inventory Status</h3>
      
      {showReorderForm && (
        <ReorderForm 
          product={selectedProduct}
          onReorderComplete={handleReorderComplete}
          onCancel={handleCancelReorder}
        />
      )}
      
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Current Stock</th>
            <th>Reorder Point</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.product_id} className={`status-${item.status.toLowerCase()}`}>
              <td>{item.product_name}</td>
              <td>{item.current_stock}</td>
              <td>{item.reorder_point}</td>
              <td>
                <span className={`status-badge ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </td>
              <td>
                {item.status !== 'Excess' && (
                  <button onClick={() => handleReorder(item)}>
                    Reorder
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};