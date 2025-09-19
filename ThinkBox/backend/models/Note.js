// backend/models/Note.js
const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  text: String,
  chunkId: String,    // unique id for chunk
  noteId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

const NoteSchema = new mongoose.Schema({
  title: String,
  content: String,       // full text (extracted + manual)
  fileUrl: String,       // optional: local path or cloud URL
  fileType: String,      // 'pdf', 'image', 'link', 'text'
  metadata: Object,      // e.g., {urlTitle, description}
  createdAt: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', NoteSchema);
const Chunk = mongoose.model('Chunk', ChunkSchema);
module.exports = { Note, Chunk };
