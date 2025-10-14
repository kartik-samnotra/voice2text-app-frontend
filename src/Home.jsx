import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, LogIn } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 text-white">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-pink-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full flex items-center justify-between px-10 py-6 backdrop-blur-md bg-white/10">
        <h1 className="text-2xl font-extrabold tracking-tight">Voice2Text Studio</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition"
          >
            <LogIn size={18} />
            Login
          </button>
          <button
            onClick={() => navigate("/transcribe")}
            className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-2 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            <Mic size={18} />
            Start Transcribing
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center px-6"
      >
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Transform Your Voice Into Text <br /> with AI Precision
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Upload or record your voice and get accurate transcriptions in seconds.
          Your words, made digital — instantly.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <button
            onClick={() => navigate("/transcribe")}
            className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-gray-200 transition shadow-lg"
          >
            🎙 Start Transcribing
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition"
          >
            🔐 Login / Signup
          </button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-0 text-sm text-gray-200 py-4">
        © 2025 Voice2Text Studio · Built by <span className="font-semibold">Kartik Samnotra</span>
      </footer>
    </div>
  );
}
