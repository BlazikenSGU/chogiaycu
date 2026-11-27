import type {
  Skill,
  SkillLevel,
} from '../../types/portfolio.types';

const LEVEL_COLORS: Record<SkillLevel, string> = {
  Learning: 'text-neutral-500',
  Intermediate: 'text-violet-500',
  Advanced: 'text-blue-500',
  Expert: 'text-emerald-500',
};

export default function SkillProgress({
  skill,
}: {
  skill: Skill;
}) {
  const progress =
    skill.progress === undefined
      ? undefined
      : Math.max(0, Math.min(100, skill.progress));

  return (
    <div>
      <div className="mb-2 flex items-center
        justify-between gap-3">

        <span className="text-sm font-medium">
          {skill.name}
        </span>

        {skill.level && (
          <span className={`text-xs font-semibold
            ${LEVEL_COLORS[skill.level]}`}>
            {skill.level}
          </span>
        )}
      </div>

      {progress !== undefined ? (
        <div
          role="progressbar"
          aria-label={skill.name}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="pf-muted h-2 overflow-hidden
            rounded-full"
        >
          <div
            className="h-full rounded-full
              bg-[var(--pf-primary)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : (
        <div className="pf-text-muted text-xs">
          Proficiency not specified
        </div>
      )}
    </div>
  );
}