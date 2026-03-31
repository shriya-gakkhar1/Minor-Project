const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/placement");

app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Placement Dashboard API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

module.exports = app;