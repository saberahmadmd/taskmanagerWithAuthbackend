// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Your MongoDB connection function
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app and server
const app = express();
const server = http.createServer(app);

// Setup allowed frontend origins for CORS
const allowedOrigins = [
  'https://taskmanager-with-auth-frontend.vercel.app',
  'https://taskmanager-with-auth-frontend-md-saber-ahmads-projects.vercel.app'
];

// Apply CORS middleware for HTTP routes
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Body parser middleware
app.use(express.json());

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Default root route
app.get('/', (req, res) => {
  res.send('Task Manager API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Export io instance for other modules (e.g., for emitting task updates)
export { io };
