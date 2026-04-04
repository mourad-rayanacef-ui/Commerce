import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
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
    <div className="forecast-page">
      <h1>Demand Forecasting</h1>
      <p>Welcome, {user?.username}!</p>
      {loading && <p>Loading forecast...</p>}
      {forecast && <p>Forecast data loaded</p>}
      {/* Add forecast content here */}
    </div>
  );
};

export default ForecastPage;