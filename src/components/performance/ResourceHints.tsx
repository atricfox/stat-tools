/**
 * Resource hints component for performance optimization
 */

export interface ResourceHintsProps {
  preconnect?: string[];
  prefetch?: string[];
  preload?: Array<{ href: string; as: string; type?: string }>;
  dnsPrefetch?: string[];
}

export default function ResourceHints({
  preconnect = [],
  prefetch = [],
  preload = [],
  dnsPrefetch = [],
}: ResourceHintsProps) {
  return (
    <>
      {/* DNS Prefetch - Resolve DNS early */}
      {dnsPrefetch.map((url) => (
        <link key={`dns-${url}`} rel="dns-prefetch" href={url} />
      ))}
      
      {/* Preconnect - Establish connection early */}
      {preconnect.map((url) => (
        <link key={`preconnect-${url}`} rel="preconnect" href={url} />
      ))}
      
      {/* Preload - Load critical resources */}
      {preload.map(({ href, as, type }) => (
        <link
          key={`preload-${href}`}
          rel="preload"
          href={href}
          as={as}
          type={type}
          crossOrigin={as === 'font' ? 'anonymous' : undefined}
        />
      ))}
      
      {/* Prefetch - Load resources for future navigation */}
      {prefetch.map((url) => (
        <link key={`prefetch-${url}`} rel="prefetch" href={url} />
      ))}
    </>
  );
}

/**
 * Default resource hints for the application
 */
export const defaultResourceHints: ResourceHintsProps = {
  dnsPrefetch: [
    'https://fonts.googleapis.com',
    'https://www.googletagmanager.com',
  ],
  preconnect: [
    'https://fonts.gstatic.com',
  ],
  preload: [
    // Critical fonts
    {
      href: '/fonts/inter-var.woff2',
      as: 'font',
      type: 'font/woff2',
    },
  ],
  prefetch: [
    // Prefetch popular calculator pages
    '/calculator/mean',
    '/calculator/gpa',
    '/statistics-calculators',
  ],
};