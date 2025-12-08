import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API = import.meta.env.BACKEND_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
      } else {
        navigate("/channels");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#1e1f22]">
      <form className="bg-[#2b2d31] p-6 rounded w-80" onSubmit={handleLogin}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#36393f]">
          <h1 className="text-xl font-bold text-gray-200">Login</h1>
          
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white text-xl p-1 hover:bg-[#36393f] rounded-full transition-all w-8 h-8 flex items-center justify-center"
            title="Close"
          >
            ×
          </button>
        </div>

        <input
          className="w-full mb-3 p-2 rounded bg-[#313338] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          type="password"
          className="w-full mb-4 p-2 rounded bg-[#313338] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-gray-200 p-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm mb-2">Don't have an account? 
            <button 
              type="button"
              onClick={() => navigate("/signup")}
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
            >
              Create account
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
