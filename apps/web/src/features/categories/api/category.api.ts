import api from '../../../lib/api';

import type {
    Category,
    CreateCategoryDto,
    UpdateCategoryDto,
} from '../types/category.types';

const categoryPath = (id: string) => `/categories/${encodeURIComponent(id)}`;

export const categoriesApi = {
    async getAll(): Promise<Category[]> {
        const res = await api.get<Category[]>('/categories');
        return res.data;
    },

    async getBySlug(slug: string): Promise<Category> {
        const res = await api.get<Category>(
            `/categories/${encodeURIComponent(slug)}`
        );
        return res.data;
    },

    async create(data: CreateCategoryDto): Promise<Category> {
        const res = await api.post<Category>('/categories', data);
        return res.data;
    },

    async update(id: string, data: UpdateCategoryDto): Promise<Category> {
        const res = await api.patch<Category>(
            categoryPath(id),
            data
        );
        return res.data;
    },

    async remove(id: string): Promise<void> {
        await api.delete(categoryPath(id));
    },
}