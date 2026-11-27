export type TechnologyIcon =
  | 'react'
  | 'typescript'
  | 'javascript'
  | 'tailwindcss'
  | 'vite'
  | 'tanstack-query'
  | 'zustand'
  | 'nodejs'
  | 'nestjs'
  | 'rest-api'
  | 'jwt'
  | 'postgresql'
  | 'prisma'
  | 'neon'
  | 'git'
  | 'github'
  | 'cloudflare'
  | 'imagekit'
  | 'resend'
  | 'design-patterns'
  | 'modular-architecture'
  | 'php'
  | 'python'
  | 'laravel'
  | 'fastapi'
  | 'flask'
  | 'frappe'
  | 'erpnext'
  | 'codeigniter'
  | 'vue'
  | 'nextjs'
  | 'html5'
  | 'css3'
  | 'bootstrap'
  | 'alpinejs'
  | 'blade'
  | 'mysql'
  | 'mariadb'
  | 'redis'
  | 'mongodb'
  | 'elasticsearch'
  | 'gitlab'
  | 'docker'
  | 'nginx'
  | 'kubernetes'
  | 'postman'
  | 'cicd'
  | 'github-actions'
  | 'composer'
  | 'aws'
  | 'cloudinary'
  | 'rbac'
  | 'multi-tenant';

export interface Technology {
  id: string;
  name: string;
  icon: TechnologyIcon;
}

export interface SkillCategory {
  id: string;
  title: string;
  description: string;
  skills: Technology[];
}
export interface SocialLink {
  type: 'github' | 'linkedin' | 'email' | 'website';
  label: string;
  href: string;
}

export interface PortfolioProfile {
  fullName: string;
  role: string;
  avatarUrl?: string;
  location: string;
  experience: string;
  email: string;
  biography: string[];
  resumeUrl?: string;
  resumeCoverUrl?: string;
  socials: SocialLink[];
}

export interface CareerItem {
  id: string;
  year: string;
  title: string;
  organization: string;
  description: string;
  type: 'work' | 'education' | 'project';
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  period: string;
  description: string;
  highlights: string[];
  imageUrl?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  imageUrl?: string;
  credentialUrl?: string;
  skills: string[];
}

export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  category: string;
  technologies: string[];
  imageUrl?: string;
  demoUrl?: string;
  sourceUrl?: string;
}