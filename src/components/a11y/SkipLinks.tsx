/**
 * Skip links for keyboard navigation accessibility
 */

'use client';

export default function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="absolute top-0 left-0 z-[100] bg-white p-2 shadow-lg">
        <a
          href="#main"
          className="inline-block px-4 py-2 text-blue-600 underline hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="ml-2 inline-block px-4 py-2 text-blue-600 underline hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to navigation
        </a>
        <a
          href="#footer"
          className="ml-2 inline-block px-4 py-2 text-blue-600 underline hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Skip to footer
        </a>
      </div>
    </div>
  );
}