import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

interface GoogleAdsPlaceholderProps {
  size?: 'banner' | 'rectangle' | 'leaderboard' | 'mobile-banner';
  position?: 'top' | 'sidebar' | 'bottom' | 'inline';
  className?: string;
}

const GoogleAdsPlaceholder: React.FC<GoogleAdsPlaceholderProps> = ({ 
  size = 'rectangle', 
  position = 'sidebar',
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'banner':
        return 'w-full h-24'; // 728x90
      case 'rectangle':
        return 'w-full h-64'; // 300x250
      case 'leaderboard':
        return 'w-full h-20'; // 728x90
      case 'mobile-banner':
        return 'w-full h-16'; // 320x50
      default:
        return 'w-full h-64';
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'mb-8';
      case 'bottom':
        return 'mt-8';
      case 'sidebar':
        return 'sticky top-4';
      case 'inline':
        return 'my-4';
      default:
        return '';
    }
  };

  // In production, this would be replaced with actual Google AdSense code
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Production: Actual Google AdSense placeholder
    return (
      <div className={`${getSizeClasses()} ${getPositionStyles()} ${className}`}>
        <div 
          className="w-full h-full bg-gray-100 border border-gray-200 rounded-lg"
          id="google-ads-container"
        >
          {/* Google AdSense code would go here */}
          <ins 
            className="adsbygoogle w-full h-full block"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-XXXXXXXXXX" // Replace with actual publisher ID
            data-ad-slot="XXXXXXXXXX" // Replace with actual ad slot ID
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // Development: Visual placeholder
  return (
    <div className={`${getSizeClasses()} ${getPositionStyles()} ${className}`}>
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center p-4 text-center">
        <div className="flex items-center mb-2">
          <ExternalLink className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-sm font-medium text-blue-700">Google Ads</span>
        </div>
        
        <div className="text-xs text-blue-600 mb-2">
          {size.charAt(0).toUpperCase() + size.slice(1)} Ad Placement
        </div>
        
        <div className="text-xs text-gray-500 mb-3">
          Position: {position}
        </div>
        
        <div className="flex items-center text-xs text-gray-400">
          <Info className="h-3 w-3 mr-1" />
          <span>Placeholder - Production Ready</span>
        </div>
        
        {/* Mock ad content for development */}
        <div className="mt-3 p-2 bg-white rounded border text-xs text-gray-600 max-w-full">
          <div className="font-medium mb-1">Statistical Software</div>
          <div className="text-gray-500">Professional tools for researchers</div>
          <div className="text-blue-600 mt-1">Learn More →</div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAdsPlaceholder;