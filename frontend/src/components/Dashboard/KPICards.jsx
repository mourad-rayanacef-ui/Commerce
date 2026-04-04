import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export const KPICards = () => {
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalSales: 0,
    avgOrderValue: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const [sales, topProducts, lowStock] = await Promise.all([
          api.getSalesDaily(30),
          api.getTopProducts(5),
          api.getLowStockItems()
        ]);
        
        const totalRevenue = sales.amounts.reduce((a, b) => a + b, 0);
        const totalSales = sales.amounts.length;
        
        setKpis({
          totalRevenue: totalRevenue.toFixed(2),
          totalSales: totalSales,
          avgOrderValue: (totalRevenue / totalSales).toFixed(2),
          lowStockCount: lowStock.length
        });
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKPIs();
  }, []);

  if (loading) return <div>Loading KPIs...</div>;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <h4>Total Revenue (30d)</h4>
        <p className="kpi-value">${kpis.totalRevenue.toLocaleString()}</p>
      </div>
      <div className="kpi-card">
        <h4>Total Sales</h4>
        <p className="kpi-value">{kpis.totalSales}</p>
      </div>
      <div className="kpi-card">
        <h4>Avg Order Value</h4>
        <p className="kpi-value">${kpis.avgOrderValue}</p>
      </div>
      <div className="kpi-card">
        <h4>Low Stock Items</h4>
        <p className="kpi-value" style={{ color: kpis.lowStockCount > 0 ? '#f44336' : '#4CAF50' }}>
          {kpis.lowStockCount}
        </p>
      </div>
    </div>
  );
};