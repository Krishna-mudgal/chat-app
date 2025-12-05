import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important for cookies
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
      } else {
        // Cookie is automatically set by backend
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
        <h1 className="text-xl font-bold mb-4 text-gray-200">Login</h1>

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
      </form>
    </div>
  );
}
