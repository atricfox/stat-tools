/**
 * Reusable result card component for displaying calculation results
 * Supports highlighting, different sizes, and units
 */

import React from 'react';

export interface ResultCardProps {
  value: number | string;
  label: string;
  highlighted?: boolean;
  size?: 'small' | 'medium' | 'large';
  unit?: string;
  description?: string;
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  value,
  label,
  highlighted = false,
  size = 'medium',
  unit,
  description,
  className = ''
}) => {
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const valueClasses = {
    small: 'text-lg font-semibold',
    medium: 'text-2xl font-bold',
    large: 'text-3xl font-bold'
  };

  const labelClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const bgClasses = highlighted 
    ? 'bg-blue-50 border-blue-200' 
    : 'bg-gray-50 border-gray-200';

  return (
    <div className={`rounded-lg border ${bgClasses} ${sizeClasses[size]} text-center ${className}`}>
      <div className={`${valueClasses[size]} ${highlighted ? 'text-blue-600' : 'text-gray-900'} mb-1`}>
        {value}{unit && <span className="text-sm ml-1">{unit}</span>}
      </div>
      <div className={`${labelClasses[size]} ${highlighted ? 'text-blue-600' : 'text-gray-600'}`}>
        {label}
      </div>
      {description && (
        <div className="text-xs text-gray-500 mt-1">
          {description}
        </div>
      )}
    </div>
  );
};

export default ResultCard;