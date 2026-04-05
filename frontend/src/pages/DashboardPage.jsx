import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import AdminShell from '../components/Admin/AdminShell';
import { KPICards } from '../components/Dashboard/KPICards';
import { SalesChart } from '../components/Dashboard/SalesChart';
import { TopProducts } from '../components/Dashboard/TopProducts';
import AdminOrdersPanel from '../components/Dashboard/AdminOrdersPanel';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <AdminShell
      title="Dashboard"
      subtitle={`Signed in as ${user?.username || 'admin'}. Revenue, orders, and inventory at a glance.`}
    >
      <div className="admin-dashboard-inner">
        <KPICards />
        <div className="dashboard-grid" style={{ marginTop: '1.25rem' }}>
          <SalesChart />
          <TopProducts />
        </div>
        <AdminOrdersPanel />
      </div>
    </AdminShell>
  );
};

export default DashboardPage;
