-- 适配当前数据库架构的种子数据
-- 执行: sqlite3 data/statcal.db < scripts/seed-current-schema.sql

-- ==========================================
-- 1. 计算器组数据
-- ==========================================

INSERT OR IGNORE INTO calculator_groups (name, display_name, sort_order) VALUES
  ('means-weighted', 'Mean & Weighted Average', 1),
  ('dispersion', 'Variance & Standard Deviation', 2),
  ('gpa-grades', 'GPA & Grade Tools', 3),
  ('descriptive-others', 'Other Statistical Tools', 4);

-- ==========================================
-- 2. 计算器数据
-- ==========================================

-- Mean & Weighted Average 组
INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Mean Calculator' as name,
  'Calculate arithmetic mean (average) of a dataset' as description,
  '/calculator/mean' as url,
  cg.id as group_id,
  1 as is_hot,
  0 as is_new,
  1 as sort_order
FROM calculator_groups cg WHERE cg.name = 'means-weighted';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Weighted Mean Calculator',
  'Calculate weighted average with custom weights',
  '/calculator/weighted-mean',
  cg.id,
  0, 0, 2
FROM calculator_groups cg WHERE cg.name = 'means-weighted';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Median Calculator',
  'Compute the median of a dataset',
  '/calculator/median',
  cg.id,
  0, 0, 3
FROM calculator_groups cg WHERE cg.name = 'means-weighted';

-- Variance & Standard Deviation 组
INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Standard Deviation Calculator',
  'Calculate standard deviation (sample/population)',
  '/calculator/standard-deviation',
  cg.id,
  1, 0, 1
FROM calculator_groups cg WHERE cg.name = 'dispersion';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Variance Calculator',
  'Compute variance of a dataset',
  '/calculator/variance',
  cg.id,
  0, 0, 2
FROM calculator_groups cg WHERE cg.name = 'dispersion';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Range Calculator',
  'Calculate the range (max - min) of a dataset',
  '/calculator/range',
  cg.id,
  0, 0, 3
FROM calculator_groups cg WHERE cg.name = 'dispersion';

-- GPA & Grade Tools 组
INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'GPA Calculator',
  'Calculate weighted GPA from grades and credits',
  '/calculator/gpa',
  cg.id,
  1, 0, 1
FROM calculator_groups cg WHERE cg.name = 'gpa-grades';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Unweighted GPA Calculator',
  'Calculate simple unweighted GPA',
  '/calculator/unweighted-gpa',
  cg.id,
  0, 0, 2
FROM calculator_groups cg WHERE cg.name = 'gpa-grades';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Cumulative GPA Calculator',
  'Calculate cumulative GPA across semesters',
  '/calculator/cumulative-gpa',
  cg.id,
  0, 0, 3
FROM calculator_groups cg WHERE cg.name = 'gpa-grades';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Final Grade Calculator',
  'Calculate required final exam score for target grade',
  '/calculator/final-grade',
  cg.id,
  0, 0, 4
FROM calculator_groups cg WHERE cg.name = 'gpa-grades';

INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Semester Grade Calculator',
  'Calculate semester grade from assignments and exams',
  '/calculator/semester-grade',
  cg.id,
  0, 0, 5
FROM calculator_groups cg WHERE cg.name = 'gpa-grades';

-- Other Statistical Tools 组
INSERT OR IGNORE INTO calculators (name, description, url, group_id, is_hot, is_new, sort_order)
SELECT 
  'Percent Error Calculator',
  'Calculate percentage error between measured and actual values',
  '/calculator/percent-error',
  cg.id,
  0, 0, 1
FROM calculator_groups cg WHERE cg.name = 'descriptive-others';

-- ==========================================
-- 3. 基础术语数据 (Glossary)
-- ==========================================

INSERT OR IGNORE INTO glossary_terms (term, slug, definition, content, category, difficulty, seo_meta_description, seo_keywords, created_at, updated_at) VALUES

