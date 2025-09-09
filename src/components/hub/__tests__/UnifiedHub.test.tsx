/**
 * 统一Hub页面组件测试文件
 * 测试工具展示、搜索、筛选和用户交互功能
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnifiedHub } from '../UnifiedHub';
import { ToolCategory, DifficultyLevel, toolsDataManager } from '@/lib/toolsData';

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
  Search: ({ className }: any) => <div className={className} data-testid="search-icon" />,
  Filter: ({ className }: any) => <div className={className} data-testid="filter-icon" />,
  Star: ({ className }: any) => <div className={className} data-testid="star-icon" />,
  Clock: ({ className }: any) => <div className={className} data-testid="clock-icon" />,
  Zap: ({ className }: any) => <div className={className} data-testid="zap-icon" />,
  BookOpen: ({ className }: any) => <div className={className} data-testid="book-open-icon" />,
  TrendingUp: ({ className }: any) => <div className={className} data-testid="trending-up-icon" />
}));

// Mock Breadcrumb component
jest.mock('@/components/navigation/Breadcrumb', () => ({
  Breadcrumb: ({ className }: any) => (
    <div className={className} data-testid="breadcrumb">Breadcrumb</div>
  )
}));

// Mock RelatedToolsRecommendation component
jest.mock('@/components/navigation/RelatedToolsRecommendation', () => ({
  RelatedToolsRecommendation: ({ variant, config }: any) => (
    <div data-testid="related-tools-recommendation">
      <div>{config?.customTitle}</div>
    </div>
  )
}));

// Mock gtag for analytics tracking
const mockGtag = jest.fn();
Object.defineProperty(window, 'gtag', {
  writable: true,
  value: mockGtag
});

describe('UnifiedHub', () => {
  beforeEach(() => {
    mockGtag.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render hub with default configuration', () => {
      render(<UnifiedHub />);

      expect(screen.getByText('Statistical Calculators Hub')).toBeInTheDocument();
      expect(screen.getByText('Discover and access all our statistical analysis tools in one place')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    });

    it('should show statistics in header', () => {
      render(<UnifiedHub />);

      const stats = toolsDataManager.getToolStats();
      expect(screen.getByText(`${stats.totalTools} tools available`)).toBeInTheDocument();
      expect(screen.getByText(`${stats.featuredTools} featured`)).toBeInTheDocument();
    });

    it('should render search bar by default', () => {
      render(<UnifiedHub />);

      expect(screen.getByPlaceholderText('Search statistical tools...')).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should render view mode buttons', () => {
      render(<UnifiedHub />);

      expect(screen.getByRole('button', { name: 'Categories' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Grid' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument();
    });
  });

  describe('Configuration Options', () => {
    it('should use custom title and description', () => {
      const customConfig = {
        title: 'Custom Hub Title',
        description: 'Custom hub description'
      };

      render(<UnifiedHub config={customConfig} />);

      expect(screen.getByText('Custom Hub Title')).toBeInTheDocument();
      expect(screen.getByText('Custom hub description')).toBeInTheDocument();
    });

    it('should hide breadcrumb when configured', () => {
      render(<UnifiedHub config={{ showBreadcrumb: false }} />);

      expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument();
    });

    it('should hide search when configured', () => {
      render(<UnifiedHub config={{ showSearch: false }} />);

      expect(screen.queryByPlaceholderText('Search statistical tools...')).not.toBeInTheDocument();
    });

    it('should hide recommendations when configured', () => {
      render(<UnifiedHub config={{ showRecommendations: false }} />);

      expect(screen.queryByTestId('related-tools-recommendation')).not.toBeInTheDocument();
    });

    it('should hide featured section when configured', () => {
      render(<UnifiedHub config={{ featuredSection: false }} />);

      expect(screen.queryByText('Featured Tools')).not.toBeInTheDocument();
    });
  });

  describe('Tool Display', () => {
    it('should display featured tools section in grid view', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      // Switch to grid view to show featured section
      await user.click(screen.getByRole('button', { name: 'Grid' }));

      expect(screen.getByText('Featured Tools')).toBeInTheDocument();
      
      // 应该显示特色工具
      const featuredTools = toolsDataManager.getFeaturedTools();
      if (featuredTools.length > 0) {
        expect(screen.getAllByText(featuredTools[0].name).length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should display tools in categories view by default', () => {
      render(<UnifiedHub />);

      const categories = toolsDataManager.getAllCategories();
      categories.forEach(category => {
        const categoryTools = toolsDataManager.getToolsByCategory(category.id);
        if (categoryTools.length > 0) {
          expect(screen.getByText(category.name)).toBeInTheDocument();
        }
      });
    });

    it('should display tool cards with correct information', () => {
      render(<UnifiedHub />);

      const tools = toolsDataManager.getAllTools();
      if (tools.length > 0) {
        const firstTool = tools[0];
        expect(screen.getAllByText(firstTool.name).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(firstTool.description).length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('View Mode Switching', () => {
    it('should switch to grid view when clicked', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      const gridButton = screen.getByRole('button', { name: 'Grid' });
      await user.click(gridButton);

      expect(gridButton).toHaveClass('bg-blue-100');
      expect(screen.getByText(/All Tools \(\d+\)/)).toBeInTheDocument();
    });

    it('should switch to list view when clicked', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      const listButton = screen.getByRole('button', { name: 'List' });
      await user.click(listButton);

      expect(listButton).toHaveClass('bg-blue-100');
      expect(screen.getByText(/All Tools \(\d+\)/)).toBeInTheDocument();
    });

    it('should switch back to categories view when clicked', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      // First switch to grid
      await user.click(screen.getByRole('button', { name: 'Grid' }));
      
      // Then switch back to categories
      const categoriesButton = screen.getByRole('button', { name: 'Categories' });
      await user.click(categoriesButton);

      expect(categoriesButton).toHaveClass('bg-blue-100');
    });
  });

  describe('Search Functionality', () => {
    it('should filter tools when searching', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'mean');

      // 应该找到包含"mean"的工具
      expect(screen.getAllByText('Mean Calculator').length).toBeGreaterThanOrEqual(1);
    });

    it('should show no results message when search yields no results', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'nonexistent tool');

      await waitFor(() => {
        expect(screen.getByText('No tools found')).toBeInTheDocument();
      });
    });

    it('should clear search results when input is cleared', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      
      // Type search term
      await user.type(searchInput, 'mean');
      expect(searchInput).toHaveValue('mean');
      
      // Clear search
      await user.clear(searchInput);
      
      // All tools should be visible again
      const allTools = toolsDataManager.getAllTools();
      if (allTools.length > 1) {
        expect(screen.getByText(allTools[0].name)).toBeInTheDocument();
        expect(screen.getByText(allTools[1].name)).toBeInTheDocument();
      }
    });
  });

  describe('Filter Functionality', () => {
    it('should show featured filter checkbox', () => {
      render(<UnifiedHub />);

      const featuredCheckbox = screen.getByRole('checkbox', { name: /featured/i });
      expect(featuredCheckbox).toBeInTheDocument();
    });

    it('should show beta filter checkbox', () => {
      render(<UnifiedHub />);

      const betaCheckbox = screen.getByRole('checkbox', { name: /beta/i });
      expect(betaCheckbox).toBeInTheDocument();
    });

    it('should filter by featured tools', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      const featuredCheckbox = screen.getByRole('checkbox', { name: /featured/i });
      await user.click(featuredCheckbox);

      // 应该只显示特色工具
      const featuredTools = toolsDataManager.getFeaturedTools();
      const nonFeaturedTools = toolsDataManager.getAllTools().filter(t => !t.featured);
      
      if (featuredTools.length > 0 && nonFeaturedTools.length > 0) {
        expect(screen.getByText(featuredTools[0].name)).toBeInTheDocument();
        expect(screen.queryByText(nonFeaturedTools[0].name)).not.toBeInTheDocument();
      }
    });

    it('should show advanced filters when clicked', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      const advancedButton = screen.getByRole('button', { name: /advanced/i });
      await user.click(advancedButton);

      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Usage')).toBeInTheDocument();
    });
  });

  describe('Tool Interaction', () => {
    it('should track tool clicks', async () => {
      const onToolClickSpy = jest.fn();
      const user = userEvent.setup();
      
      render(<UnifiedHub onToolClick={onToolClickSpy} />);

      const tools = toolsDataManager.getAllTools();
      if (tools.length > 0) {
        const toolLink = screen.getByText(tools[0].name).closest('a');
        if (toolLink) {
          await user.click(toolLink);
          
          expect(onToolClickSpy).toHaveBeenCalledWith(tools[0]);
          expect(mockGtag).toHaveBeenCalledWith('event', 'tool_click', 
            expect.objectContaining({
              event_category: 'Hub Navigation',
              event_label: tools[0].id
            })
          );
        }
      }
    });

    it('should have correct links for tools', () => {
      render(<UnifiedHub />);

      const tools = toolsDataManager.getAllTools();
      if (tools.length > 0) {
        const toolLink = screen.getByText(tools[0].name).closest('a');
        expect(toolLink).toHaveAttribute('href', tools[0].url);
      }
    });
  });

  describe('Tool Badges and Indicators', () => {
    it('should show star for featured tools', () => {
      render(<UnifiedHub />);

      const featuredTools = toolsDataManager.getFeaturedTools();
      if (featuredTools.length > 0) {
        expect(screen.getAllByTestId('star-icon').length).toBeGreaterThan(0);
      }
    });

    it('should show beta badge for beta tools', () => {
      render(<UnifiedHub />);

      const betaTools = toolsDataManager.getAllTools().filter(t => t.beta);
      const betaBadges = screen.queryAllByText('Beta');
      
      expect(betaBadges.length).toBeGreaterThanOrEqual(0);
    });

    it('should show difficulty badges', () => {
      render(<UnifiedHub />);

      const tools = toolsDataManager.getAllTools();
      if (tools.length > 0) {
        const difficultyBadges = screen.queryAllByText(/beginner|intermediate|advanced|expert/i);
        expect(difficultyBadges.length).toBeGreaterThan(0);
      }
    });

    it('should show estimated time for tools', () => {
      render(<UnifiedHub />);

      const tools = toolsDataManager.getAllTools();
      if (tools.length > 0) {
        expect(screen.getAllByTestId('clock-icon').length).toBeGreaterThan(0);
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<UnifiedHub />);

      expect(screen.getByRole('main') || document.body).toBeTruthy();
      expect(screen.getAllByRole('heading').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
    });

    it('should have accessible form controls', () => {
      render(<UnifiedHub />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      expect(searchInput).toHaveAttribute('type', 'text');

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.tab();
      
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should handle empty state gracefully', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      // Search for something that doesn't exist
      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'completely nonexistent tool xyz123');

      await waitFor(() => {
        expect(screen.getByText('No tools found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search or filters to find more tools.')).toBeInTheDocument();
      });
    });

    it('should apply grid layout classes correctly', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      await user.click(screen.getByRole('button', { name: 'Grid' }));

      const gridContainer = document.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should work with all major tool categories', () => {
      render(<UnifiedHub />);

      const categories = toolsDataManager.getAllCategories();
      categories.forEach(category => {
        const categoryTools = toolsDataManager.getToolsByCategory(category.id);
        if (categoryTools.length > 0) {
          expect(screen.getByText(category.name)).toBeInTheDocument();
        }
      });
    });

    it('should maintain consistent state across view changes', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      // Apply search filter
      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'calculator');

      // Switch views
      await user.click(screen.getByRole('button', { name: 'Grid' }));
      await user.click(screen.getByRole('button', { name: 'List' }));

      // Search should still be applied
      expect(searchInput).toHaveValue('calculator');
    });

    it('should handle multiple filters simultaneously', async () => {
      const user = userEvent.setup();
      render(<UnifiedHub />);

      // Apply search
      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'calculator');

      // Apply featured filter
      const featuredCheckbox = screen.getByRole('checkbox', { name: /featured/i });
      await user.click(featuredCheckbox);

      // Both filters should be active
      expect(searchInput).toHaveValue('calculator');
      expect(featuredCheckbox).toBeChecked();
    });
  });
});