export default function ProductDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Đang tải sản phẩm"
      className="grid animate-pulse gap-6 md:grid-cols-2 md:gap-12"
    >
      <div>
        <div className="aspect-square rounded-[28px] bg-neutral-200" />

        <div className="mt-4 hidden gap-3 md:flex">
          {Array.from({ length: 4 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-20 w-20 rounded-2xl bg-neutral-200"
              />
            ),
          )}
        </div>
      </div>

      <div className="space-y-6 rounded-[28px] bg-white p-5">
        <div className="h-8 w-4/5 rounded bg-neutral-200" />

        <div className="h-5 w-1/2 rounded bg-neutral-200" />

        <div className="h-24 rounded-xl bg-neutral-100" />

        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded-full bg-neutral-200" />

          <div className="h-12 rounded-full bg-neutral-200" />
        </div>

        <div className="h-12 w-1/2 rounded-full bg-neutral-200" />

        <div className="h-14 rounded-full bg-neutral-200" />
      </div>
    </div>
  );
}