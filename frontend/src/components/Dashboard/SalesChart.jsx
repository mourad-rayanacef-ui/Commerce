import React, { useEffect, useState } from 'react';
import  api  from '../../services/api';

export const SalesChart = () => {
  const [data, setData] = useState({ dates: [], amounts: [] });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api.getSalesDaily(30).then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);
  
  if (loading) return <div>Loading chart...</div>;
  
  // Simple bar chart using inline SVG (or use Chart.js/recharts)
  const maxAmount = Math.max(...data.amounts);
  const barWidth = 30;
  
  return (
    <div className="sales-chart">
      <h3>Daily Sales (Last 30 Days)</h3>
      <svg width={data.dates.length * barWidth} height={400}>
        {data.amounts.map((amount, idx) => (
          <rect
            key={idx}
            x={idx * barWidth}
            y={400 - (amount / maxAmount) * 350}
            width={barWidth - 2}
            height={(amount / maxAmount) * 350}
            fill="#4CAF50"
          />
        ))}
      </svg>
    </div>
  );
};