const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');
const app = express();
const placementRoutes = require('./routes/placementRoutes');

console.log("TYPE OF placementRoutes:", typeof placementRoutes);
console.log("VALUE:", placementRoutes);

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', placementRoutes);

mongoose.connect("mongodb+srv://tryannosaurusrex00_db_user:Y9uuECXvnjC6uweD@cluster0.prpqpme.mongodb.net/?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;