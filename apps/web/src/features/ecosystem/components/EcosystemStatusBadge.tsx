import type {
  EcosystemStatus,
} from '../types/ecosystem.types';

interface Props {
  status: EcosystemStatus;
}

const STATUS_CONFIG = {
  live: {
    label: 'Đang vận hành',
    className: 'bg-green-50 text-green-700',
  },
  development: {
    label: 'Đang phát triển',
    className: 'bg-neutral-100 text-neutral-600',
  },
  'coming-soon': {
    label: 'Sắp ra mắt',
    className: 'bg-blue-50 text-blue-700',
  },
} satisfies Record<
  EcosystemStatus,
  {
    label: string;
    className: string;
  }
>;

export default function EcosystemStatusBadge({
  status,
}: Props) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`rounded-full px-2.5 py-1
        text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}