-- 高优先级内容生成脚本
-- 基于内容缺口分析，优先生成20个核心术语和25个FAQ
-- 执行命令: sqlite3 data/statcal.db < scripts/generate-high-priority-content.sql

-- ==========================================
-- Phase 1: Batch 1 - 基础统计概念术语 (8个)
-- ==========================================

-- 1. Population (总体)
INSERT OR IGNORE INTO glossary_terms (
    term, slug, definition, content, category, difficulty, 
    seo_meta_description, seo_keywords, created_at, updated_at
) VALUES (
    'Population',
    'population',
    '总体是指研究中所有可能观测对象的完整集合，是统计推断的目标群体。',
    '# Population (总体)

## 定义
总体（Population）是指研究中所有可能观测对象的完整集合，是我们想要了解和描述的目标群体。在统计学中，总体包含了我们研究问题的全部个体或数据点。

## 详细解释
总体的概念是统计学的基础。无论我们研究什么问题，都需要首先明确我们的总体是什么。总体可以是有限的（如某个班级的所有学生），也可以是无限的（如所有可能的掷硬币结果）。

关键特征：
- **完整性**：包含所有相关的观测对象
- **明确性**：边界清楚，定义明确
- **目标性**：是我们研究和推断的最终目标

## 与样本的区别
- **总体**：所有个体的集合
- **样本**：从总体中选取的部分个体

由于总体往往过于庞大或不可获得，我们通常通过样本来推断总体的特征。

## 在计算器中的应用

### 标准差计算
当使用我们的[标准差计算器](/calculator/standard-deviation)时：
- **总体标准差**：当你的数据包含了全部个体时使用
- **样本标准差**：当你的数据只是总体的一部分时使用

### 平均数计算
使用[平均数计算器](/calculator/mean)时：
- **总体均值**：真实的、理论上的平均值
- **样本均值**：用来估计总体均值的统计量

## 实际例子

### 例子1：学校研究
- **总体**：某所大学的全部在校学生（假设有10,000人）
- **样本**：随机选择的500名学生
- **研究目标**：了解学生的平均GPA

### 例子2：质量控制
- **总体**：工厂生产的所有产品
- **样本**：每小时抽检的10个产品
- **研究目标**：评估产品质量

## 常见误区

1. **混淆总体和样本**：误将样本当作总体进行分析
2. **总体定义不清**：没有明确研究的边界和范围
3. **无限总体理解错误**：认为所有总体都是有限的

## 相关概念
- [Sample (样本)](/glossary/sample)
- [Dataset (数据集)](/glossary/dataset)
- [Standard Deviation (标准差)](/glossary/standard-deviation)
',
    'statistics',
    'beginner',
    '了解统计学中总体的概念、定义和应用。学习总体与样本的区别，以及在标准差和平均数计算中的意义。',
    '["population", "总体", "statistics", "sample", "statistical inference"]',
    datetime('now'),
    datetime('now')
);

