import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { UserRole } from '../types';

interface PrivateRouteProps {
    requiredRoles?: UserRole[];
}

const PrivateRoute = ({ requiredRoles }: PrivateRouteProps) => {
    const { isAuthenticated, roles } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (requiredRoles && !requiredRoles.some(role => roles.includes(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
