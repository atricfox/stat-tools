/**
 * Enhanced unified layout for all statistical calculator tools
 * Includes advanced navigation, sidebar, and improved user experience
 */

'use client'

import React, { useState } from 'react';
import { Menu, X, HelpCircle, Settings } from 'lucide-react';
import Breadcrumbs, { BreadcrumbItem } from '@/components/navigation/Breadcrumbs';
import ToolNavigation from '@/components/navigation/ToolNavigation';

export interface EnhancedToolLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  helpContent?: React.ReactNode;
  showToolNavigation?: boolean;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
  toolId?: string;
  context?: 'student' | 'research' | 'teacher';
  className?: string;
}

const EnhancedToolLayout: React.FC<EnhancedToolLayoutProps> = ({
  title,
  description,
  icon,
  children,
  breadcrumbs = [],
  helpContent,
  showToolNavigation = true,
  showSidebar = false,
  sidebarContent,
  toolId,
  context = 'student',
  className = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-full">
            {sidebarContent || (
              <>
                {showToolNavigation && (
                  <ToolNavigation 
                    currentTool={toolId}
                    showCategories={true}
                    showDescriptions={true}
                    maxVisible={10}
                    className="mb-6"
                  />
                )}
                {helpContent && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                      <HelpCircle className="h-4 w-4 mr-1" />
                      Quick Help
                    </h3>
                    <div className="text-sm text-blue-800">
                      {helpContent}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className={`${showSidebar ? 'lg:ml-80' : ''}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Left side - Menu and Breadcrumbs */}
              <div className="flex items-center space-x-4">
                {showSidebar && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                )}
                
                <Breadcrumbs
                  items={breadcrumbs.length > 0 ? breadcrumbs : undefined}
                  showHome={true}
                  showIcons={true}
                  maxItems={4}
                />
              </div>

              {/* Right side - Context and Help */}
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  context === 'student' ? 'bg-blue-100 text-blue-800' :
                  context === 'research' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {context.charAt(0).toUpperCase() + context.slice(1)} Mode
                </div>
                
                {helpContent && (
                  <button
                    onClick={() => setHelpOpen(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    title="Show help"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Tool Navigation (when not in sidebar) */}
        {showToolNavigation && !showSidebar && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <ToolNavigation
                currentTool={toolId}
                showCategories={false}
                showDescriptions={false}
                maxVisible={6}
              />
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tool Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              {icon}
              <h1 className="text-3xl font-bold text-gray-900 ml-3">{title}</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Tool Content */}
          <div className="space-y-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                © 2024 StatCal. Statistical tools for everyone.
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <button className="text-gray-600 hover:text-gray-900">Privacy</button>
                <button className="text-gray-600 hover:text-gray-900">Terms</button>
                <button className="text-gray-600 hover:text-gray-900">Help</button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Help Modal */}
      {helpOpen && helpContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Help & Documentation</h2>
              <button
                onClick={() => setHelpOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {helpContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedToolLayout;