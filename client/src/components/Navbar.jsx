import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useFavorites } from "../FavoritesContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="site-header">
      {/* Top utility bar */}
      <div className="top-banner">
        <span>✨ Free express shipping on orders over ₹999 · Use code <strong>FREESHIP</strong></span>
      </div>

      <nav className="navbar">
        {/* Brand */}
        <Link to="/" className="brand-logo" onClick={closeMobile}>
          <span className="brand-icon">✦</span>
          <span className="brand-text">ShopEase</span>
        </Link>

        {/* Center Links */}
        <div className="nav-menu">
          <Link to="/" className="nav-link">Shop</Link>
          <Link to="/favorites" className="nav-link">
            Favorites
            {favoritesCount > 0 && <span className="nav-badge">{favoritesCount}</span>}
          </Link>
          <Link to="/orders" className="nav-link">My Orders</Link>
          <Link to="/admin" className="nav-link admin-pill">
            <span className="admin-dot"></span> Admin Panel
          </Link>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          <Link to="/cart" className="action-icon-btn" title="View Cart" onClick={closeMobile}>
            <span className="icon">🛍️</span>
            <span className="action-label">Cart</span>
          </Link>

          {user ? (
            <div className="user-menu desktop-only-auth">
              <span className="user-chip">
                <span className="user-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user.name}</span>
              </span>
              <button className="btn-secondary-sm" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-actions desktop-only-auth">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-primary-sm">Register</Link>
            </div>
          )}

          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="mobile-nav-drawer">
          <Link to="/" className="mobile-nav-link" onClick={closeMobile}>Shop</Link>
          <Link to="/favorites" className="mobile-nav-link" onClick={closeMobile}>
            Favorites {favoritesCount > 0 && `(${favoritesCount})`}
          </Link>
          <Link to="/orders" className="mobile-nav-link" onClick={closeMobile}>My Orders</Link>
          <Link to="/cart" className="mobile-nav-link" onClick={closeMobile}>Shopping Cart</Link>
          <Link to="/admin" className="mobile-nav-link" onClick={closeMobile}>Admin Panel</Link>
          <div className="mobile-nav-auth">
            {user ? (
              <>
                <span className="muted">Signed in as <strong>{user.name}</strong></span>
                <button
                  className="btn-secondary-sm"
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="row" style={{ gap: "10px" }}>
                <Link to="/login" className="btn-secondary-sm" onClick={closeMobile}>Login</Link>
                <Link to="/register" className="btn-primary-sm" onClick={closeMobile}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
