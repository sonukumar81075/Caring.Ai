import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Dashboard from "./pages/Dashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import UserManagement from "./pages/UserManagement";
import ClinicReports from "./pages/ClinicReports";
import RequestAssessment from "./pages/RequestAssessment";
import AssessmentResults from "./pages/AssessmentResults";
import BookingQueue from "./pages/BookingQueue";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SignupForm from "./pages/SignupForm";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CognitiveAssessmentReport from "./pages/CognitiveAssessmentReport";
import CognitiveReportPrint from "./pages/CognitiveReportPrint";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import NotFound from "./pages/NotFound";
import NotFoundWrapper from "./components/NotFoundWrapper";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/verify/:token" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes (inside layout) */}

            {/* SuperAdmin Dashboard - Only for SuperAdmin role */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={["SuperAdmin"]}>
                  <Layout>
                    <SuperAdminDashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* User Management - Only for SuperAdmin role */}
            <Route
              path="/user-management"
              element={
                <ProtectedRoute allowedRoles={["SuperAdmin"]}>
                  <Layout>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
          <Route
            path="/clinic-reports"
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin']}>
                <Layout>
                  <ClinicReports />
                </Layout>
              </ProtectedRoute>
            }
          />
            {/* Dashboard - SuperAdmin CANNOT access, Doctor CAN access */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Clinic", "Doctor"]}>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Admin-only routes - SuperAdmin CANNOT access */}
            <Route
              path="/request-assessment"
              element={
                <ProtectedRoute allowedRoles={["Clinic"]}>
                  <Layout>
                    <RequestAssessment />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment-results"
              element={
                <ProtectedRoute allowedRoles={["Clinic", "Doctor"]}>
                  <Layout>
                    <AssessmentResults />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-queue"
              element={
                <ProtectedRoute allowedRoles={["Clinic", "Doctor"]}>
                  <Layout>
                    <BookingQueue />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  allowedRoles={["Clinic", "SuperAdmin", "Doctor"]}
                >
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctors"
              element={
                <ProtectedRoute allowedRoles={["Clinic"]}>
                  <Layout>
                    <Doctors />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={["Clinic"]}>
                  <Layout>
                    <Patients />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/assessment-results/:id"
              element={
                <ProtectedRoute deniedRoles={["SuperAdmin"]}>
                  <Layout>
                    <CognitiveAssessmentReport />
                  </Layout>
                </ProtectedRoute>
              }
            /> */}

            {/* Print Report - Separate URL for print-ready version */}
            <Route
              path="/assessment-results/:id"
              element={
                <ProtectedRoute deniedRoles={["SuperAdmin"]}>
                  <CognitiveReportPrint />
                </ProtectedRoute>
              }
            />

            {/* Default redirect based on role */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* 404 Page - Catch all unmatched routes */}
            {/* For authenticated users: show with Layout, for unauthenticated: show basic page */}
            <Route 
              path="*" 
              element={<NotFoundWrapper />}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
