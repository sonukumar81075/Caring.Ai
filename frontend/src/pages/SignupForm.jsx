import { Formik } from "formik";
import * as Yup from "yup";
import { Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import InputField from "../components/InputField";
import { useNavigate } from "react-router-dom";
import AuthBrandingFeatures from "../components/comman/AuthBrandingFeatures";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, error, clearError } = useAuth();
  const [signupError, setSignupError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .required("Username is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .required("Password is required"),
  });

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setSignupError("");
      setSuccessMessage("");
      clearError();

      const result = await signup(values);

      if (result.success) {
        setSuccessMessage(result.message);
        resetForm();
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setSignupError(result.message);
      }
    } catch (error) {
      setSignupError("An unexpected error occurred. Please try again.", error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-gray-50 p-0  ">
      <div className="w-full min-h-screen md:min-h-screen bg-white shadow-2xl grid md:grid-cols-2 overflow-hidden md:rounded-lg">
        <div className="flex flex-col items-center justify-center p-8 sm:p-8  lg:p-16 bg-gray-50 md:bg-white">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0px_4px_20px_10px_rgba(0,0,0,0.05)] border border-[#e2e8f0]  outline-1 outline-offset-[-1px] outline-white/40  p-8  ">
            <div className="flex flex-col items-center mb-6 w-full">
                <div className="w-52 h-auto flex items-center   ">
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
                Sign up to your account to continue
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {(error || signupError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error || signupError}</p>
                </div>
              </div>
            )}

            <Formik
              initialValues={{ username: "", email: "", password: "" }}
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
                    Username
                  </label>
                  <InputField
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.username}
                    touched={touched.username}
                  />
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 text-white text-md font-semibold py-3 rounded-lg cursor-pointer transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg capitalize tracking-wide hover:shadow-xl   active:scale-[0.98] bg-brand-gradient"
                  >
                    {isSubmitting ? "Signing Up..." : "Sign Up"}
                  </button>
                  <p className="text-sm text-gray-600 text-center mt-4">
                    Already have an account?{" "}
                    <span
                      onClick={() => navigate("/login")}
                      className="font-semibold cursor-pointer hover:underline text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Login
                    </span>
                  </p>
                </form>
              )}
            </Formik>
          </div>
        </div>
        <AuthBrandingFeatures />
      </div>
    </div>
  );
};

export default Signup;
