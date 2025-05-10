import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000'; // update for prod

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

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

    const res = await axios.post(`${API_BASE}/chat`, {
      sessionId,
      userMessage: userMsg,
    });

    setMessages((msgs) => [
      ...msgs,
      { role: 'user', message: userMsg },
      {
        role: 'bot',
        message:
          res.data.reply.replace(
            /\*\*(.+?)\*\*:/g,
            '<span style="font-weight:bold">$1</span>:'
          ) || 'No response from bot',
      },
    ]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-200 p-4">
      <div className="flex items-center justify-center w-full">
        <div className="w-full max-w-2xl shadow-2xl bg-white rounded-2xl p-6 border border-gray-300">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              📰 News Chatbot
            </h1>
            <button
              onClick={clearSession}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
            >
              Reset
            </button>
          </div>
          <div className="h-[500px] overflow-y-auto space-y-3 border rounded-xl p-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[75%] p-3 rounded-xl shadow-md ${
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
          <div className="mt-6 flex gap-2">
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
    </div>
  );
}
