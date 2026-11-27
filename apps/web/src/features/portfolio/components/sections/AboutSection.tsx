import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  Mail,
  UserRound,
} from 'lucide-react';

import {
  SOCIAL_ICONS,
} from '../../config/portfolio-icons.config';

import { PROFILE } from '../../config/portfolio.config';

import PortfolioCard from '../shared/PortfolioCard';

export default function AboutSection() {
  const facts = [
    {
      icon: BriefcaseBusiness,
      label: 'Experience',
      value: PROFILE.experience,
    },
    {
      icon: MapPin,
      label: 'Location',
      value: PROFILE.location,
    },
    {
      icon: Mail,
      label: 'Contact',
      value: PROFILE.email || 'Updating',
    },
  ];

  return (
    <section id="about" className="pf-section">
      <div className="grid items-start gap-10
        md:grid-cols-[260px_1fr] lg:gap-16">

        <aside className="space-y-6">
          <div className="pf-muted mx-auto flex
            aspect-square w-48 items-center
            justify-center overflow-hidden
            rounded-full md:w-56">

            {PROFILE.avatarUrl ? (
              <img
                src={PROFILE.avatarUrl}
                alt={PROFILE.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound
                size={90}
                strokeWidth={1}
                className="pf-text-muted"
              />
            )}
          </div>

          <PortfolioCard className="pf-muted p-5">
            <h3 className="mb-5 text-sm font-semibold">
              Quick Facts
            </h3>

            <div className="space-y-4">
              {facts.map((fact) => {
                const Icon = fact.icon;

                return (
                  <div
                    key={fact.label}
                    className="flex items-start gap-3"
                  >
                    <Icon
                      size={17}
                      className="pf-text-muted mt-1 shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="pf-text-muted text-xs">
                        {fact.label}
                      </p>

                      <p className="break-words
                        text-sm font-medium">
                        {fact.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pf-border mt-5 flex
              flex-wrap gap-2 border-t pt-4">

              {PROFILE.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.type];

                return (
                  <a
                    key={social.type}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="pf-button pf-button-outline"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </PortfolioCard>
        </aside>

        <div className="md:pt-4">
          <span className="pf-badge">
            ABOUT ME
          </span>

          <h1 className="mt-4 text-4xl font-bold
            leading-tight tracking-tight
            lg:text-5xl">

            Hi, I'm {PROFILE.fullName}

            <span className="block">
              {PROFILE.role}
            </span>
          </h1>

          <div className="pf-text-muted mt-6
            space-y-4 text-sm leading-7 md:text-base">

            {PROFILE.biography.map((paragraph) => (
              <p key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="pf-button pf-button-primary"
            >
              Get in Touch
              <ArrowRight size={16} />
            </a>

            <a
              href="#projects"
              className="pf-button pf-button-outline"
            >
              View My Work
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}