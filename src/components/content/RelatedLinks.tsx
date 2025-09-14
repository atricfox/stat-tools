'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Calculator, Book, HelpCircle, FileText, Lightbulb } from 'lucide-react';

interface RelatedLink {
  type: 'tool' | 'glossary' | 'howto' | 'faq' | 'case';
  title: string;
  url: string;
  description?: string;
}

interface RelatedLinksProps {
  links: RelatedLink[];
  title?: string;
  maxVisible?: number;
  onLinkClick?: (link: RelatedLink) => void;
}

export default function RelatedLinks({ 
  links, 
  title = "Related Content",
  maxVisible = 6,
  onLinkClick 
}: RelatedLinksProps) {
  const [showAll, setShowAll] = React.useState(false);
  
  const visibleLinks = showAll ? links : links.slice(0, maxVisible);
  const hasMore = links.length > maxVisible;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'tool':
        return <Calculator className="w-5 h-5" />;
      case 'glossary':
        return <Book className="w-5 h-5" />;
      case 'faq':
        return <HelpCircle className="w-5 h-5" />;
      case 'howto':
        return <Lightbulb className="w-5 h-5" />;
      case 'case':
        return <FileText className="w-5 h-5" />;
      default:
        return <ChevronRight className="w-5 h-5" />;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tool':
        return 'Calculator';
      case 'glossary':
        return 'Glossary';
      case 'faq':
        return 'FAQ';
      case 'howto':
        return 'How-To';
      case 'case':
        return 'Case Study';
      default:
        return type;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tool':
        return 'text-blue-600 bg-blue-50 border-blue-200 hover:border-blue-400';
      case 'glossary':
        return 'text-purple-600 bg-purple-50 border-purple-200 hover:border-purple-400';
      case 'faq':
        return 'text-green-600 bg-green-50 border-green-200 hover:border-green-400';
      case 'howto':
        return 'text-amber-600 bg-amber-50 border-amber-200 hover:border-amber-400';
      case 'case':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:border-indigo-400';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 hover:border-gray-400';
    }
  };
  
  const handleClick = (link: RelatedLink) => {
    if (onLinkClick) {
      onLinkClick(link);
    }
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'related_link_click', {
        link_type: link.type,
        link_url: link.url,
        link_title: link.title,
        context: 'related_links',
      });
    }
  };
  
  if (links.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-3">
        {visibleLinks.map((link, index) => (
          <Link
            key={`${link.type}-${link.url}-${index}`}
            href={link.url}
            onClick={() => handleClick(link)}
            className={`block p-3 rounded-lg border transition-all ${getTypeColor(link.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(link.type)}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider opacity-75">
                    {getTypeLabel(link.type)}
                  </span>
                </div>
                <p className="font-medium text-gray-900">
                  {link.title}
                </p>
                {link.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {link.description}
                  </p>
                )}
              </div>
              
              <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1 opacity-50" />
            </div>
          </Link>
        ))}
      </div>
      
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAll ? 'Show Less' : `Show ${links.length - maxVisible} More`}
        </button>
      )}
    </div>
  );
}