-- 基础统计概念
('Mean', 'mean', '均值是一组数据所有数值的总和除以数据个数，表示数据的平均水平。', 
'# Mean (均值)

均值（Mean），也称为算术平均数，是统计学中最基本和最常用的集中趋势测量方法。

## 定义
均值是一组数据中所有数值的总和除以数据的个数。用公式表示为：
**均值 = 数据总和 ÷ 数据个数**

## 计算公式
**x̄ = (x₁ + x₂ + x₃ + ... + xₙ) / n**

其中：
- x̄ (读作"x-bar") 表示样本均值  
- x₁, x₂, ..., xₙ 是各个数据值
- n 是数据的个数

## 应用示例
假设一个学生5次考试成绩为：85, 90, 78, 92, 80

计算步骤：
1. 求和：85 + 90 + 78 + 92 + 80 = 425
2. 除以个数：425 ÷ 5 = 85

因此，该学生的平均成绩是85分。

## 使用计算器
使用我们的[Mean Calculator](/calculator/mean)可以快速计算均值：
- 输入数据：85,90,78,92,80
- 立即得到结果：85

## 注意事项
- 均值容易受极值（离群值）影响
- 当数据中存在明显的极值时，可考虑使用中位数
- 均值适用于数值型数据，不适用于分类数据

## 相关概念
- [Median (中位数)](/glossary/median)
- [Mode (众数)](/glossary/mode)  
- [Weighted Mean (加权平均)](/glossary/weighted-mean)', 
'statistics', 'beginner', 
'了解均值的定义、计算方法和应用。学习如何使用均值计算器快速计算数据的平均值。', 
'["mean", "均值", "平均数", "arithmetic mean", "average"]', 
datetime('now'), datetime('now')),

('Median', 'median', '中位数是将数据按大小顺序排列后位于中间位置的数值，不受极值影响。',
'# Median (中位数)

中位数（Median）是将数据按升序或降序排列后位于中间位置的数值，是重要的集中趋势测量方法。

## 定义
中位数是有序数据集中位于中间位置的数值。它将数据分为两等份：50%的数据小于等于中位数，50%的数据大于等于中位数。

## 计算方法

### 奇数个数据
如果数据个数为奇数，中位数就是中间位置的数值。

**例子**：数据为 [3, 7, 9, 12, 15]
- 数据个数：5（奇数）
- 中位数位置：(5+1)/2 = 3
- 中位数：第3个数 = 9

### 偶数个数据  
如果数据个数为偶数，中位数是中间两个数的平均值。

**例子**：数据为 [4, 6, 8, 10, 12, 14]
- 数据个数：6（偶数）
- 中间两个数：第3个(8)和第4个(10)
- 中位数：(8 + 10) / 2 = 9

## 优势特点
1. **稳健性**：不受极值影响
2. **直观性**：容易理解和解释
3. **适用性**：适用于各种分布的数据

## 与均值比较
| 特征 | 中位数 | 均值 |
|------|--------|------|
| 受极值影响 | 不敏感 | 敏感 |
| 计算复杂度 | 需要排序 | 直接计算 |
| 适用场景 | 偏斜分布 | 正态分布 |

## 使用计算器
使用我们的[Median Calculator](/calculator/median)：
- 输入：3,7,9,12,15
- 自动排序并计算中位数
- 结果：9

## 实际应用
- **收入分析**：中位数收入比平均收入更能反映典型水平
- **房价统计**：避免豪宅价格影响的典型房价
- **考试成绩**：了解学生的中等表现水平

## 相关概念
- [Mean (均值)](/glossary/mean)
- [Quartile (四分位数)](/glossary/quartile)
- [Percentile (百分位数)](/glossary/percentile)',
'statistics', 'beginner',
'了解中位数的定义、计算方法和优势。学习中位数与均值的区别，以及在数据分析中的应用。',
'["median", "中位数", "中间值", "统计学", "集中趋势"]',
datetime('now'), datetime('now')),

