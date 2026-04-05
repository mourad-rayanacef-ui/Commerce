import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import AdminShell from '../components/Admin/AdminShell';
import { InventoryTable } from '../components/Inventory/InventoryTable';
import { LowStockAlert } from '../components/Inventory/LowStockAlert';

const InventoryPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <AdminShell
      title="Inventory"
      subtitle={`Stock levels and reorder workflow. Hello, ${user?.username}.`}
    >
      <div className="admin-inventory-inner">
        <LowStockAlert />
        <div style={{ marginTop: '1.25rem' }}>
          <InventoryTable />
        </div>
      </div>
    </AdminShell>
  );
};

export default InventoryPage;
