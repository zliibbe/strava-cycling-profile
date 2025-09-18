/**
 * Dashboard component for displaying cycling stats
 *
 * Component only handles presentation - data fetching is in parent
 */

import { useEffect, useState } from 'react';
import { fetchAthleteProfile, formatDistance, formatElevation, formatDuration } from '../services/api.js';
import LoadingOverlay from './LoadingOverlay.jsx';
import { GiPathDistance } from 'react-icons/gi';
import { MdNumbers } from 'react-icons/md';
import { FaMountain } from 'react-icons/fa6';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get access token from localStorage (stored by popup OAuth flow)
        const accessToken = localStorage.getItem('strava_access_token');
        const athleteId = localStorage.getItem('strava_athlete_id');

        if (!accessToken || !athleteId) {
          throw new Error('Missing access token or athlete ID');
        }

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
  }, [selectedPeriod]);

  const handlePeriodChange = (event) => {
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

  const { athlete, stats } = profileData || {};

  return (
    <>
      <LoadingOverlay isVisible={loading} message={loadingMessage} />
      <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.profileSection}>
          {athlete ? (
            <>
              <img
                src={athlete.profile}
                alt={`${athlete.firstname} ${athlete.lastname}`}
                className={styles.avatar}
              />
              <div className={styles.athleteInfo}>
                <h1>{athlete.firstname} {athlete.lastname}</h1>
                {athlete.bio && <p className={styles.bio}>{athlete.bio}</p>}
                <p>
                  {athlete.city && athlete.state
                    ? `${athlete.city}, ${athlete.state}`
                    : athlete.city || athlete.state || 'Location not set'}
                  {athlete.premium && ' • Premium'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className={styles.avatar} style={{backgroundColor: '#f3f4f6'}}></div>
              <div className={styles.athleteInfo}>
                <h1>Loading...</h1>
                <p>Fetching profile data</p>
              </div>
            </>
          )}
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
            <GiPathDistance size={24} />
          </div>
          <h2 className={styles.statValue}>{stats ? formatDistance(stats.totalDistance) : '0 mi'}</h2>
          <p className={styles.statLabel}>Total Distance</p>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.ridesIcon}`}>
            <MdNumbers size={24} />
          </div>
          <h2 className={styles.statValue}>{stats ? stats.totalRides : '0'}</h2>
          <p className={styles.statLabel}>Total Rides</p>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.elevationIcon}`}>
            <FaMountain size={24} />
          </div>
          <h2 className={styles.statValue}>{stats ? formatElevation(stats.totalElevationGain) : '0 ft'}</h2>
          <p className={styles.statLabel}>Elevation Gain</p>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.timeIcon}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/>
            </svg>
          </div>
          <h2 className={styles.statValue}>{stats ? formatDuration(stats.totalMovingTime) : '0h 0m'}</h2>
          <p className={styles.statLabel}>Moving Time</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;