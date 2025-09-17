/**
 * Domain types for OAuth authentication based on Strava API v3
 * Endpoint: POST /oauth/token
 */

/**
 * OAuth token response from Strava token exchange
 * Returned when exchanging authorization code for access token
 */
export interface AuthToken {
  readonly token_type: 'Bearer';
  readonly expires_at: number; // Unix timestamp when access token expires
  readonly expires_in: number; // Seconds until access token expires
  readonly refresh_token: string; // Used to obtain new access tokens
  readonly access_token: string; // Used for API requests
  readonly athlete: {
    readonly id: number;
    readonly username: string | null;
    readonly resource_state: number;
    readonly firstname: string;
    readonly lastname: string;
    readonly bio: string | null;
    readonly city: string | null;
    readonly state: string | null;
    readonly country: string | null;
    readonly sex: 'M' | 'F' | null;
    readonly premium: boolean;
    readonly summit: boolean;
    readonly created_at: string;
    readonly updated_at: string;
    readonly badge_type_id: number;
    readonly weight: number | null;
    readonly profile_medium: string;
    readonly profile: string;
  };
}

/**
 * OAuth authorization request parameters
 * Used when redirecting user to Strava authorization page
 */
export interface AuthorizationParams {
  readonly client_id: string;
  readonly response_type: 'code';
  readonly redirect_uri: string;
  readonly approval_prompt: 'force' | 'auto';
  readonly scope: string; // e.g., "read,activity:read_all"
  readonly state?: string; // Optional state parameter for security
}

/**
 * Token exchange request payload
 * Used when exchanging authorization code for access token
 */
export interface TokenExchangeRequest {
  readonly client_id: string;
  readonly client_secret: string;
  readonly code: string;
  readonly grant_type: 'authorization_code';
}