const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const feedRoutes = require('./routes/feedRoutes');
const redis = require('./config/redis');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('io', io);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/syncup')
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Database: syncup');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.emit('welcome', { message: 'Connected to SyncUp server!' });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

app.use('/api', feedRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'SyncUp API is running!',
    endpoints: {
      getFeeds: 'GET /api/feed/getfeeds',
      createFeed: 'POST /api/feed/createfeed'
    },
    status: {
      mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      redis: redis.status === 'ready' ? 'Connected' : 'Disconnected'
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket ready for connections`);
  console.log(`API endpoints:`);
  console.log(`GET  http://localhost:${PORT}/api/feed/getfeeds`);
  console.log(`POST http://localhost:${PORT}/api/feed/createfeed`);
});
