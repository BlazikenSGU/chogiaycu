import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Menu,
  X,
  Sun,
  Moon,
  ArrowUpRight,
} from 'lucide-react';

import { NAVIGATION } from '../../config/portfolio.config';

import {
  usePortfolioTheme,
} from '../../hooks/usePortfolioTheme';

export default function PortfolioHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const { theme, toggleTheme } =
    usePortfolioTheme();

  return (
    <header className="pf-border sticky top-0
      z-50 border-b bg-[var(--pf-background)]">

      <div className="pf-container flex h-16
        items-center justify-between gap-5">

        <Link
          to="/portfolio"
          className="text-lg font-bold tracking-tight"
        >
          Portfolio.
        </Link>

        <nav
          aria-label="Portfolio navigation"
          className="hidden items-center gap-5 xl:flex"
        >
          {NAVIGATION.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="pf-text-muted text-sm
                transition hover:text-[var(--pf-foreground)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Toggle color theme"
            onClick={toggleTheme}
            className="pf-button pf-button-outline"
          >
            {theme === 'light'
              ? <Moon size={17} />
              : <Sun size={17} />}
          </button>

          <Link
            to="/"
            className="pf-button pf-button-primary
              hidden sm:inline-flex"
          >
            72Market
            <ArrowUpRight size={15} />
          </Link>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className="pf-button pf-button-outline
              xl:hidden"
          >
            {isOpen
              ? <X size={18} />
              : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav
          aria-label="Mobile navigation"
          className="pf-container pf-border
            space-y-2 border-t py-4 xl:hidden"
        >
          {NAVIGATION.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3
                py-3 text-sm hover:bg-[var(--pf-muted)]"
            >
              {item.label}
            </a>
          ))}

          <Link
            to="/"
            className="pf-button pf-button-primary w-full"
          >
            Back to 72Market
          </Link>
        </nav>
      )}
    </header>
  );
}