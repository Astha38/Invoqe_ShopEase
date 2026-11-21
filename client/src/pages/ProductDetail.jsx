import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => setProduct(r.data)).catch(() => setNotFound(true));
  }, [id]);

  const add = async () => {
    if (!user) return navigate("/login");
    try {
      await api.post("/cart/items", { productId: id, quantity: qty });
      setMsg("Added to cart");
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not add to cart");
    }
  };

  if (notFound) return <p>Product not found.</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <div className="card detail">
      <img src={product.image_url} alt={product.name} />
      <div>
        <h2>{product.name}</h2>
        <p className="muted">{product.category_name}</p>
        <p>{product.description}</p>
        <p className="price">₹{product.price}</p>
        <p className="muted">{product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}</p>
        <div className="row">
          <input
            type="number" min="1" max={product.stock_quantity} value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          />
          <button onClick={add} disabled={product.stock_quantity === 0}>Add to cart</button>
        </div>
        {msg && <p className="toast">{msg}</p>}
      </div>
    </div>
  );
}
