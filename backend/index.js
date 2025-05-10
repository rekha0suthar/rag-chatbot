import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  clearSession,
  createSession,
  getSession,
} from './controllers/session.js';
import { chat } from './controllers/chat.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/session', createSession);
app.post('/session/clear', clearSession);
app.get('/session/:id', getSession);

// chat route
app.post('/chat', chat);

// Server start
app.listen(port, () => console.log(`Server is running on port ${port}`)); // eslint-disable-line no-console
