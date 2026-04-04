import React from 'react';
import { InventoryTable } from '../components/Inventory/InventoryTable';
import { LowStockAlert } from '../components/Inventory/LowStockAlert';

export const InventoryPage = () => {
  return (
    <div className="inventory-page">
      <h1>Inventory Management</h1>
      <LowStockAlert />
      <InventoryTable />
    </div>
  );
};