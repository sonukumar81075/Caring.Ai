/* eslint-disable no-undef */
import React, { useState } from "react";
import { X, Shield, RefreshCw } from "lucide-react";

const LoginCaptchaModal = ({
  isOpen,
  onClose,
  challenge,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() && !isNaN(parseInt(answer, 10))) {
      onSubmit(parseInt(answer, 10));
    }
  };

  const handleClose = () => {
    setAnswer("");
    onClose();
  };

  const getCorrectAnswer = () => {
    if (!challenge) return "";

    if (challenge.includes("+")) {
      const [a, b] = challenge.split("+").map((x) => parseInt(x.trim(), 10));
      return a + b;
    } else if (challenge.includes("-")) {
      const [a, b] = challenge.split("-").map((x) => parseInt(x.trim(), 10));
      // Backend ensures larger number is first, so this is always positive
      return a - b;
    }
    return "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Security Verification
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              Please solve this simple math problem to verify you're human:
            </p>

            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
              <div className="text-2xl font-mono font-bold text-gray-800">
                {challenge} = ?
              </div>
            </div>

            <p className="text-xs text-gray-500">
              This helps protect your account from unauthorized access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent  placeholder-gray-700 text-center text-md font-mono"
                placeholder="Enter your answer"
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-white text-[#475569] py-2.5 px-4 rounded-lg  transition-colors font-medium border border-[#9ca3af]"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !answer.trim()}
                className="flex-1 bg-color text-white py-2.5 px-4 rounded-lg bg-hover  disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center cursor-pointer"
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

          {/* Debug helper (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setAnswer(getCorrectAnswer().toString())}
                className="text-xs text-gray-600 hover:text-gray-800 underline font-[600] cursor-pointer"
              >
                Auto-fill correct answer ({getCorrectAnswer()})
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Protected by hidden captcha security
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCaptchaModal;
