import { useState, useEffect, useCallback } from 'react';

export const useSecurity = () => {
  const [isSecure, setIsSecure] = useState(true);
  const [sessionTimeout] = useState(30 * 60 * 1000); // 30 minutes
  const [timeRemaining, setTimeRemaining] = useState(sessionTimeout);
  const [isWarningShown, setIsWarningShown] = useState(false);

  // Check if connection is secure
  useEffect(() => {
    const checkSecurity = () => {
      const isHttps = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      setIsSecure(isHttps || isLocalhost);
    };

    checkSecurity();
  }, []);

  // Session timeout management
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          handleSessionTimeout();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show warning when 5 minutes remaining
  useEffect(() => {
    if (timeRemaining <= 5 * 60 * 1000 && !isWarningShown) {
      setIsWarningShown(true);
    }
  }, [timeRemaining, isWarningShown]);

  const handleSessionTimeout = useCallback(() => {
    // Clear sensitive data
    localStorage.removeItem('caring-ai-theme');
    sessionStorage.clear();
    
    // Clear any cookies by calling logout
    if (window.authService) {
      window.authService.logout().catch(console.error);
    }
    
    // Redirect to login
    window.location.href = '/login';
  }, []);

  const extendSession = useCallback(() => {
    setTimeRemaining(sessionTimeout);
    setIsWarningShown(false);
  }, [sessionTimeout]);

  const formatTime = useCallback((ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const clearSensitiveData = useCallback(() => {
    // Clear any sensitive data from memory
    localStorage.removeItem('caring-ai-theme');
    sessionStorage.clear();
  }, []);

  const preventDataLeakage = useCallback(() => {
    // Prevent right-click context menu on sensitive elements
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Prevent text selection on sensitive elements
    const handleSelectStart = (e) => {
      if (e.target.classList.contains('no-select')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  useEffect(() => {
    const cleanup = preventDataLeakage();
    return cleanup;
  }, [preventDataLeakage]);

  return {
    isSecure,
    timeRemaining,
    isWarningShown,
    formatTime,
    extendSession,
    handleSessionTimeout,
    clearSensitiveData,
  };
};
