'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, FileText, Calendar, Menu, X } from 'lucide-react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import type { TLegalFrontmatter } from '@/lib/content/contentSchema';
import './LegalPageClient.css';

interface LegalPageClientProps {
  frontmatter: TLegalFrontmatter;
  content: string;
  pageType: 'about' | 'privacy-policy' | 'terms-of-service';
}

// Debounce function for performance optimization
const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  }) as T;
};

export default function LegalPageClient({ frontmatter, content, pageType }: LegalPageClientProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  const lastScrollTime = useRef<number>(0);

  // Check user preferences for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check if mobile view with debounced resize handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    const debouncedCheck = debounce(checkMobile, 150);
    window.addEventListener('resize', debouncedCheck);

    return () => window.removeEventListener('resize', debouncedCheck);
  }, []);

  // Optimized scroll tracking with requestAnimationFrame
  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      if (now - lastScrollTime.current < 16) return; // Throttle to ~60fps
      lastScrollTime.current = now;

      requestAnimationFrame(() => {
        const sections = frontmatter.toc.map(item => item.id);
        const scrollPosition = window.scrollY + 100;

        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      });
    };

    const debouncedHandleScroll = debounce(handleScroll, 100);
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', debouncedHandleScroll);
  }, [frontmatter.toc]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  // Optimized ToC click handler
  const handleTocClick = useCallback((sectionId: string) => {
    // Track event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'legal_toc_click', {
        page_type: pageType,
        section_id: sectionId,
        context: 'legal_page',
      });
    }

    // Smooth scroll to section with reduced motion preference
    const element = document.getElementById(sectionId);
    if (element) {
      const scrollOptions: ScrollIntoViewOptions = isReducedMotion
        ? { behavior: 'auto', block: 'start' }
        : { behavior: 'smooth', block: 'start' };

      element.scrollIntoView(scrollOptions);

      // Focus management for accessibility
      element.setAttribute('tabindex', '-1');
      element.focus();
      setTimeout(() => element.removeAttribute('tabindex'), 1000);
    }

    // Close mobile menu if open
    if (isMobile) {
      setIsMenuOpen(false);
    }
  }, [pageType, isMobile, isReducedMotion]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        // Return focus to menu toggle button
        const toggleButton = document.querySelector('[aria-label="Toggle table of contents"]');
        if (toggleButton instanceof HTMLElement) {
          toggleButton.focus();
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isMenuOpen]);

  // Content is already in HTML format (hardcoded)
  const processedContent = content;

  return (
    <div className="min-h-screen bg-gray-50" role="document">
      {/* Skip to content link for accessibility */}
      <a
        href="#content-title"
        className="skip-to-content"
      >
        Skip to main content
      </a>

      <Header />

      {/* Page Header with enhanced accessibility */}
      <header
        className="bg-white border-b"
        aria-labelledby="page-title"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <h1
              id="page-title"
              className="text-3xl font-bold text-gray-900"
              tabIndex={-1}
            >
              {frontmatter.title}
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            {frontmatter.description}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center" aria-label="Last updated date">
              <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
              <time dateTime={frontmatter.updated}>
                Last updated: {new Date(frontmatter.updated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            <div
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
              aria-label={`Document version ${frontmatter.version}`}
            >
              Version {frontmatter.version}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Toggle with enhanced accessibility */}
      {isMobile && (
        <div className="bg-white border-b sticky top-16 z-20">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onKeyDown={(e) => handleKeyDown(e, () => setIsMenuOpen(!isMenuOpen))}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            aria-label="Toggle table of contents"
            aria-expanded={isMenuOpen}
            aria-controls="toc-navigation"
          >
            <span className="font-medium text-gray-900">Table of Contents</span>
            {isMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      {/* Main Content with improved layout and CLS prevention */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[500px]">
          {/* Table of Contents with enhanced accessibility and performance */}
          <aside
            id="toc-navigation"
            className={`
              lg:col-span-1 legal-toc-container
              ${isMobile
                ? (isMenuOpen ? 'block legal-menu-transition' : 'hidden')
                : 'block'
              }
            `}
            aria-hidden={isMobile && !isMenuOpen}
            style={{ contain: 'layout style' }}
          >
            <nav
              ref={tocRef}
              className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
              aria-label="Table of contents"
              role="navigation"
              style={{ willChange: 'transform' }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Table of Contents
              </h2>
              <ul className="space-y-1" role="list">
                {frontmatter.toc.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleTocClick(item.id)}
                      onKeyDown={(e) => handleKeyDown(e, () => handleTocClick(item.id))}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${activeSection === item.id
                          ? 'bg-blue-100 text-blue-700 font-medium ring-2 ring-blue-500 ring-offset-2'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                      aria-current={activeSection === item.id ? 'true' : 'false'}
                      role="menuitem"
                      tabIndex={isMenuOpen || !isMobile ? 0 : -1}
                      data-section-id={item.id}
                    >
                      <span className="flex items-center">
                        {activeSection === item.id && (
                          <span className="w-1 h-1 bg-blue-600 rounded-full mr-2" aria-hidden="true" />
                        )}
                        {item.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Content with improved structure, accessibility and performance */}
          <main className="lg:col-span-3 legal-content-container" style={{ contain: 'layout style paint' }}>
            <article
              ref={contentRef}
              className="prose prose-lg max-w-none bg-white rounded-lg border border-gray-200 p-8 focus:outline-none legal-print-break"
              tabIndex={-1}
              aria-labelledby="content-title"
              style={{ minHeight: '400px' }}
            >
              <h2 id="content-title" className="sr-only">
                {frontmatter.title} Content
              </h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: processedContent
                }}
              />
            </article>

            {/* Version Info with enhanced accessibility and print optimization */}
            <div className="mt-8 bg-gray-100 rounded-lg border border-gray-200 p-6 legal-print-break">
              <p className="text-sm text-gray-600" aria-live="polite">
                <span aria-label="Document version">Document version: {frontmatter.version}</span>
                {' | '}
                <span aria-label="Last updated date">
                  Last updated: {new Date(frontmatter.updated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </p>
            </div>

            {/* Quick Navigation with improved accessibility */}
            <nav
              className="mt-8 flex flex-wrap gap-3"
              aria-label="Page navigation"
              role="navigation"
            >
              <Link
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2 -m-2"
                aria-label="Back to home page"
              >
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" aria-hidden="true" />
                <span>Back to Home</span>
              </Link>
              {pageType !== 'about' && (
                <Link
                  href="/about"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2 -m-2"
                  aria-label="Go to About Us page"
                >
                  <span>About Us</span>
                  <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              )}
              {pageType !== 'privacy-policy' && (
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2 -m-2"
                  aria-label="Go to Privacy Policy page"
                >
                  <span>Privacy Policy</span>
                  <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              )}
              {pageType !== 'terms-of-service' && (
                <Link
                  href="/terms-of-service"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2 -m-2"
                  aria-label="Go to Terms of Service page"
                >
                  <span>Terms of Service</span>
                  <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              )}
            </nav>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}