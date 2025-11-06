import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false); // Track if verification has been attempted

  useEffect(() => {
    // Prevent multiple verification attempts
    if (hasVerified.current) {
      return;
    }

    // let isMounted = true; // Flag to prevent state updates if component unmounts

    const verifyToken = async () => {
      if (!token) {
        // if (isMounted) {
        setStatus("error");
        setMessage("Invalid verification link");
        // }
        return;
      }

      hasVerified.current = true; // Mark as attempted

      try {
        const result = await verifyEmail(token);

        // if (isMounted) {
        if (result.success) {
          setStatus("success");
          setMessage(result.message);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.message || "Verification failed");
        }
        // }
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Verification failed. Please try again.");
      }
    };

    verifyToken();

    // Cleanup function
    // return () => {
    //   isMounted = false;
    // };
  }, [token, verifyEmail, navigate]); // Include dependencies but use ref to prevent multiple calls

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
        return <Loader className="h-16 w-16 text-gray-600 animate-spin" />;
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "verifying":
        return "text-gray-600";
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-color text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
            CA
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification
          </h2>
          <p className="text-gray-600">
            {status === "verifying" && "Verifying your email address..."}
            {status === "success" &&
              "Your email has been verified successfully!"}
            {status === "error" && "Email verification failed"}
          </p>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-6">{getStatusIcon()}</div>

          <div className={`text-lg font-medium ${getStatusColor()}`}>
            {message}
          </div>

          {status === "success" && (
            <div className="mt-4 text-sm text-gray-500">
              Redirecting to login page in 3 seconds...
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-color text-white py-2 px-4 rounded-md hover:bg-hover transition-colors duration-200"
              >
                Go to Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Sign Up Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
