import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useFavorites } from "../FavoritesContext";
import { shareProduct } from "../utils/share";

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const showToast = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  useEffect(() => {
    api
      .get("/products")
      .then((r) => setAllProducts(r.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const favoriteProducts = allProducts.filter((p) => favorites.includes(p.id));

  const addToCart = async (productId) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/cart/items", { productId, quantity: 1 });
      showToast("Added to cart! 🛒");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to cart");
    }
  };

  const handleShare = async (product) => {
    const res = await shareProduct(product);
    if (res?.message) showToast(res.message);
  };

  const handleRemove = (productId) => {
    toggleFavorite(productId);
    showToast("Removed from favorites");
  };

  if (loading) return <p>Loading favorites...</p>;

  return (
    <>
      <div className="row between">
        <h2>My Favorites ❤️ ({favoriteProducts.length})</h2>
        <Link to="/" className="muted">← Back to Shop</Link>
      </div>

      {msg && <p className="toast">{msg}</p>}

      {favoriteProducts.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "1.2rem", margin: "0 0 16px" }}>You have no saved favorites yet.</p>
          <p className="muted" style={{ marginBottom: "20px" }}>
            Click the ❤️ heart icon on any product to save it to your favorites!
          </p>
          <Link to="/">
            <button>Browse Products</button>
          </Link>
        </div>
      ) : (
        <div className="grid">
          {favoriteProducts.map((p) => (
            <div className="card" key={p.id}>
              <div style={{ position: "relative" }}>
                <Link to={`/product/${p.id}`}>
                  <img src={p.image_url} alt={p.name} />
                </Link>
                <button
                  className="icon-btn fav-btn active"
                  title="Remove from favorites"
                  onClick={() => handleRemove(p.id)}
                >
                  ❤️
                </button>
              </div>

              <Link to={`/product/${p.id}`}>
                <h3>{p.name}</h3>
              </Link>
              <p className="muted">{p.category_name}</p>
              <p className="price">₹{p.price}</p>

              <div className="card-actions">
                <button
                  className="btn-primary"
                  onClick={() => addToCart(p.id)}
                  disabled={p.stock_quantity === 0}
                >
                  {p.stock_quantity === 0 ? "Out of stock" : "Add to cart"}
                </button>
                <button
                  className="icon-btn"
                  title="Share product"
                  onClick={() => handleShare(p)}
                >
                  🔗 Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
