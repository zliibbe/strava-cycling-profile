import { exchangeCodeForToken, fetchAthlete, fetchActivities } from '../stravaApi.js';

// Mock fetch for testing
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('Strava API', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('exchangeCodeForToken', () => {
    it('successfully exchanges code for token', async () => {
      const mockTokenResponse = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
        athlete: { id: 123, username: 'testuser' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse
      } as Response);

      const result = await exchangeCodeForToken('test_code', 'test_client_id', 'test_secret');

      expect(fetch).toHaveBeenCalledWith('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'test_client_id',
          client_secret: 'test_secret',
          code: 'test_code',
          grant_type: 'authorization_code'
        })
      });

      expect(result).toEqual(mockTokenResponse);
    });

    it('throws error when token exchange fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as Response);

      await expect(exchangeCodeForToken('invalid_code', 'client_id', 'secret'))
        .rejects.toThrow('Token exchange failed: Bad Request');
    });
  });

  describe('fetchAthlete', () => {
    it('successfully fetches athlete profile', async () => {
      const mockAthlete = {
        id: 123,
        firstname: 'John',
        lastname: 'Doe',
        profile: 'https://example.com/profile.jpg'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAthlete
      } as Response);

      const result = await fetchAthlete('test_access_token');

      expect(fetch).toHaveBeenCalledWith('https://www.strava.com/api/v3/athlete', {
        headers: {
          'Authorization': 'Bearer test_access_token'
        }
      });

      expect(result).toEqual(mockAthlete);
    });

    it('throws error when athlete fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response);

      await expect(fetchAthlete('invalid_token'))
        .rejects.toThrow('Failed to fetch athlete: Unauthorized');
    });
  });

  describe('fetchActivities', () => {
    it('successfully fetches activities without date filters', async () => {
      const mockActivities = [
        { id: 1, name: 'Morning Ride', type: 'Ride' },
        { id: 2, name: 'Evening Run', type: 'Run' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivities
      } as Response);

      const result = await fetchActivities('test_access_token');

      expect(fetch).toHaveBeenCalledWith('https://www.strava.com/api/v3/athlete/activities?per_page=30', {
        headers: {
          'Authorization': 'Bearer test_access_token'
        }
      });

      expect(result).toEqual(mockActivities);
    });

    it('includes date filters in URL when provided', async () => {
      const mockActivities = [{ id: 1, name: 'Test Activity' }];
      const after = new Date('2024-01-01');
      const before = new Date('2024-01-31');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivities
      } as Response);

      await fetchActivities('test_token', after, before, 50);

      const expectedUrl = new URL('https://www.strava.com/api/v3/athlete/activities');
      expectedUrl.searchParams.set('per_page', '50');
      expectedUrl.searchParams.set('after', Math.floor(after.getTime() / 1000).toString());
      expectedUrl.searchParams.set('before', Math.floor(before.getTime() / 1000).toString());

      expect(fetch).toHaveBeenCalledWith(expectedUrl.toString(), {
        headers: {
          'Authorization': 'Bearer test_token'
        }
      });
    });

    it('throws error when activities fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      } as Response);

      await expect(fetchActivities('invalid_token'))
        .rejects.toThrow('Failed to fetch activities: Forbidden');
    });
  });
});