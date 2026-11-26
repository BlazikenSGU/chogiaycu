export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-[22px] bg-neutral-200" />

      <div className="space-y-3 pt-3">
        <div className="h-3 w-1/3 rounded bg-neutral-200" />
        <div className="h-4 w-4/5 rounded bg-neutral-200" />
        <div className="h-3 w-1/2 rounded bg-neutral-200" />
        <div className="h-5 w-2/3 rounded bg-neutral-200" />
      </div>
    </div>
  );
}