/**
 * Lean request handlers for authentication
 * Handlers only route requests and delegate to services
 */

import express from 'express';
import { exchangeCodeForToken, fetchAthlete, fetchActivities } from '../services/stravaApi.js';
import { getLast30DaysStats } from '../services/statsAggregator.js';

type Request = express.Request;
type Response = express.Response;

/**
 * Generate Strava OAuth authorization URL
 * Lean handler: just build URL and redirect
 */
export const initiateAuth = (req: Request, res: Response): void => {
  console.log('🔄 Initiating Strava OAuth flow');

  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('❌ Missing OAuth configuration');
    res.status(500).json({ error: 'OAuth configuration missing' });
    return;
  }

  // Following Commandment #6: Prefer logs to comments
  const authUrl = new URL('https://www.strava.com/oauth/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('approval_prompt', 'force');
  authUrl.searchParams.set('scope', 'read,activity:read_all');

  console.log('✅ Redirecting to Strava authorization');
  res.redirect(authUrl.toString());
};

/**
 * Handle OAuth callback from Strava
 * Lean handler: delegate token exchange to service layer
 */
export const handleCallback = async (req: Request, res: Response): Promise<void> => {
  console.log('🔄 Handling OAuth callback');

  const { code, error } = req.query;

  if (error || !code) {
    console.error('❌ OAuth callback error:', error);
    res.status(400).json({ error: 'Authorization failed' });
    return;
  }

  try {
    const clientId = process.env.STRAVA_CLIENT_ID!;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET!;

    // Delegate to service function - following Commandment #5
    const tokenData = await exchangeCodeForToken(code as string, clientId, clientSecret);

    // In a real app, you'd store the token securely
    // For this demo, we'll redirect to frontend with token info
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/dashboard?access_token=${tokenData.access_token}&athlete_id=${tokenData.athlete.id}`;

    console.log('✅ OAuth successful, redirecting to frontend');
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ Token exchange failed:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Get athlete profile and stats
 * Lean handler: delegate to service functions
 */
export const getAthleteProfile = async (req: Request, res: Response): Promise<void> => {
  console.log('🔄 Getting athlete profile');

  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.replace('Bearer ', '');

  if (!accessToken) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    // Delegate to service functions - following Commandment #5
    const [athlete, activities] = await Promise.all([
      fetchAthlete(accessToken),
      fetchActivities(accessToken, undefined, undefined, 100) // Get more activities for better stats
    ]);

    // Delegate stats calculation to service
    const stats = getLast30DaysStats(activities);

    console.log('✅ Profile data assembled');
    res.json({
      athlete,
      stats,
      period: 'Last 30 days'
    });

  } catch (error) {
    console.error('❌ Failed to get profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
};