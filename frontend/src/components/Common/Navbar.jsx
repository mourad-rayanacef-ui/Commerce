import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Brand */}
        <Link to="/" style={styles.brand}>📦 ShopInventory</Link>

        {/* Nav Links */}
        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(isActive('/') && !isActive('/admin') ? styles.activeLink : {}) }}>🏪 Store</Link>
          {user && (
            <Link to="/orders" style={{ ...styles.link, ...(isActive('/orders') ? styles.activeLink : {}) }}>📋 My Orders</Link>
          )}
          {user && (
            <Link to="/chat" style={{ ...styles.link, ...(isActive('/chat') ? styles.activeLink : {}) }}>💬 Chat</Link>
          )}
          {isAdmin && (
            <>
              <span style={styles.divider}>|</span>
              <Link to="/admin/dashboard" style={{ ...styles.link, ...styles.adminLink, ...(isActive('/admin') ? styles.activeAdminLink : {}) }}>
                ⚙️ Admin
              </Link>
            </>
          )}
        </div>

        {/* Right Side */}
        <div style={styles.right}>
          {user && (
            <Link to="/cart" style={styles.cartBtn}>
              🛒
              {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
            </Link>
          )}

          {user ? (
            <div style={styles.userMenu}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={styles.userBtn}>
                👤 {user.username}
                {user.role === 'admin' && <span style={styles.roleTag}>Admin</span>}
                <span>▾</span>
              </button>
              {menuOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownUser}>{user.full_name || user.username}</div>
                  <div style={styles.dropdownEmail}>{user.email}</div>
                  <hr style={styles.dropdownDivider} />
                  <Link to="/orders" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>📋 My Orders</Link>
                  <button onClick={handleLogout} style={styles.dropdownLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 1000 },
  inner: { maxWidth: 1400, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 64, gap: 16 },
  brand: { color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 20, whiteSpace: 'nowrap' },
  links: { display: 'flex', gap: 4, alignItems: 'center', flex: 1 },
  link: { color: 'rgba(255,255,255,0.8)', textDecoration: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500 },
  activeLink: { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' },
  adminLink: { color: '#ffd700' },
  activeAdminLink: { backgroundColor: 'rgba(255,215,0,0.15)', color: '#ffd700' },
  divider: { color: 'rgba(255,255,255,0.3)', margin: '0 4px', fontSize: 18 },
  right: { display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' },
  cartBtn: { position: 'relative', color: 'white', textDecoration: 'none', fontSize: 22, padding: '4px 8px' },
  cartBadge: { position: 'absolute', top: -2, right: -2, background: '#e74c3c', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  userMenu: { position: 'relative' },
  userBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 },
  roleTag: { background: '#ffd700', color: '#333', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 },
  dropdown: { position: 'absolute', right: 0, top: '110%', background: 'white', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.2)', minWidth: 200, overflow: 'hidden', zIndex: 2000 },
  dropdownUser: { padding: '14px 16px 2px', fontWeight: 700, color: '#2c3e50', fontSize: 14 },
  dropdownEmail: { padding: '0 16px 10px', fontSize: 12, color: '#7f8c8d' },
  dropdownDivider: { margin: 0, border: 'none', borderTop: '1px solid #ecf0f1' },
  dropdownItem: { display: 'block', padding: '12px 16px', color: '#2c3e50', textDecoration: 'none', fontSize: 14 },
  dropdownLogout: { display: 'block', width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', color: '#e74c3c', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  authLinks: { display: 'flex', gap: 8 },
  loginBtn: { color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)', fontSize: 14 },
  registerBtn: { background: '#3498db', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 },
};