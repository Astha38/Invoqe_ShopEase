import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useFavorites } from "../FavoritesContext";
import { shareProduct } from "../utils/share";
import Hero from "../components/Hero";

export default function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [msg, setMsg] = useState("");

  const showToast = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    api
      .get("/products", {
        params: {
          search: search || undefined,
          category: selectedCategory || undefined,
        },
      })
      .then((r) => setProducts(r.data));
  }, [search, selectedCategory]);

  const addToCart = async (productId) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/cart/items", { productId, quantity: 1 });
      showToast("Added to bag! 🛍️");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to bag");
    }
  };

  const handleFavorite = (e, productId) => {
    e.preventDefault();
    const added = toggleFavorite(productId);
    showToast(added ? "Added to wishlist ❤️" : "Removed from wishlist");
  };

  const handleShare = async (e, product) => {
    e.preventDefault();
    const res = await shareProduct(product);
    if (res?.message) showToast(res.message);
  };

  // Called from Hero spotlight cards
  const handleSpotlightSelect = (categoryName) => {
    const found = categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (found) {
      setSelectedCategory(found.id);
      const el = document.getElementById("catalog-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="home-page">
      {/* Editorial Hero Section & Spotlight Tiles */}
      <Hero onCategorySelect={handleSpotlightSelect} />

      {/* Main Catalog Section */}
      <section id="catalog-section" className="catalog-wrapper">
        <div className="catalog-header">
          <div>
            <span className="section-eyebrow">CURATED CATALOG</span>
            <h2 className="section-title">Most Recommended For You</h2>
          </div>

          {/* Search Input */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>✕</button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills">
          <button
            className={`pill-btn ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            All Products ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`pill-btn ${selectedCategory === c.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(selectedCategory === c.id ? "" : c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {msg && <div className="toast-float">{msg}</div>}

        {/* Product Grid */}
        <div className="catalog-grid">
          {products.map((p) => {
            const favorited = isFavorite(p.id);
            return (
              <div className="product-card" key={p.id}>
                {/* Image Container with Floating Actions */}
                <div className="card-img-container">
                  <Link to={`/product/${p.id}`}>
                    <img src={p.image_url} alt={p.name} className="product-thumb" />
                  </Link>

                  {/* Top Floating Buttons */}
                  <div className="card-floating-actions">
                    <button
                      className={`card-circle-btn ${favorited ? "favorited" : ""}`}
                      title={favorited ? "Remove from wishlist" : "Add to wishlist"}
                      onClick={(e) => handleFavorite(e, p.id)}
                    >
                      {favorited ? "❤️" : "🤍"}
                    </button>
                    <button
                      className="card-circle-btn"
                      title="Share product link"
                      onClick={(e) => handleShare(e, p)}
                    >
                      🔗
                    </button>
                  </div>

                  {/* Stock tag */}
                  {p.stock_quantity === 0 && (
                    <span className="out-of-stock-tag">Out of Stock</span>
                  )}
                </div>

                {/* Card Info */}
                <div className="card-body">
                  <div className="row between" style={{ marginBottom: "6px" }}>
                    <span className="category-tag">{p.category_name}</span>
                    <span className="price-tag">₹{p.price}</span>
                  </div>

                  <Link to={`/product/${p.id}`}>
                    <h3 className="product-name">{p.name}</h3>
                  </Link>

                  <p className="product-desc-snippet">
                    {p.description || "Premium quality craftsmanship and materials."}
                  </p>

                  <div className="card-footer">
                    <button
                      className="btn-add-bag"
                      onClick={() => addToCart(p.id)}
                      disabled={p.stock_quantity === 0}
                    >
                      {p.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <Link to={`/product/${p.id}`} className="btn-quick-view">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && (
          <div className="empty-catalog-box">
            <span style={{ fontSize: "2.5rem" }}>🔎</span>
            <h3>No products found</h3>
            <p className="muted">Try adjusting your search terms or selecting another category.</p>
            <button className="pill-btn" onClick={() => { setSearch(""); setSelectedCategory(""); }}>
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
