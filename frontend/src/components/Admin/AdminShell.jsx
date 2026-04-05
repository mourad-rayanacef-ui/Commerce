import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/admin-shell.css';

const links = [
  { to: '/admin/dashboard', label: 'Overview', icon: '📊' },
  { to: '/admin/orders', label: 'Orders', icon: '🧾' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/inventory', label: 'Inventory', icon: '📋' },
  { to: '/admin/forecast', label: 'Forecast', icon: '📈' },
];

const AdminShell = ({ title, subtitle, children }) => {
  return (
    <div className="admin-shell">
      <aside className="admin-shell-sidebar">
        <div className="admin-shell-brand">
          <span className="admin-shell-brand-icon">⚙️</span>
          <div>
            <div className="admin-shell-brand-title">Admin</div>
            <div className="admin-shell-brand-sub">Store control</div>
          </div>
        </div>
        <nav className="admin-shell-nav">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `admin-shell-link${isActive ? ' admin-shell-link--active' : ''}`
              }
            >
              <span className="admin-shell-link-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" className="admin-shell-back">
          ← Back to store
        </NavLink>
      </aside>
      <main className="admin-shell-main">
        <header className="admin-shell-header">
          <div>
            <h1 className="admin-shell-title">{title}</h1>
            {subtitle && <p className="admin-shell-subtitle">{subtitle}</p>}
          </div>
        </header>
        <div className="admin-shell-body">{children}</div>
      </main>
    </div>
  );
};

export default AdminShell;
