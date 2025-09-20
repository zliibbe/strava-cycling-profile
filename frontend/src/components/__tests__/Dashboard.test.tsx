import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';

// Mock only the API functions that make network calls
const mockFetchAthleteProfile = jest.fn();
jest.mock('../../services/api', () => ({
  ...jest.requireActual('../../services/api'),
  fetchAthleteProfile: (...args: any[]) => mockFetchAthleteProfile(...args)
}));

// Mock LoadingOverlay component
jest.mock('../LoadingOverlay', () => {
  return function MockLoadingOverlay({ isVisible, message }: { isVisible: boolean; message?: string }) {
    return isVisible ? <div data-testid="loading-overlay">{message || 'Loading...'}</div> : null;
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  configurable: true
});

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.fn();
Object.defineProperty(console, 'error', {
  value: mockConsoleError,
  configurable: true
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    mockFetchAthleteProfile.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockConsoleError.mockClear();

    // Set up localStorage mock to return tokens for each test
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'strava_access_token') return 'test_token';
      if (key === 'strava_athlete_id') return '123';
      return null;
    });
  });

  it('renders loading state initially', () => {
    mockFetchAthleteProfile.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Dashboard />);

    expect(screen.getByTestId('loading-overlay')).toBeTruthy();
  });

  it('displays athlete profile after successful load', async () => {
    const mockProfile = {
      athlete: {
        id: 123,
        firstname: 'John',
        lastname: 'Doe',
        city: 'San Francisco',
        state: 'CA',
        profile: 'https://example.com/profile.jpg',
        bio: 'Love cycling!'
      },
      stats: {
        totalRides: 42,
        totalDistance: 123456, // Distance in meters
        totalElevationGain: 3762, // Elevation in meters
        totalMovingTime: 433800 // Time in seconds (120h 30m)
      }
    };

    mockFetchAthleteProfile.mockResolvedValue(mockProfile);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    expect(screen.getByText('San Francisco, CA')).toBeTruthy();
    expect(screen.getByText('Love cycling!')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('handles error state when profile fetch fails', async () => {
    mockFetchAthleteProfile.mockRejectedValue(new Error('Failed to fetch'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load profile/)).toBeTruthy();
      expect(screen.getByText('Failed to fetch')).toBeTruthy();
    });
  });

  it('changes time period when selector is used', async () => {
    const mockProfile = {
      athlete: { id: 123, firstname: 'John', lastname: 'Doe', profile: 'https://example.com/profile.jpg' },
      stats: { totalRides: 10, totalDistance: 16093, totalElevationGain: 305, totalMovingTime: 36000 }
    };

    mockFetchAthleteProfile.mockResolvedValue(mockProfile);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    const periodSelector = screen.getByRole('combobox');
    fireEvent.change(periodSelector, { target: { value: '7' } });

    await waitFor(() => {
      expect(mockFetchAthleteProfile).toHaveBeenCalledWith('test_token', '7');
    });
  });

  it('displays all required profile sections', async () => {
    const mockProfile = {
      athlete: {
        id: 123,
        firstname: 'John',
        lastname: 'Doe',
        city: 'San Francisco',
        state: 'CA',
        profile: 'https://example.com/profile.jpg',
        bio: 'Love cycling!'
      },
      stats: {
        totalRides: 42,
        totalDistance: 123456,
        totalElevationGain: 3762,
        totalMovingTime: 433800
      }
    };

    mockFetchAthleteProfile.mockResolvedValue(mockProfile);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    // Check that all stat sections are rendered
    expect(screen.getByText('Total Rides')).toBeTruthy();
    expect(screen.getByText('Total Distance')).toBeTruthy();
    expect(screen.getByText('Elevation Gain')).toBeTruthy();
    expect(screen.getByText('Moving Time')).toBeTruthy();
  });

  it('handles missing athlete bio gracefully', async () => {
    const mockProfile = {
      athlete: {
        id: 123,
        firstname: 'John',
        lastname: 'Doe',
        city: 'San Francisco',
        state: 'CA',
        profile: 'https://example.com/profile.jpg'
        // No bio field
      },
      stats: {
        totalRides: 42,
        totalDistance: 123456,
        totalElevationGain: 3762,
        totalMovingTime: 433800
      }
    };

    mockFetchAthleteProfile.mockResolvedValue(mockProfile);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    // Should not crash and should still display other information
    expect(screen.getByText('San Francisco, CA')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('handles missing location information gracefully', async () => {
    const mockProfile = {
      athlete: {
        id: 123,
        firstname: 'John',
        lastname: 'Doe',
        profile: 'https://example.com/profile.jpg'
        // No city/state
      },
      stats: {
        totalRides: 42,
        totalDistance: 123456,
        totalElevationGain: 3762,
        totalMovingTime: 433800
      }
    };

    mockFetchAthleteProfile.mockResolvedValue(mockProfile);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    // Should display default location message and stats
    expect(screen.getByText('Location not set')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('includes period selector with correct options', async () => {
    const mockProfile = {
      athlete: { id: 123, firstname: 'John', lastname: 'Doe', profile: 'https://example.com/profile.jpg' },
      stats: { totalRides: 10, totalDistance: 16093, totalElevationGain: 305, totalMovingTime: 36000 }
    };

    mockFetchAthleteProfile.mockResolvedValue(mockProfile);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });

    const periodSelector = screen.getByRole('combobox');
    expect(periodSelector).toBeTruthy();

    // Check that it has the expected options
    expect(screen.getByDisplayValue('Last 30 days')).toBeTruthy();
    expect(screen.getByText('Last week')).toBeTruthy();
    expect(screen.getByText('Last 60 days')).toBeTruthy();
  });

  it('handles missing tokens in localStorage', async () => {
    // Override the localStorage mock to return null for tokens
    mockLocalStorage.getItem.mockImplementation(() => null);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load profile/)).toBeTruthy();
      expect(screen.getByText('Missing access token or athlete ID')).toBeTruthy();
    });
  });
});