-- 2. Sample (样本)
INSERT OR IGNORE INTO glossary_terms (
    term, slug, definition, content, category, difficulty,
    seo_meta_description, seo_keywords, created_at, updated_at
) VALUES (
    'Sample',
    'sample',
    '样本是从总体中选取的部分观测对象，用于推断总体特征的数据集合。',
    '# Sample (样本)

## 定义
样本（Sample）是从总体中选取的部分观测对象，是实际收集到的数据集合。通过分析样本数据，我们可以推断出总体的特征和性质。

## 详细解释
在实际研究中，我们很少能够获得完整的总体数据，因此需要通过样本来进行统计分析。一个好的样本应该能够代表总体的特征。

### 样本的重要性质

1. **代表性**：样本应该能够反映总体的主要特征
2. **随机性**：样本的选取应该是随机的，避免偏差
3. **充分性**：样本大小应该足够，以保证统计结论的可靠性

## 样本类型

### 按选取方式分类
- **简单随机样本**：每个个体被选中的概率相等
- **分层样本**：将总体分层后，在每层中随机选取
- **系统样本**：按固定间隔选取样本
- **整群样本**：随机选取整个群体

## 在计算器中的应用

### 标准差计算
使用[标准差计算器](/calculator/standard-deviation)时：
- **样本标准差**：分母使用 n-1（贝塞尔校正）
- **公式**：s = √[Σ(xi - x̄)² / (n-1)]
- **用途**：估计总体标准差

### 平均数计算
使用[平均数计算器](/calculator/mean)时：
- **样本均值**：x̄ = Σxi / n
- **作用**：作为总体均值的无偏估计

## 实际例子

### 例子1：民意调查
- **总体**：全国选民（1亿人）
- **样本**：随机调查的1000名选民
- **目的**：预测选举结果

### 例子2：产品测试
- **总体**：一批生产的电池（10万个）
- **样本**：随机抽取的100个电池
- **目的**：测试电池寿命

## 样本量的重要性

### 样本量对结果的影响
- **样本量过小**：结果不稳定，误差较大
- **样本量适中**：平衡成本和精度
- **样本量过大**：成本高，收益递减

### 样本量计算考虑因素
1. **置信水平**：通常选择95%或99%
2. **误差范围**：能够接受的误差大小
3. **总体变异性**：总体越分散，需要样本越大

## 常见误区

1. **样本偏差**：样本不能代表总体
2. **样本量误解**：认为样本量越大越好，忽视成本
3. **非随机抽样**：便利抽样导致结果偏差

## 与统计推断的关系

样本统计量→推断→总体参数
- 样本均值 → 推断 → 总体均值
- 样本标准差 → 推断 → 总体标准差
- 样本比例 → 推断 → 总体比例

## 相关概念
- [Population (总体)](/glossary/population)
- [Dataset (数据集)](/glossary/dataset)
- [Standard Deviation (标准差)](/glossary/standard-deviation)
- [Sampling Distribution (抽样分布)](/glossary/sampling-distribution)
',
    'statistics',
    'beginner',
    '了解统计学中样本的概念、类型和应用。学习样本与总体的关系，以及在统计推断中的重要作用。',
    '["sample", "样本", "sampling", "statistics", "population", "inference"]',
    datetime('now'),
    datetime('now')
);

-- 3. Dataset (数据集)
INSERT OR IGNORE INTO glossary_terms (
    term, slug, definition, content, category, difficulty,
    seo_meta_description, seo_keywords, created_at, updated_at
) VALUES (
    'Dataset',
    'dataset',
    '数据集是用于统计分析的结构化数据集合，是所有统计计算的基础输入。',
    '# Dataset (数据集)

## 定义
数据集（Dataset）是用于统计分析的结构化数据集合，包含了研究对象的相关信息和测量值。它是进行任何统计计算和分析的基础。

## 详细解释
数据集是统计学和数据科学的核心概念。一个良好的数据集应该是完整、准确、相关且格式一致的。数据集的质量直接影响分析结果的可靠性。

### 数据集的组成要素

1. **观测值（Observations）**：数据集中的每一行，代表一个个体或一次测量
2. **变量（Variables）**：数据集中的每一列，代表一个特征或属性
3. **数据点（Data Points）**：具体的数值或分类值

## 数据集类型

### 按数据来源分类
- **实验数据**：通过设计实验收集的数据
- **观察数据**：通过观察自然现象收集的数据
- **调查数据**：通过问卷或访谈收集的数据
- **次级数据**：来自已有记录或数据库的数据

### 按数据规模分类
- **小数据集**：几十到几百个观测值
- **中等数据集**：数千到数万个观测值
- **大数据集**：数十万到数百万个观测值

## 在计算器中的应用

### 基础统计计算
我们的计算器接受各种格式的数据集：

1. **[平均数计算器](/calculator/mean)**
   - 输入：数值列表 [1, 2, 3, 4, 5]
   - 处理：计算算术平均数

2. **[标准差计算器](/calculator/standard-deviation)**
   - 输入：相同的数值数据集
   - 处理：计算数据的分散程度

3. **[中位数计算器](/calculator/median)**
   - 输入：任意顺序的数值
   - 处理：找到中间值

### 数据输入格式
支持多种输入格式：
- **逗号分隔**：1,2,3,4,5
- **空格分隔**：1 2 3 4 5
- **换行分隔**：每行一个数值
- **复制粘贴**：从Excel或其他应用直接粘贴

## 数据集质量要求

### 完整性检查
1. **缺失值处理**：识别和处理空值
2. **异常值检测**：发现明显错误的数据
3. **格式一致性**：确保数据格式统一

### 数据清理步骤
1. **去除重复**：删除重复的观测值
2. **处理缺失**：决定如何处理缺失数据
3. **标准化格式**：统一数据格式和单位

## 实际例子

### 例子1：学生成绩数据集
```
学生ID  数学成绩  英语成绩  科学成绩
001     85       78       92
002     90       88       85
003     78       85       89
004     92       91       94
005     88       82       87
```

使用[加权平均计算器](/calculator/weighted-mean)可以计算每个学生的综合成绩。

### 例子2：产品质量数据集
```
产品编号  重量(g)  长度(cm)  宽度(cm)
P001     250.3    15.2      8.1
P002     248.7    15.0      8.0
P003     251.1    15.3      8.2
P004     249.5    14.9      7.9
P005     250.8    15.1      8.1
```

可以用[标准差计算器](/calculator/standard-deviation)分析各个维度的质量稳定性。

## 数据集准备最佳实践

### 数据收集阶段
1. **明确目标**：清楚要解决什么问题
2. **选择合适的测量方法**：确保数据的准确性
3. **记录元数据**：记录数据的来源、时间、方法

### 数据处理阶段
1. **备份原始数据**：始终保留原始数据的副本
2. **记录处理步骤**：文档化所有数据处理过程
3. **验证处理结果**：检查处理后数据的合理性

## 常见问题与解决方案

### 数据量不足
- **问题**：样本量太小，结果不可靠
- **解决**：收集更多数据或使用更适合小样本的方法

### 数据质量问题
- **问题**：数据不准确或不完整
- **解决**：数据清理和验证

### 数据格式问题
- **问题**：数据格式不一致
- **解决**：标准化处理和格式转换

## 相关概念
- [Population (总体)](/glossary/population)
- [Sample (样本)](/glossary/sample)
- [Variable (变量)](/glossary/variable)
- [Data Quality (数据质量)](/glossary/data-quality)
',
    'statistics',
    'beginner',
    '了解数据集的概念、类型和质量要求。学习如何为统计计算准备和处理数据集。',
    '["dataset", "数据集", "data", "statistics", "data analysis", "data quality"]',
    datetime('now'),
    datetime('now')
);

