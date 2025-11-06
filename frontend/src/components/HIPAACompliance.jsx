import { useState, useEffect } from "react";

const HIPAACompliance = () => {
  const [sessionTimeout] = useState(30 * 60 * 1000); // 30 minutes
  const [timeRemaining, setTimeRemaining] = useState(sessionTimeout);
  const [isWarningShown, setIsWarningShown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleSessionTimeout();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Show warning when 5 minutes remaining
    if (timeRemaining <= 5 * 60 * 1000 && !isWarningShown) {
      setIsWarningShown(true);
    }
  }, [timeRemaining, isWarningShown]);

  const handleSessionTimeout = () => {
    // In a real app, this would redirect to login and clear sensitive data
    alert("Session expired for security. Please log in again.");
    // window.location.href = '/login';
  };

  const extendSession = () => {
    setTimeRemaining(sessionTimeout);
    setIsWarningShown(false);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Session Timeout Warning Modal */}
      {isWarningShown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Session Timeout Warning
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Your session will expire in {formatTime(timeRemaining)} for
              security purposes. Click "Extend Session" to continue working.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={extendSession}
                className="flex-1 bg-[#BAA377] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Extend Session
              </button>
              <button
                onClick={handleSessionTimeout}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIPAA Compliance Banner */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-800">
              <strong>HIPAA Compliant:</strong> All patient data is encrypted and processed according to HIPAA security standards. 
              Session timeout: {formatTime(timeRemaining)} remaining.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HIPAACompliance;
