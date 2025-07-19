import { useState } from "react";
import { API_URL } from "../api/config";


export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const body = isLogin
      ? new URLSearchParams({ username: email, password })
      : JSON.stringify({ email, password });

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
  method: "POST",
  headers: isLogin
    ? { "Content-Type": "application/x-www-form-urlencoded" }
    : { "Content-Type": "application/json" },
  body,
});

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong");

      if (isLogin) {
        localStorage.setItem("token", data.access_token);
        setMessage("Logged in successfully!");
      } else {
        setMessage("Registration successful! You can now log in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-gray-800 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{isLogin ? "Login" : "Register"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p
        className="mt-4 text-sm text-blue-400 cursor-pointer"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "No account? Register here." : "Already have an account? Login"}
      </p>
      {message && <p className="mt-2 text-red-400">{message}</p>}
    </div>
  );
}
