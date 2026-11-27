import { Mail, Globe } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';

import type { SocialLink } from '../types/portfolio.types';

export const SOCIAL_ICONS = {
  github: SiGithub,
  linkedin: FaLinkedin,
  email: Mail,
  website: Globe,
} satisfies Record<SocialLink['type'], React.ElementType>;