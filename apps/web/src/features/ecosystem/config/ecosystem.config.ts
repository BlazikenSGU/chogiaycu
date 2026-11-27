import type {
  EcosystemProduct,
  DeploymentModel,
} from '../types/ecosystem.types';

export const DEPLOYMENT_LABELS: Record<
  DeploymentModel,
  string
> = {
  saas: 'SaaS',
  'source-code': 'Source Code',
  standalone: 'Standalone',
  api: 'API',
};

export const ECOSYSTEM_PRODUCTS: EcosystemProduct[] = [
  {
    id: 'commerce',
    name: '72Market Commerce',
    description:
      'Nền tảng trưng bày và kinh doanh sản phẩm trực tuyến.',
    icon: 'commerce',
    status: 'live',
    deploymentModels: [],
    href: '/',
  },
  {
    id: 'crm',
    name: '72Market CRM',
    description:
      'Giải pháp cho doanh nghiệp định hình chiến lược, quy trình và hệ thống phần mềm',
    icon: 'crm',
    status: 'development',
    deploymentModels: ['saas', 'source-code'],
  },
  {
    id: 'realestate',
    name: '72Market Real Estate',
    description:
      'Bất động sản, nhà cần bán, phòng trọ cho thuê.',
    icon: 'realestate',
    status: 'development',
    deploymentModels: ['api', 'source-code'],
  },
  {
    id: 'course',
    name: '72Market Course',
    description:
      'Giới thiệu các khóa học cho học viên tiếp cận.',
    icon: 'course',
    status: 'development',
    deploymentModels: ['api', 'standalone'],
  },
];