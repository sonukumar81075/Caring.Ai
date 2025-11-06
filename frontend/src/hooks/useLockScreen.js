import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage screen lock functionality
 */
const useLockScreen = () => {
  // Initialize from sessionStorage
  const [isLocked, setIsLocked] = useState(() => {
    const lockStatus = sessionStorage.getItem('screenLocked');
    return lockStatus === 'true';
  });

  // Check lock status on mount and restore if locked
  useEffect(() => {
    const lockStatus = sessionStorage.getItem('screenLocked');
    if (lockStatus === 'true') {
      setIsLocked(true);
    }
  }, []);

  // Lock the screen
  const lock = useCallback(() => {
    setIsLocked(true);
    // Store lock state in sessionStorage (only for current tab)
    sessionStorage.setItem('screenLocked', 'true');
    // Also store timestamp to track when locked
    sessionStorage.setItem('screenLockedTime', Date.now().toString());
  }, []);

  // Unlock the screen
  const unlock = useCallback(() => {
    setIsLocked(false);
    // Remove lock state from sessionStorage
    sessionStorage.removeItem('screenLocked');
    sessionStorage.removeItem('screenLockedTime');
  }, []);

  // Check if screen is locked (useful for initialization)
  const checkLockStatus = useCallback(() => {
    const lockStatus = sessionStorage.getItem('screenLocked');
    return lockStatus === 'true';
  }, []);

  return {
    isLocked,
    lock,
    unlock,
    checkLockStatus,
  };
};

export default useLockScreen;


