// backend/services/qdrant.js
const { QdrantClient } = require('@qdrant/js-client-rest');
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL || 'http://localhost:6333' });

const COLLECTION = 'kb_chunks';

async function ensureCollection(dim = 3072) {
  // create collection if not exists
  try {
    const exists = await qdrant.getCollection({ collectionName: COLLECTION }).then(()=>true).catch(()=>false);
    if (!exists) {
      await qdrant.createCollection({
        collectionName: COLLECTION,
        vectorSize: dim,
        distance: 'Cosine'
      });
    }
  } catch (e) {
    console.error('qdrant ensureCollection error', e);
  }
}

async function upsertChunk(id, vector, payload = {}) {
  await ensureCollection(vector.length);
  await qdrant.upsert({
    collectionName: COLLECTION,
    points: [
      { id: id.toString(), vector, payload }
    ]
  });
}

async function searchVector(vector, top = 5) {
  const res = await qdrant.search({
    collectionName: COLLECTION,
    vector,
    limit: top,
  });
  return res;
}

module.exports = { ensureCollection, upsertChunk, searchVector };
