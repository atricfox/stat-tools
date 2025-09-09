/**
 * 工具数据配置系统
 * 统一管理所有统计计算器工具的元数据和分类
 * Features: 分层分类、搜索标签、难度评级、使用统计
 */

export enum ToolCategory {
  DESCRIPTIVE = 'descriptive-statistics',
  INFERENTIAL = 'inferential-statistics', 
  ACADEMIC = 'academic-tools',
  PROBABILITY = 'probability-theory',
  REGRESSION = 'regression-analysis',
  EXPERIMENTAL = 'experimental-design'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum UsageFrequency {
  VERY_HIGH = 'very-high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// 工具接口定义
export interface StatisticalTool {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: ToolCategory;
  subcategory?: string;
  difficulty: DifficultyLevel;
  usage: UsageFrequency;
  tags: string[];
  keywords: string[];
  url: string;
  icon?: string;
  featured: boolean;
  premium: boolean;
  beta: boolean;
  estimatedTime: string; // 预计使用时间
  prerequisites?: string[];
  learningResources?: {
    guide?: string;
    video?: string;
    examples?: string[];
  };
  relatedTools: string[]; // 相关工具ID
  lastUpdated: Date;
  version: string;
}

// 分类元数据
export interface CategoryMeta {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  subcategories?: {
    id: string;
    name: string;
    description: string;
  }[];
}

// 分类配置
export const CATEGORY_META: Record<ToolCategory, CategoryMeta> = {
  [ToolCategory.DESCRIPTIVE]: {
    id: ToolCategory.DESCRIPTIVE,
    name: 'Descriptive Statistics',
    description: 'Tools for summarizing and describing data characteristics',
    icon: 'bar-chart-3',
    color: 'blue',
    order: 1,
    subcategories: [
      { id: 'central-tendency', name: 'Central Tendency', description: 'Mean, median, mode calculations' },
      { id: 'dispersion', name: 'Dispersion', description: 'Standard deviation, variance, range' },
      { id: 'distribution', name: 'Distribution', description: 'Skewness, kurtosis, percentiles' }
    ]
  },
  [ToolCategory.INFERENTIAL]: {
    id: ToolCategory.INFERENTIAL,
    name: 'Inferential Statistics',
    description: 'Tools for making predictions and inferences about populations',
    icon: 'trending-up',
    color: 'green',
    order: 2,
    subcategories: [
      { id: 'hypothesis-testing', name: 'Hypothesis Testing', description: 'T-tests, chi-square, ANOVA' },
      { id: 'confidence-intervals', name: 'Confidence Intervals', description: 'Estimation with uncertainty' },
      { id: 'correlation', name: 'Correlation', description: 'Relationship analysis between variables' }
    ]
  },
  [ToolCategory.ACADEMIC]: {
    id: ToolCategory.ACADEMIC,
    name: 'Academic Tools',
    description: 'Educational and academic calculation tools',
    icon: 'graduation-cap',
    color: 'purple',
    order: 3,
    subcategories: [
      { id: 'grading', name: 'Grading', description: 'GPA, grade calculations' },
      { id: 'research', name: 'Research', description: 'Sample size, power analysis' }
    ]
  },
  [ToolCategory.PROBABILITY]: {
    id: ToolCategory.PROBABILITY,
    name: 'Probability Theory',
    description: 'Probability distributions and calculations',
    icon: 'dice-1',
    color: 'orange',
    order: 4,
    subcategories: [
      { id: 'distributions', name: 'Distributions', description: 'Normal, binomial, Poisson' },
      { id: 'combinatorics', name: 'Combinatorics', description: 'Permutations, combinations' }
    ]
  },
  [ToolCategory.REGRESSION]: {
    id: ToolCategory.REGRESSION,
    name: 'Regression Analysis',
    description: 'Linear and non-linear regression tools',
    icon: 'trending-up-down',
    color: 'red',
    order: 5,
    subcategories: [
      { id: 'linear', name: 'Linear Regression', description: 'Simple and multiple linear regression' },
      { id: 'non-linear', name: 'Non-linear', description: 'Polynomial, exponential regression' }
    ]
  },
  [ToolCategory.EXPERIMENTAL]: {
    id: ToolCategory.EXPERIMENTAL,
    name: 'Experimental Design',
    description: 'Tools for designing and analyzing experiments',
    icon: 'flask-conical',
    color: 'teal',
    order: 6,
    subcategories: [
      { id: 'design', name: 'Design', description: 'Sample size, randomization' },
      { id: 'analysis', name: 'Analysis', description: 'ANOVA, factorial designs' }
    ]
  }
};

// 工具数据配置
export const STATISTICAL_TOOLS: StatisticalTool[] = [
  // 描述性统计工具
  {
    id: 'mean-calculator',
    name: 'Mean Calculator',
    description: 'Calculate arithmetic mean (average) of a dataset',
    longDescription: 'Compute the arithmetic mean of numerical data with support for different data formats and automatic outlier detection.',
    category: ToolCategory.DESCRIPTIVE,
    subcategory: 'central-tendency',
    difficulty: DifficultyLevel.BEGINNER,
    usage: UsageFrequency.VERY_HIGH,
    tags: ['mean', 'average', 'central tendency', 'basic statistics'],
    keywords: ['arithmetic mean', 'average calculator', 'central tendency', 'descriptive statistics'],
    url: '/calculator/mean',
    featured: true,
    premium: false,
    beta: false,
    estimatedTime: '2-3 minutes',
    prerequisites: [],
    learningResources: {
      guide: '/guides/how-to-calculate-mean',
      examples: ['student-grades', 'sales-data', 'survey-responses']
    },
    relatedTools: ['standard-deviation-calculator', 'weighted-mean-calculator', 'median-calculator'],
    lastUpdated: new Date('2025-09-09'),
    version: '2.1.0'
  },
  {
    id: 'standard-deviation-calculator',
    name: 'Standard Deviation Calculator',
    description: 'Calculate standard deviation for population and sample data',
    longDescription: 'Compute standard deviation with automatic detection of sample vs population data, including step-by-step calculations and interpretation.',
    category: ToolCategory.DESCRIPTIVE,
    subcategory: 'dispersion',
    difficulty: DifficultyLevel.INTERMEDIATE,
    usage: UsageFrequency.HIGH,
    tags: ['standard deviation', 'variance', 'dispersion', 'spread'],
    keywords: ['standard deviation calculator', 'variance', 'dispersion measures', 'population standard deviation'],
    url: '/calculator/standard-deviation',
    featured: true,
    premium: false,
    beta: false,
    estimatedTime: '3-5 minutes',
    prerequisites: ['basic statistics', 'understanding of mean'],
    learningResources: {
      guide: '/guides/understanding-standard-deviation',
      examples: ['test-scores', 'quality-control', 'financial-data']
    },
    relatedTools: ['mean-calculator', 'variance-calculator', 'coefficient-variation'],
    lastUpdated: new Date('2025-09-09'),
    version: '2.0.0'
  },
  {
    id: 'weighted-mean-calculator',
    name: 'Weighted Mean Calculator',
    description: 'Calculate weighted average with custom weights',
    longDescription: 'Compute weighted means for datasets where different values have different importance or frequency weights.',
    category: ToolCategory.DESCRIPTIVE,
    subcategory: 'central-tendency',
    difficulty: DifficultyLevel.INTERMEDIATE,
    usage: UsageFrequency.MEDIUM,
    tags: ['weighted mean', 'weighted average', 'weights', 'frequency'],
    keywords: ['weighted mean calculator', 'weighted average', 'frequency weights'],
    url: '/calculator/weighted-mean',
    featured: false,
    premium: false,
    beta: false,
    estimatedTime: '3-4 minutes',
    prerequisites: ['understanding of mean', 'concept of weights'],
    learningResources: {
      examples: ['grade-calculations', 'portfolio-returns', 'survey-analysis']
    },
    relatedTools: ['mean-calculator', 'gpa-calculator'],
    lastUpdated: new Date('2025-08-15'),
    version: '1.5.0'
  },
  // 推理统计工具
  {
    id: 'confidence-interval-calculator',
    name: 'Confidence Interval Calculator',
    description: 'Calculate confidence intervals for means and proportions',
    longDescription: 'Generate confidence intervals with customizable confidence levels, supporting both normal and t-distributions.',
    category: ToolCategory.INFERENTIAL,
    subcategory: 'confidence-intervals',
    difficulty: DifficultyLevel.ADVANCED,
    usage: UsageFrequency.MEDIUM,
    tags: ['confidence interval', 'margin of error', 'estimation', 'inference'],
    keywords: ['confidence interval calculator', 'margin of error', 'statistical inference'],
    url: '/calculator/confidence-interval',
    featured: false,
    premium: false,
    beta: false,
    estimatedTime: '5-7 minutes',
    prerequisites: ['descriptive statistics', 'sampling theory', 'normal distribution'],
    learningResources: {
      guide: '/guides/confidence-intervals-explained',
      examples: ['population-estimation', 'quality-control', 'medical-research']
    },
    relatedTools: ['hypothesis-test-calculator', 'sample-size-calculator'],
    lastUpdated: new Date('2025-08-15'),
    version: '1.3.0'
  },
  // 学术工具
  {
    id: 'gpa-calculator',
    name: 'GPA Calculator',
    description: 'Calculate Grade Point Average with multiple grading systems',
    longDescription: 'Comprehensive GPA calculator supporting 4.0, 4.3, and 4.5 grading scales with semester and cumulative calculations.',
    category: ToolCategory.ACADEMIC,
    subcategory: 'grading',
    difficulty: DifficultyLevel.BEGINNER,
    usage: UsageFrequency.HIGH,
    tags: ['gpa', 'grades', 'academic', 'education'],
    keywords: ['gpa calculator', 'grade point average', 'academic grades', 'grading systems'],
    url: '/calculator/gpa',
    featured: true,
    premium: false,
    beta: false,
    estimatedTime: '4-6 minutes',
    prerequisites: [],
    learningResources: {
      guide: '/guides/gpa-calculation-guide',
      examples: ['semester-gpa', 'cumulative-gpa', 'transfer-credits']
    },
    relatedTools: ['weighted-mean-calculator', 'grade-predictor'],
    lastUpdated: new Date('2025-09-09'),
    version: '3.2.0'
  },
  // 未来工具 (计划中)
  {
    id: 'median-calculator',
    name: 'Median Calculator',
    description: 'Find the median value in a dataset',
    longDescription: 'Calculate median values for both odd and even number of data points with automatic sorting and quartile analysis.',
    category: ToolCategory.DESCRIPTIVE,
    subcategory: 'central-tendency',
    difficulty: DifficultyLevel.BEGINNER,
    usage: UsageFrequency.HIGH,
    tags: ['median', 'middle value', 'central tendency', 'quartiles'],
    keywords: ['median calculator', 'middle value', 'quartiles', 'percentiles'],
    url: '/calculator/median',
    featured: false,
    premium: false,
    beta: true,
    estimatedTime: '2-3 minutes',
    prerequisites: [],
    learningResources: {
      examples: ['salary-data', 'house-prices', 'test-scores']
    },
    relatedTools: ['mean-calculator', 'mode-calculator', 'quartile-calculator'],
    lastUpdated: new Date('2025-08-01'),
    version: '1.0.0-beta'
  },
  {
    id: 'correlation-calculator',
    name: 'Correlation Calculator',
    description: 'Calculate correlation coefficients between variables',
    longDescription: 'Compute Pearson, Spearman, and Kendall correlation coefficients with significance testing and scatter plot visualization.',
    category: ToolCategory.INFERENTIAL,
    subcategory: 'correlation',
    difficulty: DifficultyLevel.ADVANCED,
    usage: UsageFrequency.MEDIUM,
    tags: ['correlation', 'relationship', 'pearson', 'spearman'],
    keywords: ['correlation calculator', 'pearson correlation', 'relationship analysis'],
    url: '/calculator/correlation',
    featured: false,
    premium: false,
    beta: true,
    estimatedTime: '5-8 minutes',
    prerequisites: ['descriptive statistics', 'scatter plots', 'linear relationships'],
    learningResources: {
      guide: '/guides/correlation-analysis',
      examples: ['height-weight', 'income-education', 'advertising-sales']
    },
    relatedTools: ['regression-calculator', 'scatter-plot-generator'],
    lastUpdated: new Date('2025-07-15'),
    version: '1.0.0-beta'
  },
  {
    id: 'sample-size-calculator',
    name: 'Sample Size Calculator',
    description: 'Determine optimal sample size for research studies',
    longDescription: 'Calculate minimum sample sizes for different study designs with power analysis and effect size considerations.',
    category: ToolCategory.EXPERIMENTAL,
    subcategory: 'design',
    difficulty: DifficultyLevel.EXPERT,
    usage: UsageFrequency.LOW,
    tags: ['sample size', 'power analysis', 'research design', 'statistics'],
    keywords: ['sample size calculator', 'power analysis', 'research design', 'statistical power'],
    url: '/calculator/sample-size',
    featured: false,
    premium: true,
    beta: false,
    estimatedTime: '8-12 minutes',
    prerequisites: ['hypothesis testing', 'effect sizes', 'statistical power', 'research methodology'],
    learningResources: {
      guide: '/guides/sample-size-determination',
      examples: ['clinical-trials', 'survey-research', 'a-b-testing']
    },
    relatedTools: ['power-analysis-calculator', 'hypothesis-test-calculator'],
    lastUpdated: new Date('2025-06-20'),
    version: '1.2.0'
  }
];

// 工具查找和过滤函数
export class ToolsDataManager {
  private tools: StatisticalTool[];
  private categories: Record<ToolCategory, CategoryMeta>;

  constructor() {
    this.tools = STATISTICAL_TOOLS;
    this.categories = CATEGORY_META;
  }

  // 获取所有工具
  getAllTools(): StatisticalTool[] {
    return this.tools;
  }

  // 获取特色工具
  getFeaturedTools(): StatisticalTool[] {
    return this.tools.filter(tool => tool.featured);
  }

  // 根据分类获取工具
  getToolsByCategory(category: ToolCategory): StatisticalTool[] {
    return this.tools.filter(tool => tool.category === category);
  }

  // 根据难度获取工具
  getToolsByDifficulty(difficulty: DifficultyLevel): StatisticalTool[] {
    return this.tools.filter(tool => tool.difficulty === difficulty);
  }

  // 根据使用频率获取工具
  getToolsByUsage(usage: UsageFrequency): StatisticalTool[] {
    return this.tools.filter(tool => tool.usage === usage);
  }

  // 搜索工具
  searchTools(query: string): StatisticalTool[] {
    const lowercaseQuery = query.toLowerCase();
    return this.tools.filter(tool => 
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery) ||
      tool.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      tool.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
    );
  }

  // 获取相关工具
  getRelatedTools(toolId: string): StatisticalTool[] {
    const tool = this.tools.find(t => t.id === toolId);
    if (!tool) return [];
    
    return this.tools.filter(t => tool.relatedTools.includes(t.id));
  }

  // 根据ID获取工具
  getToolById(id: string): StatisticalTool | undefined {
    return this.tools.find(tool => tool.id === id);
  }

  // 获取分类元数据
  getCategoryMeta(category: ToolCategory): CategoryMeta {
    return this.categories[category];
  }

  // 获取所有分类
  getAllCategories(): CategoryMeta[] {
    return Object.values(this.categories).sort((a, b) => a.order - b.order);
  }

  // 获取工具统计信息
  getToolStats() {
    return {
      totalTools: this.tools.length,
      featuredTools: this.tools.filter(t => t.featured).length,
      betaTools: this.tools.filter(t => t.beta).length,
      premiumTools: this.tools.filter(t => t.premium).length,
      categoryCounts: Object.values(ToolCategory).reduce((acc, category) => {
        acc[category] = this.getToolsByCategory(category).length;
        return acc;
      }, {} as Record<ToolCategory, number>),
      difficultyDistribution: Object.values(DifficultyLevel).reduce((acc, difficulty) => {
        acc[difficulty] = this.getToolsByDifficulty(difficulty).length;
        return acc;
      }, {} as Record<DifficultyLevel, number>)
    };
  }

  // 高级过滤
  filterTools(filters: {
    categories?: ToolCategory[];
    difficulties?: DifficultyLevel[];
    usages?: UsageFrequency[];
    featured?: boolean;
    beta?: boolean;
    premium?: boolean;
    search?: string;
  }): StatisticalTool[] {
    let filteredTools = this.tools;

    if (filters.categories && filters.categories.length > 0) {
      filteredTools = filteredTools.filter(tool => 
        filters.categories!.includes(tool.category)
      );
    }

    if (filters.difficulties && filters.difficulties.length > 0) {
      filteredTools = filteredTools.filter(tool => 
        filters.difficulties!.includes(tool.difficulty)
      );
    }

    if (filters.usages && filters.usages.length > 0) {
      filteredTools = filteredTools.filter(tool => 
        filters.usages!.includes(tool.usage)
      );
    }

    if (filters.featured !== undefined) {
      filteredTools = filteredTools.filter(tool => tool.featured === filters.featured);
    }

    if (filters.beta !== undefined) {
      filteredTools = filteredTools.filter(tool => tool.beta === filters.beta);
    }

    if (filters.premium !== undefined) {
      filteredTools = filteredTools.filter(tool => tool.premium === filters.premium);
    }

    if (filters.search) {
      const searchResults = this.searchTools(filters.search);
      filteredTools = filteredTools.filter(tool => 
        searchResults.some(searchTool => searchTool.id === tool.id)
      );
    }

    return filteredTools;
  }
}

// 默认实例导出
export const toolsDataManager = new ToolsDataManager();

// 工具函数
export function getToolCategoryColor(category: ToolCategory): string {
  return CATEGORY_META[category].color;
}

export function getToolDifficultyBadge(difficulty: DifficultyLevel): {
  label: string;
  color: string;
} {
  const badges = {
    [DifficultyLevel.BEGINNER]: { label: 'Beginner', color: 'green' },
    [DifficultyLevel.INTERMEDIATE]: { label: 'Intermediate', color: 'yellow' },
    [DifficultyLevel.ADVANCED]: { label: 'Advanced', color: 'orange' },
    [DifficultyLevel.EXPERT]: { label: 'Expert', color: 'red' }
  };
  
  return badges[difficulty];
}