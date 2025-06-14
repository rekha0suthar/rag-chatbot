import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  clearSession,
  createSession,
  getSession,
} from './controllers/session.js';
import { chat } from './controllers/chat.js';
import { ingestNewsArticles } from './fetchNews.js';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Decode and write service account if running in cloud
if (process.env.GOOGLE_CREDENTIALS_B64) {
  const path = '/tmp/service-account.json';
  fs.writeFileSync(
    path,
    Buffer.from(process.env.GOOGLE_CREDENTIALS_B64, 'base64').toString()
  );
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path;
}

app.use(cors());
app.use(express.json());

app.post('/session', createSession);
app.post('/session/clear', clearSession);
app.get('/session/:id', getSession);

app.get('/ingest-news', async (req, res) => {
  try {
    await ingestNewsArticles();
    res.send('✅ News ingestion complete.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Ingestion failed.');
  }
});

// chat route
app.post('/chat', chat);

// Server start
app.listen(port, () => console.log(`Server is running on port ${port}`)); // eslint-disable-line no-console
