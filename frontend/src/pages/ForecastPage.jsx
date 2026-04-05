import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import AdminShell from '../components/Admin/AdminShell';
import api from '../services/api';

const ForecastPage = () => {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    if (token) {
      fetchForecast();
    }
  }, [token]);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const data = await api.forecastAPI.demand();
      setForecast(data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell
      title="Demand forecast"
      subtitle="Projected demand signals from the forecasting service."
    >
      <div className="admin-forecast-inner">
        <p style={{ color: '#475569', marginBottom: '1rem' }}>
          Welcome, <strong>{user?.username}</strong>. Refresh pulls the latest forecast window from the API.
        </p>
        <button type="button" className="btn-primary" onClick={fetchForecast} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh forecast'}
        </button>
        {forecast && (
          <pre
            style={{
              marginTop: '1.25rem',
              padding: '1rem',
              background: '#fff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              overflow: 'auto',
              fontSize: '0.85rem',
              color: '#334155',
            }}
          >
            {JSON.stringify(forecast, null, 2)}
          </pre>
        )}
      </div>
    </AdminShell>
  );
};

export default ForecastPage;