('Mode', 'mode', '众数是数据集中出现频率最高的数值，用于描述数据的典型特征。',
'# Mode (众数)

众数（Mode）是数据集中出现次数最多的数值，是描述数据集中趋势的重要统计量。

## 定义
众数是指在一组数据中出现频率最高的数值。一个数据集可能有：
- **无众数**：所有数值出现次数相同
- **一个众数**：只有一个数值出现次数最多（单众数）
- **多个众数**：多个数值并列出现次数最多（多众数）

## 计算示例

### 单众数示例
数据：[2, 3, 4, 4, 4, 5, 6]
- 数值4出现3次（最多）
- 众数 = 4

### 多众数示例  
数据：[1, 2, 2, 3, 3, 4]
- 数值2和3都出现2次（并列最多）
- 众数 = 2和3

### 无众数示例
数据：[1, 2, 3, 4, 5]
- 每个数值都只出现1次
- 无众数

## 适用数据类型

### 数值型数据
- 考试成绩、年龄、身高等
- 找出最常见的数值

### 分类数据
- 颜色、品牌、职业等
- 找出最流行的类别

**例子**：服装销售数据
颜色：[红, 蓝, 红, 黑, 红, 白, 蓝, 红]
众数：红色（出现4次）

## 众数的特点

### 优势
1. **适用范围广**：数值型和分类数据都能用
2. **不受极值影响**：稳健的统计量
3. **实际意义明确**：直接反映最常见情况

### 局限性
1. **可能不存在**：所有值出现次数相同时
2. **可能不唯一**：多个值并列最高频率
3. **信息有限**：只关注频率，忽略数值大小

## 与其他统计量比较

| 统计量 | 适用数据 | 受极值影响 | 唯一性 |
|--------|----------|------------|--------|
| 众数 | 数值+分类 | 不受影响 | 可能多个 |
| 中位数 | 数值型 | 不受影响 | 唯一 |
| 均值 | 数值型 | 受影响 | 唯一 |

## 实际应用场景

### 商业分析
- **产品销售**：最畅销的产品型号
- **客户行为**：最常见的购买时间
- **市场调研**：最受欢迎的品牌选择

### 教育统计
- **成绩分析**：最常见的分数段
- **学习时间**：学生最常用的学习时长
- **专业选择**：最热门的专业

### 医疗数据
- **症状分析**：最常见的症状类型
- **治疗方案**：最常用的治疗方法
- **年龄分布**：就诊患者的典型年龄

## 计算工具
虽然众数计算相对简单，但对于大数据集，可以：
1. 使用电子表格软件的MODE函数
2. 编程语言的统计库
3. 在线统计计算器

## 众数与正态分布
在完全对称的正态分布中：
**众数 = 中位数 = 均值**

在偏斜分布中，三者会有差异，众数通常位于分布的峰值处。

## 相关概念
- [Mean (均值)](/glossary/mean)
- [Median (中位数)](/glossary/median)
- [Frequency Distribution (频数分布)](/glossary/frequency-distribution)
- [Central Tendency (集中趋势)](/glossary/central-tendency)',
'statistics', 'beginner',
'了解众数的定义、特点和应用场景。学习众数在不同类型数据中的计算方法和实际意义。',
'["mode", "众数", "最频值", "统计学", "集中趋势", "频率"]',
datetime('now'), datetime('now')),

('Standard Deviation', 'standard-deviation', '标准差是衡量数据分散程度的统计量，表示数据偏离均值的平均距离。',
'# Standard Deviation (标准差)

标准差（Standard Deviation）是衡量数据集中数值分散程度的重要统计量，表示数据点偏离均值的平均距离。

## 定义
标准差描述了数据相对于均值的离散程度。标准差越大，数据越分散；标准差越小，数据越集中。

## 计算公式

### 总体标准差 (σ)
**σ = √[Σ(xi - μ)² / N]**

### 样本标准差 (s)  
**s = √[Σ(xi - x̄)² / (n-1)]**

其中：
- σ (sigma): 总体标准差
- s: 样本标准差  
- μ (mu): 总体均值
- x̄: 样本均值
- N: 总体大小
- n: 样本大小
- n-1: 贝塞尔校正（自由度）

## 计算步骤示例

数据：[2, 4, 6, 8, 10]

### 第1步：计算均值
x̄ = (2+4+6+8+10) / 5 = 6

### 第2步：计算偏差平方
- (2-6)² = 16
- (4-6)² = 4  
- (6-6)² = 0
- (8-6)² = 4
- (10-6)² = 16

### 第3步：求平均（样本标准差）
s² = (16+4+0+4+16) / (5-1) = 40/4 = 10

### 第4步：开平方
s = √10 ≈ 3.16

## 总体 vs 样本标准差

### 何时使用总体标准差
- 拥有全部数据（整个总体）
- 研究对象是有限且完整的集合
- 例子：某班全部学生的成绩

### 何时使用样本标准差  
- 只有部分数据（样本）
- 用样本推断总体特征
- 例子：抽样调查的结果

## 标准差的意义

### 68-95-99.7规则（正态分布）
在正态分布中：
- **68%** 的数据在均值 ± 1个标准差范围内
- **95%** 的数据在均值 ± 2个标准差范围内  
- **99.7%** 的数据在均值 ± 3个标准差范围内

### 实际解释
- **小标准差**：数据集中，变异性小
- **大标准差**：数据分散，变异性大

## 使用计算器
使用我们的[Standard Deviation Calculator](/calculator/standard-deviation)：
- 输入数据：2,4,6,8,10
- 选择样本或总体
- 立即得到标准差结果

## 实际应用

### 质量控制
- **产品重量**：标准差小表示质量稳定
- **制造过程**：监控生产一致性
- **合格率**：评估产品质量变异

### 投资分析
- **股票收益**：标准差衡量投资风险
- **投资组合**：评估收益波动性
- **风险管理**：制定投资策略

### 教育评估
- **考试成绩**：评估学生表现差异
- **教学效果**：比较不同班级表现
- **标准化考试**：制定分数解释标准

### 医学研究
- **治疗效果**：评估治疗方法的稳定性
- **生理指标**：正常值范围的确定
- **药物试验**：评估副作用的变异性

## 标准差 vs 方差

| 特征 | 标准差 | 方差 |
|------|--------|------|
| 单位 | 与原数据相同 | 原数据单位的平方 |
| 直观性 | 更直观 | 较抽象 |
| 计算 | 方差的平方根 | 偏差平方的平均 |
| 应用 | 日常解释 | 数学计算 |

## 影响因素

### 离群值影响
标准差对极值敏感：
- 一个极值可能显著增大标准差
- 考虑使用稳健统计量（如四分位距）

### 样本量影响
- 样本量越大，样本标准差越稳定
- 小样本的标准差变异性较大

## 相关概念
- [Variance (方差)](/glossary/variance)
- [Mean (均值)](/glossary/mean)  
- [Range (极差)](/glossary/range)
- [Coefficient of Variation (变异系数)](/glossary/coefficient-of-variation)',
'statistics', 'intermediate',
'了解标准差的定义、计算方法和实际应用。学习总体与样本标准差的区别，以及68-95-99.7规则。',
'["standard deviation", "标准差", "离散程度", "变异性", "统计分析"]',
datetime('now'), datetime('now')),

