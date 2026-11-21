import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "" });
  const [error, setError] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) await login({ email: form.email, password: form.password });
      else await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>{isLogin ? "Login" : "Create account"}</h2>
      {!isLogin && <input name="name" placeholder="Name" value={form.name} onChange={change} required />}
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} required />
      <input name="password" type="password" placeholder="Password (6+ characters)" value={form.password} onChange={change} required />
      {!isLogin && <input name="address" placeholder="Address" value={form.address} onChange={change} />}
      {error && <p className="error">{error}</p>}
      <button type="submit">{isLogin ? "Login" : "Register"}</button>
    </form>
  );
}
