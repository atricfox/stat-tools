/**
 * Reusable section component for tool layouts
 * Provides consistent styling for input, results, and help sections
 */

import React from 'react';

export interface ToolSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlighted' | 'compact';
}

const ToolSection: React.FC<ToolSectionProps> = ({
  title,
  children,
  className = '',
  variant = 'default'
}) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 p-6';
  const variantClasses = {
    default: 'shadow-sm',
    highlighted: 'shadow-md ring-1 ring-blue-100',
    compact: 'shadow-sm p-4'
  };

  return (
    <section className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  );
};

export default ToolSection;