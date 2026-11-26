import { useQuery } from '@tanstack/react-query';
import { brandsApi } from '../api/brand.api';

export const brandKeys = {
  all: ['brands'] as const,
  list: () => [...brandKeys.all, 'list'] as const,
};

export function useBrands() {
  return useQuery({
    queryKey: brandKeys.list(),
    queryFn: brandsApi.getAll,
    staleTime: 10 * 60 * 1000,
  });
}