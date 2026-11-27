import {
  SKILL_CATEGORIES,
} from '../../config/skills.config';

import SectionHeading from '../shared/SectionHeading';
import TechnologyGrid from '../shared/TechnologyGrid';

export default function SkillsSection() {
  return (
    <section id="skills" className="pf-section">
      <SectionHeading
        eyebrow="My Toolkit"
        title="Skills & Technologies"
        description="
          Technologies, frameworks and tools
          I use to build modern software solutions.
        "
      />

      <div className="space-y-10">
        {SKILL_CATEGORIES.map((category) => (
          <div key={category.id}>
            <h3
              className="
                mb-4 text-base font-semibold
                tracking-tight md:text-lg
              "
            >
              {category.title}
            </h3>

            <TechnologyGrid
              technologies={category.skills}
            />
          </div>
        ))}
      </div>
    </section>
  );
}