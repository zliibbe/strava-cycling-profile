import { formatDistance, formatElevation, formatDuration, parseOAuthParams, initiateStravaAuth, fetchAthleteProfile } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Utility Functions', () => {
  describe('formatDistance', () => {
    it('converts meters to miles with one decimal place', () => {
      expect(formatDistance(1609.34)).toBe('1.0 mi'); // 1 mile
      expect(formatDistance(8046.7)).toBe('5.0 mi'); // 5 miles
    });

    it('formats distances over 1000 miles with k suffix', () => {
      expect(formatDistance(1609600000)).toBe('1000.2k mi'); // ~1000000 miles
      expect(formatDistance(1609600)).toBe('1.0k mi'); // ~1000 miles
      expect(formatDistance(8048000)).toBe('5.0k mi'); // ~5000 miles
    });

    it('handles zero distance', () => {
      expect(formatDistance(0)).toBe('0.0 mi');
    });

    it('handles small distances', () => {
      expect(formatDistance(161)).toBe('0.1 mi');
    });

    it('handles large distances', () => {
      expect(formatDistance(16093400)).toBe('10.0k mi');
    });
  });

  describe('formatElevation', () => {
    it('converts meters to feet and rounds to nearest integer', () => {
      expect(formatElevation(100)).toBe('328 ft'); // 100m = ~328ft
      expect(formatElevation(304.8)).toBe('1,000 ft'); // 304.8m = 1000ft
    });

    it('includes comma separators for large numbers', () => {
      expect(formatElevation(3048)).toBe('10,000 ft');
      expect(formatElevation(1524)).toBe('5,000 ft');
    });

    it('handles zero elevation', () => {
      expect(formatElevation(0)).toBe('0 ft');
    });

    it('handles small elevations', () => {
      expect(formatElevation(1)).toBe('3 ft');
    });
  });

  describe('formatDuration', () => {
    it('formats durations with hours and minutes', () => {
      expect(formatDuration(3661)).toBe('1h 1m'); // 1 hour 1 minute 1 second
      expect(formatDuration(7200)).toBe('2h 0m'); // 2 hours
      expect(formatDuration(3900)).toBe('1h 5m'); // 1 hour 5 minutes
    });

    it('formats durations under an hour as minutes only', () => {
      expect(formatDuration(1800)).toBe('30m'); // 30 minutes
      expect(formatDuration(60)).toBe('1m'); // 1 minute
      expect(formatDuration(3599)).toBe('59m'); // 59 minutes 59 seconds
    });

    it('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    it('rounds down partial minutes', () => {
      expect(formatDuration(119)).toBe('1m'); // 1 minute 59 seconds
      expect(formatDuration(59)).toBe('0m'); // 59 seconds
    });

    it('handles large durations', () => {
      expect(formatDuration(36000)).toBe('10h 0m'); // 10 hours
      expect(formatDuration(90061)).toBe('25h 1m'); // 25 hours 1 minute 1 second
    });
  });

  describe('parseOAuthParams', () => {
    it('extracts access token and athlete ID from valid params', () => {
      const searchParams = new URLSearchParams('access_token=abc123&athlete_id=456789');

      const result = parseOAuthParams(searchParams);

      expect(result.accessToken).toBe('abc123');
      expect(result.athleteId).toBe('456789');
    });

    it('throws error when access token is missing', () => {
      const searchParams = new URLSearchParams('athlete_id=456789');

      expect(() => parseOAuthParams(searchParams)).toThrow('Missing access token or athlete ID');
    });

    it('throws error when athlete ID is missing', () => {
      const searchParams = new URLSearchParams('access_token=abc123');

      expect(() => parseOAuthParams(searchParams)).toThrow('Missing access token or athlete ID');
    });

    it('throws error when OAuth error is present', () => {
      const searchParams = new URLSearchParams('error=access_denied');

      expect(() => parseOAuthParams(searchParams)).toThrow('OAuth failed: access_denied');
    });

    it('throws error when both params are missing', () => {
      const searchParams = new URLSearchParams('');

      expect(() => parseOAuthParams(searchParams)).toThrow('Missing access token or athlete ID');
    });

    it('handles URL encoded values', () => {
      const searchParams = new URLSearchParams('access_token=abc%20123&athlete_id=456789');

      const result = parseOAuthParams(searchParams);

      expect(result.accessToken).toBe('abc 123');
      expect(result.athleteId).toBe('456789');
    });
  });

  describe('initiateStravaAuth', () => {
    let mockWindowOpen: jest.Mock;
    let mockAddEventListener: jest.Mock;
    let mockRemoveEventListener: jest.Mock;

    beforeEach(() => {
      // Mock window methods
      mockWindowOpen = jest.fn();
      mockAddEventListener = jest.fn();
      mockRemoveEventListener = jest.fn();

      Object.defineProperty(window, 'open', { value: mockWindowOpen });
      Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener });
      Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener });
    });

    it('opens popup window with correct URL', () => {
      const mockPopup = { close: jest.fn(), closed: false };
      mockWindowOpen.mockReturnValue(mockPopup);

      initiateStravaAuth();

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'http://localhost:3001/auth/strava',
        'strava-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );
    });

    it('rejects when popup fails to open', async () => {
      mockWindowOpen.mockReturnValue(null);

      await expect(initiateStravaAuth()).rejects.toThrow(
        'Failed to open popup window. Please allow popups for this site.'
      );
    });

    it('sets up message listener for popup communication', () => {
      const mockPopup = { close: jest.fn(), closed: false };
      mockWindowOpen.mockReturnValue(mockPopup);

      initiateStravaAuth();

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'message',
        expect.any(Function)
      );
    });
  });

  describe('fetchAthleteProfile', () => {
    beforeEach(() => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
    });

    it('fetches profile with access token', async () => {
      const mockProfileData = {
        athlete: { id: 123, firstname: 'John' },
        stats: { totalRides: 10 }
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData
      } as Response);

      const result = await fetchAthleteProfile('test_token');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/profile',
        {
          headers: {
            'Authorization': 'Bearer test_token',
            'Content-Type': 'application/json'
          }
        }
      );

      expect(result).toEqual(mockProfileData);
    });

    it('includes period parameter when provided', async () => {
      const mockProfileData = { athlete: {}, stats: {} };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => mockProfileData
      } as Response);

      await fetchAthleteProfile('test_token', '7');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/profile?period=7',
        {
          headers: {
            'Authorization': 'Bearer test_token',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('throws error when fetch fails', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response);

      await expect(fetchAthleteProfile('invalid_token')).rejects.toThrow(
        'Failed to fetch profile: Unauthorized'
      );
    });
  });
});