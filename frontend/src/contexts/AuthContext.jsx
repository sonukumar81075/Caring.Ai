/* eslint-disable no-useless-catch */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "../services/authService";
import organizationService from "../services/organizationService";
import ContractExpiredModal from "../components/ContractExpiredModal";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const userData = await authService.checkAuth();
      if (userData) {
        setUser(userData);
        // Check contract status for Admin users
        if (userData.role === "Admin") {
          await checkContractStatus();
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check contract status (Admin only - SuperAdmin doesn't have contracts)
  const checkContractStatus = useCallback(async () => {
    try {
      const response = await organizationService.getContractStatus();
      if (response.success && response.data) {
        setContractInfo(response.data);

        // Show modal if contract is invalid
        if (!response.data.isValid) {
          setShowContractModal(true);
        }

        // Show warning if expiring within 30 days
        if (
          response.data.daysUntilExpiry > 0 &&
          response.data.daysUntilExpiry <= 30
        ) {
          console.warn(
            `Contract expiring in ${response.data.daysUntilExpiry} days`
          );
        }
      }
    } catch (error) {
      // SuperAdmin will get error "SuperAdmin does not have contracts" - this is expected
      if (!error.message?.includes("SuperAdmin does not have contracts")) {
        console.error("Contract status check failed:", error);
      }
    }
  }, []);

  // Force logout if user is deactivated
  const forceLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Force logout error:", error);
    } finally {
      setUser(null);
      setError(null);
      // Redirect to login page
      window.location.href = "/login";
    }
  }, []);

  // Check if current user is still active
  const checkUserStatus = useCallback(async () => {
    if (!user) return;

    try {
      const userData = await authService.checkAuth();
      if (!userData || !userData.isActive) {
        // User is deactivated, force logout
        await forceLogout();
      }
    } catch (error) {
      console.error("User status check failed:", error);
      // If auth check fails, user might be deactivated
      await forceLogout();
    }
  }, [user, forceLogout]);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Set up periodic user status check when user is logged in
  useEffect(() => {
    if (!user) return;

    // Check user status every 30 seconds
    const statusCheckInterval = setInterval(() => {
      checkUserStatus();
    }, 30000);

    // Cleanup interval on component unmount or when user changes
    return () => clearInterval(statusCheckInterval);
  }, [user, checkUserStatus]);

  const login = useCallback(async (credentials, options = {}) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(credentials, options);

      if (response.success) {
        setUser(response.user);
        return { success: true, message: response.message };
      }

      // Return the full response to handle captcha requirements
      return response;
    } catch (error) {
      const errorMessage = error.message || "Login failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // New function to handle captcha submission
  const submitCaptcha = useCallback(async (credentials, captchaData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.submitCaptcha(
        credentials.email,
        credentials.password,
        captchaData.sessionId,
        captchaData.answer
      );

      if (response.success) {
        setUser(response.user);
        return { success: true, message: response.message };
      }

      return response;
    } catch (error) {
      const errorMessage = error.message || "Captcha verification failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // New function to handle 2FA submission
  const submitTwoFactor = useCallback(async (credentials, twoFactorCode) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.submitTwoFactor(
        credentials.email,
        credentials.password,
        twoFactorCode
      );

      if (response.success) {
        setUser(response.user);
        return { success: true, message: response.message };
      }

      return response;
    } catch (error) {
      console.error("❌ 2FA Error:", error);
      const errorMessage = error.message || "2FA verification failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // New function to handle backup code submission
  const submitBackupCode = useCallback(async (credentials, backupCode) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.submitBackupCode(
        credentials.email,
        credentials.password,
        backupCode
      );

      if (response.success) {
        setUser(response.user);
        return { success: true, message: response.message };
      }

      return response;
    } catch (error) {
      console.error("❌ Backup Code Error:", error);
      const errorMessage = error.message || "Backup code verification failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.signup(userData);

      if (response.success) {
        return { success: true, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || "Signup failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    try {
      setError(null);
      const response = await authService.verifyEmail(token);
      return { success: true, message: response.message };
    } catch (error) {
      const errorMessage = error.message || "Email verification failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  // Handle contract renewal request
  const handleContractRenewal = useCallback(
    async (renewalData) => {
      try {
        const response = await organizationService.requestRenewal(renewalData);
        if (response.success) {
          // Refresh contract status
          await checkContractStatus();
          return { success: true, message: response.message };
        }
        throw new Error(response.message || "Failed to submit renewal request");
      } catch (error) {
        throw error;
      }
    },
    [checkContractStatus]
  );

  const value = {
    user,
    loading,
    error,
    login,
    submitCaptcha,
    submitTwoFactor,
    submitBackupCode,
    signup,
    logout,
    verifyEmail,
    checkAuthStatus,
    checkUserStatus,
    forceLogout,
    clearError,
    isAuthenticated: !!user,
    contractInfo,
    checkContractStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Contract Expired Modal for Admin users */}
      {user && user.role === "Admin" && contractInfo && (
        <ContractExpiredModal
          open={showContractModal}
          contractInfo={contractInfo}
          onRequestRenewal={handleContractRenewal}
          onClose={() => setShowContractModal(false)}
          allowClose={contractInfo.isValid || contractInfo.isInGracePeriod}
        />
      )}
    </AuthContext.Provider>
  );
};
