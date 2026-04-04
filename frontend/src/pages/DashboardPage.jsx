import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  return (
    <div className="dashboard-page">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.username}!</p>
      {/* Add dashboard content here */}
    </div>
  );
};

export default DashboardPage;