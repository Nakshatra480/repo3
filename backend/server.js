const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Fallback to in-memory MongoDB if real URI is not provided
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB Atlas');
    } else {
      console.log('No MONGODB_URI found, using in-memory database fallback');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('Connected to In-Memory MongoDB');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/evaluations', require('./routes/evaluation'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
