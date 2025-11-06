import React, { useState } from "react";
import HiddenCaptcha from "./HiddenCaptcha";
import authService from "../services/authService";

const LoginWithCaptcha = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaData, setCaptchaData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authService.attemptLogin(
        formData.email,
        formData.password
      );

      if (result.success) {
        // Login successful
        onLoginSuccess(result.user);
      } else if (result.requiresCaptcha) {
        // Show captcha modal
        setCaptchaData({
          sessionId: result.captchaSessionId,
          challenge: result.challenge,
        });
      } else if (result.requiresTwoFactor) {
        // Handle 2FA (you can implement this separately)
        setError("2FA verification required. Please implement 2FA flow.");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaSubmit = async (answer) => {
    setLoading(true);
    setError("");

    try {
      const result = await authService.submitCaptcha(
        formData.email,
        formData.password,
        captchaData.sessionId,
        answer
      );

      if (result.success) {
        // Login successful
        setCaptchaData(null);
        onLoginSuccess(result.user);
      } else {
        if (result?.requiresCaptcha) {
          // Get new captcha challenge
          setError(
            `Incorrect answer. ${
              result?.attemptsLeft
                ? `${result?.attemptsLeft} attempts left.`
                : "Please try again."
            }`
          );
          // You might want to refresh the captcha challenge here
        } else {
          setError(result.error || "Captcha verification failed");
          setCaptchaData(null);
        }
      }
    } catch (err) {
      setError("Captcha verification failed. Please try again.");
      setCaptchaData(null);
      console.error("Captcha error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaCancel = () => {
    setCaptchaData(null);
    setError("Login cancelled");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Secure login with hidden captcha protection
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500">
            Protected by hidden captcha security
          </div>
        </form>

        {/* Captcha Modal */}
        {captchaData && (
          <HiddenCaptcha
            challenge={captchaData?.challenge}
            onSubmit={handleCaptchaSubmit}
            onCancel={handleCaptchaCancel}
          />
        )}
      </div>
    </div>
  );
};

export default LoginWithCaptcha;
