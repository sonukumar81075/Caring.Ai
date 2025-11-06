import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to handle automatic logout after user inactivity
 * @param {number|null} timeout - Timeout in milliseconds (default: 60000ms = 1 minute), null to disable
 * @param {number} warningTime - Warning time before logout in milliseconds (default: 13200ms = 15 seconds)
 */
const useInactivityTimeout = (timeout = 60000, warningTime = 13200) => {
  const { logout, isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownRef = useRef(null);

  // If timeout is null or disabled, don't activate the feature
  const isEnabled = timeout !== null && timeout > 0;

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setShowWarning(false);
    setRemainingTime(0);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    clearTimers();
    await logout();
    window.location.href = '/login';
  }, [logout, clearTimers]);

  // Start countdown for warning
  const startCountdown = useCallback((duration) => {
    setRemainingTime(Math.ceil(duration / 1000));
    
    countdownRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    clearTimers();

    if (!isAuthenticated || !isEnabled) return;

    // Set warning timeout (show warning before actual logout)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown(warningTime);
    }, timeout - warningTime);

    // Set logout timeout (actual logout)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeout);
  }, [isAuthenticated, isEnabled, timeout, warningTime, clearTimers, handleLogout, startCountdown]);

  // Stay active (dismiss warning)
  const stayActive = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!isAuthenticated || !isEnabled) {
      clearTimers();
      return;
    }

    // Events to track for user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any user activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initial timer start
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [isAuthenticated, isEnabled, resetTimer, clearTimers]);

  return {
    showWarning,
    remainingTime,
    stayActive,
    logout: handleLogout,
  };
};

export default useInactivityTimeout;

