import axios from 'axios';
import dotenv from 'dotenv';
import { QdrantClient } from '@qdrant/js-client-rest';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const QDRANT_URL = process.env.QDRANT_URL;

const qdrant = new QdrantClient({ url: QDRANT_URL });

await qdrant.createCollection('news_articles', {
  vectors: {
    size: 768, // Or 384, depending on your embedding model size
    distance: 'Cosine', // or 'Dot' or 'Euclid'
  },
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
        model: 'jina-embeddings-v2-base-en', // ✅ required
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        },
      }
    );
    return res.data.data[0].embedding;
  } catch (error) {
    console.error('Embedding error:', error.response?.data || error.message);
    return null;
  }
}

async function storeArticles(articles) {
  const existingCollections = await qdrant.getCollections();
  const alreadyExists = existingCollections.collections.some(
    (col) => col.name === 'news_articles'
  );

  if (!alreadyExists) {
    await qdrant.createCollection('news_articles', {
      vectors: {
        size: 768, // or 384 if you're using a small model
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

(async () => {
  const articles = await fetchNewsArticles();
  console.log(articles);
  await storeArticles(articles);
})();
