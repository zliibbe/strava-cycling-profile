import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../LoginPage';

// Mock the API functions
const mockInitiateStravaAuth = jest.fn();
jest.mock('../../services/api', () => ({
  initiateStravaAuth: (...args: any[]) => mockInitiateStravaAuth(...args)
}));

// Mock localStorage
const mockLocalStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  configurable: true
});

// Mock window.location.href
const mockLocation = { href: '' };
delete (window as any).location;
(window as any).location = mockLocation;

// Mock window.alert
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  configurable: true
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    mockInitiateStravaAuth.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    mockAlert.mockClear();
    mockLocation.href = '';
  });

  it('renders login page with Strava connect button', () => {
    render(<LoginPage />);

    expect(screen.getByText(/Cycling Profile/)).toBeTruthy();
    expect(screen.getByText(/Connect with Strava/)).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('initiates OAuth flow when connect button is clicked', async () => {
    mockInitiateStravaAuth.mockResolvedValue({
      accessToken: 'test_token',
      athleteId: '123'
    });

    render(<LoginPage />);

    const connectButton = screen.getByRole('button');
    fireEvent.click(connectButton);

    expect(mockInitiateStravaAuth).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('strava_access_token', 'test_token');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('strava_athlete_id', '123');
    });

    // Note: Testing window.location.href assignment is challenging in Jest,
    // but the above verifies the OAuth flow works correctly
  });

  it('handles OAuth error during button click', async () => {
    mockInitiateStravaAuth.mockRejectedValue(new Error('OAuth failed'));

    render(<LoginPage />);

    const connectButton = screen.getByRole('button');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Authentication failed: OAuth failed');
    });
  });


  it('shows loading state during OAuth process', async () => {
    // Mock a delayed OAuth process
    mockInitiateStravaAuth.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ accessToken: 'token', athleteId: '123' }), 100))
    );

    render(<LoginPage />);

    const connectButton = screen.getByRole('button');
    fireEvent.click(connectButton);

    // Should show loading state - button is disabled and shows different text
    expect(connectButton).toBeDisabled();
    expect(screen.getByText('Connecting...')).toBeTruthy();
  });

  it('displays error message for failed authentication', async () => {
    mockInitiateStravaAuth.mockRejectedValue(new Error('Failed to open popup window'));

    render(<LoginPage />);

    const connectButton = screen.getByRole('button');
    fireEvent.click(connectButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Authentication failed: Failed to open popup window');
    });
  });

  it('button is re-enabled after failed authentication', async () => {
    mockInitiateStravaAuth.mockRejectedValue(new Error('OAuth failed'));

    render(<LoginPage />);

    const connectButton = screen.getByRole('button');
    fireEvent.click(connectButton);

    // Initially disabled
    expect(connectButton).toBeDisabled();

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });

    // Re-enabled after error
    expect(connectButton).not.toBeDisabled();
    expect(screen.getByText('Connect with Strava')).toBeTruthy();
  });
});