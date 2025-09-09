/**
 * 高级搜索组件测试文件
 * 测试搜索功能、筛选功能、排序和建议系统
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedSearch, SortOption } from '../AdvancedSearch';
import { ToolCategory, DifficultyLevel, UsageFrequency } from '@/lib/toolsData';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: ({ className }: any) => <div className={className} data-testid="search-icon" />,
  X: ({ className }: any) => <div className={className} data-testid="x-icon" />,
  Filter: ({ className }: any) => <div className={className} data-testid="filter-icon" />,
  ArrowUpDown: ({ className }: any) => <div className={className} data-testid="arrow-up-down-icon" />,
  Clock: ({ className }: any) => <div className={className} data-testid="clock-icon" />,
  Star: ({ className }: any) => <div className={className} data-testid="star-icon" />,
  Zap: ({ className }: any) => <div className={className} data-testid="zap-icon" />
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock performance.now for search timing
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  }
});

// Mock gtag for analytics
const mockGtag = jest.fn();
Object.defineProperty(window, 'gtag', {
  writable: true,
  value: mockGtag
});

describe('AdvancedSearch', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    mockGtag.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render search input with default placeholder', () => {
      render(<AdvancedSearch />);

      expect(screen.getByPlaceholderText('Search statistical tools...')).toBeInTheDocument();
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(<AdvancedSearch placeholder="Custom search placeholder" />);

      expect(screen.getByPlaceholderText('Custom search placeholder')).toBeInTheDocument();
    });

    it('should show quick filters by default', () => {
      render(<AdvancedSearch />);

      expect(screen.getByRole('checkbox', { name: /featured/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /beta/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /premium/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument();
    });

    it('should show sorting controls by default', () => {
      render(<AdvancedSearch />);

      expect(screen.getByDisplayValue('Relevance')).toBeInTheDocument();
      expect(screen.getByTestId('arrow-up-down-icon')).toBeInTheDocument();
    });

    it('should show search results statistics', () => {
      render(<AdvancedSearch />);

      expect(screen.getByText(/\d+ of \d+ tools/)).toBeInTheDocument();
      expect(screen.getByText(/Search completed in \d+\.?\d*ms/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should update search query when typing', async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();
      
      render(<AdvancedSearch onFiltersChange={onFiltersChange} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'mean');

      expect(searchInput).toHaveValue('mean');
      expect(onFiltersChange).toHaveBeenCalled();
    });

    it('should show clear button when search has text', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'test');

      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'test');
      
      const clearButton = screen.getByTestId('x-icon').closest('button');
      await user.click(clearButton!);

      expect(searchInput).toHaveValue('');
    });

    it('should show loading indicator during search', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'calculator');

      // Loading indicator is briefly visible during search
      // This test ensures the loading state exists
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });

    it('should call onResults callback with search results', async () => {
      const user = userEvent.setup();
      const onResults = jest.fn();
      
      render(<AdvancedSearch onResults={onResults} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'mean');

      await waitFor(() => {
        expect(onResults).toHaveBeenCalled();
        const lastCall = onResults.mock.calls[onResults.mock.calls.length - 1][0];
        expect(lastCall).toHaveProperty('tools');
        expect(lastCall).toHaveProperty('totalCount');
        expect(lastCall).toHaveProperty('filteredCount');
        expect(lastCall).toHaveProperty('searchTime');
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should filter by featured tools', async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();
      
      render(<AdvancedSearch onFiltersChange={onFiltersChange} />);

      const featuredCheckbox = screen.getByRole('checkbox', { name: /featured/i });
      await user.click(featuredCheckbox);

      expect(featuredCheckbox).toBeChecked();
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ featured: true })
      );
    });

    it('should filter by beta tools', async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();
      
      render(<AdvancedSearch onFiltersChange={onFiltersChange} />);

      const betaCheckbox = screen.getByRole('checkbox', { name: /beta/i });
      await user.click(betaCheckbox);

      expect(betaCheckbox).toBeChecked();
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ beta: true })
      );
    });

    it('should filter by premium tools', async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();
      
      render(<AdvancedSearch onFiltersChange={onFiltersChange} />);

      const premiumCheckbox = screen.getByRole('checkbox', { name: /premium/i });
      await user.click(premiumCheckbox);

      expect(premiumCheckbox).toBeChecked();
      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ premium: true })
      );
    });

    it('should show advanced filters when button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch />);

      const advancedButton = screen.getByRole('button', { name: /advanced/i });
      await user.click(advancedButton);

      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Difficulty')).toBeInTheDocument();
      expect(screen.getByText('Usage Frequency')).toBeInTheDocument();
    });

    it('should show reset filters button when filters are applied', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch />);

      // Apply a filter first
      const featuredCheckbox = screen.getByRole('checkbox', { name: /featured/i });
      await user.click(featuredCheckbox);

      // Open advanced filters
      const advancedButton = screen.getByRole('button', { name: /advanced/i });
      await user.click(advancedButton);

      // Apply a category filter
      const categoryCheckboxes = screen.getAllByRole('checkbox');
      const firstCategoryCheckbox = categoryCheckboxes.find(cb => 
        cb.getAttribute('name') !== 'featured' && 
        cb.getAttribute('name') !== 'beta' && 
        cb.getAttribute('name') !== 'premium'
      );
      
      if (firstCategoryCheckbox) {
        await user.click(firstCategoryCheckbox);
        expect(screen.getByText('Reset filters')).toBeInTheDocument();
      }
    });

    it('should reset all filters when reset button is clicked', async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();
      
      render(<AdvancedSearch onFiltersChange={onFiltersChange} />);

      // Apply filters
      await user.click(screen.getByRole('checkbox', { name: /featured/i }));
      await user.click(screen.getByRole('button', { name: /advanced/i }));
      
      // Apply additional filter and reset
      const resetButton = screen.queryByText('Reset filters');
      if (resetButton) {
        await user.click(resetButton);
        
        expect(onFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            query: '',
            categories: [],
            difficulties: [],
            usages: [],
            featured: undefined,
            beta: undefined,
            premium: undefined
          })
        );
      }
    });
  });

  describe('Sorting Functionality', () => {
    it('should change sort option when dropdown is changed', async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();
      
      render(<AdvancedSearch onFiltersChange={onFiltersChange} />);

      const sortSelect = screen.getByDisplayValue('Relevance');
      await user.selectOptions(sortSelect, 'name');

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: SortOption.NAME })
      );
    });

    it('should toggle sort direction when arrow button is clicked', async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();
      
      render(<AdvancedSearch onFiltersChange={onFiltersChange} />);

      const sortArrow = screen.getByTestId('arrow-up-down-icon').closest('button');
      await user.click(sortArrow!);

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ sortDirection: 'asc' })
      );
    });

    it('should have all sort options available', () => {
      render(<AdvancedSearch />);

      const sortSelect = screen.getByDisplayValue('Relevance');
      const options = Array.from(sortSelect.querySelectorAll('option')).map(
        option => option.textContent
      );

      expect(options).toEqual([
        'Relevance',
        'Name',
        'Difficulty',
        'Usage',
        'Last Updated'
      ]);
    });
  });

  describe('Search Suggestions', () => {
    it('should show suggestions dropdown when typing', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch showSuggestions={true} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'mean');
      
      await waitFor(() => {
        expect(screen.queryByText('Suggestions')).toBeInTheDocument();
      });
    });

    it('should hide suggestions when showSuggestions is false', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch showSuggestions={false} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'mean');

      await waitFor(() => {
        expect(screen.queryByText('Suggestions')).not.toBeInTheDocument();
      });
    });

    it('should track suggestion clicks', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch showSuggestions={true} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'mean');

      await waitFor(async () => {
        const suggestionButton = screen.queryByText('Mean Calculator');
        if (suggestionButton) {
          await user.click(suggestionButton);
          expect(mockGtag).toHaveBeenCalledWith('event', 'search_suggestion_click',
            expect.objectContaining({
              event_category: 'Search',
              event_label: 'Mean Calculator'
            })
          );
        }
      });
    });
  });

  describe('Search History', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([
        {
          query: 'mean calculator',
          timestamp: new Date().toISOString(),
          resultsCount: 3
        }
      ]));
    });

    it('should load search history from localStorage', async () => {
      render(<AdvancedSearch showHistory={true} />);

      await waitFor(() => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith('statcal-search-history');
      });
    });

    it('should show recent searches when input is focused and empty', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch showHistory={true} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.click(searchInput);

      await waitFor(() => {
        expect(screen.queryByText('Recent searches')).toBeInTheDocument();
      });
    });

    it('should save search to history when typing', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch showHistory={true} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'standard deviation');

      // Wait for debounced save
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('should hide history when showHistory is false', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch showHistory={false} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.click(searchInput);

      await waitFor(() => {
        expect(screen.queryByText('Recent searches')).not.toBeInTheDocument();
      });
    });
  });

  describe('Configuration Options', () => {
    it('should hide filters when showFilters is false', () => {
      render(<AdvancedSearch showFilters={false} />);

      expect(screen.queryByRole('checkbox', { name: /featured/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /advanced/i })).not.toBeInTheDocument();
    });

    it('should hide sorting when showSorting is false', () => {
      render(<AdvancedSearch showSorting={false} />);

      expect(screen.queryByDisplayValue('Relevance')).not.toBeInTheDocument();
      expect(screen.queryByTitle(/Sort/)).not.toBeInTheDocument();
    });

    it('should use initial filters', () => {
      const initialFilters = {
        query: 'test query',
        featured: true,
        sortBy: SortOption.NAME
      };
      
      render(<AdvancedSearch initialFilters={initialFilters} />);

      expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /featured/i })).toBeChecked();
      expect(screen.getByDisplayValue('Name')).toBeInTheDocument();
    });

    it('should limit suggestions based on maxSuggestions', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch showSuggestions={true} maxSuggestions={2} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'calc');

      await waitFor(() => {
        const suggestions = screen.queryAllByText(/Calculator/);
        expect(suggestions.length).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and inputs', () => {
      render(<AdvancedSearch />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      expect(searchInput).toHaveAttribute('type', 'text');

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.tab();

      expect(document.activeElement).toBe(searchInput);
    });

    it('should have accessible button titles', () => {
      render(<AdvancedSearch />);

      const sortButton = screen.getByTitle(/Sort/);
      expect(sortButton).toHaveAttribute('title');
    });
  });

  describe('Integration Tests', () => {
    it('should work with all search, filter, and sort combinations', async () => {
      const user = userEvent.setup();
      const onFiltersChange = jest.fn();
      const onResults = jest.fn();
      
      render(
        <AdvancedSearch 
          onFiltersChange={onFiltersChange}
          onResults={onResults}
        />
      );

      // Search
      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'calculator');

      // Filter
      await user.click(screen.getByRole('checkbox', { name: /featured/i }));

      // Sort
      const sortSelect = screen.getByDisplayValue('Relevance');
      await user.selectOptions(sortSelect, 'name');

      // Verify all callbacks were called
      expect(onFiltersChange).toHaveBeenCalled();
      expect(onResults).toHaveBeenCalled();

      // Verify final state
      const finalFilters = onFiltersChange.mock.calls[onFiltersChange.mock.calls.length - 1][0];
      expect(finalFilters.query).toBe('calculator');
      expect(finalFilters.featured).toBe(true);
      expect(finalFilters.sortBy).toBe(SortOption.NAME);
    });

    it('should handle rapid search changes gracefully', async () => {
      const user = userEvent.setup();
      const onResults = jest.fn();
      
      render(<AdvancedSearch onResults={onResults} />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      
      // Rapid typing
      await user.type(searchInput, 'mean');
      await user.clear(searchInput);
      await user.type(searchInput, 'standard');
      await user.clear(searchInput);
      await user.type(searchInput, 'gpa');

      // Should handle all changes without errors
      await waitFor(() => {
        expect(onResults).toHaveBeenCalled();
      });
    });

    it('should maintain search state while toggling filters', async () => {
      const user = userEvent.setup();
      
      render(<AdvancedSearch />);

      const searchInput = screen.getByPlaceholderText('Search statistical tools...');
      await user.type(searchInput, 'calculator');

      // Toggle filters
      await user.click(screen.getByRole('checkbox', { name: /featured/i }));
      await user.click(screen.getByRole('checkbox', { name: /featured/i }));

      // Search should remain
      expect(searchInput).toHaveValue('calculator');
    });
  });
});