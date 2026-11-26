import { useEffect } from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import { ChevronRight } from 'lucide-react';
import { isAxiosError } from 'axios';

import type {
  Product,
} from '../types/product.types';

import {
  usePublicProduct,
} from '../hooks/usePublicProducts';

import {
  useProductQuantity,
} from '../hooks/useProductQuantity';

import {
  isProductAvailable,
} from '../utils/product.utils';

import ProductGallery from '../components/ProductGallery';
import ProductRelated from '../components/ProductRelated';

import ProductDetailHeader from '../components/detail/ProductDetailHeader';
import ProductDetailInfo from '../components/detail/ProductDetailInfo';
import ProductDescription from '../components/detail/ProductDescription';
import ProductAttributes from '../components/detail/ProductAttributes';
import ProductQuantity from '../components/detail/ProductQuantity';
import ProductPurchaseBar from '../components/detail/ProductPurchaseBar';
import ProductDetailSkeleton from '../components/detail/ProductDetailSkeleton';

import ErrorState from '../../../components/common/ErrorState';
import Footer from '../../../components/layout/Footer';

export default function ProductDetailPage() {
  const { slug = '' } =
    useParams<{ slug: string }>();

  const {
    data: product,
    isPending,
    isError,
    error,
    refetch,
  } = usePublicProduct(slug);

  const notFound =
    isAxiosError(error) &&
    error.response?.status === 404;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, [slug]);

  useEffect(() => {
    if (!product) return;

    const previousTitle = document.title;

    document.title =
      `${product.name} | 72Market`;

    return () => {
      document.title = previousTitle;
    };
  }, [product?.name]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#171717]">

      <ProductDetailHeader
        productName={product?.name}
      />

      <main className="mx-auto w-full max-w-7xl flex-1">

        {isPending ? (
          <div className="px-5 py-6 md:px-8">
            <ProductDetailSkeleton />
          </div>
        ) : notFound ? (
          <ProductNotFound />
        ) : isError || !product ? (
          <div className="px-5 py-12 md:px-8">
            <ErrorState
              message="Không thể tải thông tin sản phẩm"
              onRetry={() => void refetch()}
            />
          </div>
        ) : (
          <ProductDetailContent
            key={product.id}
            product={product}
          />
        )}

      </main>

      <div className={product && !isError
        ? 'pb-32 md:pb-0'
        : ''}
      >
        <Footer />
      </div>
    </div>
  );
}

interface ContentProps {
  product: Product;
}

function ProductDetailContent({
  product,
}: ContentProps) {
  const available =
    isProductAvailable(product);

  const quantity = useProductQuantity({
    stock: product.stock,
    price: product.price,
    available,
  });

  const originalTotalPrice =
    product.originalPrice !== null
      ? product.originalPrice *
        quantity.quantity
      : null;

  return (
    <>
      {/* Desktop Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="hidden flex-wrap items-center gap-2 px-8 py-6 text-sm text-neutral-500 md:flex"
      >
        <Link
          to="/"
          className="hover:text-black"
        >
          Trang chủ
        </Link>

        <ChevronRight size={14} />

        <span>{product.category.name}</span>

        <ChevronRight size={14} />

        <span
          aria-current="page"
          className="font-medium text-black"
        >
          {product.name}
        </span>
      </nav>

      {/* Main Product Content */}
      <div className="grid items-start md:grid-cols-2 md:gap-12 md:px-8">

        {/* Product Gallery */}
        <div className="bg-[#f3f3f3] px-3 pb-5 md:sticky md:top-6 md:bg-transparent md:p-0">
          <ProductGallery
            images={product.images}
            productName={product.name}
          />
        </div>

        {/* Product Information */}
        <section className="relative -mt-4 space-y-6 rounded-t-[30px] bg-white px-5 pb-8 pt-6 md:mt-0 md:rounded-none md:p-0">

          <ProductDetailInfo
            product={product}
          />

          <div className="border-t border-neutral-100" />

          <ProductDescription
            description={product.description}
            conditionNote={product.conditionNote}
          />

          <ProductAttributes
            product={product}
          />

          <ProductQuantity
            quantity={quantity.quantity}
            stock={quantity.maxQuantity}
            canIncrease={quantity.canIncrease}
            canDecrease={quantity.canDecrease}
            onIncrease={quantity.increase}
            onDecrease={quantity.decrease}
          />

          <ProductPurchaseBar
            totalPrice={quantity.totalPrice}
            originalTotalPrice={originalTotalPrice}
            available={available}
          />

        </section>
      </div>

      {/* Related Products */}
      <div className="px-5 pb-12 md:px-8">
        <ProductRelated product={product} />
      </div>
    </>
  );
}

function ProductNotFound() {
  return (
    <div className="px-5 py-24 text-center">
      <h1 className="text-xl font-bold">
        Không tìm thấy sản phẩm
      </h1>

      <p className="mt-3 text-sm text-neutral-500">
        Sản phẩm có thể đã bị ẩn hoặc không còn tồn tại.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-[#171717] px-6 py-3 text-sm font-semibold text-white"
      >
        Về trang chủ
      </Link>
    </div>
  );
}