import type { RouteObject } from "react-router-dom";
import AdminLayout from '../layouts/AdminLayout';
import ProductListPage from "../../features/products/pages/ProductListPage";
import ProductCreatePage from '../../features/products/pages/ProductCreatePage';
import ProductEditPage from '../../features/products/pages/ProductEditPage';
import ProtectedRoute from './ProtectedRoute';

export const adminRoutes: RouteObject[] = [
    {
        element: <ProtectedRoute adminOnly />,
        children: [
            {
                path: '/admin',
                element: <AdminLayout />,
                children: [
                    {
                        index: true,
                        element: <ProductListPage />
                    },
                    {
                        path: 'products',
                        element: <ProductListPage />
                    },
                    {
                        path: 'products/new',
                        element: <ProductCreatePage />,
                    },
                    {
                        path: 'products/:id/edit',
                        element: <ProductEditPage />,
                    },
                ],
            }
        ]
    },
];

