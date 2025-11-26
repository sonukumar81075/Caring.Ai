import { useAuth } from "../contexts/AuthContext";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/NotFound";

const NotFoundWrapper = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BAA377] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show with Layout
  if (isAuthenticated) {
    return (
      <ProtectedRoute allowedRoles={null}>
        <Layout>
          <NotFound />
        </Layout>
      </ProtectedRoute>
    );
  }

  // If not authenticated, show basic page without layout
  return <NotFound />;
};

export default NotFoundWrapper;

