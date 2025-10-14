import { useState } from "react";
import { supabase } from "./supabaseClient";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await supabase.auth.signInWithPassword({ email, password });
      } else {
        response = await supabase.auth.signUp({ email, password });
      }

      if (response.error) throw response.error;

      alert(
        isLogin
          ? "Login successful! Redirecting..."
          : "Signup successful! Check your email for confirmation."
      );

      if (isLogin) navigate("/transcribe");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/90 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200"
      >
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
          {isLogin ? "Welcome Back 👋" : "Create Your Account 🚀"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-700 font-semibold hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>

        <Link
          to="/"
          className="block text-center text-sm text-gray-500 mt-6 hover:text-blue-700"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
