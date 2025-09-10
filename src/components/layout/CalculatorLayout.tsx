import React, { ReactNode } from 'react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import Breadcrumb from '@/components/ui/Breadcrumb';
import RelatedTools from '@/components/ui/RelatedTools';
import PopularTools from '@/components/ui/PopularTools';
import GoogleAdsPlaceholder from '@/components/ui/GoogleAdsPlaceholder';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CalculatorLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  currentTool: string;
  toolCategory?: 'statistics' | 'gpa' | 'analysis';
  className?: string;
}

const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  children,
  title,
  description,
  breadcrumbs,
  currentTool,
  toolCategory = 'statistics',
  className = ''
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Breadcrumb items={breadcrumbs} />
        
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
          
          {/* Page Title & Description */}
          {(title || description) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
              )}
              {description && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
              )}
            </div>
          )}

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-7 xl:grid-cols-8 gap-6 lg:gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-4 xl:col-span-5">
              {children}
            </div>
            
            {/* Sidebar Components */}
            <div className="lg:col-span-3 xl:col-span-3 space-y-6">
              <GoogleAdsPlaceholder size="rectangle" position="sidebar" />
              <RelatedTools 
                currentTool={currentTool} 
                category={toolCategory}
              />
              <PopularTools />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CalculatorLayout;
