import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Youtube, 
  Zap, 
  Brain, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  MessageSquare,
  Clock,
  Users
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import axios from 'axios';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setVideo } = useVideo();
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleProcess = async () => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (!match) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    const videoId = match[1];
    setError(null);
    setIsProcessing(true);
    setIsSuccess(false);

    try {
      // Set video data
      setVideo({
        id: videoId,
        url: url,
        isProcessing: true
      });

      // Process video
      await axios.post('http://localhost:8000/process', { video_id: videoId });
      
      setVideo({
        isProcessed: true,
        isProcessing: false
      });

      setIsSuccess(true);
      
      // Navigate to chat page after a brief delay
      setTimeout(() => {
        navigate('/chat');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.detail || 'Error processing video. Please try again.');
      setVideo({ isProcessing: false, error: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleProcess();
    }
  };

  const features = [
    {
      icon: <Youtube className="w-8 h-8" />,
      title: "Any YouTube Video",
      description: "Works with any video that has available transcripts",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Processing",
      description: "AI-powered analysis in seconds",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Smart Conversations",
      description: "Context-aware AI responses",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Natural Chat",
      description: "Ask questions in plain English",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const stats = [
    { icon: <Clock className="w-6 h-6" />, value: "Instant", label: "Processing" },
    { icon: <Users className="w-6 h-6" />, value: "Unlimited", label: "Questions" },
    { icon: <Sparkles className="w-6 h-6" />, value: "AI-Powered", label: "Responses" }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Youtube className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                AI YouTube Chatbot
              </h1>
            </motion.div>
            <motion.div 
              className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Powered by Gemini AI
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
              Sheersh
              <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent block">
                Tehri
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12">
              Transform any YouTube video into an interactive conversation. Ask questions, get summaries, 
              and explore content like never before with our cutting-edge AI technology.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Video Processing Form */}
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  Process Your Video
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Paste a YouTube URL below to get started
                </p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-6 py-5 text-lg border-2 border-slate-200 dark:border-slate-600 rounded-2xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={isProcessing}
                  />
                  {isProcessing && (
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                  )}
                </div>

                <motion.button
                  className={`w-full py-5 px-8 rounded-2xl font-bold text-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                    isProcessing
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl'
                  }`}
                  onClick={handleProcess}
                  disabled={isProcessing}
                  whileHover={!isProcessing ? { scale: 1.02 } : {}}
                  whileTap={!isProcessing ? { scale: 0.98 } : {}}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center space-x-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Processing Video...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-3">
                      <Play className="w-6 h-6" />
                      <span>Process Video</span>
                      <ArrowRight className="w-6 h-6" />
                    </span>
                  )}
                </motion.button>

                {/* Status Messages */}
                {error && (
                  <motion.div 
                    className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
                  </motion.div>
                )}

                {isSuccess && (
                  <motion.div 
                    className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      Video processed successfully! Redirecting to chat...
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Our AI Chatbot?
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Experience the future of video content interaction with our advanced AI technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                AI YouTube Chatbot
              </h4>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Transform your video watching experience with AI-powered conversations
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              &copy; 2024 AI YouTube Chatbot. Built with React and powered by Gemini AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
