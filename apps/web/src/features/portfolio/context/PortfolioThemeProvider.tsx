import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import {
  PortfolioThemeContext,
} from './PortfolioThemeContext';

import type {
  Theme,
} from './PortfolioThemeContext';

const STORAGE_KEY = 'portfolio-theme';

function getInitialTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark'
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

interface Props {
  children: ReactNode;
}

export function PortfolioThemeProvider({
  children,
}: Props) {
  const [theme, setTheme] =
    useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((previous) =>
      previous === 'light' ? 'dark' : 'light',
    );
  }

  return (
    <PortfolioThemeContext.Provider
      value={{ theme, toggleTheme }}
    >
      <div
        className="portfolio-root"
        data-theme={theme}
      >
        {children}
      </div>
    </PortfolioThemeContext.Provider>
  );
}