('Variance', 'variance', '方差是标准差的平方，用于衡量数据的变异程度，是重要的离散性统计量。',
'# Variance (方差)

方差（Variance）是衡量数据分散程度的基础统计量，定义为各数据点与均值差值的平方的平均数。

## 定义
方差表示数据相对于均值的平均平方偏差，是标准差的平方。方差越大，数据越分散；方差越小，数据越集中。

## 计算公式

### 总体方差 (σ²)
**σ² = Σ(xi - μ)² / N**

### 样本方差 (s²)
**s² = Σ(xi - x̄)² / (n-1)**

其中：
- σ² (sigma squared): 总体方差
- s²: 样本方差
- μ: 总体均值  
- x̄: 样本均值
- N: 总体大小
- n: 样本大小

## 计算步骤示例

数据：[1, 3, 5, 7, 9]

### 第1步：计算均值
x̄ = (1+3+5+7+9) / 5 = 5

### 第2步：计算每个数据与均值的差值
- 1 - 5 = -4
- 3 - 5 = -2  
- 5 - 5 = 0
- 7 - 5 = 2
- 9 - 5 = 4

### 第3步：计算差值的平方
- (-4)² = 16
- (-2)² = 4
- (0)² = 0  
- (2)² = 4
- (4)² = 16

### 第4步：计算平均值（样本方差）
s² = (16+4+0+4+16) / (5-1) = 40/4 = 10

## 总体方差 vs 样本方差

### 总体方差
- 使用全部数据计算
- 分母为 N（数据总数）
- 用于描述已知总体的变异性

### 样本方差
- 使用样本数据估计总体方差
- 分母为 n-1（贝塞尔校正）
- 提供总体方差的无偏估计

### 为什么用 n-1？
贝塞尔校正解决了：
- **自由度减少**：计算均值消耗了1个自由度
- **无偏估计**：使样本方差成为总体方差的无偏估计量
- **统计推断**：为后续假设检验提供正确基础

## 方差的特性

### 数学性质
1. **非负性**：方差 ≥ 0
2. **单位**：原数据单位的平方
3. **可加性**：独立变量的方差可相加
4. **尺度变换**：数据乘以常数c，方差乘以c²

### 统计含义
- **方差 = 0**：所有数据相同
- **方差较小**：数据集中在均值附近
- **方差较大**：数据分散，变异性高

## 使用计算器
使用我们的[Variance Calculator](/calculator/variance)：
- 输入数据：1,3,5,7,9
- 选择总体或样本计算
- 立即得到方差结果：10

## 实际应用

### 质量管理
- **生产过程**：监控产品质量的一致性
- **供应商评估**：比较供应商产品的稳定性
- **六西格玛**：过程能力分析的基础指标

### 金融投资
- **投资风险**：股票收益方差衡量投资风险
- **投资组合**：资产配置的风险分析
- **风险模型**：VaR（风险值）计算的基础

### 科学研究
- **实验设计**：评估测量精度和可重复性
- **假设检验**：ANOVA分析的核心概念
- **回归分析**：解释变量的变异性分解

### 工程应用
- **信号处理**：噪声水平的量化
- **控制系统**：系统稳定性的评估
- **可靠性工程**：产品寿命变异性分析

## 方差分解

### 总方差分解
**总方差 = 组内方差 + 组间方差**

这是ANOVA（方差分析）的基础：
- **组内方差**：各组内部的变异
- **组间方差**：各组均值间的变异

### 实际例子
比较三个班级的考试成绩：
- 总方差：所有学生成绩的方差
- 组内方差：各班内学生成绩的方差
- 组间方差：各班平均成绩间的方差

## 方差 vs 标准差

| 特征 | 方差 | 标准差 |
|------|------|--------|
| 定义 | 偏差平方的平均 | 方差的平方根 |
| 单位 | 原单位的平方 | 与原数据相同 |
| 直观性 | 较难解释 | 更直观 |
| 数学性质 | 便于理论分析 | 便于实际解释 |
| 应用场景 | 统计推断 | 描述性统计 |

## 常见误区

### 计算错误
1. **分母混淆**：总体用N，样本用n-1
2. **单位忽略**：忘记方差的单位是原单位的平方
3. **负方差**：计算错误导致的不可能结果

### 解释错误
1. **绝对大小**：方差大小要结合数据范围判断
2. **比较标准**：不同量纲的数据方差不能直接比较
3. **正态假设**：方差解释需要考虑数据分布

## 高级概念

### 协方差
两个变量间的联合变异：
**Cov(X,Y) = E[(X-μₓ)(Y-μᵧ)]**

### 相关系数
标准化的协方差：
**ρ = Cov(X,Y) / (σₓσᵧ)**

### 条件方差
给定条件下的方差：
**Var(Y|X) = E[(Y-E[Y|X])²|X]**

## 相关概念
- [Standard Deviation (标准差)](/glossary/standard-deviation)
- [Mean (均值)](/glossary/mean)
- [Covariance (协方差)](/glossary/covariance)  
- [Coefficient of Variation (变异系数)](/glossary/coefficient-of-variation)',
'statistics', 'intermediate',
'了解方差的定义、计算方法和统计意义。学习总体方差与样本方差的区别，以及在各领域的应用。',
'["variance", "方差", "变异性", "离散程度", "贝塞尔校正"]',
datetime('now'), datetime('now'));

