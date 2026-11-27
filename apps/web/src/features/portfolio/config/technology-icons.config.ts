import {
  SiReact,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiVite,
  SiReactquery,
  SiNodedotjs,
  SiNestjs,
  SiJsonwebtokens,
  SiPostgresql,
  SiPrisma,
  SiGit,
  SiGithub,
  SiCloudflare,
} from 'react-icons/si';

import {
  Database,
  Images,
  Mail,
  Network,
  Layers,
  Boxes,
  Code2,
} from 'lucide-react';

import type { ElementType } from 'react';

import type {
  TechnologyIcon,
} from '../types/portfolio.types';

interface TechnologyIconConfig {
  icon: ElementType;
  color: string;
}

export const TECHNOLOGY_ICONS = {
  react: {
    icon: SiReact,
    color: '#61DAFB',
  },

  typescript: {
    icon: SiTypescript,
    color: '#3178C6',
  },

  javascript: {
    icon: SiJavascript,
    color: '#EAB308',
  },

  tailwindcss: {
    icon: SiTailwindcss,
    color: '#06B6D4',
  },

  vite: {
    icon: SiVite,
    color: '#646CFF',
  },

  'tanstack-query': {
    icon: SiReactquery,
    color: '#FF4154',
  },

  zustand: {
    icon: Code2,
    color: '#A16207',
  },

  nodejs: {
    icon: SiNodedotjs,
    color: '#339933',
  },

  nestjs: {
    icon: SiNestjs,
    color: '#E0234E',
  },

  'rest-api': {
    icon: Network,
    color: '#64748B',
  },

  jwt: {
    icon: SiJsonwebtokens,
    color: '#D946EF',
  },

  postgresql: {
    icon: SiPostgresql,
    color: '#4169E1',
  },

  prisma: {
    icon: SiPrisma,
    color: 'var(--pf-foreground)',
  },

  neon: {
    icon: Database,
    color: '#16A34A',
  },

  git: {
    icon: SiGit,
    color: '#F05032',
  },

  github: {
    icon: SiGithub,
    color: 'var(--pf-foreground)',
  },

  cloudflare: {
    icon: SiCloudflare,
    color: '#F38020',
  },

  imagekit: {
    icon: Images,
    color: '#2563EB',
  },

  resend: {
    icon: Mail,
    color: 'var(--pf-foreground)',
  },

  'design-patterns': {
    icon: Boxes,
    color: '#8B5CF6',
  },

  'modular-architecture': {
    icon: Layers,
    color: '#0EA5E9',
  },
} satisfies Record<TechnologyIcon, TechnologyIconConfig>;