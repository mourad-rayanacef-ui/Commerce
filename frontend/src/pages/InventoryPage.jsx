import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const InventoryPage = () => {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  return (
    <div className="inventory-page">
      <h1>Inventory Management</h1>
      <p>Welcome, {user?.username}!</p>
      {/* Add inventory content here */}
    </div>
  );
};

export default InventoryPage;