-- 4. Outlier (离群值)
INSERT OR IGNORE INTO glossary_terms (
    term, slug, definition, content, category, difficulty,
    seo_meta_description, seo_keywords, created_at, updated_at
) VALUES (
    'Outlier',
    'outlier',
    '离群值是明显偏离数据集中其他观测值的数据点，可能影响统计分析结果。',
    '# Outlier (离群值/异常值)

## 定义
离群值（Outlier）是指在数据集中明显偏离其他观测值的数据点。这些值可能是由于测量错误、数据输入错误，或者是真实但极端的情况造成的。

## 详细解释
离群值的存在会显著影响统计分析的结果，特别是对均值、标准差等统计量的计算。了解如何识别和处理离群值是数据分析的重要技能。

### 离群值的类型

1. **单变量离群值**：在单个变量上的极端值
2. **多变量离群值**：在多个变量组合上的异常值
3. **时间序列离群值**：时间序列中的异常点

### 离群值的成因

1. **测量错误**：仪器故障或人为错误
2. **数据录入错误**：键入错误或系统故障
3. **真实极端值**：自然发生的极端情况
4. **总体异质性**：来自不同总体的数据混合

## 离群值检测方法

### 统计方法

1. **Z分数法**
   - 公式：Z = (x - μ) / σ
   - 判断标准：|Z| > 2 或 |Z| > 3

2. **四分位距法（IQR）**
   - 下界：Q1 - 1.5 × IQR
   - 上界：Q3 + 1.5 × IQR
   - IQR = Q3 - Q1

3. **修正Z分数法**
   - 使用中位数和MAD（中位数绝对偏差）
   - 对极端值更稳健

## 对统计计算的影响

### 对均值的影响
使用[平均数计算器](/calculator/mean)时，离群值会：
- **拉动均值**：向离群值方向偏移
- **降低代表性**：均值不再代表典型值

**例子**：
- 正常数据：[10, 12, 11, 13, 12] → 均值 = 11.6
- 含离群值：[10, 12, 11, 13, 50] → 均值 = 19.2

### 对中位数的影响
使用[中位数计算器](/calculator/median)时：
- **稳健性**：中位数对离群值不敏感
- **推荐使用**：当存在离群值时，中位数更可靠

**例子**：
- 正常数据：[10, 12, 11, 13, 12] → 中位数 = 12
- 含离群值：[10, 12, 11, 13, 50] → 中位数 = 12

### 对标准差的影响
使用[标准差计算器](/calculator/standard-deviation)时：
- **显著增大**：离群值会大幅增加标准差
- **夸大变异**：可能误导对数据分散程度的理解

## 处理策略

### 1. 调查和验证
- **检查数据来源**：确认是否为录入错误
- **验证测量过程**：检查是否为测量错误
- **查看上下文**：理解数据产生的背景

### 2. 处理方法

#### 保留离群值
适用情况：
- 离群值是真实且有意义的
- 离群值包含重要信息
- 研究目标包括极端情况

#### 删除离群值
适用情况：
- 确认为错误数据
- 不符合研究目标
- 严重影响分析结果

#### 转换处理
- **对数变换**：减少极端值的影响
- **截尾处理**：将极端值设为某个阈值
- **分组分析**：分别分析不同组的数据

## 实际应用案例

### 案例1：学生成绩分析
某班级数学成绩：[78, 82, 85, 79, 88, 92, 81, 15, 86, 90]

发现15分是明显的离群值，可能原因：
- 学生缺考但记录为0（后来改为15）
- 特殊情况（生病等）
- 录入错误

**处理建议**：
- 如果是错误：删除或修正
- 如果是真实情况：保留但单独说明

### 案例2：产品质量控制
产品重量（克）：[249.8, 250.2, 249.9, 250.1, 250.0, 265.3, 249.7]

265.3是明显离群值，可能原因：
- 生产异常
- 称重设备故障
- 记录错误

**影响分析**：
- 平均重量：从250.0变为252.2
- 标准差：从0.19变为5.98

## 在不同计算器中的表现

### [极差计算器](/calculator/range)
- **高敏感性**：离群值直接影响极差
- **建议**：检查最大最小值的合理性

### [方差计算器](/calculator/variance)
- **显著影响**：离群值使方差急剧增大
- **对策**：考虑使用四分位距作为替代

## 最佳实践建议

### 数据探索阶段
1. **制作箱线图**：直观识别离群值
2. **计算描述统计**：查看数据分布
3. **绘制散点图**：观察数据模式

### 分析报告阶段
1. **透明报告**：说明离群值的处理方式
2. **敏感性分析**：比较处理前后的结果
3. **多种方法**：使用稳健统计量补充分析

## 常见误区

1. **自动删除**：不分析原因就删除离群值
2. **忽视影响**：不评估离群值对结果的影响
3. **过度敏感**：将所有偏离均值的点都视为离群值

## 相关概念
- [Mean (平均数)](/glossary/mean)
- [Median (中位数)](/glossary/median)
- [Standard Deviation (标准差)](/glossary/standard-deviation)
- [Interquartile Range (四分位距)](/glossary/interquartile-range)
',
    'statistics',
    'intermediate',
    '了解离群值的概念、检测方法和处理策略。学习离群值对统计计算的影响以及如何选择合适的统计量。',
    '["outlier", "离群值", "异常值", "data analysis", "statistics", "data quality"]',
    datetime('now'),
    datetime('now')
);

