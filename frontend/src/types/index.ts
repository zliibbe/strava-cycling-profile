/**
 * Frontend domain types for Strava Cycling Profile
 *
 * Types match the backend API responses for type safety
 */

/**
 * Athlete profile data from Strava API
 */
export interface Athlete {
  readonly id: number;
  readonly username: string | null;
  readonly firstname: string;
  readonly lastname: string;
  readonly city: string | null;
  readonly state: string | null;
  readonly country: string | null;
  readonly profile: string; // Profile picture URL
  readonly premium: boolean;
}

/**
 * Cycling statistics for time period
 */
export interface AthleteStats {
  readonly totalDistance: number; // meters
  readonly totalRides: number;
  readonly totalElevationGain: number; // meters
  readonly totalMovingTime: number; // seconds
}

/**
 * API response from backend /api/profile endpoint
 */
export interface ProfileResponse {
  readonly athlete: Athlete;
  readonly stats: AthleteStats;
  readonly period: string; // e.g., "Last 30 days"
}

/**
 * OAuth URL parameters for handling callback
 */
export interface OAuthParams {
  readonly access_token?: string;
  readonly athlete_id?: string;
  readonly error?: string;
}

/**
 * Application state for authentication
 */
export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly accessToken: string | null;
  readonly athlete: Athlete | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}