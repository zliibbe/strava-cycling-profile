/**
 * Domain type for Athlete entity based on Strava API v3
 * Endpoint: GET /athlete
 */
export interface Athlete {
  readonly id: number;
  readonly username: string | null;
  readonly resource_state: number;
  readonly firstname: string;
  readonly lastname: string;
  readonly city: string | null;
  readonly state: string | null;
  readonly country: string | null;
  readonly sex: 'M' | 'F' | null;
  readonly premium: boolean;
  readonly summit: boolean;
  readonly created_at: string; // ISO 8601 date string
  readonly updated_at: string; // ISO 8601 date string
  readonly badge_type_id: number;
  readonly profile_medium: string; // URL to 62x62 profile picture
  readonly profile: string; // URL to 124x124 profile picture
  readonly friend: string | null;
  readonly follower: string | null;
}

/**
 * Aggregate statistics for an athlete
 * Used for displaying summary data on profile page
 */
export interface AthleteStats {
  readonly totalDistance: number; // Total distance in meters
  readonly totalRides: number;
  readonly totalElevationGain: number; // Total elevation in meters
  readonly totalMovingTime: number; // Total time in seconds
}