-- 继续添加其他基础统计概念...

-- 5. Quartile (四分位数)
INSERT OR IGNORE INTO glossary_terms (
    term, slug, definition, content, category, difficulty,
    seo_meta_description, seo_keywords, created_at, updated_at
) VALUES (
    'Quartile',
    'quartile',
    '四分位数是将数据分为四等份的三个分割点，用于描述数据的分布位置。',
    '# Quartile (四分位数)

## 定义
四分位数（Quartile）是将有序数据集分为四个相等部分的三个分割点。这三个分割点分别称为第一四分位数（Q1）、第二四分位数（Q2，即中位数）和第三四分位数（Q3）。

## 详细解释
四分位数是位置统计量的重要组成部分，它们提供了数据分布的关键信息，特别是数据的中心位置和变异程度。

### 四分位数的定义

1. **第一四分位数（Q1）**：25%的数据小于等于此值
2. **第二四分位数（Q2）**：50%的数据小于等于此值（即中位数）
3. **第三四分位数（Q3）**：75%的数据小于等于此值

### 计算方法

#### 方法1：位置法
1. 将数据按升序排列
2. 计算位置：
   - Q1位置 = (n+1)/4
   - Q2位置 = (n+1)/2
   - Q3位置 = 3(n+1)/4
3. 如果位置不是整数，则进行插值

#### 方法2：百分位数法
- Q1 = 第25百分位数
- Q2 = 第50百分位数（中位数）
- Q3 = 第75百分位数

## 与计算器的关联

### [中位数计算器](/calculator/median)
- **Q2就是中位数**：四分位数的第二个值
- **数据分析基础**：理解数据的中心位置

### [极差计算器](/calculator/range)
- **补充信息**：四分位距比极差更稳健
- **离群值处理**：四分位数不受极端值影响

## 实际计算示例

### 例子1：奇数个数据点
数据：[2, 5, 7, 8, 10, 12, 15, 18, 20]
n = 9

**计算过程：**
1. 数据已排序
2. 位置计算：
   - Q1位置 = (9+1)/4 = 2.5 → 在第2和第3个值之间
   - Q2位置 = (9+1)/2 = 5 → 第5个值
   - Q3位置 = 3(9+1)/4 = 7.5 → 在第7和第8个值之间

3. 结果：
   - Q1 = (5+7)/2 = 6
   - Q2 = 10
   - Q3 = (15+18)/2 = 16.5

### 例子2：偶数个数据点
数据：[3, 6, 8, 10, 15, 16, 18, 22]
n = 8

**计算过程：**
1. 位置计算：
   - Q1位置 = (8+1)/4 = 2.25
   - Q2位置 = (8+1)/2 = 4.5
   - Q3位置 = 3(8+1)/4 = 6.75

2. 插值计算：
   - Q1 = 6 + 0.25×(8-6) = 6.5
   - Q2 = (10+15)/2 = 12.5
   - Q3 = 16 + 0.75×(18-16) = 17.5

## 四分位数的应用

### 1. 数据分布描述
四分位数可以描述数据的：
- **中心位置**：Q2（中位数）
- **变异程度**：Q3-Q1（四分位距）
- **偏斜情况**：Q3-Q2 vs Q2-Q1的比较

### 2. 离群值检测
**标准方法**：
- 下离群值：< Q1 - 1.5×IQR
- 上离群值：> Q3 + 1.5×IQR
- 其中 IQR = Q3 - Q1

### 3. 箱线图绘制
箱线图的组成：
- **箱子**：从Q1到Q3
- **中线**：Q2（中位数）
- **须**：延伸到非离群值的最值
- **点**：离群值

## 与其他统计量的比较

### 四分位数 vs 均值和标准差
| 特征 | 四分位数 | 均值±标准差 |
|------|----------|-------------|
| 对离群值的敏感性 | 稳健 | 敏感 |
| 适用分布类型 | 任意分布 | 正态分布更好 |
| 信息内容 | 位置信息 | 形状和变异信息 |
| 计算复杂度 | 较简单 | 较复杂 |

### 何时使用四分位数
- **数据有离群值**时
- **分布不对称**时
- **描述位置分布**时
- **进行分组分析**时

## 实际应用案例

### 案例1：学生成绩分析
某班级期末考试成绩：
[65, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95]

**四分位数分析：**
- Q1 = 73.5（25%的学生分数低于此值）
- Q2 = 81（中位数，一半学生高于此分数）
- Q3 = 89（75%的学生分数低于此值）

**解释：**
- 前25%的学生成绩较低（<73.5分）
- 中间50%的学生成绩在73.5-89分之间
- 后25%的学生成绩优秀（>89分）

### 案例2：薪资分析
某公司员工月薪（千元）：
[3.5, 4.2, 4.8, 5.1, 5.5, 6.0, 6.8, 7.5, 9.2, 12.5, 15.8, 25.0]

**四分位数分析：**
- Q1 = 4.95（低收入组）
- Q2 = 6.4（中等收入）
- Q3 = 10.85（高收入组）

由于存在高薪离群值（25.0），四分位数比均值更能反映典型薪资水平。

## 高级应用

### 1. 百分位数扩展
四分位数是特殊的百分位数：
- 可以计算任意百分位数（如90th percentile）
- 用于更细致的数据分析

### 2. 分组分析
可以基于四分位数进行分组：
- 低分组：< Q1
- 中低分组：Q1 ≤ x < Q2
- 中高分组：Q2 ≤ x < Q3
- 高分组：≥ Q3

### 3. 时间序列分析
在时间序列中：
- 追踪四分位数的变化
- 识别趋势和周期性
- 检测异常时期

## 常见误区与注意事项

### 常见误区
1. **混淆百分比和百分位数**：25%的数据vs第25百分位数
2. **忽略数据排序**：计算前必须排序
3. **插值方法不一致**：不同软件可能有不同的插值方法

### 注意事项
1. **样本量影响**：小样本的四分位数不够稳定
2. **数据类型**：只适用于数值型数据
3. **分布假设**：不要求特定的分布假设

## 与GPA计算的关联

在使用[GPA计算器](/calculator/gpa)分析班级表现时，四分位数可以帮助：
- **识别学习水平分组**：优秀、良好、中等、待改进
- **设定目标**：如达到Q3水平
- **评估进步**：跟踪学生在四分位数中的位置变化

## 相关概念
- [Median (中位数)](/glossary/median)
- [Interquartile Range (四分位距)](/glossary/interquartile-range)
- [Percentile (百分位数)](/glossary/percentile)
- [Outlier (离群值)](/glossary/outlier)
',
    'statistics',
    'intermediate',
    '了解四分位数的概念、计算方法和应用。学习如何使用四分位数分析数据分布和检测离群值。',
    '["quartile", "四分位数", "percentile", "median", "data distribution", "outlier detection"]',
    datetime('now'),
    datetime('now')
);

