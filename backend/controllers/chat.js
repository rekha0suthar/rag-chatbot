import { getRelevantContext } from '../utils/index.js';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chat = async (req, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    const history = JSON.parse((await redis.get(sessionId)) || '[]');
    const context = await getRelevantContext(userMessage);

    const prompt = `Use the following context to answer the user's question.\n\nContext:\n${context}\n\nUser: ${userMessage}`;

    const model = genAI.getGenerativeModel({
      model: 'models/gemini-1.5-flash',
    });
    const result = await model.generateContent(prompt);
    console.log(result);
    const botReply = result.response.text();

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
