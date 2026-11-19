import type { RouteObject } from "react-router-dom";
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from "../../features/auth/pages/RegisterPage";
import HomePage from '../../features/home/pages/HomePage';
import ForgotPasswordPage from '../../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../features/auth/pages/ResetPasswordPage';

export const publicRoutes: RouteObject[] = [
    {
        index: true,
        element: <HomePage />,
    },
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/register',
        element: <RegisterPage />
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/reset-password',
        element: <ResetPasswordPage />,
    },
];