import { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import authService from "../../services/authService";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password strength for new password
    if (name === "newPassword") {
      checkPasswordStrength(value);
    }

    // Clear messages when user starts typing
    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Lowercase letter");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Uppercase letter");
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Number");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Special character");
    }

    setPasswordStrength({ score, feedback });
  };

  const getStrengthColor = (score) => {
    if (score <= 2) return "text-red-500";
    if (score <= 3) return "text-yellow-500";
    if (score <= 4) return "text-blue-500";
    return "text-green-500";
  };

  const getStrengthText = (score) => {
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Good";
    return "Strong";
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setMessage({ type: "error", text: "Current password is required" });
      return false;
    }

    if (!formData.newPassword) {
      setMessage({ type: "error", text: "New password is required" });
      return false;
    }

    if (formData.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "New password must be at least 8 characters long",
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({
        type: "error",
        text: "New password and confirm password do not match",
      });
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage({
        type: "error",
        text: "New password must be different from current password",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (response.success) {
        setMessage({
          type: "success",
          text: response.message || "Password changed successfully",
        });
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength({ score: 0, feedback: [] });
      } else {
        setMessage({
          type: "error",
          text: response.message || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      setMessage({
        type: "error",
        text: error.message || "An error occurred while changing password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] mt-6  outline-1 outline-offset-[-1px] outline-white/40  sm:mb-6 mb-3">
        <div className="p-6  ">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className=" sm:block hidden  ">
                <div className="w-8 h-8 bg-blue-100   rounded-lg flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-gray-600  "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900  ">
                  Change Password
                </h2>
                <p className="text-sm text-gray-600  ">
                  Update your password to keep your account secure. Make sure to
                  use a strong password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pl-10 border rounded-lg bg-white text-gray-900 focus:outline-none   border-gray-300 focus:border-transparent focus-within:ring-1 focus-within:ring-[#475569]/50 focus-within:border-transparent   shadow-xs transition-all duration-200"
              placeholder="Enter your current password"
              required
            />
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("current")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pl-10 border rounded-lg bg-white text-gray-900 focus:outline-none   border-gray-300 focus:border-transparent focus-within:ring-1 focus-within:ring-[#475569]/50 focus-within:border-transparent   shadow-xs transition-all duration-200"
              placeholder="Enter your new password"
              required
            />
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("new")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 2
                        ? "bg-red-500"
                        : passwordStrength.score <= 3
                        ? "bg-yellow-500"
                        : passwordStrength.score <= 4
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${getStrengthColor(
                    passwordStrength.score
                  )}`}
                >
                  {getStrengthText(passwordStrength.score)}
                </span>
              </div>
              {passwordStrength.feedback.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Missing: {passwordStrength.feedback.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pl-10 border rounded-lg bg-white text-gray-900 focus:outline-none   border-gray-300 focus:border-transparent focus-within:ring-1 focus-within:ring-[#475569]/50 focus-within:border-transparent   shadow-xs transition-all duration-200"
              placeholder="Confirm your new password"
              required
            />
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirm")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {formData.confirmPassword &&
            formData.newPassword !== formData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
          {formData.confirmPassword &&
            formData.newPassword === formData.confirmPassword && (
              <p className="text-xs text-green-500 mt-1 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Passwords match
              </p>
            )}
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`p-4 rounded-lg flex items-center space-x-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end ">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-color bg-hover cursor-pointer disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Changing Password...</span>
              </>
            ) : (
              <span>Change Password</span>
            )}
          </button>
        </div>
      </form>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Password Security Tips
        </h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>
            • Use at least 8 characters with a mix of letters, numbers, and
            symbols
          </li>
          <li>• Avoid using personal information or common words</li>
          <li>• Don't reuse passwords from other accounts</li>
          <li>• Consider using a password manager</li>
        </ul>
      </div>
    </div>
  );
};

export default ChangePassword;
