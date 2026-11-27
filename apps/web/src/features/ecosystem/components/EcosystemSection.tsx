import EcosystemCard from './EcosystemCard';
import EcosystemCTA from './EcosystemCTA';

import {
  ECOSYSTEM_PRODUCTS,
} from '../config/ecosystem.config';

interface Props {
  contactUrl?: string;
}

export default function EcosystemSection({
  contactUrl,
}: Props) {
  return (
    <section
      id="ecosystem"
      aria-labelledby="ecosystem-heading"
      className="mt-16 border-t
        border-neutral-200 pb-8 pt-12 md:mt-20"
    >
      <div className="mb-8 text-center">

        <p
          className="mb-3 text-xs font-semibold
            uppercase tracking-[0.25em] text-neutral-500"
        >
          72Market Ecosystem
        </p>

        <h2
          id="ecosystem-heading"
          className="mb-3 text-3xl font-bold
            tracking-tight text-black md:text-4xl"
        >
          Hệ sinh thái
        </h2>

        <p
          className="mx-auto max-w-2xl text-sm
            leading-relaxed text-neutral-500 md:text-base"
        >
          Khám phá các giải pháp công nghệ được phát triển
          bởi 72Market, hướng đến khả năng mở rộng,
          tùy chỉnh và triển khai linh hoạt cho doanh nghiệp.
        </p>

      </div>

      <div
        className="grid grid-cols-1 gap-4
          sm:grid-cols-2 xl:grid-cols-4"
      >
        {ECOSYSTEM_PRODUCTS.map((product) => (
          <EcosystemCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      <EcosystemCTA contactUrl={contactUrl} />

    </section>
  );
}