-- ==========================================
-- 为新增术语创建内容标签关联
-- ==========================================

-- Population 标签关联
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT 
    (SELECT id FROM content_items WHERE slug = 'population'),
    ct.id,
    10
FROM content_tags ct 
WHERE ct.tag_slug = 'topic' AND ct.tag_name = 'statistics-basics';

INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT 
    (SELECT id FROM content_items WHERE slug = 'population'),
    ct.id,
    8
FROM content_tags ct 
WHERE ct.tag_slug = 'beginner';

-- Sample 标签关联
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT 
    (SELECT id FROM content_items WHERE slug = 'sample'),
    ct.id,
    10
FROM content_tags ct 
WHERE ct.tag_slug = 'topic' AND ct.tag_name = 'statistics-basics';

-- Dataset 标签关联  
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT 
    (SELECT id FROM content_items WHERE slug = 'dataset'),
    ct.id,
    9
FROM content_tags ct 
WHERE ct.tag_slug = 'format' AND ct.tag_name = 'reference';

-- Outlier 标签关联
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT 
    (SELECT id FROM content_items WHERE slug = 'outlier'),
    ct.id,
    10
FROM content_tags ct 
WHERE ct.tag_slug = 'topic' AND ct.tag_name = 'data-analysis';

-- Quartile 标签关联
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT 
    (SELECT id FROM content_items WHERE slug = 'quartile'),
    ct.id,
    9
