import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({
  children,
  allowedRoles = null,
  deniedRoles = null,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role is in denied roles - redirect to appropriate dashboard
  if (deniedRoles && deniedRoles.includes(user?.role)) {
    // Redirect SuperAdmin to their dashboard
    if (user?.role === "SuperAdmin") {
      return <Navigate to="/super-admin" replace />;
    }
    // Redirect Clinic and Doctor to their dashboard
    if (user?.role === "Clinic" || user?.role === "Doctor") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if user role is in allowed roles - redirect to appropriate dashboard if not
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Automatically redirect to appropriate dashboard based on role
    if (user.role === "SuperAdmin") {
      return <Navigate to="/super-admin" replace />;
    } else {
      // For Clinic, Doctor, and any other roles, redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
