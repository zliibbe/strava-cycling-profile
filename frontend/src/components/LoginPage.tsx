/**
 * Login page component for Strava OAuth
 * Following Commandment #4: Keep logic out of views
 *
 * This component only handles presentation - business logic is in services
 */

import { initiateStravaAuth } from '../services/api';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  // Minimal logic - just delegate to service function
  const handleConnectClick = () => {
    initiateStravaAuth();
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
          type="button"
        >
          <svg className={styles.stravaIcon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.172"/>
          </svg>
          Connect with Strava
        </button>

        <div className={styles.features}>
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              View last 30 days cycling stats
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              Total distance and elevation
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              Ride count and moving time
            </li>
            <li className={styles.featureItem}>
              <span className={styles.checkIcon}>✓</span>
              Clean, professional dashboard
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