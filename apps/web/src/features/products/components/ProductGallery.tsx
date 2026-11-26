import { useRef, useState } from 'react';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import type {
  ProductImage as ProductImageType,
} from '../types/product.types';

import {
  getSortedProductImages,
} from '../utils/product.utils';

import ProductImage from './ProductImage';

interface Props {
  images: ProductImageType[];
  productName: string;
  showThumbnails?: boolean;
}

export default function ProductGallery({
  images,
  productName,
  showThumbnails = true,
}: Props) {
  const sortedImages =
    getSortedProductImages(images);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);

  const selectedImage =
    sortedImages.find(
      (image) => image.id === selectedId,
    ) ?? sortedImages[0];

  const activeIndex = sortedImages.findIndex(
    (image) => image.id === selectedImage?.id,
  );

  function selectImage(index: number) {
    const image = sortedImages[index];

    if (image) {
      setSelectedId(image.id);
    }
  }

  function changeImage(direction: number) {
    if (sortedImages.length < 2) return;

    const nextIndex =
      (
        activeIndex +
        direction +
        sortedImages.length
      ) % sortedImages.length;

    selectImage(nextIndex);
  }

  function handleTouchStart(x: number) {
    touchStartX.current = x;
  }

  function handleTouchEnd(x: number) {
    if (touchStartX.current === null) return;

    const distance = touchStartX.current - x;

    touchStartX.current = null;

    if (Math.abs(distance) < 50) return;

    changeImage(distance > 0 ? 1 : -1);
  }

  return (
    <div className="min-w-0">
      <div className="relative overflow-hidden rounded-[28px] bg-[#f3f3f3]">

        {/* Main Image */}
        <div
          className="aspect-square touch-pan-y md:aspect-[5/4]"
          onTouchStart={(event) => {
            handleTouchStart(
              event.touches[0].clientX,
            );
          }}
          onTouchEnd={(event) => {
            handleTouchEnd(
              event.changedTouches[0].clientX,
            );
          }}
          onTouchCancel={() => {
            touchStartX.current = null;
          }}
        >
          <ProductImage
            src={selectedImage?.url}
            alt={
              selectedImage?.alt ||
              productName
            }
            loading="eager"
            className="h-full w-full select-none object-contain p-6 md:p-10"
          />
        </div>

        {/* Desktop Arrows */}
        {sortedImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              onClick={() => changeImage(-1)}
              className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm md:flex"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              aria-label="Ảnh tiếp theo"
              onClick={() => changeImage(1)}
              className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm md:flex"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {sortedImages.length > 1 && (
          <div className="flex items-center justify-center pb-5">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Xem ảnh ${index + 1}`}
                aria-pressed={activeIndex === index}
                onClick={() => selectImage(index)}
                className="flex h-8 cursor-pointer items-center px-1"
              >
                <span
                  className={`h-[6px] rounded-full transition-all duration-300
                    ${
                      activeIndex === index
                        ? 'w-6 bg-black'
                        : 'w-[6px] bg-neutral-300'
                    }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Thumbnails */}
      {showThumbnails &&
        sortedImages.length > 1 && (
          <div className="mt-4 hidden gap-3 overflow-x-auto p-1 md:flex">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Xem ảnh ${index + 1}`}
                aria-pressed={activeIndex === index}
                onClick={() => selectImage(index)}
                className={`h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-[#f3f3f3]
                  ${
                    activeIndex === index
                      ? 'ring-2 ring-black'
                      : 'ring-1 ring-neutral-200'
                  }`}
              >
                <ProductImage
                  src={image.url}
                  alt={image.alt || productName}
                  className="h-full w-full object-contain p-2"
                />
              </button>
            ))}
          </div>
        )}
    </div>
  );
}