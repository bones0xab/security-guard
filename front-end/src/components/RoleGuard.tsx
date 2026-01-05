import { ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { UserRole } from '../types';

interface RoleGuardProps {
    children: ReactNode;
    requiredRoles: UserRole[];
}

const RoleGuard = ({ children, requiredRoles }: RoleGuardProps) => {
    const { roles, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return null;
    }

    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));

    return hasRequiredRole ? <>{children}</> : null;
};

export default RoleGuard;
