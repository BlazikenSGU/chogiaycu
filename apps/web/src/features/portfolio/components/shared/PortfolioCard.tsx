import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function PortfolioCard({
  children,
  className = '',
}: Props) {
  return (
    <div className={`pf-card ${className}`}>
      {children}
    </div>
  );
}