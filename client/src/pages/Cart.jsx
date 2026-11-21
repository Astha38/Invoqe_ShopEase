import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [address, setAddress] = useState(user?.address || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get("/cart").then((r) => setCart(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const changeQty = async (itemId, quantity) => {
    if (quantity < 1) return;
    setError("");
    try {
      await api.patch(`/cart/items/${itemId}`, { quantity });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update");
    }
  };

  const remove = async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
    load();
  };

  const placeOrder = async () => {
    setError("");
    try {
      await api.post("/orders", { shippingAddress: address });
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (cart.items.length === 0) return <p>Your cart is empty. <Link to="/">Browse products</Link></p>;

  return (
    <>
      <h2>Your cart</h2>
      {cart.items.map((it) => (
        <div className="card cart-row" key={it.id}>
          <img src={it.image_url} alt={it.name} />
          <div className="grow">
            <h3>{it.name}</h3>
            <p className="muted">₹{it.price} each</p>
          </div>
          <div className="row">
            <button onClick={() => changeQty(it.id, it.quantity - 1)}>-</button>
            <span>{it.quantity}</span>
            <button onClick={() => changeQty(it.id, it.quantity + 1)}>+</button>
          </div>
          <p className="price">₹{it.line_total}</p>
          <button className="danger" onClick={() => remove(it.id)}>Remove</button>
        </div>
      ))}
      <div className="card checkout">
        <h3>Total: ₹{cart.total}</h3>
        <textarea
          placeholder="Shipping address" value={address}
          onChange={(e) => setAddress(e.target.value)} rows={3}
        />
        {error && <p className="error">{error}</p>}
        <button onClick={placeOrder} disabled={!address.trim()}>Place order</button>
      </div>
    </>
  );
}
