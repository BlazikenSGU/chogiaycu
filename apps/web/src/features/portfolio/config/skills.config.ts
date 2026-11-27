import type {
  SkillCategory,
  Technology,
  TechnologyIcon,
} from '../types/portfolio.types';

function technology(
  icon: TechnologyIcon,
  name: string,
): Technology {
  return {
    id: icon,
    name,
    icon,
  };
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'backend',

    title: 'Backend Development',

    description:
      'Backend frameworks, APIs and enterprise applications.',

    skills: [
      technology('php', 'PHP'),
      technology('python', 'Python'),
      technology('laravel', 'Laravel'),
      technology('fastapi', 'FastAPI'),
      technology('flask', 'Flask'),
      technology('frappe', 'Frappe Framework'),
      technology('erpnext', 'ERPNext'),
      technology('nodejs', 'Node.js'),
      technology('nestjs', 'NestJS'),
      technology('codeigniter', 'CodeIgniter'),
      technology('rest-api', 'RESTful APIs'),
      technology('jwt', 'JWT'),
    ],
  },

  {
    id: 'frontend',

    title: 'Frontend Development',

    description:
      'Modern frontend frameworks and UI technologies.',

    skills: [
      technology('javascript', 'JavaScript'),
      technology('typescript', 'TypeScript'),
      technology('react', 'React.js'),
      technology('vue', 'Vue.js'),
      technology('nextjs', 'Next.js'),
      technology('html5', 'HTML5'),
      technology('css3', 'CSS3'),
      technology('tailwindcss', 'Tailwind CSS'),
      technology('bootstrap', 'Bootstrap'),
      technology('alpinejs', 'Alpine.js'),
      technology('blade', 'Blade'),
      technology('vite', 'Vite'),
      technology('tanstack-query', 'TanStack Query'),
      technology('zustand', 'Zustand'),
    ],
  },

  {
    id: 'database',

    title: 'Database & Search',

    description:
      'Database systems, caching, search engines and ORM.',

    skills: [
      technology('mysql', 'MySQL'),
      technology('postgresql', 'PostgreSQL'),
      technology('mariadb', 'MariaDB'),
      technology('redis', 'Redis'),
      technology('mongodb', 'MongoDB'),
      technology('elasticsearch', 'Elasticsearch'),
      technology('prisma', 'Prisma ORM'),
      technology('neon', 'Neon Database'),
    ],
  },

  {
    id: 'devops',

    title: 'DevOps & Development Tools',

    description:
      'Development, deployment and automation workflows.',

    skills: [
      technology('git', 'Git'),
      technology('github', 'GitHub'),
      technology('gitlab', 'GitLab'),
      technology('docker', 'Docker'),
      technology('nginx', 'Nginx'),
      technology('kubernetes', 'Kubernetes'),
      technology('postman', 'Postman'),
      technology('cicd', 'CI/CD'),
      technology('github-actions', 'GitHub Actions'),
      technology('composer', 'Composer'),
    ],
  },

  {
    id: 'cloud',

    title: 'Cloud & Services',

    description:
      'Cloud platforms and third-party application services.',

    skills: [
      technology('aws', 'AWS'),
      technology('cloudinary', 'Cloudinary'),
      technology('cloudflare', 'Cloudflare Pages'),
      technology('imagekit', 'ImageKit'),
      technology('resend', 'Resend'),
    ],
  },

  {
    id: 'architecture',

    title: 'Software Architecture',

    description:
      'Software architecture and enterprise design practices.',

    skills: [
      technology('design-patterns', 'Design Patterns'),
      technology('modular-architecture', 'Modular Architecture'),
      technology('multi-tenant', 'Multi-tenant SaaS'),
      technology('rbac', 'RBAC'),
    ],
  },
];

export const ALL_TECHNOLOGIES =
  SKILL_CATEGORIES.flatMap(
    (category) => category.skills,
  );