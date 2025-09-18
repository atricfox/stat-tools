# How-To Content Migration Rules

## 内容解析策略

### 1. 步骤识别规则

#### 标题模式识别
- `## Step 1:`, `## Step 2:` - 明确的步骤编号
- `## Method 1:`, `## Method 2:` - 方法步骤
- `## 操作步骤` - 中文步骤标题
- 动词开头的二级标题：`## Enter your data`, `## Click Calculate`

#### 列表项识别
- 以数字开头：`1. 第一步`, `2. 第二步`
- 以破折号开头：`- 操作项目`
- 以动词开头的列表项作为步骤

### 2. 内容分类规则

#### 介绍内容 (Introduction)
- 第一个二级标题之前的所有内容
- 包含背景说明、使用场景、基本概念

#### 先决条件 (Prerequisites)
- 标题包含关键词：`前提条件`, `准备工作`, `Requirements`, `Prerequisites`
- 列表形式的准备事项

#### 预期结果 (Outcomes)
- 标题包含：`预期结果`, `完成后`, `What You'll Achieve`, `Results`
- 描述完成后的状态或收益

#### 提示和警告
- **提示**: 包含 `tip:`, `💡`, `提示:`, `小贴士`
- **警告**: 包含 `warning:`, `⚠️`, `注意:`, `警告:`

### 3. 具体解析示例

#### 原始内容
```markdown
# Complete Guide to Using the Median Calculator

The median is the middle value in a dataset when numbers are arranged in order.

## When to Use Median Instead of Mean
- Income data (often skewed by high earners)
- Real estate prices (outliers can distort averages)

## Step-by-Step Calculation Process

### Method 1: Manual Calculation
1. **Arrange data in order** (smallest to largest)
2. **Count total values** (n)
3. **Find middle position**

### Method 2: Using Our Calculator
1. **Enter your data** in any format
2. **Click Calculate** - the system automatically sorts
```

#### 解析结果
```json
{
  "introduction": "The median is the middle value in a dataset...",
  "steps": [
    {
      "slug": "step-1",
      "name": "Arrange data in order",
      "description": "Arrange data in order (smallest to largest)"
    },
    {
      "slug": "step-2", 
      "name": "Count total values",
      "description": "Count total values (n)"
    },
    {
      "slug": "step-3",
      "name": "Enter your data",
      "description": "Enter your data in any format: comma-separated, space-separated..."
    }
  ],
  "metadata": {
    "prerequisites": [],
    "outcomes": [],
    "estimated_time": 8
  }
}
```

## 迁移优先级

### 第一阶段：高优先级内容 (5个)
1. `how-to-use-median-calculator` - 有明确步骤结构
2. `how-to-calculate-mean` - 基础计算指南  
3. `how-to-calculate-variance` - 最长内容，需精细处理
4. `how-to-calculate-standard-deviation` - 复杂统计概念
5. `how-to-import-data-from-excel` - 实用性高

### 第二阶段：中等优先级 (4个)
6. `how-to-calculate-range` - 基础概念
7. `how-to-calculate-percent-error` - 特定应用
8. `interpreting-statistical-results` - 解释类内容
9. `basic-data-analysis-workflow` - 工作流程

### 第三阶段：低优先级 (2个)
10. `gpa-improvement-academic-planning` - 特定领域
11. `weighted-average-real-world-applications` - 应用案例

## 质量保证规则

### 步骤完整性检查
- 每个步骤必须有明确的名称和描述
- 步骤顺序逻辑合理
- 避免过长或过短的步骤

### 内容一致性检查  
- 术语使用统一
- 格式保持一致
- 链接和引用有效

### 用户体验验证
- 步骤可操作性
- 说明清晰度
- 示例相关性

## 回滚策略

### 数据备份
- 迁移前备份原始 `content` 字段
- 保留迁移日志用于追踪
- 支持单个或批量回滚

### 渐进式发布
- 先在测试环境验证
- 按优先级分批迁移
- 监控用户反馈调整策略