import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../api/category.api";

export const categoryKeys = {
    all: ['categories'] as const,
    list: () => [...categoryKeys.all, 'list'] as const,
};

export function useCategories() {
    return useQuery({
        queryKey: categoryKeys.list(),
        queryFn: categoriesApi.getAll,
        staleTime: 10 * 60 * 1000,
    });
}