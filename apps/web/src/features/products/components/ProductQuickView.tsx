import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { isAxiosError } from 'axios';

import Modal from '../../../components/common/Modal';
import ErrorState from '../../../components/common/ErrorState';

import {
  usePublicProduct,
} from '../hooks/usePublicProducts';

import {
  getProductDetailPath,
  isProductAvailable,
} from '../utils/product.utils';

import ProductGallery from './ProductGallery';
import ProductPrice from './ProductPrice';

import ProductAttributes from './detail/ProductAttributes';
import ProductDescription from './detail/ProductDescription';

interface Props {
  slug: string;
  onClose: () => void;
}

export default function ProductQuickView({
  slug,
  onClose,
}: Props) {
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

  return (
    <Modal
      open
      title="Xem nhanh sản phẩm"
      onClose={onClose}
    >
      {isPending ? (
        <QuickViewSkeleton />
      ) : notFound ? (
        <p className="py-12 text-center text-sm text-neutral-500">
          Sản phẩm không còn khả dụng.
        </p>
      ) : isError || !product ? (
        <ErrorState
          message="Không thể tải thông tin sản phẩm"
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="grid items-start gap-6 md:grid-cols-2">

          <ProductGallery
            key={product.id}
            images={product.images}
            productName={product.name}
            showThumbnails={false}
          />

          <div className="min-w-0 space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {product.brand.name}
                {' · '}
                {product.category.name}
              </p>

              <h3 className="break-words text-xl font-extrabold md:text-2xl">
                {product.name}
              </h3>
            </div>

            <ProductPrice
              price={product.price}
              originalPrice={product.originalPrice}
              size="lg"
              showDiscount
            />

            <div className="border-t border-neutral-100" />

            <ProductDescription
              description={product.description}
              compact
            />

            <ProductAttributes product={product} />

            <p className="text-sm text-neutral-500">
              {isProductAvailable(product)
                ? `Còn ${product.stock} sản phẩm`
                : 'Không còn hàng'}
            </p>

            <Link
              to={getProductDetailPath(product)}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Xem chi tiết sản phẩm

              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}

function QuickViewSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 md:grid-cols-2">
      <div className="aspect-square rounded-[28px] bg-neutral-200" />

      <div className="space-y-5">
        <div className="h-4 w-1/3 rounded bg-neutral-200" />
        <div className="h-8 w-4/5 rounded bg-neutral-200" />
        <div className="h-7 w-1/2 rounded bg-neutral-200" />
        <div className="h-20 rounded-xl bg-neutral-100" />
        <div className="h-12 w-1/2 rounded-full bg-neutral-200" />
        <div className="h-12 rounded-full bg-neutral-200" />
      </div>
    </div>
  );
}