import { useState } from 'react';
import { initiateStravaAuth } from '../services/api';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectClick = async () => {
    setIsConnecting(true);

    try {
      const { accessToken, athleteId } = await initiateStravaAuth();

      // Store tokens
      localStorage.setItem('strava_access_token', accessToken);
      localStorage.setItem('strava_athlete_id', athleteId);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('OAuth failed:', error);
      alert(`Authentication failed: ${error.message}`);
      setIsConnecting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Cycling Profile</h1>
        <p className={styles.subtitle}>
          Connect your Strava account to view your cycling statistics and achievements
        </p>

        <button
          className={styles.connectButton}
          onClick={handleConnectClick}
          disabled={isConnecting}
          type="button"
        >
          <svg className={styles.stravaIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.172"/>
          </svg>
          {isConnecting ? 'Connecting...' : 'Connect with Strava'}
        </button>

        <div className={styles.features}>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              View multiple time periods (week, 30 days, 60 days)
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              Total distance and elevation gain
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              Ride count and moving time stats
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              Interactive dashboard with dynamic filtering
            </li>
          </ul>
        </div>

        <div className={styles.footer}>
          <p>
            This app only reads your activity data and respects your privacy.
            You can revoke access anytime in your Strava settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;