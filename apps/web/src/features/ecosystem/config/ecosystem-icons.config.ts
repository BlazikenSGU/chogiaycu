import {
  ShoppingCartPlus,
  BuildingComplex,
  MapPinHouse,
  NotebookPen,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import type {
  EcosystemIcon,
} from '../types/ecosystem.types';

export const ECOSYSTEM_ICON_MAP = {
  commerce: ShoppingCartPlus,
  crm: BuildingComplex,
  realestate: MapPinHouse,
  course: NotebookPen,
} satisfies Record<EcosystemIcon, LucideIcon>;