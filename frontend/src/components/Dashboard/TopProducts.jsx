import React, { useEffect, useState } from 'react';
import  api  from '../../services/api';

export const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTopProducts(5).then((data) => {
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading top products...</div>;

  return (
    <div className="top-products">
      <h3>Top Selling Products</h3>
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity Sold</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, idx) => (
            <tr key={idx}>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
              <td>
                ${product.revenue != null ? Number(product.revenue).toFixed(2) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};