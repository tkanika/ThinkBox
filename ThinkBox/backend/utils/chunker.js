// backend/utils/chunker.js
function chunkText(text, maxTokens = 800) {
  // simple splitter: split by paragraphs then by length
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let buffer = '';
  for (const p of paragraphs) {
    if ((buffer + '\n' + p).length > maxTokens) {
      chunks.push(buffer.trim());
      buffer = p;
    } else {
      buffer = buffer ? buffer + '\n' + p : p;
    }
  }
  if (buffer) chunks.push(buffer.trim());
  return chunks;
}
module.exports = { chunkText };
