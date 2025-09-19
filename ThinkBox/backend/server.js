// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const uploadRoutes = require('./routes/upload');
const searchRoutes = require('./routes/search');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/upload', uploadRoutes);
app.use('/api', searchRoutes);

// connect to Mongo
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kb_ai', {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(()=>console.log('mongo connected')).catch(e=>console.error(e));

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log('server listening', port));
