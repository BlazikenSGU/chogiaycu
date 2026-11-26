import { Link } from 'react-router-dom';

import { useBrands } from '../../brands/hooks/useBrands';
import BrandLogo from '../../brands/components/BrandLogo';

import ErrorState from '../../../components/common/ErrorState';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function BrandSection({
  selectedId,
  onSelect,
}: Props) {
  const {
    data: brands = [],
    isPending,
    isError,
    refetch,
  } = useBrands();

  return (
    <section id="brands" className="mb-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          Thương hiệu
        </h2>

        <Link
          to="/shop"
          className="text-sm font-semibold"
        >
          See All
        </Link>
      </div>

      {isPending ? (
        <div className="grid grid-cols-4 gap-5 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse flex-col items-center gap-3"
            >
              <div className="h-16 w-16 rounded-full bg-neutral-200" />

              <div className="h-3 w-12 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          message="Không thể tải thương hiệu"
          onRetry={() => void refetch()}
        />
      ) : brands.length === 0 ? (
        <p className="py-5 text-center text-sm text-neutral-500">
          Chưa có thương hiệu.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-5 sm:grid-cols-4 md:grid-cols-6">
          {brands.map((brand) => {
            const active = selectedId === brand.id;

            return (
              <button
                key={brand.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onSelect(active ? '' : brand.id)
                }
                className="flex cursor-pointer flex-col items-center gap-3"
              >
                <span
                  className={`flex h-16 w-16 items-center justify-center
                    rounded-full transition-all duration-200
                    ${
                      active
                        ? 'bg-neutral-200 ring-2 ring-black'
                        : 'bg-[#f3f3f3] hover:bg-neutral-200'
                    }`}
                >
                  <BrandLogo
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="h-10 w-10 object-contain"
                  />
                </span>

                <span className="text-center text-xs font-semibold">
                  {brand.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}