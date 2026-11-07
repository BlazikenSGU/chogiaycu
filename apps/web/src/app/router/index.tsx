import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from 'react-router-dom';
import { adminRoutes } from './AdminRoutes';
import { publicRoutes } from './PublicRoutes';
import ProtectedRoute from './ProtectedRoute';
import ProfilePage from '../../features/customer/pages/ProfilePage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/shop" replace />
    },
    ...publicRoutes,
    ...adminRoutes,
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/profile',
                element: <ProfilePage />
            },
        ],
    },
    {
        path: '*',
        element: <div>404 - Không tìm thấy trang</div>,
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />
}