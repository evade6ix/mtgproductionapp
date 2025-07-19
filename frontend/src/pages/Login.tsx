import { useState } from "react";
import { API_URL } from "../api/config";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username: email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Auth failed");
      if (isLogin) {
        localStorage.setItem("token", data.access_token);
        navigate("/profile");
      } else {
        setMessage("Registration successful! Please log in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded shadow w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold">
          {isLogin ? "Login" : "Register"}
        </h1>
        {message && <p className="text-yellow-400">{message}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 px-3 py-2 rounded hover:bg-purple-700"
        >
          {isLogin ? "Login" : "Register"}
        </button>

        {/* Toggle Login/Register */}
        <p
          className="text-sm text-gray-300 cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "No account? Register here."
            : "Have an account? Login here."}
        </p>

        {/* Forgot Password Link */}
        {isLogin && (
          <p
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-purple-400 hover:underline cursor-pointer mt-2 text-center"
          >
            Forgot Password?
          </p>
        )}
      </form>
    </div>
  );
}