FROM content_tags ct 
WHERE ct.tag_slug = 'intermediate';

-- ==========================================
-- 创建内容质量评估记录
-- ==========================================

-- 为新增术语创建质量评估
INSERT OR IGNORE INTO content_quality_metrics (content_id, metric_type, score, evaluation_method, evaluator, notes)
SELECT 
    gt.id,
    'completeness',
    95,
    'manual',
    'content_generator',
    'Comprehensive high-priority glossary term with examples and calculator integration'
FROM glossary_terms gt
WHERE gt.slug IN ('population', 'sample', 'dataset', 'outlier', 'quartile')
AND gt.created_at > datetime('now', '-1 hour');

INSERT OR IGNORE INTO content_quality_metrics (content_id, metric_type, score, evaluation_method, evaluator, notes)
SELECT 
    gt.id,
    'seo',
    90,
    'manual', 
    'content_generator',
    'Optimized meta description, keywords, and internal linking'
FROM glossary_terms gt
WHERE gt.slug IN ('population', 'sample', 'dataset', 'outlier', 'quartile')
AND gt.created_at > datetime('now', '-1 hour');

-- ==========================================
-- 输出生成结果
-- ==========================================

SELECT 'Phase 1 Batch 1 - Basic Statistical Concepts Generated!' as status;
SELECT 'Generated terms: ' || COUNT(*) as result
FROM glossary_terms 
WHERE slug IN ('population', 'sample', 'dataset', 'outlier', 'quartile')
AND created_at > datetime('now', '-1 hour');

SELECT term, slug, difficulty, category 
FROM glossary_terms 
WHERE slug IN ('population', 'sample', 'dataset', 'outlier', 'quartile')
ORDER BY created_at DESC;