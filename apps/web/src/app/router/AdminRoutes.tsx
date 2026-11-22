import type { RouteObject } from "react-router-dom";
import AdminLayout from '../layouts/AdminLayout';
import ProductListPage from "../../features/products/pages/ProductListPage";
import ProtectedRoute from './ProtectedRoute';

import BrandListPage from "../../features/brands/pages/BrandListPage";
import CategoryListPage from '../../features/categories/pages/CategoryListPage';

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
                        path: 'brands',
                        element: <BrandListPage />,
                    },
                    {
                        path: 'categories',
                        element: <CategoryListPage />,
                    },
                ],
            }
        ]
    },
];

