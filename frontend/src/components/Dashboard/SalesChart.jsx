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

  const amounts = Array.isArray(data.amounts) ? data.amounts : [];
  const maxAmount = Math.max(...amounts, 1);
  const barWidth = 30;
  
  return (
    <div className="sales-chart">
      <h3>Daily Sales (Last 30 Days)</h3>
      <svg width={Math.max((data.dates?.length || 0) * barWidth, 120)} height={400}>
        {amounts.map((amount, idx) => (
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