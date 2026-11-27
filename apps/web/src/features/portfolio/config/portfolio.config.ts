import type {
  PortfolioProfile,
  CareerItem,
  Education,
  Certification,
  PortfolioProject,
} from '../types/portfolio.types';

export const PROFILE: PortfolioProfile = {
  fullName: 'Nguyen Nhat Truong',

  role: 'Full Stack Developer',

  avatarUrl: '/portfolio/avatar.webp',

  location: 'Ho Chi Minh City, Vietnam',

  experience: '3+ Years',

  email: 'truongnhat.nguyen.41@gmail.com',

  resumeUrl: '/portfolio/resume.pdf',

  resumeCoverUrl: '',

  biography: [
    'With over 3 years of experience in enterprise software development, my expertise spans Ecommerce, ERP, CRM, HRM, TMS, LMS, Internal Systems and SaaS platforms, with a strong focus on software architecture, system integration, and performance optimization.',
    'My professional goal is to take end-to-end ownership of software systems — from business analysis and architectural design to development, infrastructure, deployment, and operations — delivering scalable, reliable, and sustainable solutions that drive business value.'
  ],

  socials: [
    {
      type: 'github',
      label: 'GitHub',
      href: 'https://github.com/BlazikenSGU',
    },
    {
      type: 'email',
      label: 'Email',
      href: 'mailto:truongnhat.nguyen.41@gmail.com',
    },
    {
      type: 'website',
      label: 'Website',
      href: 'https://blazikensgu.id.vn',
    },
  ],
};

export const NAVIGATION = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Career', href: '#career' },
  { label: 'Education', href: '#education' },
  { label: 'Projects', href: '#projects' },
  { label: 'Ecosystem', href: '#ecosystem' },
  { label: 'Contact', href: '#contact' },
];

export const CAREER: CareerItem[] = [
  {
    id: 's3work',
    year: 'Mar 2024 - Sep 2026',
    title: 'Full Stack Developer',
    organization: 'S3work Technology',
    type: 'work',
    logoUrl: '/portfolio/companies/s3work.webp',
    description:
      'Developed enterprise applications using Python, Frappe, PHP, and Laravel. Customized ERPNext modules for ERP, CRM, HRMS, inventory, purchasing, and sales. Contributed to multi-tenant SaaS architecture, role-based access control, RESTful APIs, and CI/CD workflows.',
  },

  {
    id: 'namperfume',
    year: 'Jan 2023 - Feb 2024',
    title: 'Backend Developer',
    organization: 'Namperfume.net',
    type: 'work',
    logoUrl: '/portfolio/companies/namperfume.webp',
    description:
      'Developed and maintained internal business applications using PHP, Laravel, and CodeIgniter. Implemented HR management, attendance, payroll, accounting, procurement, sales, inventory, and promotional program features.',
  },

  {
    id: 'sapo',
    year: 'Feb 2022 - Aug 2022',
    title: 'Backend Developer Intern',
    organization: 'Sapo Technology JSC',
    type: 'work',
    logoUrl: '/portfolio/companies/sapo.webp',
    description:
      'Applied software development knowledge to build and deliver application modules based on client requirements.',
  },
];

export const EDUCATION: Education[] = [
  {
    id: 'saigon-university',
    degree: 'Engineer of Information Technology',
    school: 'Saigon University',
    imageUrl: '/portfolio/education/education.webp',
    period: 'Sep 2019 - Jun 2023',
    description:
      'Majored in Software Engineering, with a focus on software development and information technology.',
    highlights: [
      'Major: Software Engineering',
      'Degree: Engineer of Information Technology',
      'TOEIC Score: 590',
    ],
  },
];

export const CERTIFICATIONS: Certification[] = [];

export const PROJECTS: PortfolioProject[] = [
  {
    id: 's3work-system',
    name: 'S3Work System Business Management',
    imageUrl: '/portfolio/projects/s3work.webp',
    category: 'Enterprise ERP & Multi-tenant SaaS',
    description:
      'An enterprise management platform built on the Frappe and ERPNext ecosystem, supporting ERP, CRM, HRMS, and multi-tenant business operations. Contributed as a Full Stack Developer and Development Team Lead, implementing tenant-level data isolation and optimizing database queries and API response times from 4,000ms to 200ms.',
    technologies: [
      'Python',
      'Frappe Framework',
      'ERPNext',
      'React.js',
      'Vue.js',
      'Nginx',
      'Kubernetes',
      'Elasticsearch',
    ],
  },

  {
    id: 's3-onsuite',
    name: 'S3 Onsuite',
    imageUrl: '/portfolio/projects/s3-onsuite.webp',
    category: 'Enterprise Business Management',
    description:
      'An enterprise management platform for a US-based client, integrating HRM, payroll, accounting, POS, and Omnichannel communication. Developed backend modules, independent Python services, RESTful APIs, Elasticsearch integrations, and automated data synchronization workflows.',
    technologies: [
      'PHP',
      'Laravel',
      'Python',
      'FastAPI',
      'Flask',
      'Elasticsearch',
      'Node.js',
      'React.js',
      'RESTful APIs',
    ],
  },

  {
    id: 'blazik-app',
    name: 'Blazik App',
    imageUrl: '/portfolio/projects/blazik-app.webp',
    category: 'Modular Business Management Platform',
    description:
      'A personal project currently in development, designed to integrate independent business modules into a centralized administration system. Built with a modular Laravel architecture using Composer packages, reusable administrative interfaces, centralized authentication, RBAC, and automated deployment workflows.',
    technologies: [
      'PHP',
      'Laravel 12',
      'MySQL',
      'Blade',
      'Tailwind CSS',
      'Alpine.js',
      'Composer',
      'GitHub Actions',
    ],

    demoUrl: 'https://blazikensgu.id.vn',
  },

  {
    id: '72market',
    name: '72Market',
    imageUrl: '/portfolio/projects/72market.webp',
    category: 'E-commerce Platform',
    description:
      'A football footwear e-commerce platform featuring product management, brand and category management, user authentication, and image management.',

    technologies: [
      'React',
      'TypeScript',
      'NestJS',
      'PostgreSQL',
      'Prisma',
      'Tailwind CSS',
      'ImageKit',
      'Resend',
    ],

    demoUrl: '/',
  },
];

export const RESUME_FACTS = [
  {
    title: 'Experience',
    description:
      '3+ years of professional software development experience.',
  },
  {
    title: 'Education',
    description:
      'Engineer of Information Technology, Saigon University.',
  },
  {
    title: 'Industries',
    description:
      'Enterprise Software, ERP, CRM, HRMS, SaaS and E-commerce.',
  },
  {
    title: 'Services',
    description:
      'Full Stack Development, RESTful APIs, System Integration and Modular Software Development.',
  },
];