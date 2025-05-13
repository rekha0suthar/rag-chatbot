import axios from 'axios';
import dotenv from 'dotenv';
import { QdrantClient } from '@qdrant/js-client-rest';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const JINA_API_KEY = process.env.JINA_API_KEY;

const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
  config: { checkCompatibility: false },
});

async function fetchNewsArticles() {
  try {
    const res = await axios.get(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=50&apiKey=${NEWS_API_KEY}`
    );

    return res.data.articles.map((article, index) => ({
      id: index,
      title: article.title,
      content: article.content || article.description || '',
      url: article.url,
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error(
      'Failed to fetch news:',
      error.response?.data || error.message
    );
    return [];
  }
}

async function getEmbedding(text) {
  try {
    const res = await axios.post(
      'https://api.jina.ai/v1/embeddings',
      {
        input: [text],
        model: 'jina-embeddings-v2-base-en',
      },
      {
        headers: {
          Authorization: `Bearer ${JINA_API_KEY}`,
        },
      }
    );
    return res.data.data[0].embedding;
  } catch (error) {
    console.error('Embedding error:', error.response?.data || error.message);
    return null;
  }
}

export async function ingestNewsArticles() {
  const articles = await fetchNewsArticles();
  if (!articles.length) return;

  const existingCollections = await qdrant.getCollections();
  const alreadyExists = existingCollections.collections.some(
    (col) => col.name === 'news_articles'
  );

  if (!alreadyExists) {
    await qdrant.createCollection('news_articles', {
      vectors: {
        size: 768,
        distance: 'Cosine',
      },
    });
    console.log('✅ Collection created: news_articles');
  } else {
    console.log('ℹ️ Collection already exists: news_articles');
  }

  const points = [];

  for (const article of articles) {
    const inputText = `${article.title}. ${article.content}`;
    const embedding = await getEmbedding(inputText);
    if (!embedding) continue;

    points.push({
      id: article.id,
      vector: embedding,
      payload: {
        title: article.title,
        url: article.url,
        content: article.content,
        publishedAt: article.publishedAt,
      },
    });
  }

  if (points.length > 0) {
    await qdrant.upsert('news_articles', { points });
    console.log(`✅ Stored ${points.length} articles to Qdrant.`);
  } else {
    console.warn('⚠️ No articles were stored.');
  }
}

// Optional direct runner for local use
if (import.meta.url === `file://${process.argv[1]}`) {
  ingestNewsArticles();
}
