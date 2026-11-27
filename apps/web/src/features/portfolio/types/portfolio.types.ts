export type SkillLevel =
  | 'Learning'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert';

export interface Skill {
  name: string;
  level?: SkillLevel;
  progress?: number;
}

export interface SkillCategory {
  id: string;
  title: string;
  description: string;
  skills: Skill[];
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