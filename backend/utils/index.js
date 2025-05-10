import { QdrantClient } from '@qdrant/js-client-rest';
import axios from 'axios';

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });

export async function getEmbedding(text) {
  const response = await axios.post(
    'https://api.jina.ai/v1/embeddings',
    {
      input: [text],
      model: 'jina-embeddings-v2-base-en',
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
      },
    }
  );
  return response.data.data[0].embedding;
}

// RAG context retrieval
export async function getRelevantContext(queryText) {
  const queryEmbedding = await getEmbedding(queryText);
  const result = await qdrant.search('news_articles', {
    vector: queryEmbedding,
    top: 5,
  });
  return result.map((r) => r.payload.content).join('\n');
}
