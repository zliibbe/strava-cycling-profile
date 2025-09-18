/**
 * Loading overlay component with blur background
 */

import styles from './LoadingOverlay.module.css';

const LoadingOverlay = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingOverlay;