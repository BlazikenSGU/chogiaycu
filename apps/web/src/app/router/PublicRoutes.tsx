import type { RouteObject } from "react-router-dom";
import PublicLayout from '../layouts/PublicLayout';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from "../../features/auth/pages/RegisterPage";

export const publicRoutes: RouteObject[] = [
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            {
                index: true,
                element: <div>Danh sách giày bán</div>
            },
        ],
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