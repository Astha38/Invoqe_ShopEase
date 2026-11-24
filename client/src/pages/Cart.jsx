import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [address, setAddress] = useState(user?.address || "");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponError, setCouponError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const r = await api.get("/cart");
      setCart(r.data);
      const nextSubtotal = Number(r.data.total || 0);
      if (appliedCoupon && nextSubtotal > 0) {
        try {
          const val = await api.post("/coupons/validate", {
            code: appliedCoupon.coupon.code,
            subtotal: nextSubtotal,
          });
          setAppliedCoupon(val.data);
          setCouponMsg(val.data.message);
          setCouponError("");
        } catch (err) {
          setAppliedCoupon(null);
          setCouponMsg("");
          setCouponError(err.response?.data?.message || "Coupon no longer applies");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api
      .get("/cart")
      .then((r) => setCart(r.data))
      .finally(() => setLoading(false));
    api
      .get("/coupons/active")
      .then((r) => setAvailableCoupons(r.data))
      .catch(() => {});
  }, []);

  const subtotal = Number(cart.total || 0);

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

  const applyCoupon = async (codeToApply) => {
    const code = (codeToApply ?? couponInput).trim().toUpperCase();
    setCouponError("");
    setCouponMsg("");
    if (!code) {
      setCouponError("Enter a promo code first");
      return;
    }
    try {
      const { data } = await api.post("/coupons/validate", { code, subtotal });
      setCouponInput(code);
      setAppliedCoupon(data);
      setCouponMsg(data.message);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || "Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMsg("");
    setCouponError("");
  };

  const baseShipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const shippingFee = appliedCoupon ? appliedCoupon.shippingFee : baseShipping;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = appliedCoupon
    ? appliedCoupon.finalTotal
    : Math.max(0, Math.round((subtotal + shippingFee) * 100) / 100);

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");
    if (!address.trim()) {
      setError("Please enter a shipping address");
      return;
    }
    if (paymentMethod === "upi" && !upiId.includes("@")) {
      setError("Please enter a valid UPI ID (e.g., name@upi)");
      return;
    }
    if (paymentMethod === "card") {
      const digits = cardNumber.replace(/\s+/g, "");
      if (!cardName.trim() || digits.length < 12 || !cardExpiry.trim() || cardCvv.trim().length < 3) {
        setError("Please complete all card payment fields");
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post("/orders", {
        shippingAddress: address,
        couponCode: appliedCoupon?.coupon?.code || undefined,
        paymentMethod,
        paymentDetails:
          paymentMethod === "upi"
            ? { upiId }
            : paymentMethod === "card"
            ? { cardName, cardNumber }
            : {},
      });
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ padding: "32px 0" }}>Loading your shopping bag...</p>;
  if (cart.items.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "48px 24px", marginTop: "24px" }}>
        <h2>Your cart is empty</h2>
        <p className="muted" style={{ marginBottom: "20px" }}>
          Add some curated essentials from our catalog to get started.
        </p>
        <Link to="/">
          <button className="btn-primary">Browse products</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <div className="row between" style={{ marginBottom: "20px" }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "2rem" }}>
          Your Shopping Bag ({cart.items.length})
        </h2>
        <Link to="/" className="muted">← Continue Shopping</Link>
      </div>

      <div className="cart-layout">
        {/* Cart Line Items */}
        <div className="cart-items-col">
          {cart.items.map((it) => (
            <div className="card cart-row" key={it.id}>
              <img src={it.image_url} alt={it.name} />
              <div className="grow">
                <Link to={`/product/${it.product_id}`}>
                  <h3 style={{ margin: "0 0 4px" }}>{it.name}</h3>
                </Link>
                <p className="muted" style={{ margin: 0 }}>₹{it.price} each</p>
              </div>
              <div className="row" style={{ gap: "10px" }}>
                <button type="button" className="qty-btn" onClick={() => changeQty(it.id, it.quantity - 1)}>-</button>
                <span style={{ fontWeight: 700, minWidth: "20px", textAlign: "center" }}>{it.quantity}</span>
                <button type="button" className="qty-btn" onClick={() => changeQty(it.id, it.quantity + 1)}>+</button>
              </div>
              <p className="price" style={{ minWidth: "84px", textAlign: "right" }}>₹{it.line_total}</p>
              <button type="button" className="danger" onClick={() => remove(it.id)}>Remove</button>
            </div>
          ))}
        </div>

        {/* Checkout, Coupon & Payment Panel */}
        <form className="card checkout" onSubmit={placeOrder}>
          <h3 style={{ margin: "0 0 14px", fontFamily: "var(--font-serif)", fontSize: "1.4rem" }}>
            Order Summary & Checkout
          </h3>

          {/* Coupon Section */}
          <div className="coupon-box">
            <label className="checkout-label">Promo / Coupon Code</label>
            <div className="row" style={{ gap: "8px" }}>
              <input
                type="text"
                placeholder="Enter code (e.g. WELCOME10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                style={{ flex: 1 }}
              />
              {appliedCoupon ? (
                <button type="button" className="btn-secondary-sm" onClick={removeCoupon}>
                  Remove
                </button>
              ) : (
                <button type="button" className="btn-primary-sm" style={{ border: 0, cursor: "pointer" }} onClick={() => applyCoupon()}>
                  Apply
                </button>
              )}
            </div>

            {availableCoupons.length > 0 && (
              <div className="coupon-chips">
                {availableCoupons.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`coupon-chip ${appliedCoupon?.coupon?.code === c.code ? "active" : ""}`}
                    onClick={() => applyCoupon(c.code)}
                    title={c.description}
                  >
                    🏷️ {c.code}
                  </button>
                ))}
              </div>
            )}

            {couponMsg && <p className="coupon-success">{couponMsg}</p>}
            {couponError && <p className="error" style={{ margin: "6px 0 0" }}>{couponError}</p>}
          </div>

          {/* Price Breakdown */}
          <div className="price-summary">
            <div className="row between">
              <span className="muted">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="row between" style={{ color: "var(--accent-green)", fontWeight: 600 }}>
                <span>Coupon Discount ({appliedCoupon.coupon.code})</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="row between">
              <span className="muted">Express Shipping</span>
              <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="row between summary-total">
              <strong>Total Payable</strong>
              <strong>₹{finalTotal.toFixed(2)}</strong>
            </div>
          </div>

          {/* Shipping Address */}
          <label className="checkout-label" style={{ marginTop: "14px" }}>
            Shipping Address
            <textarea
              placeholder="Full street address, city, state, PIN code"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              required
            />
          </label>

          {/* Payment Method */}
          <div style={{ marginTop: "14px" }}>
            <label className="checkout-label">Payment Method</label>
            <div className="payment-methods">
              <button
                type="button"
                className={`payment-option ${paymentMethod === "upi" ? "active" : ""}`}
                onClick={() => setPaymentMethod("upi")}
              >
                📱 UPI
              </button>
              <button
                type="button"
                className={`payment-option ${paymentMethod === "card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                💳 Card
              </button>
              <button
                type="button"
                className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                💵 Cash on Delivery
              </button>
            </div>

            {paymentMethod === "upi" && (
              <div className="payment-fields">
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g. astha@okaxis)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="payment-fields">
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <div className="row" style={{ gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            )}

            {paymentMethod === "cod" && (
              <p className="muted" style={{ fontSize: "0.84rem", margin: "8px 0 0" }}>
                Pay via cash or UPI at your doorstep upon delivery.
              </p>
            )}
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "14px" }} disabled={submitting}>
            {submitting
              ? "Processing order..."
              : paymentMethod === "cod"
              ? `Place COD Order · ₹${finalTotal.toFixed(2)}`
              : `Pay ₹${finalTotal.toFixed(2)} & Place Order`}
          </button>
        </form>
      </div>
    </div>
  );
}
