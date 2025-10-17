// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./Home";
import Auth from "./Auth";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { supabase } from "./supabaseClient";
import ProtectedRoute from "./ProtectedRoute";
import { Mic, Upload, History, LogOut, Menu, X, Download, Play, Square, Sun, Moon } from "lucide-react";

/* -----------------------
   Transcription component
   ----------------------- */
function Transcription() {
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [recording, setRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [darkMode, setDarkMode] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch transcriptions for the logged-in user
  const fetchTranscriptions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setHistory([]);
      return;
    }

    try {
      const res = await axios.get("https://voice2text-backend-6oaj.onrender.com/api/transcriptions", {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching transcriptions:", err);
    }
  };

  useEffect(() => {
    fetchTranscriptions();
    // subscribe to auth changes to refetch if user changes
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchTranscriptions();
    });
    return () => {
      try {
        listener.subscription.unsubscribe();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setUploadMethod("file");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "recorded.webm", { type: "audio/webm" });
        setAudioFile(file);
        setUploadMethod("record");
        // Auto-transcribe after recording
        await handleUpload(file);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      alert("Please allow microphone access to record audio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  // Upload audio + send Supabase token to backend
  const handleUpload = async (file = audioFile) => {
    if (!file) {
      alert("Please select or record an audio file first!");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("You must be logged in to transcribe.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);
      setTranscript("");
      const res = await axios.post("https://voice2text-backend-6oaj.onrender.com/api/transcribe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      setTranscript(res.data.transcript || res.data.transcript);
      // Refresh history after new transcription
      await fetchTranscriptions();
    } catch (err) {
      alert("Transcription failed! Please check if the server is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "transcription.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50'
    } flex`}>
      {/* Sidebar - History Section */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className={`fixed lg:static lg:translate-x-0 z-40 w-80 backdrop-blur-lg border-r min-h-screen p-6 shadow-lg transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-xl font-bold flex items-center gap-2 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            <History size={24} className={darkMode ? "text-blue-400" : "text-blue-600"} />
            Transcription History
          </h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X size={20} className={darkMode ? "text-gray-300" : "text-gray-600"} />
          </button>
        </div>

        <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
          {history.length > 0 ? (
            history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl shadow-sm border transition-all cursor-pointer group backdrop-blur-sm ${
                  darkMode
                    ? 'bg-gray-700/50 border-gray-600 hover:border-blue-400 hover:bg-gray-700'
                    : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-white'
                }`}
                onClick={() => setTranscript(item.transcription)}
              >
                <p className={`text-sm leading-relaxed line-clamp-3 transition-colors duration-300 ${
                  darkMode 
                    ? 'text-gray-200 group-hover:text-white' 
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {item.transcription || "No transcription text available"}
                </p>
                <p className={`text-xs mt-2 flex items-center gap-1 transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span>🗓</span>
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <History size={48} className={`mx-auto mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-300'
              }`} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No transcription history yet.</p>
              <p className={`text-xs mt-2 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>Your transcriptions will appear here</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className={`backdrop-blur-lg border-b py-4 px-6 flex justify-between items-center shadow-sm transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800/90 border-gray-700' 
            : 'bg-white/90 border-gray-200'
        }`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Menu size={20} className={darkMode ? "text-gray-300" : "text-gray-600"} />
            </button>
            <Link to="/" className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
              darkMode ? 'brightness-125' : ''
            }`}>
              🎙️ VoiceToText
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-300 ${
                darkMode 
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </nav>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content area - PROPERLY CENTERED */}
        <div className="flex-1 flex justify-center items-start p-6 lg:p-8">
          <div className="w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 transition-colors duration-300 ${
                darkMode 
                  ? 'from-gray-100 to-gray-300' 
                  : 'from-gray-800 to-gray-600'
              }`}>
                Transcription Studio
              </h1>
              <p className={`text-lg transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Upload or record audio to get instant transcriptions
              </p>
            </motion.div>

            {/* Upload Card - CENTERED */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`backdrop-blur-lg rounded-2xl shadow-xl border p-6 lg:p-8 transition-colors duration-300 ${
                darkMode
                  ? 'bg-gray-800/80 border-gray-700'
                  : 'bg-white/90 border-gray-100'
              }`}
            >
              {/* Method Selection Tabs */}
              <div className={`flex gap-2 mb-6 p-1 rounded-xl w-fit mx-auto transition-colors duration-300 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setUploadMethod("file")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    uploadMethod === "file" 
                      ? darkMode
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-blue-600 shadow-sm"
                      : darkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMethod("record")}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    uploadMethod === "record" 
                      ? darkMode
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-blue-600 shadow-sm"
                      : darkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Record Audio
                </button>
              </div>

              {/* File Upload Section */}
              {uploadMethod === "file" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 justify-center">
                    <Upload size={24} className={darkMode ? "text-blue-400" : "text-blue-600"} />
                    <h3 className={`text-xl font-semibold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Upload Audio File
                    </h3>
                  </div>
                  
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-300 relative ${
                    darkMode
                      ? 'border-gray-600 hover:border-blue-400 bg-gray-700/50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={48} className={`mx-auto mb-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <p className={`mb-2 font-medium transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-600'
                    }`}>
                      {audioFile ? audioFile.name : "Click to upload audio file"}
                    </p>
                    <p className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Supports MP3, WAV, WEBM formats
                    </p>
                  </div>

                  {audioFile && (
                    <div className={`rounded-xl p-4 border transition-colors duration-300 ${
                      darkMode
                        ? 'bg-green-900/30 border-green-700'
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <p className={`text-sm transition-colors duration-300 ${
                        darkMode ? 'text-green-300' : 'text-green-700'
                      }`}>
                        ✅ File selected: <strong>{audioFile.name}</strong>
                      </p>
                      <p className={`text-xs mt-1 transition-colors duration-300 ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        Ready to transcribe! Click the button below.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleUpload()}
                    disabled={loading || !audioFile}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${
                      darkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing Transcription...
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        Transcribe Audio
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Recording Section */}
              {uploadMethod === "record" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 justify-center">
                    <Mic size={24} className={darkMode ? "text-green-400" : "text-green-600"} />
                    <h3 className={`text-xl font-semibold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      Record Audio
                    </h3>
                  </div>

                  <div className={`rounded-xl p-8 text-center border transition-colors duration-300 ${
                    darkMode
                      ? 'bg-gray-700/50 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    {!recording ? (
                      <button
                        onClick={startRecording}
                        className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${
                          darkMode
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <Mic size={20} />
                        Start Recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg animate-pulse ${
                          darkMode
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        <Square size={20} />
                        Stop Recording
                      </button>
                    )}
                    <p className={`text-sm mt-4 transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {recording 
                        ? "🎤 Recording in progress... Click stop when finished" 
                        : "Click start to begin recording your audio"}
                    </p>
                  </div>

                  {loading && (
                    <div className={`rounded-xl p-4 text-center border transition-colors duration-300 ${
                      darkMode
                        ? 'bg-blue-900/30 border-blue-700'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className={`flex items-center justify-center gap-2 transition-colors duration-300 ${
                        darkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
                          darkMode 
                            ? 'border-blue-300 border-t-transparent' 
                            : 'border-blue-700 border-t-transparent'
                        }`} />
                        Processing your recording...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Transcript Result */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`mt-8 p-6 rounded-xl border transition-colors duration-300 ${
                    darkMode
                      ? 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold text-lg transition-colors duration-300 ${
                      darkMode ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      Transcription Result
                    </h3>
                    <button
                      onClick={downloadTranscript}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 text-sm ${
                        darkMode
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                  <div className={`rounded-lg p-4 border transition-colors duration-300 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-white border-gray-200'
                  }`}>
                    <p className={`leading-relaxed whitespace-pre-wrap text-left transition-colors duration-300 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {transcript}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------
   App Root (with routes)
   ----------------------- */
export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // load initial session
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    // listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      try {
        listener.subscription.unsubscribe();
      } catch (e) {}
    };
  }, []);

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home session={session} />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/transcribe"
            element={
              <ProtectedRoute>
                <Transcription />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}