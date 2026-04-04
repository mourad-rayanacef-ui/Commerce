import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CartContext } from '../../contexts/CartContext';
import '../../styles/navbar.css';

const Navbar = ({ onChatClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🛍️ Commerce Dashboard
        </Link>

        <div className="navbar-menu">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin/dashboard" className="nav-link">Admin Dashboard</Link>
                  <Link to="/admin/inventory" className="nav-link">Inventory</Link>
                  <Link to="/admin/forecast" className="nav-link">Forecast</Link>
                  <Link to="/admin/products" className="nav-link">Products</Link>
                </>
              ) : (
                <>
                  <Link to="/" className="nav-link">Shop</Link>
                  <Link to="/orders" className="nav-link">Orders</Link>
                </>
              )}

              <Link to="/cart" className="nav-link cart-link">
                🛒 Cart ({cartItems.length})
              </Link>

              <button onClick={onChatClick} className="nav-link chat-btn">
                💬 Chat
              </button>

              <div className="user-menu">
                <span className="user-name">{user.username}</span>
                <span className="user-role">({user.role})</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;