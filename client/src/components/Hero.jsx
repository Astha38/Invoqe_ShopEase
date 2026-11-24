import { Link } from "react-router-dom";

export default function Hero({ onCategorySelect }) {
  const scrollToProducts = () => {
    const el = document.getElementById("catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero-wrapper">
      {/* Main Editorial Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <span className="hero-tag">NEW SEASON 2026</span>
          <h1 className="hero-headline">
            Products That Defy Your Every day Look
          </h1>
          <p className="hero-subtext">
            Thoughtfully curated apparel, smart tech, and mindful living essentials. Built for modern comfort and timeless style.
          </p>
          <div className="hero-cta-group">
            <button className="btn-hero-primary" onClick={scrollToProducts}>
              Shop Collection ↓
            </button>
            <Link to="/favorites" className="btn-hero-secondary">
              View Wishlist
            </Link>
          </div>
        </div>

        <div className="hero-image-box">
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=85"
            alt="Editorial Streetwear Fashion"
            className="hero-img"
          />
          <div className="hero-floating-badge">
            <span className="badge-highlight">✦ 100% Authentic</span>
            <span className="badge-desc">Premium Craftsmanship</span>
          </div>
        </div>
      </div>

      {/* 3 Spotlight Collection Cards */}
      <div className="spotlight-grid">
        <div
          className="spotlight-card"
          onClick={() => onCategorySelect && onCategorySelect("Electronics")}
        >
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"
            alt="Electronics Spotlight"
          />
          <div className="spotlight-overlay">
            <span className="spotlight-label">ELECTRONICS</span>
            <h3>Immersive Sound & Smart Wearables</h3>
            <button className="spotlight-btn">Explore Tech →</button>
          </div>
        </div>

        <div
          className="spotlight-card"
          onClick={() => onCategorySelect && onCategorySelect("Clothing")}
        >
          <img
            src="https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80"
            alt="Apparel Spotlight"
          />
          <div className="spotlight-overlay">
            <span className="spotlight-label">APPAREL & SNEAKERS</span>
            <h3>Fresh Drops. Iconic Silhouettes.</h3>
            <button className="spotlight-btn">Shop Fashion →</button>
          </div>
        </div>

        <div
          className="spotlight-card"
          onClick={() => onCategorySelect && onCategorySelect("Home")}
        >
          <img
            src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80"
            alt="Living Spotlight"
          />
          <div className="spotlight-overlay">
            <span className="spotlight-label">HOME & ESSENTIALS</span>
            <h3>Spaces That Inspire Daily Work</h3>
            <button className="spotlight-btn">Browse Living →</button>
          </div>
        </div>
      </div>
    </section>
  );
}
