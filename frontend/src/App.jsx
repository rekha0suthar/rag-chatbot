import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'https://rag-chatbot-server.vercel.app';

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initSession() {
      const res = await axios.post(`${API_BASE}/session`);
      setSessionId(res.data.sessionId);
    }
    initSession();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearSession = async () => {
    await axios.post(`${API_BASE}/session/clear`, { sessionId });
    const res = await axios.post(`${API_BASE}/session`);
    setSessionId(res.data.sessionId);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input;

    setMessages((msgs) => [...msgs, { role: 'user', message: userMsg }]);
    setInput('');
    setLoading(true);

    // Show loading message
    setMessages((msgs) => [
      ...msgs,
      { role: 'user', message: userMsg },
      { role: 'bot', message: 'Thinking... 🤔' },
    ]);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        sessionId,
        userMessage: userMsg,
      });

      setMessages((msgs) => [
        ...msgs.slice(0, -1), // remove loading
        { role: 'bot', message: res.data.reply },
      ]);
    } catch (err) {
      console.error('API Error:', err);
      setMessages((msgs) => [
        ...msgs.slice(0, -1), // remove loading
        {
          role: 'bot',
          message: '⚠️ I couldn’t fetch a response. Please try again later.',
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200 px-4 py-6">
      <div className="w-full max-w-3xl shadow-2xl bg-white rounded-2xl px-4 py-6 sm:p-6 border border-gray-300">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            📰 News Chatbot
          </h1>
          <button
            onClick={clearSession}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
          >
            Reset
          </button>
        </div>
        <div className="h-[60vh] sm:h-[500px] overflow-y-auto space-y-3 border rounded-xl p-4 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[90%] sm:max-w-[75%] p-3 rounded-xl shadow-md ${
                msg.role === 'user'
                  ? 'ml-auto bg-blue-100 text-right'
                  : 'mr-auto bg-green-100 text-left'
              }`}
            >
              <span className="block text-xs text-gray-500 mb-1 font-semibold">
                {msg.role === 'user' ? 'You' : 'Bot'}
              </span>
              <div className="text-gray-800 whitespace-pre-wrap">
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me about the news..."
            className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
