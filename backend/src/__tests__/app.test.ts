import request from 'supertest';
import app from '../app.js';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('returns healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        service: 'strava-cycling-profile-backend'
      });
    });
  });

  describe('GET /auth/strava', () => {
    it('redirects to Strava OAuth when environment variables are set', async () => {
      // Set required environment variables
      process.env.STRAVA_CLIENT_ID = 'test_client_id';
      process.env.STRAVA_REDIRECT_URI = 'http://localhost:3001/auth/strava/callback';

      const response = await request(app)
        .get('/auth/strava')
        .expect(302);

      expect(response.headers.location).toContain('https://www.strava.com/oauth/authorize');
      expect(response.headers.location).toContain('client_id=test_client_id');
      expect(response.headers.location).toContain('response_type=code');
      expect(response.headers.location).toContain('scope=read%2Cactivity%3Aread_all');
    });

    it('returns error when environment variables are missing', async () => {
      // Clear environment variables
      delete process.env.STRAVA_CLIENT_ID;
      delete process.env.STRAVA_REDIRECT_URI;

      const response = await request(app)
        .get('/auth/strava')
        .expect(500);

      expect(response.body).toEqual({
        error: 'OAuth configuration missing'
      });
    });
  });

  describe('GET /auth/strava/callback', () => {
    it('returns error when code parameter is missing', async () => {
      const response = await request(app)
        .get('/auth/strava/callback')
        .expect(200);

      expect(response.text).toContain('OAuth Error');
      expect(response.text).toContain('Missing authorization code');
    });

    it('returns error when error parameter is present', async () => {
      const response = await request(app)
        .get('/auth/strava/callback?error=access_denied')
        .expect(200);

      expect(response.text).toContain('OAuth Error');
      expect(response.text).toContain('access_denied');
    });
  });

  describe('GET /api/profile', () => {
    it('returns error when authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Access token required'
      });
    });

    it('returns error when authorization header is malformed', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Invalid authorization header format'
      });
    });
  });

  describe('404 handler', () => {
    it('returns 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Route not found'
      });
    });
  });

  describe('CORS', () => {
    it('includes CORS headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});