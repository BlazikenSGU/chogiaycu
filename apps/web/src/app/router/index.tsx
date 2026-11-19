import {
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import { adminRoutes } from './AdminRoutes';
import { publicRoutes } from './PublicRoutes';
import ProtectedRoute from './ProtectedRoute';
import ProfilePage from '../../features/customer/pages/ProfilePage';
import { useEffect } from 'react';
import { updatePageTitle } from '../utils/pageTitle';

const router = createBrowserRouter([
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
    useEffect(() => {
        updatePageTitle(router.state.location.pathname);

        const unsubcribe = router.subscribe((state) => {
            updatePageTitle(state.location.pathname);
        });

        return unsubcribe;
    }, []);

    return <RouterProvider router={router} />
}