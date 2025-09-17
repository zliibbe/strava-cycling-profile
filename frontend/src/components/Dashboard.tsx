/**
 * Dashboard component for displaying cycling stats
 * Following Commandment #4: Keep logic out of views
 *
 * Component only handles presentation - data fetching is in parent
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchAthleteProfile, parseOAuthParams, formatDistance, formatElevation, formatDuration } from '../services/api';
import type { ProfileResponse } from '../types';
import LoadingOverlay from './LoadingOverlay';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parse OAuth parameters from URL
        const { accessToken } = parseOAuthParams(searchParams);

        // Fetch profile data from backend with selected period
        const data = await fetchAthleteProfile(accessToken, selectedPeriod);
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [searchParams, selectedPeriod]);

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(event.target.value);
  };

  // Show loading overlay when loading
  const loadingMessage = selectedPeriod === '7' ? 'Loading last week stats...' :
                         selectedPeriod === '30' ? 'Loading last 30 days stats...' :
                         'Loading last 60 days stats...';

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Unable to load profile</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!profileData && !loading) {
    return (
      <div className={styles.error}>
        <h2>No data available</h2>
        <p>Unable to retrieve your cycling statistics.</p>
      </div>
    );
  }

  const { athlete, stats, period } = profileData || {};

  // Don't render the main content until we have data
  if (loading || !profileData || !athlete || !stats) {
    return <LoadingOverlay isVisible={true} message={loadingMessage} />;
  }

  return (
    <>
      <LoadingOverlay isVisible={loading} message={loadingMessage} />
      <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profileSection}>
          <img
            src={athlete.profile}
            alt={`${athlete.firstname} ${athlete.lastname}`}
            className={styles.avatar}
          />
          <div className={styles.athleteInfo}>
            <h1>{athlete.firstname} {athlete.lastname}</h1>
            <p>
              {athlete.city && athlete.state
                ? `${athlete.city}, ${athlete.state}`
                : athlete.city || athlete.state || 'Location not set'}
              {athlete.premium && ' • Premium'}
            </p>
          </div>
        </div>
        <div className={styles.periodSection}>
          <label htmlFor="period-select" className={styles.periodLabel}>
            Time Period:
          </label>
          <select
            id="period-select"
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className={styles.periodSelect}
          >
            <option value="7">Last week</option>
            <option value="30">Last 30 days</option>
            <option value="60">Last 60 days</option>
          </select>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.distanceIcon}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h2 className={styles.statValue}>{formatDistance(stats.totalDistance)}</h2>
          <p className={styles.statLabel}>Total Distance</p>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.ridesIcon}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 12C5 8.13 8.13 5 12 5S19 8.13 19 12 15.87 19 12 19 5 15.87 5 12M12 7C9.24 7 7 9.24 7 12S9.24 17 12 17 17 14.76 17 12 14.76 7 12 7M12 9C13.66 9 15 10.34 15 12S13.66 15 12 15 9 13.66 9 12 10.34 9 12 9Z"/>
            </svg>
          </div>
          <h2 className={styles.statValue}>{stats.totalRides}</h2>
          <p className={styles.statLabel}>Total Rides</p>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.elevationIcon}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,6L10.25,11L13.1,14.8L11.5,16C9.81,13.75 7,10 7,10L1,18H23L14,6Z"/>
            </svg>
          </div>
          <h2 className={styles.statValue}>{formatElevation(stats.totalElevationGain)}</h2>
          <p className={styles.statLabel}>Elevation Gain</p>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.timeIcon}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
            </svg>
          </div>
          <h2 className={styles.statValue}>{formatDuration(stats.totalMovingTime)}</h2>
          <p className={styles.statLabel}>Moving Time</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;