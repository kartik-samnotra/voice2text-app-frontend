import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, LogIn, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function Home({ session }) {
  const navigate = useNavigate();

  const handleTranscribeClick = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      navigate("/transcribe");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Live Recording",
      description: "Record audio directly in your browser and get instant transcriptions"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Processing",
      description: "AI-powered transcription that works in seconds, not minutes"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your data stays yours. We don't store or share your recordings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full flex items-center justify-between px-6 lg:px-12 py-6 backdrop-blur-md bg-white/5 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Mic size={24} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Voice2Text Studio
          </h1>
        </motion.div>

        <div className="flex items-center gap-4">
          {!session ? (
            <>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => navigate("/auth")}
                className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <LogIn size={18} />
                Login
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleTranscribeClick}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                <Mic size={18} />
                Start Transcribing
              </motion.button>
            </>
          ) : (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/auth");
              }}
              className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition-all"
            >
              Logout
            </motion.button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-8"
          >
            <Sparkles size={16} className="text-yellow-400" />
            <span className="text-sm font-medium">AI-Powered Transcription</span>
          </motion.div>

          <motion.h1
            className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Voice to Text
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>

          <motion.p
            className="text-xl lg:text-2xl text-blue-200 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Transform your voice into accurate text with our advanced AI technology. 
            Perfect for meetings, interviews, notes, and more.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
          >
            <button
              onClick={handleTranscribeClick}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-2xl"
            >
              <Mic size={24} />
              Start Transcribing Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              <LogIn size={24} />
              Login / Signup
            </button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-blue-200 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-blue-200 py-8 border-t border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <p className="text-sm">
            © 2025 Voice2Text Studio · Built by{" "}
            <span className="font-semibold text-white">Kartik Samnotra</span>
          </p>
        </div>
      </footer>
    </div>
  );
}