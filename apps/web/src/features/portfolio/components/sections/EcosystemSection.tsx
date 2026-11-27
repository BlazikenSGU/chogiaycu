import { ArrowUpRight } from 'lucide-react';

import { Link } from 'react-router-dom';

import {
  ECOSYSTEM_PRODUCTS,
  DEPLOYMENT_LABELS,
} from '../../../ecosystem/config/ecosystem.config';

import {
  ECOSYSTEM_ICON_MAP,
} from '../../../ecosystem/config/ecosystem-icons.config';

import SectionHeading from '../shared/SectionHeading';
import PortfolioCard from '../shared/PortfolioCard';

const STATUS_LABELS = {
  live: 'Available',
  development: 'In Development',
  'coming-soon': 'Coming Soon',
};

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="pf-section">
      <SectionHeading
        eyebrow="Product Ecosystem"
        title="My Software Ecosystem"
        description="Software products and reusable modules designed for flexible deployment and future commercialization."
      />

      <div className="grid gap-4
        sm:grid-cols-2 lg:grid-cols-4">

        {ECOSYSTEM_PRODUCTS.map((product) => {
          const Icon = ECOSYSTEM_ICON_MAP[product.icon];

          return (
            <PortfolioCard
              key={product.id}
              className="flex flex-col p-5"
            >
              <div className="pf-muted flex h-12
                w-12 items-center justify-center
                rounded-xl">

                <Icon size={24} strokeWidth={1.5} />
              </div>

              <div className="mt-4">
                <span className="pf-badge">
                  {STATUS_LABELS[product.status]}
                </span>
              </div>

              <h3 className="mt-3 font-semibold">
                {product.name}
              </h3>

              <p className="pf-text-muted mt-3
                text-sm leading-6">
                {product.description}
              </p>

              <div className="my-4 flex flex-wrap gap-1">
                {product.deploymentModels.map((model) => (
                  <span key={model} className="pf-badge">
                    {DEPLOYMENT_LABELS[model]}
                  </span>
                ))}
              </div>

              <div className="mt-auto">
                {product.href && (
                  product.href.startsWith('/') ? (
                    <Link
                      to={product.href}
                      className="inline-flex items-center
                        gap-1 text-sm font-medium"
                    >
                      Explore
                      <ArrowUpRight size={15} />
                    </Link>
                  ) : (
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center
                        gap-1 text-sm font-medium"
                    >
                      Explore
                      <ArrowUpRight size={15} />
                    </a>
                  )
                )}
              </div>
            </PortfolioCard>
          );
        })}
      </div>
    </section>
  );
}