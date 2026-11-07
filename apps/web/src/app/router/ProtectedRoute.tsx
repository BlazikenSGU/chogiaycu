import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from '../../features/auth/hooks/useAuth';

interface ProtectedRouteProps {
    adminOnly?: boolean;
}

export default function ProtectedRoute({
    adminOnly = false,
}: ProtectedRouteProps) {
    const location = useLocation();

    const {
        status,
        isAuthenticated,
        isAdmin,
    } = useAuth();

    if (status === 'loading') {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                Đang kiểm tra phiên đăng nhập...
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}