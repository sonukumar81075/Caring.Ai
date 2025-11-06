import React, { useState } from "react";
import authService from "../services/authService";

const CaptchaTest = () => {
  const [step, setStep] = useState(1); // 1: Login, 2: Captcha, 3: Success
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setMessage("Attempting login...");

    try {
      const result = await authService.attemptLogin(email, password);

      if (result.success) {
        setStep(3);
        setMessage(
          `✅ Login successful! Welcome ${
            result.user.name || result.user.email
          }`
        );
      } else if (result.requiresCaptcha) {
        setStep(2);
        setCaptchaData({
          sessionId: result.captchaSessionId,
          challenge: result.challenge,
        });
        setMessage(
          `🔒 Security verification required. Please solve: ${result.challenge}`
        );
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptchaSubmit = async () => {
    if (!captchaAnswer.trim()) {
      setMessage("❌ Please enter your answer");
      return;
    }

    setLoading(true);
    setMessage("Verifying captcha...");

    try {
      const result = await authService.submitCaptcha(
        email,
        password,
        captchaData.sessionId,
        parseInt(captchaAnswer, 10)
      );

      if (result.success) {
        setStep(3);
        setMessage(
          `✅ Login successful! Welcome ${
            result.user.name || result.user.email
          }`
        );
      } else {
        setMessage(`❌ ${result.error}`);
        if (result.requiresCaptcha) {
          setMessage(`❌ ${result.error}. Please try again.`);
        }
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setStep(1);
    setCaptchaData(null);
    setCaptchaAnswer("");
    setMessage("");
  };

  const getAnswer = () => {
    if (!captchaData) return "";

    const challenge = captchaData?.challenge;
    if (challenge.includes("+")) {
      const [a, b] = challenge.split("+").map((x) => parseInt(x.trim()));
      return a + b;
    } else if (challenge.includes("-")) {
      const [a, b] = challenge.split("-").map((x) => parseInt(x.trim()));
      return a - b;
    }
    return "";
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Captcha System Test
      </h2>

      {/* Step 1: Login Form */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">
              Step 1: Login Attempt
            </h3>
            <p className="text-blue-700 text-sm">
              Enter credentials to trigger the hidden captcha system
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "🚀 Test Login"}
          </button>
        </div>
      )}

      {/* Step 2: Captcha Challenge */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-md">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Step 2: Captcha Challenge
            </h3>
            <p className="text-yellow-700 text-sm">
              The hidden captcha system is working! Solve the math problem
              below.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-md text-center">
            <p className="text-sm text-gray-600 mb-3">
              Please solve this simple math problem:
            </p>
            <div className="text-3xl font-mono font-bold text-gray-800 mb-4">
              {captchaData?.challenge} = ?
            </div>
            <div className="text-xs text-gray-500">
              (Hint: The answer is {getAnswer()})
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Answer
            </label>
            <input
              type="number"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the answer"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetTest}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-color"
            >
              🔙 Back
            </button>
            <button
              onClick={handleCaptchaSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "✅ Verify"}
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setCaptchaAnswer(getAnswer().toString())}
              className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
            >
              Auto-fill correct answer ({getAnswer()})
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-md text-center">
            <h3 className="font-semibold text-green-800 mb-2">
              🎉 Test Successful!
            </h3>
            <p className="text-green-700 text-sm">
              The hidden captcha system is working perfectly!
            </p>
          </div>

          <button
            onClick={resetTest}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            🔄 Run Another Test
          </button>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            message.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : message.includes("❌")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>🛡️ Hidden Captcha System Test</p>
        <p>Session-based security with 5-minute expiration</p>
      </div>
    </div>
  );
};

export default CaptchaTest;
