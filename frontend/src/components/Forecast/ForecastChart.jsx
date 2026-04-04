import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export const ForecastChart = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getForecast().then(data => {
      setForecast(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading forecast...</div>;
  if (forecast.error) return <div>Error: {forecast.error}</div>;

  // Combine historical and forecast data for display
  const allDates = [...forecast.historical_dates, ...forecast.forecast_dates];
  const allValues = [...forecast.historical_values, ...forecast.forecast_values.map(v => null)];
  const forecastValues = [...Array(forecast.historical_values.length).fill(null), ...forecast.forecast_values];

  const maxValue = Math.max(...forecast.historical_values, ...forecast.forecast_values);
  const chartHeight = 400;
  const barWidth = Math.min(40, 800 / allDates.length);

  return (
    <div className="forecast-chart">
      <h3>Demand Forecast - {forecast.method}</h3>
      <p className="confidence">Confidence Level: {(forecast.confidence * 100)}%</p>
      <svg width={allDates.length * barWidth} height={chartHeight}>
        {/* Historical bars */}
        {forecast.historical_values.map((value, idx) => (
          <rect
            key={`hist-${idx}`}
            x={idx * barWidth}
            y={chartHeight - (value / maxValue) * (chartHeight - 50)}
            width={barWidth - 2}
            height={(value / maxValue) * (chartHeight - 50)}
            fill="#4CAF50"
          />
        ))}
        {/* Forecast bars */}
        {forecast.forecast_values.map((value, idx) => (
          <rect
            key={`fore-${idx}`}
            x={(forecast.historical_values.length + idx) * barWidth}
            y={chartHeight - (value / maxValue) * (chartHeight - 50)}
            width={barWidth - 2}
            height={(value / maxValue) * (chartHeight - 50)}
            fill="#FF9800"
            opacity="0.7"
            stroke="#FF9800"
            strokeDasharray="4"
          />
        ))}
      </svg>
      <div className="chart-legend">
        <span className="legend historical">Historical</span>
        <span className="legend forecast">Forecast</span>
      </div>
    </div>
  );
};