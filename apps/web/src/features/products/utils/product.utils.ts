import type {
    Product,
    ProductImage,
} from '../types/product.types';

const priceFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
});

export function formatProductPrice(price: number) {
    return priceFormatter.format(price);
}

export function getDiscountPercent(
    price: number,
    originalPrice: number | null,
): number {
    if (
        originalPrice === null ||
        originalPrice <= 0 ||
        originalPrice <= price
    ) {
        return 0;
    }

    return Math.round(
        (1 - price / originalPrice) * 100,
    );
}

export function getSortedProductImages(
    images: ProductImage[],
) {
    return [...images].sort(
        (a, b) =>
            Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
    );
}

export function getPrimaryImage(
    images: ProductImage[],
) {
    return getSortedProductImages(images)[0];
}

export function getProductDetailPath(
    product: Pick<Product, 'slug'>,
) {
    return `/products/${encodeURIComponent(product.slug)}`;
}

export function isProductAvailable(
    product: Pick<Product, 'status' | 'stock'>,
) {
    return product.status === 'ACTIVE' && product.stock > 0;
}