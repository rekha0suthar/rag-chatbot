import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const redis = new Redis(process.env.REDIS_URL);

const createSession = async (req, res) => {
  const sessionId = uuidv4();
  await redis.set(sessionId, JSON.stringify([]), 'Ex', 86400); //TTL 1 day
  res.json({ sessionId });
};

const clearSession = async (req, res) => {
  const { sessionId } = req.body;
  await redis.del(sessionId);
  res.json({ message: 'Session cleared' });
};

const getSession = async (req, res) => {
  const messages = await redis.get(req.params.id);
  res.json({ history: JSON.parse(messages || '[]') });
};

export { createSession, clearSession, getSession };
