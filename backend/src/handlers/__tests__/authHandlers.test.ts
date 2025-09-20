import request from 'supertest';
import express from 'express';
import { handleCallback, getAthleteProfile } from '../authHandlers.js';

// Create a test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/auth/strava/callback', handleCallback);
  app.get('/api/profile', getAthleteProfile);
  return app;
};

// Mock fetch for testing
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('Auth Handlers', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    mockFetch.mockClear();
  });

  describe('handleCallback', () => {
    it('successfully processes OAuth callback with valid code', async () => {
      // Set environment variables
      process.env.STRAVA_CLIENT_ID = 'test_client_id';
      process.env.STRAVA_CLIENT_SECRET = 'test_secret';

      // Setup fetch responses
      const mockTokenResponse = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        athlete: { id: 123, username: 'testuser' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse
      } as Response);

      const response = await request(app)
        .get('/auth/strava/callback?code=test_auth_code')
        .expect(200);

      expect(response.text).toContain('OAuth Success');
      expect(response.text).toContain('test_access_token');
      expect(response.text).toContain('123');
    });

    it('handles OAuth callback error', async () => {
      const response = await request(app)
        .get('/auth/strava/callback?error=access_denied')
        .expect(200);

      expect(response.text).toContain('OAuth Error');
      expect(response.text).toContain('access_denied');
    });

    it('handles missing environment variables', async () => {
      // Clear environment variables
      delete process.env.STRAVA_CLIENT_ID;
      delete process.env.STRAVA_CLIENT_SECRET;

      const response = await request(app)
        .get('/auth/strava/callback?code=test_code')
        .expect(200);

      expect(response.text).toContain('OAuth Error');
      expect(response.text).toContain('Authentication failed');
    });

    it('handles token exchange failure', async () => {
      process.env.STRAVA_CLIENT_ID = 'test_client_id';
      process.env.STRAVA_CLIENT_SECRET = 'test_secret';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response);

      const response = await request(app)
        .get('/auth/strava/callback?code=invalid_code')
        .expect(200);

      expect(response.text).toContain('OAuth Error');
      expect(response.text).toContain('Authentication failed');
    });
  });

  describe('getAthleteProfile', () => {
    it('successfully returns profile data with valid token', async () => {
      const mockAthlete = {
        id: 123,
        firstname: 'John',
        lastname: 'Doe'
      };

      const mockActivities = [
        {
          id: 1,
          type: 'Ride',
          sport_type: 'RoadBike',
          start_date: new Date().toISOString(),
          distance: 10000,
          total_elevation_gain: 100,
          moving_time: 1800,
          name: 'Morning Ride',
          elapsed_time: 1800,
          resource_state: 2,
          athlete: { id: 123, resource_state: 1 },
          start_date_local: new Date().toISOString(),
          timezone: 'UTC',
          utc_offset: 0,
          location_city: null,
          location_state: null,
          location_country: null,
          achievement_count: 0,
          kudos_count: 0,
          comment_count: 0,
          athlete_count: 1,
          photo_count: 0,
          trainer: false,
          commute: false,
          manual: false,
          private: false,
          visibility: 'everyone',
          flagged: false,
          gear_id: null,
          start_latlng: null,
          end_latlng: null,
          average_speed: 5.5,
          max_speed: 15.0,
          has_heartrate: false,
          heartrate_opt_out: false,
          display_hide_heartrate_option: false,
          elev_high: null,
          elev_low: null,
          upload_id: null,
          upload_id_str: null,
          external_id: null,
          from_accepted_tag: false,
          pr_count: 0,
          total_photo_count: 0,
          has_kudoed: false
        }
      ];

      // Setup fetch responses for both athlete and activities
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAthlete
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockActivities
        } as Response);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer test_access_token')
        .expect(200);

      expect(response.body.athlete).toEqual(mockAthlete);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalRides).toBe(1);
    });

    it('handles different time periods', async () => {
      const mockAthlete = { id: 123, firstname: 'John' };
      const mockActivities = [];

      mockFetch
        .mockResolvedValue({
          ok: true,
          json: async () => mockActivities
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAthlete
        } as Response);

      const response = await request(app)
        .get('/api/profile?period=7')
        .set('Authorization', 'Bearer test_token')
        .expect(200);

      expect(response.body.athlete).toEqual(mockAthlete);
      expect(response.body.stats.totalRides).toBe(0);
    });

    it('handles athlete fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch profile data');
    });

    it('handles activities fetch failure gracefully', async () => {
      const mockAthlete = { id: 123, firstname: 'John' };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAthlete
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          statusText: 'Forbidden'
        } as Response);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer test_token')
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch profile data');
    });
  });
});