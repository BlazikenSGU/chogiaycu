import { useMemo, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import {
    ProductSort,
    type ProductQueryParams,
} from '../../products/types/product.types';

export function useHomeFilters() {
    const [search, setSearchState] = useState('');
    const [categoryId, setCategoryState] = useState('');
    const [brandId, setBrandState] = useState('');
    const [page, setPage] = useState(1);

    const [sort, setSortState] = useState<ProductSort>('newest');
    const debouncedSearch = useDebounce(search.trim(), 400,);

    function setSearch(value: string) {
        setSearchState(value);
        setPage(1);
    }

    function setCategoryId(value: string) {
        setCategoryState(value);
        setPage(1);
    }

    function setBrandId(value: string) {
        setBrandState(value);
        setPage(1);
    }

    function setSort(value: ProductSort) {
        setSortState(value);
        setPage(1);
    }

    function resetFilters() {
        setSearchState('');
        setCategoryState('');
        setBrandState('');
        setSortState('newest');
        setPage(1);
    }

    const productQuery = useMemo<ProductQueryParams>(
        () => ({
            page,
            limit: 24,
            sort,
            search: debouncedSearch || undefined,
            categoryId: categoryId || undefined,
            brandId: brandId || undefined,
        }),
        [
            page,
            sort,
            debouncedSearch,
            categoryId,
            brandId,
        ],
    );

    return {
        search,
        setSearch,

        categoryId,
        setCategoryId,

        brandId,
        setBrandId,

        sort,
        setSort,

        page,
        setPage,

        resetFilters,
        productQuery,

        isSearching:
            search.trim() !== debouncedSearch,
    };

}