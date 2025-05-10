// deleteQdrant.js
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config();

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL });

async function deleteCollection() {
  try {
    await qdrant.deleteCollection('news_articles');
    console.log('🗑️ Collection "news_articles" deleted');
  } catch (err) {
    console.error('❌ Failed to delete:', err.response?.data || err.message);
  }
}

deleteCollection();
