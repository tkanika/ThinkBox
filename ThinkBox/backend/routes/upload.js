// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const tesseract = require('node-tesseract-ocr');
const { Note, Chunk } = require('../models/Note');
const { chunkText } = require('../utils/chunker');
const { embedText } = require('../services/gemini');
const { upsertChunk } = require('../services/qdrant');

const upload = multer({ dest: 'uploads/' });

router.post('/file', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).send('No file');

    // Basic file handling
    let extractedText = '';
    const ext = file.originalname.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      const data = await fs.readFile(file.path);
      const pdfData = await pdf(data);
      extractedText = pdfData.text;
    } else if (['png','jpg','jpeg','tiff','bmp'].includes(ext)) {
      // OCR
      extractedText = await tesseract.recognize(file.path, { lang: 'eng' });
    } else {
      extractedText = '';
    }

    // create note
    const note = await Note.create({
      title: req.body.title || file.originalname,
      content: extractedText,
      fileUrl: file.path,
      fileType: ext === 'pdf' ? 'pdf' : 'image'
    });

    // chunk and embed
    const chunks = chunkText(extractedText);
    for (let i=0;i<chunks.length;i++){
      const chunkTextStr = chunks[i];
      const chunkDoc = await Chunk.create({
        text: chunkTextStr,
        chunkId: `${note._id}-${i}`,
        noteId: note._id
      });
      const vec = await embedText(chunkTextStr); // returns array of floats
      if (vec) await upsertChunk(chunkDoc._id.toString(), vec, { noteId: note._id.toString(), title: note.title });
    }

    res.json({ note });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'upload failed' });
  }
});

module.exports = router;
