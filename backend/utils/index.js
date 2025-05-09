import axios from 'axios';
import { QdrantClient } from '@qdrant/js-client-rest';

const qdrant = new QdrantClient(process.env.QDRANT_URL);

const getEmbeddings = async (text) => {
  const response = await axios.post(
    'https://api.jina.ai/v1/embeddings',
    { input: [text] },
    { headers: { Authorization: `Bearer ${process.env.JINA_API_KEY}` } }
  );
  return response.data.data[0].embedding;
};

const retrieveContext = async (queryEmbedding) => {
  const search = await qdrant.search('news_articles', {
    vectors: queryEmbedding,
    top: 5,
  });
  return search.map((hit) => hit.payload.content);
};

const askGemini = async (prompt) => {
  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' +
      process.env.GEMINI_API_KEY,
    {
      contents: [{ parts: [{ text: prompt }] }],
    }
  );
  return response.data.candidates[0].content.parts[0].text;
};
{
}
export { getEmbeddings, retrieveContext, askGemini };
