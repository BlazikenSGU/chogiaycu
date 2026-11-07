import api from '../../../lib/api';

import type {
    Product,
    ProductImage,
    CreateProductDto,
    UpdateProductDto,
    ProductQueryParams,
    PaginatedProducts,
} from '../types/product.types';

const productPath = (id: string) => `/products/${encodeURIComponent(id)}`;
const imagePath = (
    productId: string,
    imageId: string,
) => `${productPath(productId)}/images/${encodeURIComponent(imageId)}`;

export const productsApi = {

    async getPublicProducts(params?: ProductQueryParams) {
        const response = await api.get<PaginatedProducts>(
            '/products',
            { params }
        );
        return response.data;
    },

    async getBySlug(slug: string) {
        const response = await api.get<Product>(
            `/products/${encodeURIComponent(slug)}`
        );

        return response.data;
    },

    async getAll(params?: ProductQueryParams) {
        const response = await api.get<PaginatedProducts>(
            '/products/admin/list',
            { params }
        );

        return response.data;
    },

    async getById(id: string) {
        const response = await api.get<Product>(
            `/products/admin/${encodeURIComponent(id)}`,
        );

        return response.data;
    },

    async create(data: CreateProductDto) {
        const response = await api.post<Product>(
            '/products',
            data,
        );

        return response.data;
    },

    async update(id: string, data: UpdateProductDto) {
        const response = await api.patch<Product>(
            productPath(id),
            data
        );

        return response.data;
    },

    async remove(id: string) {
        await api.delete(productPath(id));
    },

    async uploadImage(productId: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ProductImage>(
            `${productPath(productId)}/images`,
            formData,
        );

        return response.data;
    },

    async setPrimaryImage(
        productId: string,
        imageId: string,
    ) {
        const response = await api.patch<ProductImage>(
            `${imagePath(productId, imageId)}/primary`,
        );

        return response.data;
    },

    async deleteImage(
        productId: string,
        imageId: string
    ) {
        await api.delete(imagePath(productId, imageId));
    },
}