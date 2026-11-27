import {
  ShoppingCartPlus,
  BuildingComplex,
  MapPinHouse,
  NotebookPen,
  ArrowUpRight,
} from 'lucide-react';

import { Link } from 'react-router-dom';

import type {
  EcosystemIcon,
  EcosystemProduct,
} from '../types/ecosystem.types';

import {
  DEPLOYMENT_LABELS,
} from '../config/ecosystem.config';

import EcosystemStatusBadge from './EcosystemStatusBadge';

interface Props {
  product: EcosystemProduct;
}

const ICON_MAP = {
  commerce: ShoppingCartPlus,
  crm: BuildingComplex,
  realestate: MapPinHouse,
  course: NotebookPen,
} satisfies Record<
  EcosystemIcon,
  typeof ShoppingCartPlus
>;

export default function EcosystemCard({
  product,
}: Props) {
  const Icon = ICON_MAP[product.icon];

  return (
    <article
      className="group flex h-full flex-col
        rounded-2xl border border-neutral-200
        bg-white p-5 transition-all duration-300
        hover:-translate-y-1 hover:border-neutral-400
        hover:shadow-lg"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">

        <div
          className="flex h-12 w-12 items-center
            justify-center rounded-xl bg-black text-white"
        >
          <Icon size={24} />
        </div>

        <EcosystemStatusBadge status={product.status} />

      </div>

      <h3 className="mb-2 text-lg font-bold text-black">
        {product.name}
      </h3>

      <p className="mb-5 flex-1 text-sm leading-relaxed text-neutral-500">
        {product.description}
      </p>

      {product.deploymentModels.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {product.deploymentModels.map((model) => (
            <span
              key={model}
              className="rounded-md border
                border-neutral-200 px-2 py-1
                text-xs text-neutral-600"
            >
              {DEPLOYMENT_LABELS[model]}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto border-t border-neutral-100 pt-4">

        {product.href ? (
          <Link
            to={product.href}
            className="flex items-center justify-between
              text-sm font-semibold text-black"
          >
            Khám phá giải pháp

            <ArrowUpRight
              size={18}
              className="transition-transform
                group-hover:-translate-y-1
                group-hover:translate-x-1"
            />
          </Link>
        ) : (
          <span className="text-sm text-neutral-400">
            Thông tin sẽ được cập nhật
          </span>
        )}

      </div>
    </article>
  );
}