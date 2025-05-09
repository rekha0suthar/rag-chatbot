import { askGemini, getEmbeddings, retrieveContext } from '../utils/index.js';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const chat = async (req, res) => {
  const { sessionId, userMessage } = req.body;

  const history = JSON.parse(await redis.get(sessionId || '[]'));
  const queryEmbedding = await getEmbeddings(userMessage);
  const context = await retrieveContext(queryEmbedding);
  const prompt = `Use the following context to answer:\n${context}\n\nUser: ${userMessage}`;
  const botReply = await askGemini(prompt);
  const updatedHistory = [
    ...history,
    { role: 'user', message: userMessage },
    { role: 'assistant', message: botReply },
  ];
  await redis.set(sessionId, JSON.stringify(updatedHistory), 'Ex', 86400);
  res.json({ reply: botReply });
};
