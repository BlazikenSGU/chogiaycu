import { createContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const PortfolioThemeContext =
  createContext<ThemeContextValue | null>(null);