import { useEffect, useState } from "react";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get("/orders").then((r) => setOrders(r.data));
  }, []);

  if (!orders) return <p>Loading...</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <>
      <h2>My orders</h2>
      {orders.map((o) => (
        <div className="card order" key={o.id}>
          <div className="row between">
            <strong>Order #{o.id.slice(0, 8)}</strong>
            <span className="badge">{o.status}</span>
          </div>
          <p className="muted">
            {new Date(o.created_at).toLocaleString()} · Ship to: {o.shipping_address}
          </p>
          <ul>
            {o.items.map((it, i) => (
              <li key={i}>{it.name} × {it.quantity} @ ₹{it.price}</li>
            ))}
          </ul>
          <p className="price">Total: ₹{o.total_amount}</p>
        </div>
      ))}
    </>
  );
}
