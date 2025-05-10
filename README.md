## RAG-Powered News Chatbot

A full-stack chatbot that answers queries over recent news using Retrieval-Augmented Generation (RAG), powered by Jina embeddings, Qdrant vector search, and Gemini/OpenAI LLMs.

---

### Features

- RAG pipeline with top-k context retrieval
- Gemini or OpenAI GPT for answering questions
- Vector search using Qdrant
- Chat interface with session history
- Redis-backed memory per session
- Responsive UI built with React + Tailwind CSS

---

### Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Vector DB**: Qdrant
- **Embedding**: Jina AI
- **LLM**: Gemini (or OpenAI GPT)
- **Storage**: Redis Cloud (session data)

---

### Setup Instructions

#### 1. Clone & Install

```bash
git clone https://github.com/rekha0suthar/rag-chatbot.git
cd rag-chatbot
```

#### 2. Environment Variables

##### Backend `.env`:

```env
PORT=5000
REDIS_URL=redis://default:<password>@<host>:<port>
QDRANT_URL=http://localhost:6333
JINA_API_KEY=your_jina_api_key
GEMINI_API_KEY=your_makersuite_key  # OR use OPENAI_API_KEY
```

##### Frontend:

```
API_BASE=https://rag-chatbot-server.vercel.app
```

#### 3. Run

```bash
# backend
cd backend
npm install
node index.js

# frontend
cd frontend
npm install
npm run dev
```

---

### Deployment

- Frontend & Backend: Deploy to **Vercel**
- Redis: Use **Redis Cloud** free tier
- Qdrant: Use **Qdrant Cloud** or Docker
