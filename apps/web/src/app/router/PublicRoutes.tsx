import type { RouteObject } from "react-router-dom";
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from "../../features/auth/pages/RegisterPage";
import HomePage from '../../features/home/pages/HomePage';


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
    }
];