/**
 * Strava API service functions
 */

import type { AuthToken, TokenExchangeRequest, Athlete, Activity } from '../types/index.js';

const STRAVA_BASE_URL = 'https://www.strava.com/api/v3';
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth';

/**
 * Exchange authorization code for access token
 */
const exchangeCodeForToken = async (
  authCode: string,
  clientId: string,
  clientSecret: string
): Promise<AuthToken> => {
  console.log('🔄 Exchanging authorization code for access token');

  const tokenRequest: TokenExchangeRequest = {
    client_id: clientId,
    client_secret: clientSecret,
    code: authCode,
    grant_type: 'authorization_code'
  };

  const response = await fetch(`${STRAVA_AUTH_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tokenRequest)
  });

  if (!response.ok) {
    console.error('❌ Token exchange failed:', response.status, response.statusText);
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  const tokenData = await response.json() as AuthToken;
  console.log('✅ Token exchange successful for athlete:', tokenData.athlete.id);

  return tokenData;
};

/**
 * Fetch authenticated athlete profile
 */
const fetchAthlete = async (accessToken: string): Promise<Athlete> => {
  console.log('🔄 Fetching athlete profile');

  const response = await fetch(`${STRAVA_BASE_URL}/athlete`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    console.error('❌ Failed to fetch athlete:', response.status);
    throw new Error(`Failed to fetch athlete: ${response.statusText}`);
  }

  const athlete = await response.json() as Athlete;
  console.log('✅ Athlete profile fetched:', athlete.firstname, athlete.lastname);

  return athlete;
};

/**
 * Fetch athlete activities with optional date filtering
 * Single responsibility: just fetch activities
 */
const fetchActivities = async (
  accessToken: string,
  after?: Date,
  before?: Date,
  perPage: number = 30
): Promise<Activity[]> => {
  console.log('🔄 Fetching athlete activities');

  const url = new URL(`${STRAVA_BASE_URL}/athlete/activities`);
  url.searchParams.set('per_page', perPage.toString());

  if (after) {
    url.searchParams.set('after', Math.floor(after.getTime() / 1000).toString());
  }

  if (before) {
    url.searchParams.set('before', Math.floor(before.getTime() / 1000).toString());
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    console.error('❌ Failed to fetch activities:', response.status);
    throw new Error(`Failed to fetch activities: ${response.statusText}`);
  }

  const activities = await response.json() as Activity[];
  console.log(`✅ Fetched ${activities.length} activities`);

  return activities;
};

export {
  exchangeCodeForToken,
  fetchAthlete,
  fetchActivities
};