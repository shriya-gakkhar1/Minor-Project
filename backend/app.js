const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const driveRoutes = require('./routes/driveRoutes');
const ingestRoutes = require('./routes/ingestRoutes');
const intelligenceRoutes = require('./routes/intelligenceRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const matchRoutes = require('./routes/matchRoutes');
const mlRoutes = require('./routes/mlRoutes');
const reportRoutes = require('./routes/reportRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((error) => {
      console.warn(`MongoDB connection failed: ${error.message}`);
    });
} else {
  console.log('MongoDB skipped: local demo mode is active.');
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Placify AI API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ml', mlRoutes);

module.exports = app;
