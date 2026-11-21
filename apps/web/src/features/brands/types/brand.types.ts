export interface Brand {
    id: string,
    name: string,
    slug: string,
    logoUrl: string | null,
    createdAt: string;
    updatedAt: string,
}

export interface CreateBrandDto {
    name: string,
    slug: string,
    logoUrl?: string,
}

export type UpdateBrandDto = Partial<CreateBrandDto>;