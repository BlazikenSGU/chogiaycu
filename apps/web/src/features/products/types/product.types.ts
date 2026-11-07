
export const ProductStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  SOLD_OUT: 'SOLD_OUT',
  HIDDEN: 'HIDDEN',
} as const;

export type ProductStatus =
  (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductSort = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
} as const;

export type ProductSort =
  (typeof ProductSort)[keyof typeof ProductSort];

// Brand
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// Product Image
export interface ProductImage {
  id: string;
  productId: string;
  fileId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

// Product
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  price: number;
  originalPrice: number | null;

  size: string;
  conditionPercent: number | null;
  conditionNote: string | null;

  stock: number;
  status: ProductStatus;

  brandId: string;
  categoryId: string;

  brand: Brand;
  category: Category;
  images: ProductImage[];

  createdAt: string;
  updatedAt: string;
}

// Create Product
export interface CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  size: string;
  conditionPercent?: number;
  conditionNote?: string;
  stock?: number;
  status?: ProductStatus;
  brandId: string;
  categoryId: string;
}

// Update Product
export type UpdateProductDto =
  Partial<CreateProductDto>;

// Product Query
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  minCondition?: number;
  status?: ProductStatus;
  sort?: ProductSort;
}

// Pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: PaginationMeta;
}
