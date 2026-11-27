import type {
    PortfolioProfile,
    SkillCategory,
    CareerItem,
    Education,
    Certification,
    PortfolioProject,
} from '../types/portfolio.types';

export const PROFILE: PortfolioProfile = {
    fullName: 'Your Name',

    role: 'Full Stack Developer',

    avatarUrl: '/portfolio/avatar.webp',

    location: 'Việt Nam',

    experience: 'Updating',

    email: '',

    resumeUrl: '/portfolio/resume.pdf',

    resumeCoverUrl: '/portfolio/resume-cover.webp',

    biography: [
        'Tôi quan tâm đến phát triển phần mềm và xây dựng các ứng dụng web hiện đại, tập trung vào trải nghiệm người dùng và khả năng mở rộng hệ thống.',

        'Hiện tại, tôi đang phát triển 72Market, một nền tảng thương mại điện tử kết hợp các module quản lý sản phẩm, xác thực người dùng và quản lý hình ảnh.',

        'Định hướng của tôi là xây dựng các giải pháp phần mềm có khả năng tái sử dụng, dễ bảo trì và có thể triển khai độc lập hoặc phát triển theo mô hình SaaS.',
    ],

    socials: [
        {
            type: 'github',
            label: 'GitHub',
            href: 'https://github.com/BlazikenSGU',
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

export const SKILL_CATEGORIES: SkillCategory[] = [
    {
        id: 'development',
        title: 'Development',
        description:
            'Technologies used in application development.',

        skills: [
            { name: 'JavaScript / TypeScript' },
            { name: 'React' },
            { name: 'Node.js' },
            { name: 'NestJS' },
            { name: 'REST API' },
            { name: 'Tailwind CSS' },
        ],
    },
    {
        id: 'database',
        title: 'Database',
        description:
            'Database and data management technologies.',

        skills: [
            { name: 'PostgreSQL' },
            { name: 'Prisma ORM' },
            { name: 'Neon Database' },
        ],
    },
    {
        id: 'architecture',
        title: 'Architecture',
        description:
            'Software architecture and development practices.',

        skills: [
            { name: 'Design Patterns' },
            { name: 'Modular Architecture' },
            { name: 'JWT Authentication' },
            { name: 'Git & GitHub' },
        ],
    },
];

export const TECHNOLOGIES = [
    'React',
    'TypeScript',
    'JavaScript',
    'NestJS',
    'Node.js',
    'PostgreSQL',
    'Prisma',
    'Tailwind CSS',
    'Vite',
    'TanStack Query',
    'Zustand',
    'GitHub',
    'Cloudflare Pages',
    'ImageKit',
    'Resend',
    'Neon',
];

export const CAREER: CareerItem[] = [];

export const EDUCATION: Education[] = [];

export const CERTIFICATIONS: Certification[] = [];

export const PROJECTS: PortfolioProject[] = [
    {
        id: '72market',
        name: '72Market',
        category: 'E-commerce Platform',

        description:
            'Nền tảng thương mại điện tử dành cho giày bóng đá, tích hợp quản lý sản phẩm, thương hiệu, danh mục và tài khoản người dùng.',

        technologies: [
            'React',
            'NestJS',
            'PostgreSQL',
            'Prisma',
        ],

        demoUrl: '/',
    },
    {
        id: 'product-manager',
        name: 'Product Management',
        category: 'Management Module',

        description:
            'Module quản lý sản phẩm, danh mục, thương hiệu và hình ảnh, định hướng phát triển thành giải pháp độc lập.',

        technologies: [
            'React',
            'NestJS',
            'ImageKit',
        ],
    },
    {
        id: 'identity',
        name: 'Identity & Authentication',
        category: 'Security Module',

        description:
            'Module xác thực tài khoản, JWT, Refresh Token, xác thực email và khôi phục mật khẩu.',

        technologies: [
            'NestJS',
            'JWT',
            'PostgreSQL',
            'Resend',
        ],
    },
];

export const RESUME_FACTS = [
    {
        title: 'Experience',
        description: 'Thông tin kinh nghiệm cập nhật sau.',
    },
    {
        title: 'Education',
        description: 'Thông tin học vấn cập nhật sau.',
    },
    {
        title: 'Industries',
        description: 'E-commerce, Web Applications.',
    },
    {
        title: 'Services',
        description: 'Web Development, API, Software Modules.',
    },
];