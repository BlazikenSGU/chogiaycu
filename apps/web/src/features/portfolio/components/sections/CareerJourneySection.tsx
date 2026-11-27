
import {
  BriefcaseBusiness,
  GraduationCap,
  Code2,
} from 'lucide-react';

import {
  CAREER,
} from '../../config/portfolio.config';

import SectionHeading from '../shared/SectionHeading';
import PortfolioCard from '../shared/PortfolioCard';

const CAREER_ICONS = {
  work: BriefcaseBusiness,
  education: GraduationCap,
  project: Code2,
};

export default function CareerJourneySection() {

  return (
    <section id="career" className="pf-section">
      <SectionHeading
        eyebrow="My Journey"
        title="Career Journey"
        description="Explore my professional journey, work experience and career milestones."
      />

      <div className="grid items-start">
        <div>

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
      </div>
    </section>
  );
}