import {
  Download,
  ArrowRight,
  FileText,
  Mail,
} from 'lucide-react';

import {
  SiGithub,
} from 'react-icons/si';

import {
  PROFILE,
  RESUME_FACTS,
} from '../../config/portfolio.config';

import PortfolioCard from '../shared/PortfolioCard';

export default function ResumeSection() {
  const github = PROFILE.socials.find(
    (social) => social.type === 'github',
  );

  return (
    <section id="contact" className="pf-section">
      <PortfolioCard className="grid overflow-hidden
        md:grid-cols-[2fr_3fr]">

        <div className="relative flex min-h-80
          flex-col items-center justify-center
          overflow-hidden bg-neutral-600
          p-8 text-center text-white">

          {PROFILE.resumeCoverUrl && (
            <img
              src={PROFILE.resumeCoverUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full
                w-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10">
            <FileText
              size={44}
              strokeWidth={1.2}
              className="mx-auto"
            />

            <h3 className="mt-5 text-2xl font-semibold">
              Resume
            </h3>

            <p className="mx-auto mt-3 max-w-xs
              text-sm leading-6 text-neutral-200">

              Download my resume to learn more
              about my experience, education,
              and qualifications.
            </p>

            {PROFILE.resumeUrl ? (
              <a
                href={PROFILE.resumeUrl}
                download
                className="mt-5 inline-flex
                  items-center gap-2 rounded-md
                  bg-black px-4 py-3 text-sm text-white"
              >
                <Download size={16} />
                Download PDF
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-5 rounded-md bg-black/60
                  px-4 py-3 text-sm text-white/70"
              >
                Resume coming soon
              </button>
            )}
          </div>
        </div>

        <div className="p-6 md:p-10">
          <h2 className="text-2xl font-bold
            tracking-tight md:text-3xl">

            Hire Me For Your Next Project
          </h2>

          <p className="pf-text-muted mt-4
            text-sm leading-6">

            Let's discuss how I can contribute
            to your next project, develop software
            solutions and build digital products.
          </p>

          <div className="mt-6 grid gap-3
            sm:grid-cols-2">

            {RESUME_FACTS.map((item) => (
              <div
                key={item.title}
                className="pf-muted rounded-lg p-4"
              >
                <h4 className="text-sm font-semibold">
                  {item.title}
                </h4>

                <p className="pf-text-muted mt-2
                  text-xs leading-5">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {PROFILE.resumeUrl ? (
              <a
                href={PROFILE.resumeUrl}
                download
                className="pf-button pf-button-primary"
              >
                Download Resume
                <Download size={15} />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="pf-button pf-button-primary"
              >
                Download Resume
                <Download size={15} />
              </button>
            )}

            {PROFILE.email && (
              <a
                href={`mailto:${PROFILE.email}`}
                className="pf-button pf-button-outline"
              >
                Contact Me
                <ArrowRight size={15} />
              </a>
            )}

            {!PROFILE.email && github && (
              <a
                href={github.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pf-button pf-button-outline"
              >
                <SiGithub size={16} />
                GitHub Profile
              </a>
            )}
          </div>
        </div>
      </PortfolioCard>

      <PortfolioCard className="mt-5 flex flex-col
        justify-between gap-4 p-5
        sm:flex-row sm:items-center">

        <div>
          <h3 className="text-sm font-semibold">
            Need more information?
          </h3>

          <p className="pf-text-muted mt-1 text-xs">
            Feel free to contact me directly
            for more information.
          </p>
        </div>

        {PROFILE.email ? (
          <a
            href={`mailto:${PROFILE.email}`}
            className="pf-button pf-button-outline"
          >
            <Mail size={15} />
            {PROFILE.email}
          </a>
        ) : (
          <span className="pf-text-muted text-xs">
            Contact email updating
          </span>
        )}
      </PortfolioCard>
    </section>
  );
}