-- ==========================================
-- 4. 基础内容数据 (slim_content)  
-- ==========================================

-- FAQ类型内容
INSERT OR IGNORE INTO slim_content (title, slug, type, status, featured, priority, target_tool, seo_title, seo_description, reading_time) VALUES

('What''s the difference between mean and median?', 'difference-mean-median', 'faq', 'published', 1, 8, '/calculator/mean', 
'Mean vs Median: Key Differences Explained | StatCal', 
'Learn the key differences between mean and median, when to use each measure of central tendency, and how outliers affect them.', 4),

('When should I use mean vs median?', 'when-use-mean-median', 'faq', 'published', 0, 7, '/calculator/median',
'When to Use Mean vs Median | Statistical Guide | StatCal',
'Discover when to use mean versus median for data analysis. Complete guide with examples and practical applications.', 5),

('What''s the difference between sample and population standard deviation?', 'sample-vs-population-sd', 'faq', 'published', 1, 9, '/calculator/standard-deviation',
'Sample vs Population Standard Deviation | StatCal',
'Understand the difference between sample and population standard deviation, including when to use each and the n-1 correction.', 6),

('What''s the difference between weighted and unweighted GPA?', 'weighted-vs-unweighted-gpa', 'faq', 'published', 1, 8, '/calculator/gpa',
'Weighted vs Unweighted GPA: Complete Guide | StatCal', 
'Learn the differences between weighted and unweighted GPA, how they''re calculated, and which one colleges prefer.', 5);

-- How-to类型内容  
INSERT OR IGNORE INTO slim_content (title, slug, type, status, featured, priority, target_tool, seo_title, seo_description, reading_time) VALUES

