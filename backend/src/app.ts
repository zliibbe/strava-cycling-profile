/**
 * Express application setup
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initiateAuth, handleCallback, getAthleteProfile } from './handlers/authHandlers.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Starting Strava Cycling Profile Backend');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'strava-cycling-profile-backend' });
});

// OAuth routes - lean routing, delegate to handlers
app.get('/auth/strava', initiateAuth);
app.get('/auth/strava/callback', handleCallback);

// API routes - lean routing, delegate to handlers
app.get('/api/profile', getAthleteProfile);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error: 1', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 OAuth start: http://localhost:${PORT}/auth/strava`);
});

export default app;