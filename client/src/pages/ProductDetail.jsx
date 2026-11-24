import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import { useFavorites } from "../FavoritesContext";
import { shareProduct } from "../utils/share";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [notFound, setNotFound] = useState(false);

  const showToast = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => setProduct(r.data))
      .catch(() => setNotFound(true));
  }, [id]);

  const add = async () => {
    if (!user) return navigate("/login");
    try {
      await api.post("/cart/items", { productId: id, quantity: qty });
      showToast("Added to cart! 🛒");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to cart");
    }
  };

  const handleFavorite = () => {
    const added = toggleFavorite(id);
    showToast(added ? "Added to favorites ❤️" : "Removed from favorites");
  };

  const handleShare = async () => {
    if (!product) return;
    const res = await shareProduct(product);
    if (res?.message) showToast(res.message);
  };

  if (notFound) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <p>Product not found.</p>
        <Link to="/"><button>Browse all products</button></Link>
      </div>
    );
  }

  if (!product) return <p>Loading product details...</p>;

  const favorited = isFavorite(product.id);

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <Link to="/" className="muted">← Back to all products</Link>
      </div>

      {msg && <p className="toast">{msg}</p>}

      <div className="card detail">
        <div style={{ position: "relative" }}>
          <img src={product.image_url} alt={product.name} />
          <button
            className={`icon-btn fav-btn ${favorited ? "active" : ""}`}
            title={favorited ? "Remove from favorites" : "Add to favorites"}
            onClick={handleFavorite}
          >
            {favorited ? "❤️" : "🤍"}
          </button>
        </div>

        <div>
          <h2>{product.name}</h2>
          <p className="muted">{product.category_name}</p>
          <p style={{ lineHeight: "1.6", margin: "14px 0" }}>{product.description}</p>
          <p className="price" style={{ fontSize: "1.4rem" }}>₹{product.price}</p>
          <p className="muted" style={{ marginBottom: "16px" }}>
            {product.stock_quantity > 0
              ? `${product.stock_quantity} available in stock`
              : "Out of stock"}
          </p>

          <div className="row" style={{ flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <input
              type="number"
              min="1"
              max={product.stock_quantity}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              style={{ width: "80px" }}
              disabled={product.stock_quantity === 0}
            />
            <button
              className="btn-primary"
              onClick={add}
              disabled={product.stock_quantity === 0}
            >
              Add to cart 🛒
            </button>
            <button
              className="icon-btn"
              onClick={handleFavorite}
              title={favorited ? "Remove from favorites" : "Save to favorites"}
            >
              {favorited ? "❤️ Favorited" : "🤍 Favorite"}
            </button>
            <button
              className="icon-btn"
              onClick={handleShare}
              title="Share product link"
            >
              🔗 Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
