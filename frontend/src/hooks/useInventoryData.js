import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useInventoryData = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getInventoryStatus();
      setInventory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  return { inventory, loading, error, refreshInventory };
};