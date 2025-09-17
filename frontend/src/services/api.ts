/**
 * API service for backend communication
 */

import type { ProfileResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001';

/**
 * Initiate Strava OAuth flow
 * Single responsibility: redirect to backend OAuth endpoint
 */
export const initiateStravaAuth = (): void => {
  console.log('🔄 Initiating Strava OAuth flow');
  window.location.href = `${API_BASE_URL}/auth/strava`;
};

/**
 * Fetch athlete profile and stats from backend
 * Single responsibility: get profile data with access token
 */
export const fetchAthleteProfile = async (accessToken: string, period?: string): Promise<ProfileResponse> => {
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

  const profileData = await response.json() as ProfileResponse;
  console.log('✅ Profile data received:', profileData.athlete.firstname);

  return profileData;
};

/**
 * Parse OAuth callback parameters from URL
 * Single responsibility: extract OAuth data from URL
 */
export const parseOAuthParams = (searchParams: URLSearchParams) => {
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
 * Format distance for display (convert meters to readable format for Americans ;))
 */
export const formatDistance = (meters: number): string => {
  const kilometers = meters / 1000;

  if (kilometers >= 1000) {
    return `${(kilometers / 1000).toFixed(1)}k km`;
  }

  return `${kilometers.toFixed(1)} km`;
};

/**
 * Format elevation for display (convert meters to readable formatfor Americans ;))
 */
export const formatElevation = (meters: number): string => {
  return `${Math.round(meters).toLocaleString()} m`;
};

/**
 * Format time duration for display (convert meters to readable format for Americans ;))
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};