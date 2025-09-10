/**
 * Breadcrumb navigation component
 * Shows the current location within the site hierarchy
 */

'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Calculator, BookOpen, Users, TrendingUp } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  showIcons?: boolean;
  maxItems?: number;
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  showIcons = true,
  maxItems = 5,
  className = ''
}) => {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/',
        icon: Home
      });
    }

    // Map path segments to readable names and icons
    const segmentMap: { [key: string]: { label: string; icon?: any } } = {
      'tools': { label: 'Tools', icon: Calculator },
      'mean': { label: 'Mean Calculator', icon: TrendingUp },
      'median': { label: 'Median Calculator', icon: TrendingUp },
      'mode': { label: 'Mode Calculator', icon: TrendingUp },
      'about': { label: 'About', icon: BookOpen },
      'help': { label: 'Help', icon: BookOpen },
      'docs': { label: 'Documentation', icon: BookOpen },
      'blog': { label: 'Blog', icon: BookOpen },
      'contact': { label: 'Contact', icon: Users },
      'privacy': { label: 'Privacy Policy', icon: BookOpen },
      'terms': { label: 'Terms of Service', icon: BookOpen }
    };

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      const segmentInfo = segmentMap[segment] || { 
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '), 
        icon: BookOpen 
      };

      breadcrumbs.push({
        label: segmentInfo.label,
        href: isLast ? undefined : currentPath,
        icon: showIcons ? segmentInfo.icon : undefined,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();
  
  // Truncate breadcrumbs if they exceed maxItems
  const displayItems = breadcrumbItems.length > maxItems 
    ? [
        breadcrumbItems[0], // Always show home
        { label: '...', href: undefined }, // Ellipsis
        ...breadcrumbItems.slice(-2) // Show last 2 items
      ]
    : breadcrumbItems;

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for root pages
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            )}
            
            {item.label === '...' ? (
              <span className="text-gray-500 px-2">...</span>
            ) : item.href && !item.current ? (
              <Link
                href={item.href as any}
                className="flex items-center px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                {item.label}
              </Link>
            ) : (
              <span className={`flex items-center px-2 py-1 rounded-lg ${
                item.current 
                  ? 'bg-blue-100 text-blue-800 font-medium' 
                  : 'text-gray-900'
              }`}>
                {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': breadcrumbItems.map((item, index) => ({
              '@type': 'ListItem',
              'position': index + 1,
              'name': item.label,
              'item': item.href ? `${window?.location?.origin}${item.href}` : undefined
            }))
          })
        }}
      />
    </nav>
  );
};

export default Breadcrumbs;
