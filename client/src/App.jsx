import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import AuthPage from "./pages/AuthPage";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

export default function App() {
  const { user, logout } = useAuth();
  const Private = ({ children }) => (user ? children : <Navigate to="/login" />);

  return (
    <>
      <nav className="nav">
        <Link to="/" className="brand">ShopEase</Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">My Orders</Link>
              <span>Hi, {user.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/cart" element={<Private><Cart /></Private>} />
          <Route path="/orders" element={<Private><Orders /></Private>} />
        </Routes>
      </main>
    </>
  );
}
