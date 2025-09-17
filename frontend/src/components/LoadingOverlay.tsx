/**
 * Loading overlay component with blur background
 */

import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  readonly isVisible: boolean;
  readonly message?: string;
}

const LoadingOverlay = ({ isVisible, message = "Loading..." }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingOverlay;
