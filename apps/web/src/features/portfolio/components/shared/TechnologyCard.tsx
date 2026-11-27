import type {
  Technology,
} from '../../types/portfolio.types';

import {
  TECHNOLOGY_ICONS,
} from '../../config/technology-icons.config';

interface Props {
  technology: Technology;
  compact?: boolean;
}

export default function TechnologyCard({
  technology,
  compact = false,
}: Props) {
  const {
    icon: Icon,
    color,
  } = TECHNOLOGY_ICONS[technology.icon];

  return (
    <div
      className={`
        pf-card group flex min-w-0 flex-col
        items-center justify-center gap-3
        text-center transition-all duration-200
        hover:-translate-y-1
        hover:border-[var(--pf-muted-foreground)]
        hover:shadow-sm
        motion-reduce:transform-none
        motion-reduce:transition-none
        ${
          compact
            ? 'min-h-24 p-3'
            : 'min-h-28 p-4'
        }
      `}
    >
      <Icon
        size={compact ? 28 : 36}
        color={color}
        aria-hidden="true"
        className="
          shrink-0 transition-transform
          duration-200 group-hover:scale-110
          motion-reduce:transform-none
        "
      />

      <span
        className="
          break-words text-xs font-medium
          leading-5 sm:text-sm
        "
      >
        {technology.name}
      </span>
    </div>
  );
}