import React, { useState, useEffect } from "react";
import {
  Shield,
  Key,
  Download,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import authService from "../../services/authService";
import { Refresh as RefreshIcon } from "@mui/icons-material";

const TwoFactorAuth = () => {
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ""); // only numbers
    if (!value) return;

    // Replace or add digit in specific index
    let newCode = verificationCode?.split("");
    newCode[index] = value;
    const updatedCode = newCode.join("").slice(0, 6);
    setVerificationCode(updatedCode);

    // Move focus to next box
    if (index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      let newCode = verificationCode?.split("");
      if (!newCode[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`).focus();
      }
      newCode[index] = "";
      setVerificationCode(newCode.join(""));
    }
  };

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  // Add a refresh button for debugging
  const handleRefreshStatus = () => {
    checkTwoFactorStatus();
  };

  const checkTwoFactorStatus = async () => {
    try {
      const response = await authService.getTwoFactorStatus();
      setTwoFactorEnabled(response?.twoFactorEnabled);
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
  };

  const handleSetupTwoFactor = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authService.setupTwoFactor();
      setSetupData({
        secret: response?.secret,
        qrCode: response?.qrCodeUrl,
        manualEntryKey: response?.secret,
      });
      setBackupCodes(response?.backupCodes);
      setShowSetup(true);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to setup 2FA",
      });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode?.length !== 6) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit code" });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authService.verifyAndEnableTwoFactor(
        verificationCode
      );
      setMessage({ type: "success", text: response.message });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      setTwoFactorEnabled(true);
      setShowBackupCodes(true);
      setVerificationCode("");
      // Refresh status to ensure it's up to date
      setTimeout(() => checkTwoFactorStatus(), 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Invalid verification code",
      });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!disablePassword) {
      setMessage({ type: "error", text: "Please enter your password" });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authService.disableTwoFactor(disablePassword);
      setMessage({ type: "success", text: response?.message });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      setTwoFactorEnabled(false);
      setShowDisableConfirm(false);
      setDisablePassword("");
      setShowSetup(false);
      setSetupData(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to disable 2FA",
      });
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const text = backupCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "caring-ai-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCancelSetup = () => {
    setShowSetup(false);
    setSetupData(null);
    setVerificationCode("");
    setBackupCodes([]);
    setShowBackupCodes(false);
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 ">
      <div className="xl:flex items-center  justify-between mb-6">
        <div className="flex items-center mb-6 xl:mb-0  space-x-3">
          <div className="sm:block hidden">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>
        <div className="sm:flex grid grid-cols-2 items-center justify-end space-x-3 mt-6 sm:mt-0">
          <div
            className={`px-6 py-2.5 text-center items-center rounded-lg text-sm font-medium ${
              twoFactorEnabled
                ? "bg-white text-gray-700 border border-[#9ca3af]"
                : "bg-white text-gray-700 border border-[#9ca3af]"
            }`}
          >
            {twoFactorEnabled ? "Enabled" : "Disabled"}
          </div>

          <button
            onClick={handleRefreshStatus}
            className="bg-color text-[#ffffff] py-2 px-4 rounded-lg bg-hover transition-colors font-medium border border-[#9ca3af]   cursor-pointer"
            title="Refresh 2FA Status"
          >
            <RefreshIcon className="text-white text-[12px]" /> Refresh
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message?.text && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-start ${
            message?.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {message?.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          )}
          <p
            className={`text-sm ${
              message?.type === "success" ? "text-green-700" : "text-red-700"
            }`}
          >
            {message?.text}
          </p>
        </div>
      )}

      {!twoFactorEnabled && !showSetup && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Why enable 2FA?</h4>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  Protects your account even if your password is compromised
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Uses Google Authenticator or similar apps</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Provides backup codes for emergency access</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end items-center w-full">
            <button
              onClick={handleSetupTwoFactor}
              disabled={loading}
              className="sm:w-fit  w-full bg-color text-white py-2.5 px-4 rounded-lg bg-hover text-sm sm:text-md  disabled:opacity-50 transition-colors font-medium flex items-center cursor-pointer justify-center"
            >
              <Shield className="w-5 h-5 mr-2 sm:block hidden" />
              {loading ? "Setting up..." : "Enable Two-Factor Authentication"}
            </button>
          </div>
        </div>
      )}

      {showSetup && setupData && !showBackupCodes && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              Scan QR Code
            </h4>

            <div className="bg-white p-2 rounded-lg border border-gray-200 mb-4">
              <img
                src={setupData?.qrCode}
                alt="2FA QR Code"
                className="mx-auto object-contain"
                style={{ width: "200px", height: "200px" }}
              />
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.)
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-800 mb-2">
                Can't scan? Enter this code manually:
              </p>
              <div className="flex items-center justify-between bg-white px-3 py-3 rounded-lg border border-gray-300">
                <code className="text-sm font-mono text-gray-800 line-clamp-1">
                  {setupData?.manualEntryKey}
                </code>
                <button
                  onClick={() => handleCopyCode(setupData?.manualEntryKey)}
                  className="text-gray-600 hover:text-gray-700"
                >
                  {copiedCode === setupData?.manualEntryKey ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              Enter Verification Code
            </h4>

            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code from your authenticator app
            </p>

            <div className="flex justify-center sm:space-x-3 space-x-2">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={verificationCode[index] || ""}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="sm:w-14 w-10 sm:h-14 h-10 text-center text-2xl border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 font-mono text-gray-800"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 px-4">
            <button
              onClick={handleCancelSetup}
              className="flex-1 bg-white text-gray-700 border border-[#9ca3af] rounded-lg cursor-pointer "
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyAndEnable}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 bg-color text-white py-3 px-4 rounded-lg bg-hover disabled:opacity-50 transition-colors font-medium cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </button>
          </div>
        </div>
      )}

      {showBackupCodes && backupCodes?.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Save Your Backup Codes
                </h4>
                <p className="text-sm text-gray-800 mb-3">
                  Store these codes in a safe place. Each code can only be used
                  once if you lose access to your authenticator app.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {backupCodes?.map((code, index) => (
                <div
                  key={index}
                  className="bg-white px-4 py-3 rounded border border-gray-200 flex items-center justify-between"
                >
                  <code className="text-sm font-mono text-gray-800">
                    {code}
                  </code>
                  <button
                    onClick={() => handleCopyCode(code)}
                    className="text-gray-600 hover:text-gray-700 ml-2"
                  >
                    {copiedCode === code ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="sm:flex  items-center justify-end gap-4">
              <button
                onClick={handleDownloadBackupCodes}
                className="sm:w-fit w-full  bg-white text-gray-700 border border-[#9ca3af]   py-2.5 px-4 rounded-lg   transition-colors font-medium flex items-center  cursor-pointer justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Backup Codes
              </button>
              <button
                onClick={() => {
                  setShowBackupCodes(false);
                  setShowSetup(false);
                  setBackupCodes([]);
                }}
                className="sm:w-fit w-full sm:mt-0 mt-4  py-2.5 px-4  bg-color rounded-lg text-white bg-hover  transition-colors font-medium cursor-pointer"
              >
                I've Saved My Backup Codes
              </button>
            </div>
          </div>
        </div>
      )}

      {twoFactorEnabled && !showSetup && !showDisableConfirm && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">
                  2FA is Active
                </h4>
                <p className="text-sm text-green-700">
                  Your account is protected with two-factor authentication
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => setShowDisableConfirm(true)}
              className="w-fit bg-color text-white py-2.5 px-4 rounded-lg bg-hover transition-colors font-medium cursor-pointer"
            >
              Disable Two-Factor Authentication
            </button>
          </div>
        </div>
      )}

      {showDisableConfirm && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">
                  Disable Two-Factor Authentication?
                </h4>
                <p className="text-sm text-red-700">
                  This will make your account less secure. Enter your password
                  to confirm.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 border border-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div className="flex gap-3 justify-end items-center w-full">
            <button
              onClick={() => {
                setShowDisableConfirm(false);
                setDisablePassword("");
                setMessage({ type: "", text: "" });
              }}
              className="  w-fit   py-2.5 px-6 rounded-lg   transition-colors cursor-pointer font-medium bg-white text-gray-700 border border-[#9ca3af]"
            >
              Cancel
            </button>
            <button
              onClick={handleDisableTwoFactor}
              disabled={loading || !disablePassword}
              className=" w-fit bg-color text-white py-2.5 px-6 rounded-lg bg-hover disabled:opacity-50 transition-colors cursor-pointer font-medium"
            >
              {loading ? "Disabling..." : "Disable 2FA"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
