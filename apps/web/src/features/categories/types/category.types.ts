export interface Category {
    id: string,
    name: string,
    slug: string,
    description: string | null,
    createdAt: string,
    updatedAt: string,
}

export interface CreateCategoryDto {
    name: string,
    slug: string,
    description?: string,
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;