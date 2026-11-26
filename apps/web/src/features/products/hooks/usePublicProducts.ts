import { useQuery } from '@tanstack/react-query';

import { productsApi } from '../api/product.api';
import type {
  ProductQueryParams,
} from '../types/product.types';

export const productKeys = {
  all: ['products'] as const,

  public: () =>
    [...productKeys.all, 'public'] as const,

  list: (params: ProductQueryParams) =>
    [...productKeys.public(), 'list', params] as const,

  detail: (slug: string) =>
    [...productKeys.public(), 'detail', slug] as const,
};

export function usePublicProducts(
  params: ProductQueryParams,
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () =>
      productsApi.getPublicProducts(params),

    staleTime: 60 * 1000,
  });
}

export function usePublicProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),

    queryFn: () =>
      productsApi.getBySlug(slug),

    enabled: Boolean(slug),

    staleTime: 60 * 1000,

    gcTime: 5 * 60 * 1000,
  });
}