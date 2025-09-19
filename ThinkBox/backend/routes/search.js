// backend/routes/search.js
const express = require('express');
const router = express.Router();
const { searchVector } = require('../services/qdrant');
const { embedText, chatWithContext } = require('../services/gemini');
const { Chunk, Note } = require('../models/Note');

router.post('/semantic', async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;
    const qvec = await embedText(query);
    const results = await searchVector(qvec, topK);
    // results array contains { id, payload, score } - fetch chunk text from Mongo
    const hits = [];
    for (const r of results) {
      const chunk = await Chunk.findById(r.id).lean();
      const note = await Note.findById(chunk.noteId).lean();
      hits.push({ score: r.score, text: chunk.text, noteTitle: note?.title, noteId: note?._id });
    }
    res.json({ hits });
  } catch (e) {
    console.error(e);
    res.status(500).send('search failed');
  }
});

router.post('/qa', async (req, res) => {
  try {
    const { question, topK = 5 } = req.body;
    const qvec = await embedText(question);
    const results = await searchVector(qvec, topK);
    const contexts = [];
    for (const r of results) {
      const chunk = await Chunk.findById(r.id).lean();
      contexts.push(chunk.text);
    }
    const answer = await chatWithContext(
      'You are an assistant that answers questions using the provided context. If not found, say you don\'t know.',
      question,
      contexts
    );
    res.json({ answer, contexts });
  } catch (e) {
    console.error(e);
    res.status(500).send('qa failed');
  }
});

module.exports = router;
