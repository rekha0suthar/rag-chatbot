import { getRelevantContext } from '../utils/index.js';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chat = async (req, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    const history = JSON.parse((await redis.get(sessionId)) || '[]');
    const context = 'Context from vector DB (Qdrant) goes here...'; // Replace with your real context logic
    const prompt = `Use the following context to answer the user's question:\n\n${context}\n\nUser: ${userMessage}`;

    const vertex_ai = new VertexAI({
      project: '105892957073579483079', // ✅ update this!
      location: 'us-central1',
    });

    const model = vertex_ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const botReply = result.response.candidates[0].content.parts[0].text;
    const updatedHistory = [
      ...history,
      { role: 'user', message: userMessage },
      { role: 'bot', message: botReply },
    ];
    await redis.set(sessionId, JSON.stringify(updatedHistory), 'EX', 86400);

    res.json({ reply: botReply });
  } catch (err) {
    console.error('Gemini Chat Error:', err.message);
    res.status(500).json({ error: 'Failed to generate response.' });
  }
};
