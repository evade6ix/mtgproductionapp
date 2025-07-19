import { useState } from "react";
import { API_URL } from "../api/config";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to send reset email");
      setMessage("Password reset link sent to your email.");
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
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        {message && <p className="text-yellow-400">{message}</p>}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 px-3 py-2 rounded hover:bg-purple-700"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
