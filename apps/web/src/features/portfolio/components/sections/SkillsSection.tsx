import { useState } from 'react';
import { Code2, Lightbulb } from 'lucide-react';

import {
  SKILL_CATEGORIES,
  TECHNOLOGIES,
} from '../../config/portfolio.config';

import SectionHeading from '../shared/SectionHeading';
import SkillTabs from '../shared/SkillTabs';
import SkillProgress from '../shared/SkillProgress';
import PortfolioCard from '../shared/PortfolioCard';

const TABS = [
  { id: 'skills', label: 'Technical Skills' },
  { id: 'tools', label: 'Tools & Technologies' },
];

export default function SkillsSection() {
  const [activeTab, setActiveTab] =
    useState('skills');

  const skills = SKILL_CATEGORIES.flatMap(
    (category) => category.skills,
  );

  return (
    <section id="skills" className="pf-section">
      <SectionHeading
        eyebrow="My Toolkit"
        title="Skills & Technologies"
        description="A comprehensive overview of my technical skills and the tools I use to create digital experiences."
      />

      <SkillTabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-5">
        {activeTab === 'skills' ? (
          <PortfolioCard className="p-6 md:p-8">
            <h3 className="mb-7 flex items-center
              gap-2 font-semibold">

              <Lightbulb size={19} />

              Skill Proficiency Levels
            </h3>

            <div className="grid gap-x-10 gap-y-6
              md:grid-cols-2">

              {skills.map((skill) => (
                <SkillProgress
                  key={skill.name}
                  skill={skill}
                />
              ))}
            </div>
          </PortfolioCard>
        ) : (
          <PortfolioCard className="p-6">
            <div className="grid grid-cols-2 gap-3
              sm:grid-cols-3 lg:grid-cols-4">

              {TECHNOLOGIES.map((technology) => (
                <div
                  key={technology}
                  className="pf-border flex flex-col
                    items-center gap-3 rounded-lg
                    border p-5 text-center"
                >
                  <Code2
                    size={25}
                    className="pf-text-muted"
                  />

                  <span className="text-sm font-medium">
                    {technology}
                  </span>
                </div>
              ))}
            </div>
          </PortfolioCard>
        )}
      </div>
    </section>
  );
}