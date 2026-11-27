import type {
  Technology,
} from '../../types/portfolio.types';

import TechnologyCard from './TechnologyCard';

interface Props {
  technologies: Technology[];
  compact?: boolean;
}

export default function TechnologyGrid({
  technologies,
  compact = false,
}: Props) {
  if (technologies.length === 0) {
    return (
      <p className="pf-text-muted text-sm">
        Technologies will be updated.
      </p>
    );
  }

  return (
    <div
      className={
        compact
          ? 'grid grid-cols-2 gap-3 sm:grid-cols-3'
          : `grid grid-cols-2 gap-3
             min-[400px]:grid-cols-3
             md:grid-cols-4 lg:grid-cols-6`
      }
    >
      {technologies.map((technology) => (
        <TechnologyCard
          key={technology.id}
          technology={technology}
          compact={compact}
        />
      ))}
    </div>
  );
}