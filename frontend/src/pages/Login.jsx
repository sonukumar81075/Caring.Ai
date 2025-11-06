import { Formik } from "formik";
import * as Yup from "yup";
import { Mail, Lock, AlertCircle } from "lucide-react";
import InputField from "../components/InputField";
import { useNavigate, useLocation } from "react-router-dom";
import AuthBrandingFeatures from "../components/comman/AuthBrandingFeatures";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import LoginCaptchaModal from "../components/LoginCaptchaModal";
import TwoFactorModal from "../components/TwoFactorModal";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    submitCaptcha,
    submitTwoFactor,
    submitBackupCode,
    error,
    clearError,
  } = useAuth();
  const [loginError, setLoginError] = useState("");
  const [captchaData, setCaptchaData] = useState(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoginError("");
      setCaptchaError("");
      setTwoFactorError("");
      clearError();

      const result = await login(values);

      if (result.success) {
        // Redirect to intended page or dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
        resetForm();
      } else if (result.requiresTwoFactor) {
        // Show 2FA modal
        setTwoFactorData({
          credentials: values,
        });
        setShowTwoFactor(true);
        setSubmitting(false); // Don't reset form yet
      } else if (result.requiresCaptcha) {
        // Show captcha modal
        setCaptchaData({
          sessionId: result.captchaSessionId,
          challenge: result.challenge,
          credentials: values,
        });
        setShowCaptcha(true);
        setSubmitting(false); // Don't reset form yet
      } else {
        setLoginError(result.message || "Login failed");
      }
    } catch (error) {
      setLoginError("An unexpected error occurred. Please try again.", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle captcha submission
  const handleCaptchaSubmit = async (answer) => {
    if (!captchaData) return;

    setCaptchaLoading(true);
    setCaptchaError("");

    try {
      const result = await submitCaptcha(captchaData.credentials, {
        sessionId: captchaData.sessionId,
        answer: answer,
      });

      if (result.success) {
        // Close captcha modal and redirect
        setShowCaptcha(false);
        setCaptchaData(null);
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else if (result.requiresCaptcha) {
        // Wrong answer, show error but keep modal open
        setCaptchaError(
          result.message || "Incorrect answer. Please try again."
        );
      } else {
        setCaptchaError(
          result.message || "Verification failed. Please try again."
        );
      }
    } catch (error) {
      console.log(error)
      setCaptchaError("An unexpected error occurred. Please try again.");
    } finally {
      setCaptchaLoading(false);
    }
  };

  // Handle captcha modal close
  const handleCaptchaClose = () => {
    setShowCaptcha(false);
    setCaptchaData(null);
    setCaptchaError("");
    setCaptchaLoading(false);
  };

  // Handle 2FA submission
  const handleTwoFactorSubmit = async (code, type = "2fa") => {
    if (!twoFactorData) return;

    console.log(
      "🔐 Login: Starting 2FA submission with code:",
      code,
      "type:",
      type
    );
    setTwoFactorLoading(true);
    setTwoFactorError("");

    try {
      let result;

      if (type === "backup") {
        // Use backup code submission
        result = await submitBackupCode(twoFactorData.credentials, code);
      } else {
        // Use regular 2FA code submission
        result = await submitTwoFactor(twoFactorData.credentials, code);
      }

      console.log("🔐 Login: 2FA result:", result);

      if (result.success) {
        console.log("✅ Login: 2FA successful, redirecting to dashboard");
        // Close 2FA modal and redirect
        setShowTwoFactor(false);
        setTwoFactorData(null);
        const from = location.state?.from?.pathname || "/dashboard";
        console.log("🔐 Login: Navigating to:", from);
        navigate(from, { replace: true });
      } else if (result.requiresTwoFactor) {
        // Wrong code, show error but keep modal open
        setTwoFactorError(
          result.message ||
            `Invalid ${
              type === "backup" ? "backup" : "2FA"
            } code. Please try again.`
        );
      } else {
        setTwoFactorError(
          result.message || "Verification failed. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Login: 2FA error:", error);
      setTwoFactorError("An unexpected error occurred. Please try again.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Handle 2FA modal close
  const handleTwoFactorClose = () => {
    setShowTwoFactor(false);
    setTwoFactorData(null);
    setTwoFactorError("");
    setTwoFactorLoading(false);
  };

  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-gray-50 p-0  ">
      <div className="w-full min-h-screen md:min-h-screen bg-white shadow-2xl grid md:grid-cols-2 overflow-hidden ">
        <div className="flex flex-col items-center justify-center  p-8 sm:p-8 lg:p-16 bg-gray-50 md:bg-white">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0px_4px_20px_10px_rgba(0,0,0,0.05)] border border-[#e2e8f0]  outline-1 outline-offset-[-1px] outline-white/40  p-8 ">
            <div className="flex flex-col items-center mb-6 w-full">
               <div className="w-52 h-auto flex items-center  ">
                <img
                  src="/logo/logo.svg"
                  alt="CaringAI Logo"
                  className="h-16 w-auto"
                />
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Clinical Assessment Portal
              </p>
              <p className="text-sm text-gray-700">
                Sign in to your account to continue
              </p>
            </div>

            {/* Error Display */}
            {(error || loginError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error || loginError}</p>
                </div>
              </div>
            )}

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit} className="space-y-2 pt-4">
                  {/* Username Field */}
                  <label className="block text-sm font-semibold text-gray-800">
                    Email
                  </label>
                  <InputField
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.email}
                    touched={touched.email}
                    icon={Mail}
                  />

                  {/* Password Field */}
                  <label className="block text-sm font-semibold text-gray-800  ">
                    Password
                  </label>
                  <InputField
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.password}
                    touched={touched.password}
                    icon={Lock}
                  />

                  <div className="flex justify-end mb-2">
                    <span
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm font-semibold cursor-pointer hover:underline text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Forgot Password?
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white text-md font-semibold py-3 rounded-lg cursor-pointer transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg capitalize tracking-wide hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] bg-brand-gradient"
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                  <p className="text-sm text-gray-600 text-center mt-4">
                    Don't have an account?{" "}
                    <span
                      onClick={() => navigate("/signup")}
                      className="font-semibold cursor-pointer hover:underline text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Sign Up
                    </span>
                  </p>
                </form>
              )}
            </Formik>
          </div>
        </div>
        <AuthBrandingFeatures />
      </div>

      {/* Captcha Modal */}
      <LoginCaptchaModal
        isOpen={showCaptcha}
        onClose={handleCaptchaClose}
        challenge={captchaData?.challenge}
        onSubmit={handleCaptchaSubmit}
        loading={captchaLoading}
        error={captchaError}
      />

      {/* 2FA Modal */}
      <TwoFactorModal
        isOpen={showTwoFactor}
        onClose={handleTwoFactorClose}
        onSubmit={handleTwoFactorSubmit}
        loading={twoFactorLoading}
        error={twoFactorError}
      />
    </div>
  );
};

export default Login;
