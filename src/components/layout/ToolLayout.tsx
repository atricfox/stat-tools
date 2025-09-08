/**
 * Unified layout for all statistical calculator tools
 * Provides consistent structure, navigation, and styling
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Menu, X } from 'lucide-react';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import ToolNavigation from '@/components/navigation/ToolNavigation';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface ToolLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  helpContent?: React.ReactNode;
  showToolNavigation?: boolean;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  className?: string;
}

const ToolLayout: React.FC<ToolLayoutProps> = ({
  title,
  description,
  icon,
  children,
  breadcrumbs = [],
  helpContent,
  showToolNavigation = true,
  showSidebar = false,
  sidebarContent,
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/tools' },
    ...breadcrumbs
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {defaultBreadcrumbs.map((item, index) => (
              <React.Fragment key={item.href}>
                {index === 0 ? (
                  <Link 
                    href={item.href}
                    className="flex items-center hover:text-blue-500 transition-colors duration-200"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    {index === defaultBreadcrumbs.length - 1 ? (
                      <span className="font-medium text-gray-900" aria-current="page">
                        {item.label}
                      </span>
                    ) : (
                      <Link 
                        href={item.href}
                        className="hover:text-blue-500 transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    )}
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>

        {/* Tool Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {icon}
            <h1 className="text-3xl font-bold text-gray-900 ml-3">{title}</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </header>

        {/* Main Content Area */}
        <main className="mb-8">
          {children}
        </main>

        {/* Help Section (if provided) */}
        {helpContent && (
          <section className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h2>
            {helpContent}
          </section>
        )}
      </div>
    </div>
  );
};

export default ToolLayout;