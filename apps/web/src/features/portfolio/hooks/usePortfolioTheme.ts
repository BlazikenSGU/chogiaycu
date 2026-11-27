import { useContext } from 'react';

import {
  PortfolioThemeContext,
} from '../context/PortfolioThemeContext';

export function usePortfolioTheme() {
  const context = useContext(
    PortfolioThemeContext,
  );

  if (!context) {
    throw new Error(
      'usePortfolioTheme must be used within PortfolioThemeProvider',
    );
  }

  return context;
}