/**
 * 面包屑导航组件测试文件
 * 测试路径解析、SEO功能和用户交互
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { 
  Breadcrumb, 
  CompactBreadcrumb,
  MinimalBreadcrumb,
  getBreadcrumbData,
  validateBreadcrumbConfig,
  BreadcrumbItem
} from '../Breadcrumb';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronRight: ({ className }: any) => <div className={className} data-testid="chevron-right-icon" />,
  Home: ({ className }: any) => <div className={className} data-testid="home-icon" />
}));

// Mock gtag for analytics tracking
const mockGtag = jest.fn();
Object.defineProperty(window, 'gtag', {
  writable: true,
  value: mockGtag
});

describe('Breadcrumb', () => {
  beforeEach(() => {
    mockGtag.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render breadcrumb for calculator page', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Calculators')).toBeInTheDocument();
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    it('should not render for homepage only', () => {
      const { container } = render(
        <Breadcrumb currentUrl="/" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render home icon by default', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    });

    it('should hide home icon when showHomeIcon is false', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" showHomeIcon={false} />
      );

      expect(screen.queryByTestId('home-icon')).not.toBeInTheDocument();
    });
  });

  describe('Path Parsing', () => {
    it('should parse calculator URL correctly', () => {
      render(
        <Breadcrumb currentUrl="/calculator/standard-deviation" />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Calculators')).toBeInTheDocument();
      expect(screen.getByText('Standard Deviation Calculator')).toBeInTheDocument();
    });

    it('should parse guide URL correctly', () => {
      render(
        <Breadcrumb currentUrl="/guides/how-to-calculate-mean" />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Guides')).toBeInTheDocument();
      expect(screen.getByText('How to Calculate Mean: Complete Guide with Examples')).toBeInTheDocument();
    });

    it('should handle unknown paths gracefully', () => {
      render(
        <Breadcrumb currentUrl="/unknown/path/here" />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('Path')).toBeInTheDocument();
      expect(screen.getByText('Here')).toBeInTheDocument();
    });

    it('should use custom title when provided', () => {
      render(
        <Breadcrumb 
          currentUrl="/calculator/mean" 
          currentTitle="Custom Mean Calculator"
        />
      );

      expect(screen.getByText('Custom Mean Calculator')).toBeInTheDocument();
    });
  });

  describe('Custom Items', () => {
    it('should render custom breadcrumb items', () => {
      const customItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Custom Section', href: '/custom' },
        { label: 'Current Page', isCurrentPage: true }
      ];

      render(
        <Breadcrumb 
          currentUrl="/any/url" 
          customItems={customItems}
        />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Custom Section')).toBeInTheDocument();
      expect(screen.getByText('Current Page')).toBeInTheDocument();
    });

    it('should handle custom items with icons', () => {
      const MockIcon = ({ className }: { className?: string }) => (
        <div className={className} data-testid="mock-icon" />
      );

      const customItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/', icon: MockIcon }
      ];

      render(
        <Breadcrumb 
          currentUrl="/any/url" 
          customItems={customItems}
        />
      );

      expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render compact variant correctly', () => {
      render(
        <CompactBreadcrumb currentUrl="/calculator/mean" />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // 检查紧凑变体特有的样式
      expect(nav.className).toContain('text-xs');
    });

    it('should render minimal variant correctly', () => {
      render(
        <MinimalBreadcrumb currentUrl="/calculator/mean" />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      
      // 检查最小变体特有的样式
      expect(nav.className).toContain('text-sm');
    });

    it('should apply variant-specific icon sizes', () => {
      const { rerender } = render(
        <Breadcrumb currentUrl="/calculator/mean" variant="compact" />
      );

      let homeIcon = screen.getByTestId('home-icon');
      expect(homeIcon.className).toContain('h-3 w-3');

      rerender(<Breadcrumb currentUrl="/calculator/mean" variant="default" />);
      
      homeIcon = screen.getByTestId('home-icon');
      expect(homeIcon.className).toContain('h-4 w-4');
    });
  });

  describe('Separators', () => {
    it('should show separators by default', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const separators = screen.getAllByTestId('chevron-right-icon');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('should hide separators when showSeparator is false', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" showSeparator={false} />
      );

      expect(screen.queryByTestId('chevron-right-icon')).not.toBeInTheDocument();
    });

    it('should use custom separator icon', () => {
      const CustomSeparator = ({ className }: { className?: string }) => (
        <div className={className} data-testid="custom-separator" />
      );

      render(
        <Breadcrumb 
          currentUrl="/calculator/mean" 
          separatorIcon={CustomSeparator}
        />
      );

      expect(screen.getAllByTestId('custom-separator').length).toBeGreaterThan(0);
      expect(screen.queryByTestId('chevron-right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Links and Navigation', () => {
    it('should create clickable links for non-current items', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      const calculatorsLink = screen.getByRole('link', { name: /calculators/i });
      
      expect(homeLink).toHaveAttribute('href', '/');
      expect(calculatorsLink).toHaveAttribute('href', '/calculator');
    });

    it('should not create link for current page', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const currentPageElement = screen.getByText('Mean Calculator');
      expect(currentPageElement.closest('a')).toBeNull();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb navigation');
      
      const currentPageElement = screen.getByText('Mean Calculator');
      // 查找包含aria-current的父元素
      const spanWithAriaCurrent = currentPageElement.closest('span[aria-current="page"]');
      expect(spanWithAriaCurrent).toBeInTheDocument();
    });
  });

  describe('Click Tracking', () => {
    it('should track breadcrumb clicks', () => {
      const onClickSpy = jest.fn();

      render(
        <Breadcrumb 
          currentUrl="/calculator/mean" 
          onItemClick={onClickSpy}
        />
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      fireEvent.click(homeLink);

      expect(onClickSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Home',
          href: '/'
        }),
        0
      );
    });

    it('should send analytics events on click', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      fireEvent.click(homeLink);

      expect(mockGtag).toHaveBeenCalledWith('event', 'breadcrumb_click',
        expect.objectContaining({
          event_category: 'Navigation',
          event_label: '/',
          value: 1
        })
      );
    });
  });

  describe('SEO Features', () => {
    it('should include structured data', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
      expect(structuredDataScript).toBeInTheDocument();
      
      const structuredData = JSON.parse(structuredDataScript!.textContent || '{}');
      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('BreadcrumbList');
      expect(structuredData.itemListElement).toBeDefined();
      expect(structuredData.itemListElement.length).toBeGreaterThan(0);
    });

    it('should have proper title attributes for SEO', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink).toHaveAttribute('title', 'StatCal - Home');
    });

    it('should generate correct structured data positions', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
      const structuredData = JSON.parse(structuredDataScript!.textContent || '{}');
      
      structuredData.itemListElement.forEach((item: any, index: number) => {
        expect(item.position).toBe(index + 1);
        expect(item.name).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      homeLink.focus();
      expect(document.activeElement).toBe(homeLink);
    });

    it('should have proper focus styles', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      expect(homeLink.className).toContain('focus:outline-none');
      expect(homeLink.className).toContain('focus:ring-2');
    });

    it('should have semantic HTML structure', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" />
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should handle text truncation', () => {
      render(
        <Breadcrumb currentUrl="/calculator/mean" variant="compact" />
      );

      const items = document.querySelectorAll('.truncate');
      expect(items.length).toBeGreaterThan(0);
      
      items.forEach(item => {
        expect(item.className).toContain('max-w-20');
      });
    });

    it('should adjust sizes for different variants', () => {
      const { rerender } = render(
        <Breadcrumb currentUrl="/calculator/mean" variant="compact" />
      );

      let nav = screen.getByRole('navigation');
      expect(nav.className).toContain('text-xs');

      rerender(<Breadcrumb currentUrl="/calculator/mean" variant="default" />);
      
      nav = screen.getByRole('navigation');
      expect(nav.className).toContain('text-sm');
    });
  });
});

describe('getBreadcrumbData', () => {
  it('should return correct breadcrumb data for calculator page', () => {
    const data = getBreadcrumbData('/calculator/mean');
    
    expect(data.items.length).toBe(3);
    expect(data.depth).toBe(3);
    expect(data.currentPageTitle).toBe('Mean Calculator');
    expect(data.parentPages.length).toBe(2);
    expect(data.structuredData['@type']).toBe('BreadcrumbList');
  });

  it('should handle homepage correctly', () => {
    const data = getBreadcrumbData('/');
    
    expect(data.items.length).toBe(1);
    expect(data.depth).toBe(1);
    expect(data.currentPageTitle).toBe('Home');
    expect(data.parentPages.length).toBe(0);
  });

  it('should use custom title when provided', () => {
    const data = getBreadcrumbData('/calculator/mean', 'Custom Title');
    
    expect(data.currentPageTitle).toBe('Custom Title');
  });

  it('should generate valid structured data', () => {
    const data = getBreadcrumbData('/calculator/mean');
    
    expect(data.structuredData['@context']).toBe('https://schema.org');
    expect(data.structuredData.itemListElement).toBeInstanceOf(Array);
    expect(data.structuredData.itemListElement.length).toBe(3);
    
    data.structuredData.itemListElement.forEach((item: any, index: number) => {
      expect(item['@type']).toBe('ListItem');
      expect(item.position).toBe(index + 1);
      expect(item.name).toBeTruthy();
    });
  });
});

describe('validateBreadcrumbConfig', () => {
  it('should validate good breadcrumb configuration', () => {
    const goodItems: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Section', href: '/section' },
      { label: 'Current Page', isCurrentPage: true }
    ];

    const validation = validateBreadcrumbConfig(goodItems);
    
    expect(validation.isValid).toBe(true);
    expect(validation.warnings).toHaveLength(0);
  });

  it('should warn about empty configuration', () => {
    const validation = validateBreadcrumbConfig([]);
    
    expect(validation.isValid).toBe(false);
    expect(validation.warnings.some(w => w.includes('Empty breadcrumb'))).toBe(true);
  });

  it('should warn about too deep breadcrumb', () => {
    const deepItems: BreadcrumbItem[] = Array(7).fill(0).map((_, i) => ({
      label: `Level ${i + 1}`,
      href: i < 6 ? `/level${i + 1}` : undefined,
      isCurrentPage: i === 6
    }));

    const validation = validateBreadcrumbConfig(deepItems);
    
    expect(validation.warnings.some(w => w.includes('too deep'))).toBe(true);
  });

  it('should suggest shortening long labels', () => {
    const longLabelItems: BreadcrumbItem[] = [
      { label: 'This is a very long breadcrumb label that exceeds the recommended length', href: '/' }
    ];

    const validation = validateBreadcrumbConfig(longLabelItems);
    
    expect(validation.suggestions.some(s => s.includes('too long'))).toBe(true);
  });

  it('should warn about empty labels', () => {
    const emptyLabelItems: BreadcrumbItem[] = [
      { label: '', href: '/' }
    ];

    const validation = validateBreadcrumbConfig(emptyLabelItems);
    
    expect(validation.warnings.some(w => w.includes('empty label'))).toBe(true);
  });

  it('should suggest removing href from last item', () => {
    const lastItemWithHref: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current Page', href: '/current' }
    ];

    const validation = validateBreadcrumbConfig(lastItemWithHref);
    
    expect(validation.suggestions.some(s => s.includes('should not have href'))).toBe(true);
  });

  it('should suggest homepage link for first item', () => {
    const noHomepageItems: BreadcrumbItem[] = [
      { label: 'Not Home', href: '/not-home' },
      { label: 'Current', isCurrentPage: true }
    ];

    const validation = validateBreadcrumbConfig(noHomepageItems);
    
    expect(validation.suggestions.some(s => s.includes('should link to homepage'))).toBe(true);
  });
});

describe('Integration Tests', () => {
  it('should work with all major calculator URLs', () => {
    const calculatorUrls = [
      '/calculator/mean',
      '/calculator/standard-deviation',
      '/calculator/gpa',
      '/calculator/weighted-mean',
      '/calculator/confidence-interval'
    ];

    calculatorUrls.forEach(url => {
      const { unmount } = render(<Breadcrumb currentUrl={url} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Calculators')).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should maintain consistent structure across different page types', () => {
    const testUrls = [
      { url: '/calculator/mean', expectedLevels: 3 },
      { url: '/guides/how-to-calculate-mean', expectedLevels: 3 },
      { url: '/hub', expectedLevels: 2 }
    ];

    testUrls.forEach(({ url, expectedLevels }) => {
      const data = getBreadcrumbData(url);
      expect(data.depth).toBe(expectedLevels);
    });
  });

  it('should generate consistent structured data format', () => {
    const urls = ['/calculator/mean', '/guides/how-to-calculate-mean', '/hub'];
    
    urls.forEach(url => {
      const data = getBreadcrumbData(url);
      
      expect(data.structuredData['@context']).toBe('https://schema.org');
      expect(data.structuredData['@type']).toBe('BreadcrumbList');
      expect(Array.isArray(data.structuredData.itemListElement)).toBe(true);
    });
  });
});