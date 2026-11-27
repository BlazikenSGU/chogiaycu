import { useState } from 'react';

import {
  BriefcaseBusiness,
  GraduationCap,
  Code2,
  Sparkles,
} from 'lucide-react';

import {
  CAREER,
  SKILL_CATEGORIES,
} from '../../config/portfolio.config';

import SectionHeading from '../shared/SectionHeading';
import PortfolioCard from '../shared/PortfolioCard';
import SkillTabs from '../shared/SkillTabs';
import SkillProgress from '../shared/SkillProgress';

const CAREER_ICONS = {
  work: BriefcaseBusiness,
  education: GraduationCap,
  project: Code2,
};

export default function CareerJourneySection() {
  const [activeCategory, setActiveCategory] =
    useState(SKILL_CATEGORIES[0]?.id ?? '');

  const category = SKILL_CATEGORIES.find(
    (item) => item.id === activeCategory,
  );

  return (
    <section id="career" className="pf-section">
      <SectionHeading
        eyebrow="Journey & Expertise"
        title="My Path & Skills"
        description="Explore my professional journey and the skills I've developed along the way."
      />

      <div className="grid items-start gap-10
        lg:grid-cols-2">

        <div>
          <h3 className="mb-6 flex items-center
            gap-2 text-lg font-semibold">

            <BriefcaseBusiness size={20} />

            Career Journey
          </h3>

          {CAREER.length === 0 ? (
            <PortfolioCard className="p-8 text-center">
              <BriefcaseBusiness
                size={32}
                className="pf-text-muted mx-auto"
              />

              <p className="pf-text-muted mt-3 text-sm">
                Career information will be updated.
              </p>
            </PortfolioCard>
          ) : (
            <div className="pf-border ml-4
              space-y-6 border-l-2 pl-7">

              {CAREER.map((item) => {
                const Icon = CAREER_ICONS[item.type];

                return (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-10
                      top-3 flex h-6 w-6 items-center
                      justify-center rounded-full
                      bg-[var(--pf-primary)]
                      text-[var(--pf-primary-foreground)]">

                      <Icon size={13} />
                    </div>

                    <PortfolioCard className="p-5">
                      <span className="pf-badge">
                        {item.year}
                      </span>

                      <h4 className="mt-3 font-semibold">
                        {item.title}
                      </h4>

                      <p className="pf-text-muted
                        mt-1 text-xs">
                        {item.organization}
                      </p>

                      <p className="pf-text-muted
                        mt-3 text-sm leading-6">
                        {item.description}
                      </p>
                    </PortfolioCard>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-6 flex items-center
            gap-2 text-lg font-semibold">

            <Sparkles size={20} />

            Skills by Category
          </h3>

          <SkillTabs
            tabs={SKILL_CATEGORIES.map((item) => ({
              id: item.id,
              label: item.title,
            }))}
            activeTab={activeCategory}
            onChange={setActiveCategory}
          />

          {category && (
            <PortfolioCard className="mt-5 p-6">
              <h4 className="font-semibold">
                {category.title} Skills
              </h4>

              <p className="pf-text-muted
                mt-2 text-xs leading-5">
                {category.description}
              </p>

              <div className="mt-6 space-y-5">
                {category.skills.map((skill) => (
                  <SkillProgress
                    key={skill.name}
                    skill={skill}
                  />
                ))}
              </div>
            </PortfolioCard>
          )}
        </div>
      </div>
    </section>
  );
}