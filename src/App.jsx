import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Home from "./Home";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Auth from "./Auth";

function Transcription() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const fetchTranscriptions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/transcriptions`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching transcriptions:", err);
    }
  };

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const handleFileChange = (e) => setAudioFile(e.target.files[0]);

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
        await handleUpload(file);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      alert("Please allow microphone access to record audio.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleUpload = async (file = audioFile) => {
    if (!file) return alert("Select or record an audio file first!");
    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);
      setTranscript("");
      const res = await axios.get(`${API_URL}/api/transcriptions`), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscript(res.data.transcript);
      fetchTranscriptions();
    } catch {
      alert("Transcription failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center py-10 px-4">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md py-3 px-6 flex justify-between items-center z-50">
        <Link to="/" className="text-2xl font-bold text-blue-700">🎙️ VoiceToText</Link>
        <Link
          to="/"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Home
        </Link>
      </nav>

      <div className="mt-20 w-full flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-blue-700 mb-8 tracking-tight"
        >
          🎧 Transcription Studio
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center gap-5 border border-gray-100"
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 
                       file:rounded-md file:border-0 file:text-sm 
                       file:font-semibold file:bg-blue-50 file:text-blue-600 
                       hover:file:bg-blue-100"
          />

          <button
            onClick={() => handleUpload()}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold 
                       hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Upload & Transcribe"}
          </button>

          <div className="flex gap-4 mt-2">
            {!recording ? (
              <button
                onClick={startRecording}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                🎤 Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition animate-pulse"
              >
                ⏹ Stop Recording
              </button>
            )}
          </div>

          {transcript && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl w-full"
            >
              <h3 className="font-semibold text-blue-800">Transcription:</h3>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{transcript}</p>
            </motion.div>
          )}
        </motion.div>

        {/* History Section */}
        <div className="mt-10 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📜 Saved Transcriptions</h2>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
                >
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {item.transcription}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No saved transcriptions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transcribe" element={<Transcription />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;
