import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        📊 Inventory Analytics Platform
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Dashboard
        </Link>
        <Link to="/inventory" className={location.pathname === '/inventory' ? 'active' : ''}>
          Inventory
        </Link>
        <Link to="/forecast" className={location.pathname === '/forecast' ? 'active' : ''}>
          Forecast
        </Link>
      </div>
    </nav>
  );
};