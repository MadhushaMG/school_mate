import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { ENV } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import vehicleRoutes from './modules/vehicles/vehicle.routes';
import childRoutes from './modules/children/child.routes';
import marketplaceRoutes from './modules/marketplace/marketplace.routes';
import tripRoutes from './modules/trips/trip.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import path from 'path';
import { setupTrackingSocket } from './sockets/tracking.socket';

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ENV.CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Middlewares
app.use(cors({ origin: ENV.CLIENT_ORIGIN }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Setup Socket.io events
setupTrackingSocket(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SchoolMate API', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/children', childRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/notifications', notificationRoutes);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Start Server
httpServer.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 SchoolMate Server running on port ${ENV.PORT}`);
  console.log(`📡 WebSocket Gateway ready for live tracking`);
  console.log(`🌍 Local:   http://localhost:${ENV.PORT}`);
  console.log(`📱 Network: http://192.168.1.21:${ENV.PORT}`);
  console.log(`=========================================`);
});
