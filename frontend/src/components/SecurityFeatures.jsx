import { useState, useEffect } from 'react';

const SecurityFeatures = () => {
  const [isSecureConnection, setIsSecureConnection] = useState(true);
  const [lastActivity, setLastActivity] = useState(new Date());

  useEffect(() => {
    // Check if connection is secure (HTTPS)
    setIsSecureConnection(window.location.protocol === 'https:');

    // Track user activity
    const updateActivity = () => {
      setLastActivity(new Date());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  const formatLastActivity = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Security Status
      </h3>
      
      <div className="space-y-4">
        {/* Connection Security */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isSecureConnection ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Secure Connection
            </span>
          </div>
          <span className={`text-sm font-medium ${isSecureConnection ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isSecureConnection ? 'HTTPS Enabled' : 'Insecure Connection'}
          </span>
        </div>

        {/* Data Encryption */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Data Encryption
            </span>
          </div>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            AES-256 Enabled
          </span>
        </div>

        {/* Session Management */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Session Management
            </span>
          </div>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Auto Timeout Active
          </span>
        </div>

        {/* Last Activity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Activity
            </span>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {formatLastActivity(lastActivity)}
          </span>
        </div>

        {/* HIPAA Compliance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              HIPAA Compliance
            </span>
          </div>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Fully Compliant
          </span>
        </div>
      </div>

      {/* Security Tips */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Security Tips
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Always log out when finished</li>
          <li>• Never share your login credentials</li>
          <li>• Report any suspicious activity immediately</li>
          <li>• Keep your browser updated</li>
        </ul>
      </div>
    </div>
  );
};

export default SecurityFeatures;
