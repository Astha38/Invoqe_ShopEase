import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <Link to="/" className="brand-logo footer-logo">
            <span className="brand-icon">✦</span>
            <span className="brand-text">ShopEase</span>
          </Link>
          <p className="footer-bio">
            Curated everyday goods that defy expectations. Designed for modern living with timeless craftsmanship and honest pricing.
          </p>
          <div className="social-links">
            <span className="social-icon">📸</span>
            <span className="social-icon">🐦</span>
            <span className="social-icon">💼</span>
            <span className="social-icon">📍</span>
          </div>
        </div>

        {/* Categories */}
        <div className="footer-col">
          <h4>Explore Shop</h4>
          <ul>
            <li><Link to="/">All Products</Link></li>
            <li><Link to="/">Electronics & Audio</Link></li>
            <li><Link to="/">Apparel & Denim</Link></li>
            <li><Link to="/">Books & Personal Growth</Link></li>
            <li><Link to="/">Home & Living</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/orders">Order Tracking</Link></li>
            <li><Link to="/favorites">My Wishlist</Link></li>
            <li><Link to="/cart">Shopping Bag</Link></li>
            <li><Link to="/admin">Admin Portal</Link></li>
            <li><a href="#support">Shipping & Returns</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-col newsletter-col">
          <h4>Stay in the Loop</h4>
          <p className="muted">Subscribe to receive exclusive drops, seasonal sales, and 10% off your first order.</p>
          
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          {subscribed && <p className="newsletter-success">🎉 Thank you! Check your inbox for your 10% discount.</p>}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 ShopEase Inc. All rights reserved. Designed with precision & care.</p>
        <div className="footer-legal">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security</span>
          <span>UPI / Cards Accepted</span>
        </div>
      </div>
    </footer>
  );
}
