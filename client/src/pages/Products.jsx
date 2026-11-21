import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function Products() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    api
      .get("/products", { params: { search: search || undefined, category: category || undefined } })
      .then((r) => setProducts(r.data));
  }, [search, category]);

  const addToCart = async (productId) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/cart/items", { productId, quantity: 1 });
      setMsg("Added to cart");
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not add to cart");
    }
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <>
      <div className="filters">
        <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {msg && <p className="toast">{msg}</p>}
      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p.id}>
            <Link to={`/product/${p.id}`}>
              <img src={p.image_url} alt={p.name} />
              <h3>{p.name}</h3>
            </Link>
            <p className="muted">{p.category_name}</p>
            <p className="price">₹{p.price}</p>
            <button onClick={() => addToCart(p.id)} disabled={p.stock_quantity === 0}>
              {p.stock_quantity === 0 ? "Out of stock" : "Add to cart"}
            </button>
          </div>
        ))}
        {products.length === 0 && <p>No products found.</p>}
      </div>
    </>
  );
}
