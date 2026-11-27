import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface Props {
  name: string;
  logoUrl?: string;
}

export default function CompanyLogo({
  name,
  logoUrl,
}: Props) {
  const [failedUrl, setFailedUrl] = useState<string>();

  const showLogo =
    logoUrl && failedUrl !== logoUrl;

  return (
    <div
      className="
        pf-border flex h-16 w-16 shrink-0
        items-center justify-center
        overflow-hidden rounded-xl
        border bg-white p-2
        sm:h-20 sm:w-20
      "
    >
      {showLogo ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(logoUrl)}
          className="h-full w-full object-contain"
        />
      ) : (
        <Building2
          size={28}
          strokeWidth={1.5}
          className="text-neutral-400"
          aria-hidden="true"
        />
      )}
    </div>
  );
}