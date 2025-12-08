import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API = import.meta.env.BACKEND_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/profile`, {
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      
      localStorage.removeItem("user");
      
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1f22] flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1f22] py-12 px-4">
      <div className="max-w-md mx-auto bg-[#2b2d31] rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {user?.username || "User"}
          </h1>
          
          <p className="text-gray-400 mb-6">
            ID: {user?._id?.slice(-6) || "N/A"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="text-sm text-gray-400">
            <strong>Status:</strong> Online
          </div>
          <div className="text-sm text-gray-400">
            <strong>Joined:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
