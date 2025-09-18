/**
 * API service for backend communication
 */

const API_BASE_URL = 'http://localhost:3001';

/**
 * Initiate Strava OAuth flow in popup window
 * Single responsibility: open OAuth in popup and handle callback
 */
export const initiateStravaAuth = () => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Initiating Strava OAuth flow in popup');

    const popup = window.open(
      `${API_BASE_URL}/auth/strava`,
      'strava-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      reject(new Error('Failed to open popup window. Please allow popups for this site.'));
      return;
    }

    // Poll for popup to close or receive message
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        reject(new Error('OAuth popup was closed by user'));
      }
    }, 1000);

    // Listen for message from popup
    const messageHandler = (event) => {
      // Only accept messages that have the expected OAuth data structure
      if (!event.data || (typeof event.data !== 'object')) return;
      if (!event.data.accessToken && !event.data.error) return;

      clearInterval(checkClosed);
      popup.close();
      window.removeEventListener('message', messageHandler);

      if (event.data.error) {
        reject(new Error(event.data.error));
      } else if (event.data.accessToken && event.data.athleteId) {
        resolve({
          accessToken: event.data.accessToken,
          athleteId: event.data.athleteId
        });
      } else {
        reject(new Error('Invalid OAuth response'));
      }
    };

    window.addEventListener('message', messageHandler);
  });
};

/**
 * Fetch athlete profile and stats from backend
 * Single responsibility: get profile data with access token
 */
export const fetchAthleteProfile = async (accessToken, period) => {
  console.log('🔄 Fetching athlete profile from backend');

  const url = new URL(`${API_BASE_URL}/api/profile`);
  if (period) {
    url.searchParams.set('period', period);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('❌ Failed to fetch profile:', response.status);
    throw new Error(`Failed to fetch profile: ${response.statusText}`);
  }

  const profileData = await response.json();
  console.log('✅ Profile data received:', profileData.athlete.firstname);

  return profileData;
};

/**
 * Parse OAuth callback parameters from URL
 * Single responsibility: extract OAuth data from URL
 */
export const parseOAuthParams = (searchParams) => {
  console.log('🔄 Parsing OAuth callback parameters');

  const accessToken = searchParams.get('access_token');
  const athleteId = searchParams.get('athlete_id');
  const error = searchParams.get('error');

  if (error) {
    console.error('❌ OAuth error:', error);
    throw new Error(`OAuth failed: ${error}`);
  }

  if (!accessToken || !athleteId) {
    console.error('❌ Missing OAuth parameters');
    throw new Error('Missing access token or athlete ID');
  }

  console.log('✅ OAuth parameters parsed successfully');
  return { accessToken, athleteId };
};

/**
 * Format distance for display (convert meters to miles for Americans ;))
 */
export const formatDistance = (meters) => {
  const miles = meters * 0.000621371; // Convert meters to miles

  if (miles >= 1000) {
    return `${(miles / 1000).toFixed(1)}k mi`;
  }

  return `${miles.toFixed(1)} mi`;
};

/**
 * Format elevation for display (convert meters to feet for Americans ;))
 */
export const formatElevation = (meters) => {
  const feet = meters * 3.28084; // Convert meters to feet
  return `${Math.round(feet).toLocaleString()} ft`;
};

/**
 * Format time duration for display (convert meters to readable format for Americans ;))
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};