import React, { useState } from 'react';
import { ChevronDown, ChevronUp, List } from 'lucide-react';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
  onItemClick?: (itemId: string) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ items, onItemClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleItemClick = (itemId: string) => {
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onItemClick?.(itemId);
    }
    // Close mobile ToC after clicking
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg">
      {/* Mobile Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg transition-colors"
          aria-expanded={isExpanded}
          aria-label="Toggle table of contents"
        >
          <div className="flex items-center">
            <List className="w-5 h-5 mr-2 text-blue-600" aria-hidden="true" />
            Table of Contents
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block p-4 border-b border-gray-200">
        <div className="flex items-center">
          <List className="w-5 h-5 mr-2 text-blue-600" aria-hidden="true" />
          <h3 className="font-medium text-gray-900">Table of Contents</h3>
        </div>
      </div>

      {/* Table of Contents List */}
      <nav className={`${isExpanded ? 'block' : 'hidden'} md:block`} role="navigation" aria-label="Table of contents">
        <ul className="p-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full text-left px-2 py-1 rounded-md hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors ${
                  item.level === 2 ? 'text-sm font-medium text-gray-900' : 'text-sm text-gray-600 ml-4'
                }`}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;