('How to Calculate GPA (Grade Point Average)', 'how-calculate-gpa', 'howto', 'published', 0, 9, '/calculator/gpa',
'How to Calculate GPA: Step-by-Step Guide | StatCal',
'Learn how to calculate GPA with our comprehensive step-by-step guide. Includes examples for weighted and unweighted GPA.', 8),

('How to Calculate Mean Step by Step', 'how-calculate-mean', 'howto', 'published', 0, 8, '/calculator/mean', 
'How to Calculate Mean: Complete Step-by-Step Guide | StatCal',
'Master mean calculation with our detailed guide. Includes examples, formulas, and tips for avoiding common mistakes.', 6),

('How to Calculate Median', 'how-calculate-median', 'howto', 'published', 0, 7, '/calculator/median',
'How to Calculate Median: Easy Step-by-Step Method | StatCal', 
'Learn to calculate median for both odd and even number of data points. Includes examples and practical applications.', 5),

('How to Calculate Standard Deviation', 'how-calculate-standard-deviation', 'howto', 'published', 0, 8, '/calculator/standard-deviation',
'How to Calculate Standard Deviation: Complete Guide | StatCal',
'Master standard deviation calculation with our comprehensive guide. Covers both sample and population formulas with examples.', 10);

-- Case study类型内容
INSERT OR IGNORE INTO slim_content (title, slug, type, status, featured, priority, target_tool, seo_title, seo_description, reading_time) VALUES

('Strategic GPA Improvement: From 2.8 to 3.5 in Two Semesters', 'gpa-improvement-case-study', 'case', 'published', 0, 6, '/calculator/cumulative-gpa',
'GPA Improvement Case Study: 2.8 to 3.5 | StatCal',
'Real student case study showing how strategic course selection and study habits improved GPA from 2.8 to 3.5 in two semesters.', 12);

-- ==========================================
-- 5. 内容详情数据 (slim_content_details)
-- ==========================================

-- 为每个content添加详细内容
INSERT OR IGNORE INTO slim_content_details (content_id, content, summary, tags, industry, difficulty) 
SELECT 
    sc.id,
    '# ' || sc.title || '

## 概述
This content provides comprehensive information about ' || sc.title || '.

## 主要内容
- 详细解释和定义
- 实际应用示例  
- 最佳实践建议
- 常见问题解答

## 相关工具
使用我们的' || COALESCE(sc.target_tool, '/calculator') || '进行实际计算。

## 总结
' || sc.title || '是理解统计学的重要概念，通过本内容您可以全面掌握相关知识。',
    
    SUBSTR(sc.seo_description, 1, 200),
    '["statistics", "calculation", "education"]',
    '["education", "general"]',
    'beginner'
FROM slim_content sc
WHERE NOT EXISTS (
    SELECT 1 FROM slim_content_details scd WHERE scd.content_id = sc.id
);

-- ==========================================
-- 6. 更新搜索索引
-- ==========================================

-- 清空并重建搜索索引
DELETE FROM content_search;

INSERT INTO content_search(rowid, title, summary, content)
SELECT 
    sc.id,
    sc.title,
    COALESCE(scd.summary, sc.seo_description),
    COALESCE(scd.content, sc.title)
FROM slim_content sc
LEFT JOIN slim_content_details scd ON sc.id = scd.content_id;

-- ==========================================
-- 7. 验证数据
-- ==========================================

-- 显示插入结果
SELECT 'Data seeding completed!' as status;

SELECT 'Calculator Groups:' as category, COUNT(*) as count FROM calculator_groups
UNION ALL
SELECT 'Calculators:', COUNT(*) FROM calculators  
UNION ALL
SELECT 'Glossary Terms:', COUNT(*) FROM glossary_terms
UNION ALL  
SELECT 'Content Items:', COUNT(*) FROM slim_content
UNION ALL
SELECT 'Content Details:', COUNT(*) FROM slim_content_details
UNION ALL
SELECT 'Search Index:', COUNT(*) FROM content_search;

-- 显示示例数据
SELECT 'Sample Calculators:' as info;
SELECT name, url, is_hot FROM calculators LIMIT 5;

SELECT 'Sample Glossary Terms:' as info;  
SELECT term, slug, category FROM glossary_terms LIMIT 5;

SELECT 'Sample Content:' as info;
SELECT title, type, target_tool FROM slim_content LIMIT 5;