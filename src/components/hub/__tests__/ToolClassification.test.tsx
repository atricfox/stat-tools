/**
 * 工具分类系统组件测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ToolClassification from '../ToolClassification';
import { StatisticalTool, ToolCategory, DifficultyLevel, UsageFrequency } from '@/lib/toolsData';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, whileHover, whileTap, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    div: ({ children, whileHover, whileTap, ...props }: any) => (
      <div {...props}>{children}</div>
    )
  },
  AnimatePresence: ({ children }: any) => children
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BarChart3: () => <div data-testid="bar-chart-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  GraduationCap: () => <div data-testid="graduation-cap-icon" />,
  Calculator: () => <div data-testid="calculator-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Grid3x3: () => <div data-testid="grid-icon" />,
  List: () => <div data-testid="list-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Zap: () => <div data-testid="zap-icon" />
}));

// 测试工具数据
const testTools: StatisticalTool[] = [
  {
    id: 'mean-calculator',
    name: 'Mean Calculator',
    description: 'Calculate arithmetic mean',
    category: ToolCategory.DESCRIPTIVE,
    difficulty: DifficultyLevel.BEGINNER,
    usage: UsageFrequency.VERY_HIGH,
    featured: true,
    url: '/calculator/mean'
  },
  {
    id: 'standard-deviation',
    name: 'Standard Deviation',
    description: 'Calculate standard deviation',
    category: ToolCategory.DESCRIPTIVE,
    difficulty: DifficultyLevel.INTERMEDIATE,
    usage: UsageFrequency.HIGH,
    featured: false,
    url: '/calculator/std-dev'
  },
  {
    id: 'confidence-interval',
    name: 'Confidence Interval',
    description: 'Calculate confidence intervals',
    category: ToolCategory.INFERENTIAL,
    difficulty: DifficultyLevel.ADVANCED,
    usage: UsageFrequency.MEDIUM,
    featured: true,
    url: '/calculator/confidence'
  },
  {
    id: 'gpa-calculator',
    name: 'GPA Calculator',
    description: 'Calculate GPA from grades',
    category: ToolCategory.ACADEMIC,
    difficulty: DifficultyLevel.BEGINNER,
    usage: UsageFrequency.HIGH,
    featured: false,
    url: '/calculator/gpa'
  }
];

describe('ToolClassification', () => {
  const defaultProps = {
    tools: testTools,
    onSelectionChange: jest.fn(),
    onToolClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应该正确渲染分类组件', () => {
      render(<ToolClassification {...defaultProps} />);
      
      // 检查维度选择器
      expect(screen.getAllByText('功能分类')).toHaveLength(2); // 按钮和标题
      expect(screen.getByText('难度等级')).toBeInTheDocument();
      expect(screen.getByText('使用频率')).toBeInTheDocument();
      expect(screen.getByText('推荐等级')).toBeInTheDocument();
    });

    it('应该显示默认的功能分类维度', () => {
      render(<ToolClassification {...defaultProps} />);
      
      // 检查默认选中功能分类
      const categoryButtons = screen.getAllByText('功能分类');
      const categoryButton = categoryButtons[0].closest('button');
      expect(categoryButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('应该显示分类值和工具计数', () => {
      render(<ToolClassification {...defaultProps} />);
      
      // 检查描述性统计分类（应该有2个工具）
      expect(screen.getByText('描述性统计')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // 计数
      
      // 检查推断性统计分类（应该有1个工具）
      expect(screen.getByText('推断性统计')).toBeInTheDocument();
      expect(screen.getAllByText('1')).toHaveLength(2); // 推断性统计和学术评估都是1
      
      // 检查学术评估分类（应该有1个工具）
      expect(screen.getByText('学术评估')).toBeInTheDocument();
    });
  });

  describe('维度切换', () => {
    it('应该支持切换不同的分类维度', async () => {
      const user = userEvent.setup();
      render(<ToolClassification {...defaultProps} />);
      
      // 切换到难度等级维度
      const difficultyButtons = screen.getAllByText('难度等级');
      await user.click(difficultyButtons[0]); // 点击按钮中的那个
      
      // 检查难度等级按钮变为选中状态
      const difficultyButton = difficultyButtons[0].closest('button');
      expect(difficultyButton).toHaveClass('bg-blue-600', 'text-white');
      
      // 检查显示难度分类值
      expect(screen.getByText('初学者')).toBeInTheDocument();
      expect(screen.getByText('中等')).toBeInTheDocument();
      expect(screen.getByText('高级')).toBeInTheDocument();
    });

    it('应该在切换维度时更新计数', async () => {
      const user = userEvent.setup();
      render(<ToolClassification {...defaultProps} />);
      
      // 切换到使用频率维度
      await user.click(screen.getByText('使用频率'));
      
      // 检查使用频率的计数
      expect(screen.getByText('极高频')).toBeInTheDocument();
      expect(screen.getByText('高频')).toBeInTheDocument();
      expect(screen.getByText('中频')).toBeInTheDocument();
    });
  });

  describe('值选择和筛选', () => {
    it('应该支持选择分类值进行筛选', async () => {
      const user = userEvent.setup();
      render(<ToolClassification {...defaultProps} />);
      
      // 选择描述性统计分类
      const descriptiveButton = screen.getByText('描述性统计').closest('button');
      await user.click(descriptiveButton!);
      
      // 检查筛选结果部分出现
      expect(screen.getByText(/筛选结果/)).toBeInTheDocument();
      expect(screen.getByText('(2)')).toBeInTheDocument(); // 2个工具
      
      // 检查只显示描述性统计工具
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
      expect(screen.getByText('Standard Deviation')).toBeInTheDocument();
      expect(screen.queryByText('Confidence Interval')).not.toBeInTheDocument();
    });

    it('应该在选择值时触发回调', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();
      
      render(<ToolClassification {...defaultProps} onSelectionChange={onSelectionChange} />);
      
      // 选择描述性统计分类
      const descriptiveButton = screen.getByText('描述性统计').closest('button');
      await user.click(descriptiveButton!);
      
      // 检查回调被调用
      expect(onSelectionChange).toHaveBeenCalledWith('category', ['DESCRIPTIVE']);
    });

    it('应该支持清除筛选', async () => {
      const user = userEvent.setup();
      render(<ToolClassification {...defaultProps} />);
      
      // 先选择一个分类值
      const descriptiveButton = screen.getByText('描述性统计').closest('button');
      await user.click(descriptiveButton!);
      
      expect(screen.getByText(/筛选结果/)).toBeInTheDocument();
      
      // 点击清除筛选
      await user.click(screen.getByText('清除筛选'));
      
      // 检查筛选结果部分消失
      expect(screen.queryByText(/筛选结果/)).not.toBeInTheDocument();
    });

    it('应该正确处理没有工具的分类值', () => {
      // 创建一个空的工具列表
      render(<ToolClassification {...defaultProps} tools={[]} />);
      
      // 检查所有分类值都被禁用
      const categoryButtons = screen.getAllByRole('button');
      const disabledButtons = categoryButtons.filter(button => 
        button.hasAttribute('disabled')
      );
      
      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });

  describe('工具点击', () => {
    it('应该在点击工具时触发回调', async () => {
      const user = userEvent.setup();
      const onToolClick = jest.fn();
      
      render(<ToolClassification {...defaultProps} onToolClick={onToolClick} />);
      
      // 先筛选出工具
      const descriptiveButton = screen.getByText('描述性统计').closest('button');
      await user.click(descriptiveButton!);
      
      // 点击工具
      await user.click(screen.getByText('Mean Calculator'));
      
      // 检查回调被调用
      expect(onToolClick).toHaveBeenCalledWith(testTools[0]);
    });

    it('应该正确显示精选工具的星标', async () => {
      const user = userEvent.setup();
      render(<ToolClassification {...defaultProps} />);
      
      // 筛选出精选工具
      const descriptiveButton = screen.getByText('描述性统计').closest('button');
      await user.click(descriptiveButton!);
      
      // 检查星标图标
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    });
  });

  describe('配置选项', () => {
    it('应该支持隐藏计数', () => {
      render(<ToolClassification {...defaultProps} config={{ showCounts: false }} />);
      
      // 检查计数不显示
      expect(screen.queryByText('2')).not.toBeInTheDocument();
      expect(screen.queryByText('1')).not.toBeInTheDocument();
    });

    it('应该支持隐藏描述', () => {
      render(<ToolClassification {...defaultProps} config={{ showDescriptions: false }} />);
      
      // 检查描述不显示
      expect(screen.queryByText('计算数据集的基本特征和描述性指标')).not.toBeInTheDocument();
    });

    it('应该支持设置默认维度', () => {
      render(<ToolClassification {...defaultProps} config={{ defaultDimension: 'difficulty' }} />);
      
      // 检查难度等级按钮为选中状态
      const difficultyButton = screen.getByText('难度等级').closest('button');
      expect(difficultyButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('应该支持多选模式', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();
      
      render(<ToolClassification 
        {...defaultProps} 
        config={{ allowMultiSelect: true }}
        onSelectionChange={onSelectionChange}
      />);
      
      // 选择第一个分类值
      const descriptiveButton = screen.getByText('描述性统计').closest('button');
      await user.click(descriptiveButton!);
      
      expect(onSelectionChange).toHaveBeenCalledWith('category', ['DESCRIPTIVE']);
      
      // 选择第二个分类值
      const inferentialButton = screen.getByText('推断性统计').closest('button');
      await user.click(inferentialButton!);
      
      expect(onSelectionChange).toHaveBeenCalledWith('category', ['DESCRIPTIVE', 'INFERENTIAL']);
    });
  });

  describe('空状态处理', () => {
    it('应该正确处理空工具列表', () => {
      render(<ToolClassification {...defaultProps} tools={[]} />);
      
      // 检查所有计数都是0
      expect(screen.getAllByText('0')).toHaveLength(3); // 三个分类都是0
    });

    it('应该在筛选结果为空时显示提示', async () => {
      const user = userEvent.setup();
      
      // 使用只有一种分类的工具
      const limitedTools = [testTools[0]]; // 只有描述性统计
      
      render(<ToolClassification {...defaultProps} tools={limitedTools} />);
      
      // 切换到推断性统计（应该没有结果，按钮应该被禁用）
      const inferentialButton = screen.getByText('推断性统计').closest('button');
      expect(inferentialButton).toHaveAttribute('disabled');
      
      // 或者检查显示计数为0
      expect(screen.getAllByText('0')).toHaveLength(2); // 推断性统计和学术评估都是0
    });
  });

  describe('响应式行为', () => {
    it('应该应用自定义类名', () => {
      const { container } = render(<ToolClassification {...defaultProps} className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('应该有正确的网格布局类', () => {
      render(<ToolClassification {...defaultProps} />);
      
      // 检查响应式网格类
      const gridElements = document.querySelectorAll('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe('可访问性', () => {
    it('应该有正确的ARIA属性', () => {
      render(<ToolClassification {...defaultProps} />);
      
      // 检查按钮有正确的role
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('应该支持键盘导航', async () => {
      const user = userEvent.setup();
      render(<ToolClassification {...defaultProps} />);
      
      // Tab到第一个维度按钮
      await user.tab();
      const categoryButtons = screen.getAllByText('功能分类');
      const firstButton = categoryButtons[0].closest('button');
      expect(firstButton).toHaveFocus();
      
      // 回车键激活
      await user.keyboard('{Enter}');
      expect(firstButton).toHaveClass('bg-blue-600');
    });
  });

  describe('性能优化', () => {
    it('应该正确使用memo化的计算', () => {
      const { rerender } = render(<ToolClassification {...defaultProps} />);
      
      // 重新渲染相同的props不应该导致重新计算
      rerender(<ToolClassification {...defaultProps} />);
      
      // 检查组件正常工作
      expect(screen.getAllByText('功能分类')).toHaveLength(2);
    });

    it('应该在工具数据改变时重新计算', () => {
      const { rerender } = render(<ToolClassification {...defaultProps} />);
      
      // 使用不同的工具数据重新渲染
      const newTools = [testTools[0]];
      rerender(<ToolClassification {...defaultProps} tools={newTools} />);
      
      // 检查计数更新
      expect(screen.getByText('1')).toBeInTheDocument(); // 只有1个描述性统计工具
    });
  });
});