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

  // Development: Minimal placeholder
  return (
    <div className={`${getSizeClasses()} ${getPositionStyles()} ${className}`}>
      <div className="w-full h-full bg-gray-100 border border-gray-200 rounded-lg"></div>
    </div>
  );
};

export default GoogleAdsPlaceholder;