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
  SiPhp,
  SiPython,
  SiLaravel,
  SiFastapi,
  SiFlask,
  SiCodeigniter,
  SiVuedotjs,
  SiNextdotjs,
  SiHtml5,
  SiBootstrap,
  SiAlpinedotjs,
  SiMysql,
  SiMariadb,
  SiRedis,
  SiMongodb,
  SiElasticsearch,
  SiGitlab,
  SiDocker,
  SiNginx,
  SiKubernetes,
  SiPostman,
  SiGithubactions,
  SiComposer,
  SiCloudinary,
} from 'react-icons/si';

import {
  Database,
  Images,
  Mail,
  Network,
  Layers,
  Boxes,
  Code2,
  Workflow,
  ShieldCheck,
  Building2,
} from 'lucide-react';

import type { ElementType } from 'react';

import type {
  TechnologyIcon,
} from '../types/portfolio.types';

import {
  FaCss3Alt,
  FaAws,
} from 'react-icons/fa';

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
  php: {
    icon: SiPhp,
    color: '#777BB4',
  },

  python: {
    icon: SiPython,
    color: '#3776AB',
  },

  laravel: {
    icon: SiLaravel,
    color: '#FF2D20',
  },

  fastapi: {
    icon: SiFastapi,
    color: '#009688',
  },

  flask: {
    icon: SiFlask,
    color: 'var(--pf-foreground)',
  },

  frappe: {
    icon: Layers,
    color: '#2490EF',
  },

  erpnext: {
    icon: Boxes,
    color: '#2490EF',
  },

  codeigniter: {
    icon: SiCodeigniter,
    color: '#EF4223',
  },

  vue: {
    icon: SiVuedotjs,
    color: '#42B883',
  },

  nextjs: {
    icon: SiNextdotjs,
    color: 'var(--pf-foreground)',
  },

  html5: {
    icon: SiHtml5,
    color: '#E34F26',
  },

  css3: {
    icon: FaCss3Alt,
    color: '#1572B6',
  },

  bootstrap: {
    icon: SiBootstrap,
    color: '#7952B3',
  },

  alpinejs: {
    icon: SiAlpinedotjs,
    color: '#8BC0D0',
  },

  blade: {
    icon: SiLaravel,
    color: '#FF2D20',
  },

  mysql: {
    icon: SiMysql,
    color: '#4479A1',
  },

  mariadb: {
    icon: SiMariadb,
    color: '#C0765A',
  },

  redis: {
    icon: SiRedis,
    color: '#DC382D',
  },

  mongodb: {
    icon: SiMongodb,
    color: '#47A248',
  },

  elasticsearch: {
    icon: SiElasticsearch,
    color: '#FEC514',
  },

  gitlab: {
    icon: SiGitlab,
    color: '#FC6D26',
  },

  docker: {
    icon: SiDocker,
    color: '#2496ED',
  },

  nginx: {
    icon: SiNginx,
    color: '#009639',
  },

  kubernetes: {
    icon: SiKubernetes,
    color: '#326CE5',
  },

  postman: {
    icon: SiPostman,
    color: '#FF6C37',
  },

  cicd: {
    icon: Workflow,
    color: '#8B5CF6',
  },

  'github-actions': {
    icon: SiGithubactions,
    color: '#2088FF',
  },

  composer: {
    icon: SiComposer,
    color: '#885630',
  },

  'aws': {
    icon: FaAws,
    color: '#FF9900',
  },

  cloudinary: {
    icon: SiCloudinary,
    color: '#3448C5',
  },

  rbac: {
    icon: ShieldCheck,
    color: '#16A34A',
  },

  'multi-tenant': {
    icon: Building2,
    color: '#2563EB',
  },
} satisfies Record<TechnologyIcon, TechnologyIconConfig>;