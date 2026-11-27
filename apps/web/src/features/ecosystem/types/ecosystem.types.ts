export type EcosystemStatus =
  | 'live'
  | 'development'
  | 'coming-soon';

export type EcosystemIcon =
  | 'commerce'
  | 'crm'
  | 'realestate'
  | 'course';

export type DeploymentModel =
  | 'saas'
  | 'source-code'
  | 'standalone'
  | 'api';

export interface EcosystemProduct {
  id: string;
  name: string;
  description: string;
  icon: EcosystemIcon;
  status: EcosystemStatus;
  deploymentModels: DeploymentModel[];
  href?: string;
}