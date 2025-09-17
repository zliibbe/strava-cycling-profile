/**
 * Domain type for Activity entity based on Strava API v3
 * Endpoint: GET /athlete/activities
 */
export interface Activity {
  readonly resource_state: number;
  readonly athlete: {
    readonly id: number;
    readonly resource_state: number;
  };
  readonly name: string;
  readonly distance: number; // Distance in meters
  readonly moving_time: number; // Moving time in seconds
  readonly elapsed_time: number; // Elapsed time in seconds
  readonly total_elevation_gain: number; // Elevation gain in meters
  readonly type: string; // Activity type (e.g., "Ride", "Run")
  readonly sport_type: string; // Sport type (e.g., "MountainBikeRide", "Road")
  readonly id: number;
  readonly start_date: string; // ISO 8601 date string
  readonly start_date_local: string; // ISO 8601 date string in local timezone
  readonly timezone: string;
  readonly utc_offset: number;
  readonly location_city: string | null;
  readonly location_state: string | null;
  readonly location_country: string | null;
  readonly achievement_count: number;
  readonly kudos_count: number;
  readonly comment_count: number;
  readonly athlete_count: number;
  readonly photo_count: number;
  readonly trainer: boolean;
  readonly commute: boolean;
  readonly manual: boolean;
  readonly private: boolean;
  readonly visibility: string;
  readonly flagged: boolean;
  readonly gear_id: string | null;
  readonly start_latlng: [number, number] | null; // [latitude, longitude]
  readonly end_latlng: [number, number] | null; // [latitude, longitude]
  readonly average_speed: number; // Average speed in meters per second
  readonly max_speed: number; // Max speed in meters per second
  readonly has_heartrate: boolean;
  readonly heartrate_opt_out: boolean;
  readonly display_hide_heartrate_option: boolean;
  readonly elev_high: number | null; // Highest elevation in meters
  readonly elev_low: number | null; // Lowest elevation in meters
  readonly upload_id: number | null;
  readonly upload_id_str: string | null;
  readonly external_id: string | null;
  readonly from_accepted_tag: boolean;
  readonly pr_count: number;
  readonly total_photo_count: number;
  readonly has_kudoed: boolean;
}