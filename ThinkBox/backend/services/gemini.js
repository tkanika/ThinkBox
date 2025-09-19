// backend/services/gemini.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai'); // or '@google/generative-ai' per package
const client = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

async function embedText(text) {
  // gemini-embedding-001 is the recommended model
  const resp = await client.models.embedContent({
    model: 'gemini-embedding-001',
    contents: [ text ]
  });
  // resp.embeddings is an array of embedding objects
  return resp?.embeddings?.[0]?.value || resp?.embeddings?.[0] || null;
}

async function chatWithContext(systemPrompt, userQuestion, contextArray = []) {
  // Build a prompt: prepend context then ask question
  const contextText = contextArray.join('\n\n---\n\n');
  const prompt = `${systemPrompt}\n\nContext:\n${contextText}\n\nQuestion:\n${userQuestion}`;

  const res = await client.models.generateContent({
    model: 'gemini-proto' /* substitute with available chat model name in your account */,
    prompt: prompt,
    // Adjust params as per SDK docs
    maxOutputTokens: 512,
  });
  // extract answer - SDK returns a complex object, keep simple:
  return res?.candidates?.[0]?.content || res?.output?.[0]?.content || null;
}

module.exports = { embedText, chatWithContext };
