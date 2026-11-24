import { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Admin() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  const [tab, setTab] = useState("overview"); // 'overview' | 'products' | 'orders' | 'users' | 'coupons'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(isAdmin);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Product Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category_id: "",
    price: "",
    stock_quantity: "",
    image_url: "",
    description: "",
  });

  // Coupon Form state
  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    discount_type: "percent",
    discount_value: "10",
    min_order_amount: "0",
  });

  const showToast = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, prodsRes, catsRes, ordersRes, usersRes, couponsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/products"),
        api.get("/categories"),
        api.get("/admin/orders"),
        api.get("/admin/users"),
        api.get("/admin/coupons"),
      ]);
      setStats(statsRes.data);
      setProducts(prodsRes.data);
      setCategories(catsRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setCoupons(couponsRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load admin data. Ensure server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    Promise.all([
      api.get("/admin/stats"),
      api.get("/products"),
      api.get("/categories"),
      api.get("/admin/orders"),
      api.get("/admin/users"),
      api.get("/admin/coupons"),
    ])
      .then(([statsRes, prodsRes, catsRes, ordersRes, usersRes, couponsRes]) => {
        if (!active) return;
        setStats(statsRes.data);
        setProducts(prodsRes.data);
        setCategories(catsRes.data);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
        setCoupons(couponsRes.data);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        setError(err.response?.data?.message || "Failed to load admin data. Ensure server is running.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="card" style={{ maxWidth: "540px", margin: "48px auto", textAlign: "center", padding: "36px" }}>
        <span className="admin-badge-label">RESTRICTED AREA</span>
        <h2 style={{ fontFamily: "var(--font-serif)", marginTop: "8px" }}>Admin Access Required</h2>
        <p className="muted" style={{ marginBottom: "20px" }}>
          {user
            ? `You are currently signed in as ${user.email} (${user.role || "customer"}). Please sign in with an admin account to manage products, orders, and coupons.`
            : "Please log in with an admin account to access the ShopEase Admin Dashboard."}
        </p>
        <div className="row" style={{ justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          {user ? (
            <button className="btn-secondary-sm" onClick={logout}>Sign Out</button>
          ) : (
            <Link to="/login" className="btn-primary">Go to Login</Link>
          )}
          <Link to="/" className="btn-secondary-sm">Back to Storefront</Link>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order status updated to ${newStatus.toUpperCase()}`);
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update status");
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productForm);
        showToast("Product updated successfully! ✓");
      } else {
        await api.post("/products", productForm);
        showToast("New product created! ✓");
      }
      setShowAddModal(false);
      setEditingProduct(null);
      setProductForm({ name: "", category_id: "", price: "", stock_quantity: "", image_url: "", description: "" });
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category_id: p.category_id || "",
      price: p.price,
      stock_quantity: p.stock_quantity,
      image_url: p.image_url,
      description: p.description || "",
    });
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to deactivate this product?")) return;
    try {
      await api.delete(`/products/${productId}`);
      showToast("Product deactivated ✓");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to remove product");
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/coupons", couponForm);
      showToast("Coupon created! ✓");
      setCouponForm({ code: "", description: "", discount_type: "percent", discount_value: "10", min_order_amount: "0" });
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not create coupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      showToast("Coupon removed ✓");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete coupon");
    }
  };

  if (loading) return <div className="admin-loading"><p>Loading Admin Dashboard...</p></div>;

  return (
    <div className="admin-container">
      {/* Top Header */}
      <div className="admin-header">
        <div>
          <span className="admin-badge-label">STORE MANAGEMENT</span>
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <div className="admin-header-actions">
          <button
            className="btn-admin-add"
            onClick={() => {
              setEditingProduct(null);
              setProductForm({ name: "", category_id: categories[0]?.id || "", price: "", stock_quantity: "20", image_url: "", description: "" });
              setShowAddModal(true);
            }}
          >
            + Add New Product
          </button>
          <Link to="/" className="btn-secondary-sm">View Storefront →</Link>
        </div>
      </div>

      {msg && <div className="toast">{msg}</div>}
      {error && <div className="toast" style={{ background: "#fee2e2", color: "#b91c1c" }}>{error}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
          📊 Overview
        </button>
        <button className={`admin-tab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>
          📦 Products ({products.length})
        </button>
        <button className={`admin-tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>
          📑 Orders ({orders.length})
        </button>
        <button className={`admin-tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
          👥 Users ({users.length})
        </button>
        <button className={`admin-tab ${tab === "coupons" ? "active" : ""}`} onClick={() => setTab("coupons")}>
          🏷️ Coupons ({coupons.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && stats && (
        <div className="admin-tab-content">
          <div className="admin-stats-grid">
            <div className="stat-card">
              <span className="stat-icon">💰</span>
              <div>
                <p className="stat-label">Total Revenue</p>
                <h3 className="stat-value">₹{stats.totalRevenue}</h3>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📦</span>
              <div>
                <p className="stat-label">Total Orders</p>
                <h3 className="stat-value">{stats.totalOrders}</h3>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏷️</span>
              <div>
                <p className="stat-label">Active Products</p>
                <h3 className="stat-value">{stats.totalProducts}</h3>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">👥</span>
              <div>
                <p className="stat-label">Registered Customers</p>
                <h3 className="stat-value">{stats.totalUsers}</h3>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {stats.lowStockProducts?.length > 0 && (
            <div className="admin-card" style={{ marginTop: "24px" }}>
              <div className="row between">
                <h3 style={{ margin: 0, color: "#d97706" }}>⚠️ Inventory Attention (Low Stock)</h3>
                <span className="badge" style={{ background: "#fef3c7", color: "#b45309" }}>
                  {stats.lowStockProducts.length} Items
                </span>
              </div>
              <div className="admin-table-wrapper" style={{ marginTop: "12px" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Units Left</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockProducts.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td>₹{p.price}</td>
                        <td>
                          <span style={{ color: p.stock_quantity === 0 ? "#dc2626" : "#d97706", fontWeight: 700 }}>
                            {p.stock_quantity === 0 ? "OUT OF STOCK" : `${p.stock_quantity} remaining`}
                          </span>
                        </td>
                        <td>
                          <button className="icon-btn" onClick={() => handleEditClick(p)}>
                            Restock / Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Orders Overview */}
          <div className="admin-card" style={{ marginTop: "24px" }}>
            <div className="row between">
              <h3 style={{ margin: 0 }}>Recent Orders</h3>
              <button className="btn-secondary-sm" onClick={() => setTab("orders")}>
                View All Orders ({orders.length}) →
              </button>
            </div>
            {stats.recentOrders?.length === 0 ? (
              <p className="muted" style={{ marginTop: "16px" }}>No orders placed yet.</p>
            ) : (
              <div className="admin-table-wrapper" style={{ marginTop: "16px" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Payment</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td><code>#{o.id.slice(0, 8)}</code></td>
                        <td>{o.customer_name || "Guest"} ({o.email})</td>
                        <td style={{ textTransform: "uppercase", fontSize: "0.82rem" }}>{o.payment_method || "cod"}</td>
                        <td><strong>₹{o.total_amount}</strong></td>
                        <td>{new Date(o.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-pill status-${o.status}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Products */}
      {tab === "products" && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <div className="row between" style={{ marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Catalog Products ({products.length})</h3>
              <button
                className="btn-admin-add"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: "", category_id: categories[0]?.id || "", price: "", stock_quantity: "20", image_url: "", description: "" });
                  setShowAddModal(true);
                }}
              >
                + Add Product
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img src={p.image_url} alt={p.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover" }} />
                        <div>
                          <strong>{p.name}</strong>
                          <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>ID: {p.id.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td>{p.category_name}</td>
                      <td><strong>₹{p.price}</strong></td>
                      <td>
                        <span style={{ color: p.stock_quantity < 10 ? "#d97706" : "#047857", fontWeight: 600 }}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td>
                        <div className="row" style={{ gap: "6px" }}>
                          <button className="icon-btn" onClick={() => handleEditClick(p)}>Edit</button>
                          <button className="icon-btn danger-hover" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {tab === "orders" && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <h3 style={{ margin: "0 0 16px" }}>Customer Orders ({orders.length})</h3>
            {orders.length === 0 ? (
              <p className="muted">No customer orders have been placed yet.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer & Address</th>
                      <th>Line Items</th>
                      <th>Payment / Total</th>
                      <th>Status Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <strong>#{o.id.slice(0, 8).toUpperCase()}</strong>
                          {o.tracking_number && (
                            <p className="muted" style={{ fontSize: "0.75rem", margin: "2px 0 0" }}>
                              Track: <code>{o.tracking_number}</code>
                            </p>
                          )}
                          <p className="muted" style={{ fontSize: "0.75rem", margin: "2px 0 0" }}>
                            {new Date(o.created_at).toLocaleString()}
                          </p>
                        </td>
                        <td>
                          <strong>{o.customer_name}</strong>
                          <p className="muted" style={{ fontSize: "0.85rem", margin: "2px 0" }}>{o.customer_email}</p>
                          <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>📍 {o.shipping_address}</p>
                        </td>
                        <td>
                          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.85rem" }}>
                            {o.items?.map((it, idx) => (
                              <li key={idx}>
                                {it.name} × {it.quantity} (@ ₹{it.price})
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#047857" }}>
                            ₹{o.total_amount}
                          </span>
                          <p className="muted" style={{ fontSize: "0.78rem", margin: "4px 0 0" }}>
                            {(o.payment_method || "cod").toUpperCase()} ({o.payment_status || "pending"})
                          </p>
                        </td>
                        <td>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className={`status-select status-${o.status}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {tab === "users" && (
        <div className="admin-tab-content">
          <div className="admin-card">
            <h3 style={{ margin: "0 0 16px" }}>Registered Customer Accounts ({users.length})</h3>
            {users.length === 0 ? (
              <p className="muted">No customers registered yet.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Shipping Address</th>
                      <th>Total Orders</th>
                      <th>Total Spent</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td><span className="badge">{u.role || "customer"}</span></td>
                        <td className="muted">{u.address || "No address saved"}</td>
                        <td><strong>{u.total_orders}</strong></td>
                        <td><strong style={{ color: "#047857" }}>₹{parseFloat(u.total_spent).toFixed(2)}</strong></td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Coupons */}
      {tab === "coupons" && (
        <div className="admin-tab-content">
          <div className="admin-card" style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 14px" }}>Create Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="coupon-admin-form">
              <input
                required
                placeholder="Code (e.g. FESTIVE15)"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
              />
              <select
                value={couponForm.discount_type}
                onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
                <option value="shipping">Free Shipping</option>
              </select>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Value"
                value={couponForm.discount_value}
                onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Min Order (₹)"
                value={couponForm.min_order_amount}
                onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
              />
              <input
                placeholder="Description"
                value={couponForm.description}
                onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
              />
              <button type="submit" className="btn-admin-add">+ Add Coupon</button>
            </form>
          </div>

          <div className="admin-card">
            <h3 style={{ margin: "0 0 16px" }}>Active Coupons ({coupons.length})</h3>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min Order</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td><code>{c.code}</code></td>
                      <td style={{ textTransform: "capitalize" }}>{c.discount_type}</td>
                      <td>
                        {c.discount_type === "percent"
                          ? `${c.discount_value}%`
                          : c.discount_type === "fixed"
                          ? `₹${c.discount_value}`
                          : "Free Shipping"}
                      </td>
                      <td>₹{c.min_order_amount}</td>
                      <td className="muted">{c.description}</td>
                      <td>
                        <button className="icon-btn danger-hover" onClick={() => handleDeleteCoupon(c.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="row between" style={{ marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button className="icon-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="modal-form">
              <label>
                Product Name:
                <input
                  required
                  placeholder="e.g. Vintage Leather Backpack"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </label>

              <div className="modal-row">
                <label style={{ flex: 1 }}>
                  Category:
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  Price (₹):
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1299"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </label>
              </div>

              <div className="modal-row">
                <label style={{ flex: 1 }}>
                  Stock Quantity:
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="25"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                  />
                </label>
                <label style={{ flex: 2 }}>
                  Image URL (Unsplash or direct image):
                  <input
                    placeholder="https://images.unsplash.com/photo-..."
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  />
                </label>
              </div>

              <label>
                Description:
                <textarea
                  rows={3}
                  placeholder="Brief description of the product features..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary-sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-hero-primary" style={{ padding: "10px 20px" }}>
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
