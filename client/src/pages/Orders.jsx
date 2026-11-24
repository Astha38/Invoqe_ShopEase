import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const TRACKING_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "paid", label: "Payment Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.get("/orders").then((r) => setOrders(r.data));
  }, []);

  if (!orders) return <p style={{ padding: "32px 0" }}>Loading your orders...</p>;
  if (orders.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px 20px", marginTop: "24px" }}>
        <h2>No orders placed yet</h2>
        <p className="muted" style={{ marginBottom: "20px" }}>
          You haven't placed any orders with ShopEase yet.
        </p>
        <Link to="/">
          <button className="btn-primary">Start Shopping</button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "#15803d";
      case "shipped":
        return "#0284c7";
      case "paid":
        return "#059669";
      case "cancelled":
        return "#dc2626";
      default:
        return "#d97706";
    }
  };

  const getStepIndex = (status) => TRACKING_STEPS.findIndex((s) => s.key === status);

  return (
    <div style={{ marginTop: "24px" }}>
      <div className="row between" style={{ marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "2rem" }}>
          My Orders 📦 ({orders.length})
        </h2>
        <Link to="/" className="muted">← Back to Shop</Link>
      </div>

      {orders.map((o) => {
        const currentStep = getStepIndex(o.status);
        return (
          <div className="card order" key={o.id}>
            <div className="row between" style={{ marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <strong>Order #{o.id.slice(0, 8).toUpperCase()}</strong>
                {o.tracking_number && (
                  <span className="muted" style={{ marginLeft: "10px", fontSize: "0.85rem" }}>
                    Tracking: <code>{o.tracking_number}</code>
                  </span>
                )}
              </div>
              <div className="row" style={{ gap: "8px" }}>
                <span className="badge" style={{ background: "#F3EFEA", color: "var(--text-dark)" }}>
                  {(o.payment_method || "cod").toUpperCase()} · {o.payment_status || "pending"}
                </span>
                <span
                  className="badge"
                  style={{
                    color: "#fff",
                    background: getStatusColor(o.status),
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {o.status}
                </span>
              </div>
            </div>

            <p className="muted" style={{ marginBottom: "14px" }}>
              📅 {new Date(o.created_at).toLocaleString()} · 📍 Ship to: {o.shipping_address}
            </p>

            {/* Visual Order Tracking Stepper */}
            {o.status === "cancelled" ? (
              <div className="order-cancelled-banner">
                ✕ This order was cancelled.
              </div>
            ) : (
              <div className="tracking-stepper">
                {TRACKING_STEPS.map((step, idx) => {
                  const completed = idx <= currentStep;
                  return (
                    <div key={step.key} className={`tracking-step ${completed ? "done" : ""}`}>
                      <div className="tracking-dot">{completed ? "✓" : idx + 1}</div>
                      <span className="tracking-label">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <ul style={{ margin: "14px 0", paddingLeft: "20px" }}>
              {o.items.map((it, i) => (
                <li key={i} style={{ marginBottom: "4px" }}>
                  <Link to={`/product/${it.product_id}`} style={{ fontWeight: 500, color: "#2563eb" }}>
                    {it.name}
                  </Link>{" "}
                  × {it.quantity} @ ₹{it.price}
                </li>
              ))}
            </ul>

            <div className="row between" style={{ marginTop: "14px", borderTop: "1px solid var(--brand-cream-border)", paddingTop: "12px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span className="price" style={{ fontSize: "1.15rem" }}>
                  Total Paid: ₹{o.total_amount}
                </span>
                {(Number(o.discount_amount) > 0 || o.coupon_code) && (
                  <span className="muted" style={{ marginLeft: "10px", fontSize: "0.85rem" }}>
                    (Coupon {o.coupon_code}: -₹{o.discount_amount})
                  </span>
                )}
              </div>
              <Link to="/">
                <button className="btn-secondary-sm">Shop more</button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
