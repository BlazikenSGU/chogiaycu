
import { useEffect, useState } from 'react';

interface BrandLogoProps {
    src?: string | null;
    alt: string;
    className?: string;
}

const FALLBACK_LOGO = '/images/image-not-available.png';

export default function BrandLogo({
    src,
    alt,
    className,
}: BrandLogoProps) {
    const [imageSrc, setImageSrc] = useState(
        src?.trim() || FALLBACK_LOGO,
    );

    useEffect(() => {
        setImageSrc(src?.trim() || FALLBACK_LOGO);
    }, [src]);

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            onError={() => {
                if (imageSrc !== FALLBACK_LOGO) {
                    setImageSrc(FALLBACK_LOGO);
                }
            }}
        />
    );
}
