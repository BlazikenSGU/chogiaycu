import { Link } from 'react-router-dom';

import {
  Mail,
  Globe,
  ArrowUp,
} from 'lucide-react';

import {
  SiGithub,
  SiLinkerd,
} from 'react-icons/si';

import { PROFILE } from '../../config/portfolio.config';

const SOCIAL_ICONS = {
  github: SiGithub,
  linkedin: SiLinkerd,
  email: Mail,
  website: Globe,
};

export default function PortfolioFooter() {
  return (
    <footer className="pf-border border-t">
      <div className="pf-container flex flex-col
        items-center justify-between gap-5
        py-7 md:flex-row">

        <div>
          <p className="font-semibold">
            {PROFILE.fullName}
          </p>

          <p className="pf-text-muted mt-1 text-xs">
            © {new Date().getFullYear()}.
            All rights reserved.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {PROFILE.socials.map((social) => {
            const Icon = SOCIAL_ICONS[social.type];

            return (
              <a
                key={social.type}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="pf-text-muted"
              >
                <Icon size={18} />
              </a>
            );
          })}

          <Link
            to="/"
            className="pf-text-muted text-sm"
          >
            72Market
          </Link>

          <button
            type="button"
            aria-label="Back to top"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            className="pf-button pf-button-outline"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}