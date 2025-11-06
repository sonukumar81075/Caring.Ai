import React, { useState } from "react";
import {
  Shield,
  Key,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Smartphone,
} from "lucide-react";

const TwoFactorModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (useBackupCode) {
      // Backup codes are typically 8 characters
      if (code.trim() && code.length >= 6) {
        onSubmit(code, "backup");
      }
    } else {
      // Regular 2FA codes are 6 digits
      if (code.trim() && code.length === 6) {
        onSubmit(code, "2fa");
      }
    }
  };

  const handleClose = () => {
    setCode("");
    setUseBackupCode(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Two-Factor Authentication
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            {useBackupCode ? (
              <>
                <p className="text-gray-600 mb-4">
                  Enter one of your backup codes:
                </p>

                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <Key className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-700">
                    Use one of your saved backup codes (each code can only be
                    used once)
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Please enter the 6-digit code from your authenticator app:
                </p>

                <div className="bg-gray-50 border  border-dashed border-gray-300 rounded-lg p-6 mb-4">
                  <div className="flex items-center justify-center mb-3">
                    <Smartphone className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Open Google Authenticator and find "Caring AI"
                  </p>
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {useBackupCode ? "Backup Code" : "6-Digit Code"}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  if (useBackupCode) {
                    setCode(e.target.value.toUpperCase().slice(0, 10));
                  } else {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-300 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent text-center text-xl font-mono tracking-widest"
                placeholder={useBackupCode ? "A1B2C3D4" : "000000"}
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1   py-2.5 px-6 rounded-lg   transition-colors cursor-pointer font-medium bg-white text-gray-700 border border-[#9ca3af]"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  !code.trim() ||
                  (useBackupCode ? code.length < 6 : code.length !== 6)
                }
                className="flex-1 flex items-center  bg-color  text-white py-2.5 px-6 rounded-lg bg-hover disabled:opacity-50 transition-colors cursor-pointer font-medium"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-4 text-center">
            {useBackupCode ? (
              <>
                <p className="text-xs text-gray-500">
                  Have access to your authenticator app?
                </p>
                <button
                  type="button"
                  className="text-xs text-gray-600 hover:text-gray-800 underline mt-1  font-[600] cursor-pointer"
                  onClick={() => {
                    setUseBackupCode(false);
                    setCode("");
                  }}
                >
                  Use 2FA code instead
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">
                  Don't have access to your authenticator app?
                </p>
                <button
                  type="button"
                  className="text-xs text-gray-600 hover:text-gray-800 underline mt-1 cursor-pointer font-[600]"
                  onClick={() => {
                    setUseBackupCode(true);
                    setCode("");
                  }}
                >
                  Use backup code instead
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Protected by two-factor authentication
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorModal;
