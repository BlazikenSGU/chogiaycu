import type {
  SkillCategory,
} from '../types/portfolio.types';

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    description:
      'Modern frontend frameworks and libraries.',

    skills: [
      {
        id: 'react',
        name: 'React',
        icon: 'react',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        icon: 'typescript',
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        icon: 'javascript',
      },
      {
        id: 'tailwindcss',
        name: 'Tailwind CSS',
        icon: 'tailwindcss',
      },
      {
        id: 'vite',
        name: 'Vite',
        icon: 'vite',
      },
      {
        id: 'tanstack-query',
        name: 'TanStack Query',
        icon: 'tanstack-query',
      },
      {
        id: 'zustand',
        name: 'Zustand',
        icon: 'zustand',
      },
    ],
  },

  {
    id: 'backend',
    title: 'Backend Development',
    description:
      'Backend frameworks, APIs and authentication.',

    skills: [
      {
        id: 'nodejs',
        name: 'Node.js',
        icon: 'nodejs',
      },
      {
        id: 'nestjs',
        name: 'NestJS',
        icon: 'nestjs',
      },
      {
        id: 'rest-api',
        name: 'REST API',
        icon: 'rest-api',
      },
      {
        id: 'jwt',
        name: 'JWT',
        icon: 'jwt',
      },
    ],
  },

  {
    id: 'database',
    title: 'Database & ORM',
    description:
      'Database technologies and data management.',

    skills: [
      {
        id: 'postgresql',
        name: 'PostgreSQL',
        icon: 'postgresql',
      },
      {
        id: 'prisma',
        name: 'Prisma ORM',
        icon: 'prisma',
      },
      {
        id: 'neon',
        name: 'Neon Database',
        icon: 'neon',
      },
    ],
  },

  {
    id: 'cloud',
    title: 'Cloud & Deployment',
    description:
      'Cloud platforms and application services.',

    skills: [
      {
        id: 'cloudflare',
        name: 'Cloudflare Pages',
        icon: 'cloudflare',
      },
      {
        id: 'imagekit',
        name: 'ImageKit',
        icon: 'imagekit',
      },
      {
        id: 'resend',
        name: 'Resend',
        icon: 'resend',
      },
    ],
  },

  {
    id: 'tools',
    title: 'Development Tools',
    description:
      'Version control and development workflows.',

    skills: [
      {
        id: 'git',
        name: 'Git',
        icon: 'git',
      },
      {
        id: 'github',
        name: 'GitHub',
        icon: 'github',
      },
    ],
  },

  {
    id: 'architecture',
    title: 'Software Architecture',
    description:
      'Software design and architecture practices.',

    skills: [
      {
        id: 'design-patterns',
        name: 'Design Patterns',
        icon: 'design-patterns',
      },
      {
        id: 'modular-architecture',
        name: 'Modular Architecture',
        icon: 'modular-architecture',
      },
    ],
  },
];

export const ALL_TECHNOLOGIES =
  SKILL_CATEGORIES.flatMap(
    (category) => category.skills,
  );