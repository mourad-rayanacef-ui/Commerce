import React from 'react';
import { SalesChart } from '../components/Dashboard/SalesChart';
import { TopProducts } from '../components/Dashboard/TopProducts';
import { KPICards } from '../components/Dashboard/KPICards';

export const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      <h1>Sales Dashboard</h1>
      <KPICards />
      <div className="dashboard-grid">
        <SalesChart />
        <TopProducts />
      </div>
    </div>
  );
};