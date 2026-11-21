import api from '../../../lib/api';

import type {
    Brand,
    CreateBrandDto,
    UpdateBrandDto,
} from '../types/brand.types';

const brandPath = (id: string) => `/brands/${encodeURIComponent(id)}`;

export const brandsApi = {
    async getAll(): Promise<Brand[]> {
        const res = await api.get<Brand[]>('/brands');
        return res.data;
    },

    async getBySlug(slug: string): Promise<Brand> {
        const res = await api.get<Brand>(`/brands/${encodeURIComponent(slug)}`);
        return res.data;
    },


    async uploadLogo(file: File): Promise<{
        fileId: string;
        url: string;
    }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<{
            fileId: string;
            url: string;
        }>('/brands/logo/upload', formData);

        return response.data;
    },


    async create(data: CreateBrandDto): Promise<Brand> {
        const res = await api.post<Brand>(`/brands`, data);
        return res.data;
    },

    async update(id: string, data: UpdateBrandDto): Promise<Brand> {
        const res = await api.patch<Brand>(brandPath(id), data);
        return res.data;
    },

    async remove(id: string): Promise<void> {
        await api.delete(brandPath(id));
    },
};