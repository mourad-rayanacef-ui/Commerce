import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import '../../styles/navbar.css';

const Navbar = ({ onChatClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAdmin ? '/admin/dashboard' : '/'} className="navbar-logo">
          🛍️ Commerce
        </Link>

        <div className="navbar-menu">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          ) : isAdmin ? (
            <>
              <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/admin/orders" className="nav-link">Orders</Link>
              <Link to="/admin/products" className="nav-link">Products</Link>
              <Link to="/admin/inventory" className="nav-link">Inventory</Link>
              <Link to="/admin/forecast" className="nav-link">Forecast</Link>
              <button type="button" onClick={onChatClick} className="nav-link chat-btn">
                💬 Chat
              </button>
              <Link to="/profile" className="nav-link profile-nav-link" title="Profile">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="navbar-avatar" />
                ) : (
                  <span className="navbar-avatar navbar-avatar--placeholder" aria-hidden>
                    {user.username?.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </Link>
              <div className="user-menu">
                <Link to="/profile" className="user-name user-name--link">
                  {user.username}
                </Link>
                <span className="user-role">(admin)</span>
                <button type="button" onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Shop</Link>
              <Link to="/orders" className="nav-link">Orders</Link>
              <Link to="/cart" className="nav-link cart-link">
                🛒 Cart ({cartItems.length})
              </Link>
              <button type="button" onClick={onChatClick} className="nav-link chat-btn">
                💬 Chat
              </button>
              <Link to="/profile" className="nav-link profile-nav-link" title="Profile">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="navbar-avatar" />
                ) : (
                  <span className="navbar-avatar navbar-avatar--placeholder" aria-hidden>
                    {user.username?.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </Link>
              <div className="user-menu">
                <Link to="/profile" className="user-name user-name--link">
                  {user.username}
                </Link>
                <span className="user-role">({user.role})</span>
                <button type="button" onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
