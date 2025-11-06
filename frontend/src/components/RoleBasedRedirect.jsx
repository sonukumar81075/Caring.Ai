import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect based on role
    if (user.role === 'SuperAdmin') {
        return <Navigate to="/super-admin" replace />;
    }

    if (user.role === 'Doctor') {
        return <Navigate to="/dashboard" replace />;
    }

    // Default redirect for Clinic and other roles
    return <Navigate to="/dashboard" replace />;
};

export default RoleBasedRedirect;

