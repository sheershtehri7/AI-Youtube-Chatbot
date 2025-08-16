import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Youtube, 
  Play, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  User, 
  Bot, 
  Loader2,
  Sparkles,
  Lightbulb,
  Clock,
  TrendingUp,
  BookOpen,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import axios from 'axios';

const ChatPage = () => {
  const navigate = useNavigate();
  const { videoData, clearVideo } = useVideo();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Redirect if no video is processed
  useEffect(() => {
    if (!videoData.isProcessed) {
      navigate('/');
    }
  }, [videoData.isProcessed, navigate]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { 
      text: input, 
      isUser: true, 
      timestamp: new Date(),
      id: Date.now()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);
    
    try {
      const response = await axios.post('http://localhost:8000/ask', { question: input });
      
      // Simulate typing delay for better UX
      setTimeout(() => {
        const botMessage = { 
          text: response.data.answer, 
          isUser: false, 
          timestamp: new Date(),
          id: Date.now() + 1
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
      
    } catch (err) {
      const errorMessage = { 
        text: 'Sorry, I encountered an error. Please try again or check if the video was processed correctly.', 
        isUser: false, 
        timestamp: new Date(),
        id: Date.now() + 1,
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      text: "Can you summarize the main points of this video?",
      category: "Summary"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      text: "What are the key takeaways?",
      category: "Insights"
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      text: "Can you explain the main concept in simple terms?",
      category: "Explanation"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      text: "What questions does this video answer?",
      category: "Analysis"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      text: "Are there any important details I should know?",
      category: "Details"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      text: "What's the timeline of events discussed?",
      category: "Timeline"
    }
  ];

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const handleGoBack = () => {
    clearVideo();
    navigate('/');
  };

  if (!videoData.isProcessed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.button
              onClick={handleGoBack}
              className="flex items-center space-x-3 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-medium">Back to Home</span>
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                AI Chat
              </h1>
            </div>
            
            <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-full">
              Powered by Gemini AI
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Video Info & Suggested Questions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Video Info Card */}
            <motion.div 
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Play className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Video Ready
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    ID: {videoData.id}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Successfully processed</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span>Ready for questions</span>
                </div>
              </div>
            </motion.div>

            {/* Suggested Questions */}
            <motion.div 
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span>Suggested Questions</span>
              </h3>
              
              <div className="space-y-3">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question.text)}
                    className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-xl border border-slate-200 dark:border-slate-600 transition-all duration-200 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="text-white">
                          {question.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                          {question.category}
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                          {question.text}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
                    <p className="text-blue-100 text-sm">Ask me anything about the video</p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10 text-blue-500" />
                    </div>
                    <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      Start Your Conversation
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                      Ask questions about the video content or use the suggested questions on the left to get started
                    </p>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto"></div>
                  </div>
                )}

                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`flex items-start space-x-3 max-w-[80%] ${msg.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.isUser 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-r from-slate-500 to-slate-600'
                        }`}>
                          {msg.isUser ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-white" />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`relative group ${
                          msg.isUser ? 'order-1' : 'order-2'
                        }`}>
                          <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                            msg.isUser
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                              : msg.isError
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            
                            {/* Timestamp */}
                            <div className={`text-xs mt-2 ${
                              msg.isUser ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {formatTimestamp(msg.timestamp)}
                            </div>
                          </div>

                          {/* Copy Button */}
                          {!msg.isUser && (
                            <motion.button
                              onClick={() => copyToClipboard(msg.text, index)}
                              className={`absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 ${
                                copiedIndex === index ? 'text-green-500' : 'text-slate-500 hover:text-blue-500'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div 
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Section */}
              <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask a question about the video..."
                      rows={1}
                      disabled={loading}
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                  </div>
                  <motion.button
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      loading || !input.trim()
                        ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    whileHover={!loading && input.trim() ? { scale: 1.05 } : {}}
                    whileTap={!loading && input.trim() ? { scale: 0.95 } : {}}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {/* Character Count */}
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">
                  {input.length}/1000 characters
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
