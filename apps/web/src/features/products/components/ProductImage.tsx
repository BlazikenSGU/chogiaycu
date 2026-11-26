import { useState } from 'react';
import { Footprints } from 'lucide-react';

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export default function ProductImage(props: Props) {
  return (
    <ImageContent
      key={props.src ?? 'empty'}
      {...props}
    />
  );
}

function ImageContent({
  src,
  alt,
  className = 'h-full w-full object-contain',
  loading = 'lazy',
}: Props) {
  const [imageError, setImageError] =
    useState(false);

  if (!src || imageError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-400">
        <Footprints
          size={44}
          strokeWidth={1.3}
        />

        <span className="text-xs">
          Ảnh đang cập nhật
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
      onError={() => setImageError(true)}
      className={className}
    />
  );
}