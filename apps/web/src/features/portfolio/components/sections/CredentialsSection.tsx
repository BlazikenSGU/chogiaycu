import {
  GraduationCap,
  Award,
  ArrowUpRight,
} from 'lucide-react';

import {
  EDUCATION,
  CERTIFICATIONS,
} from '../../config/portfolio.config';

import SectionHeading from '../shared/SectionHeading';
import PortfolioCard from '../shared/PortfolioCard';

export default function CredentialsSection() {
  return (
    <section id="education" className="pf-section">
      <SectionHeading
        eyebrow="Credentials"
        title="Education & Certifications"
        description="My academic background and professional credentials."
      />

      <h3 className="mb-6 flex items-center
        justify-center gap-2 text-lg font-semibold">

        <GraduationCap size={20} />

        Academic Background
      </h3>

      <div
        className={
          EDUCATION.length === 1
            ? 'mx-auto grid max-w-3xl gap-5'
            : 'grid gap-5 md:grid-cols-2'
        }
      >
        {EDUCATION.map((item) => (
          <PortfolioCard
            key={item.id}
            className="overflow-hidden"
          >
            <div className="relative flex min-h-36
              flex-col justify-end overflow-hidden
              bg-neutral-700 p-5 text-white">

              {item.imageUrl && (
                <>
                  <img
                    src={item.imageUrl}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0
                      h-full w-full object-cover"
                  />

                  <div className="absolute inset-0
                    bg-gradient-to-t
                    from-black/90 to-black/10" />
                </>
              )}

              <div className="relative z-10">
                <p className="text-xs text-neutral-300">
                  {item.period}
                </p>

                <h4 className="mt-2 text-lg font-semibold">
                  {item.degree}
                </h4>

                <p className="text-sm">
                  {item.school}
                </p>
              </div>
            </div>

            <div className="p-5">
              <p className="pf-text-muted
                text-sm leading-6">
                {item.description}
              </p>

              {item.highlights.length > 0 && (
                <>
                  <p className="mt-5 text-xs
                    font-semibold uppercase">
                    Highlights
                  </p>

                  <ul className="mt-2 list-disc
                    space-y-1 pl-4 text-xs">
                    {item.highlights.map((highlight) => (
                      <li key={highlight}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </PortfolioCard>
        ))}
      </div>

      {EDUCATION.length === 0 && (
        <PortfolioCard className="p-8 text-center">
          <GraduationCap
            size={36}
            className="pf-text-muted mx-auto"
          />

          <p className="pf-text-muted mt-3 text-sm">
            Academic information will be updated.
          </p>
        </PortfolioCard>
      )}

      {CERTIFICATIONS.length > 0 && (
        <>
          <div className="mt-14 text-center">
            <span className="pf-badge">
              PROFESSIONAL
            </span>

            <h3 className="mt-3 text-xl font-semibold">
              Certifications & Training
            </h3>
          </div>

          <div className="mt-6 grid gap-4
        sm:grid-cols-2 lg:grid-cols-4">

            {CERTIFICATIONS.map((item) => (
              <PortfolioCard
                key={item.id}
                className="overflow-hidden p-3"
              >
                <div className="pf-muted flex aspect-video
              items-center justify-center
              overflow-hidden rounded-lg">

                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Award
                      size={40}
                      className="pf-text-muted"
                    />
                  )}
                </div>

                <h4 className="mt-4 text-sm font-semibold">
                  {item.name}
                </h4>

                <p className="pf-text-muted mt-1 text-xs">
                  {item.issuer}
                </p>

                <p className="pf-text-muted mt-2 text-xs">
                  {item.year}
                </p>

                <div className="mt-4 flex flex-wrap gap-1">
                  {item.skills.map((skill) => (
                    <span key={skill} className="pf-badge">
                      {skill}
                    </span>
                  ))}
                </div>

                {item.credentialUrl && (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center
                  gap-1 text-xs font-medium"
                  >
                    View Credential
                    <ArrowUpRight size={13} />
                  </a>
                )}
              </PortfolioCard>
            ))}
          </div>

          {CERTIFICATIONS.length === 0 && (
            <PortfolioCard className="p-8 text-center">
              <Award
                size={36}
                className="pf-text-muted mx-auto"
              />

              <p className="pf-text-muted mt-3 text-sm">
                Certifications will be updated.
              </p>
            </PortfolioCard>
          )}

          <div className="pf-muted mt-10 rounded-xl
        px-6 py-8 text-center">

            <h3 className="font-semibold">
              Continuous Learner
            </h3>

            <p className="pf-text-muted mx-auto mt-2
          max-w-lg text-sm leading-6">

              Committed to continuous learning,
              emerging technologies and professional
              development.
            </p>

            <a
              href="#contact"
              className="pf-button pf-button-outline mt-4"
            >
              Let's Connect and Learn Together
            </a>
          </div>
        </>
      )}
    </section>
  );
}