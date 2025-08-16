import React, { useState } from 'react';
import axios from 'axios';
import { FiSend } from 'react-icons/fi';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/ask', { question: input });
      setMessages((prev) => [...prev, { text: response.data.answer, isUser: false }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: 'Error: ' + (err.response?.data?.detail || 'Failed to get response'), isUser: false }]);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-96">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500">Ask a question about the video!</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-3 rounded-lg ${msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-center text-gray-500">Thinking...</div>}
      </div>
      <div className="border-t p-4 flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded-l-lg bg-gray-200 dark:bg-gray-700 focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about the video..."
        />
        <button className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600" onClick={handleSend}>
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;