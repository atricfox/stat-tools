export type TopicId = 'gpa' | 'descriptive-statistics' | 'inferential-statistics' | 'probability-distributions';

export interface TopicConfig {
  id: TopicId;
  route: string;
  title: string;
  description: string;
  // calculators.json 中的 group_name 列表
  groupNames: string[];
  // 选择指南（页面上方小卡片）
  guides?: { title: string; text: string }[];
  // FAQ 简要（Q&A）
  faqs?: { q: string; a: string }[];
}

export const TOPICS: Record<TopicId, TopicConfig> = {
  gpa: {
    id: 'gpa',
    route: '/gpa/',
    title: 'GPA Calculators Hub',
    description: 'Find GPA, unweighted and cumulative GPA tools with helpful guidance.',
    groupNames: ['gpa-grades'],
    guides: [
      { title: 'Weighted vs Unweighted', text: '多数高中用 4.0 非加权；有加权课则参考学校政策。' },
      { title: 'Semester vs Cumulative', text: '学期成绩只看当期；累计 GPA 聚合所有已修课程。' },
    ],
    faqs: [
      { q: '是否支持 4.0/4.3/4.5 标尺？', a: '工具支持常见标尺选择，详情见各计算器设置。' },
      { q: '是否能混合加权/非加权课程？', a: '请先按学校政策确认；必要时拆分计算后再合并。' },
    ],
  },
  'descriptive-statistics': {
    id: 'descriptive-statistics',
    route: '/descriptive-statistics/',
    title: 'Descriptive Statistics Hub',
    description: 'Central tendency and dispersion tools like mean, median and standard deviation.',
    groupNames: ['means-weighted', 'dispersion', 'descriptive-others'],
    guides: [
      { title: '均值/中位数/众数', text: '偏态数据常用“中位数”；均值受极端值影响更大。' },
      { title: '样本 vs 总体', text: '标准差公式不同：样本需使用无偏估计（n-1）。' },
    ],
    faqs: [
      { q: '如何选择均值或中位数？', a: '数据偏态时推荐中位数；对称分布时均值更常用。' },
      { q: '标准差和方差的关系？', a: '标准差是方差的平方根，单位与原数据一致。' },
    ],
  },
  // 扩展主题：推断统计（示例，可后续补充对应 groupNames）
  'inferential-statistics': {
    id: 'inferential-statistics',
    route: '/inferential-statistics/',
    title: 'Inferential Statistics Hub',
    description: 'Confidence intervals, hypothesis testing, correlation and more.',
    groupNames: [],
    guides: [
      { title: '置信区间 vs 假设检验', text: '二者互补：区间估计给出范围，检验给出显著性。' },
      { title: 't 分布/正态分布何时用', text: '样本量小且未知方差用 t；样本大或已知方差用正态。' },
    ],
    faqs: [
      { q: '如何选择显著性水平？', a: '常用 0.05；更严格的场景可用 0.01。' },
    ],
  },
  // 扩展主题：概率分布（示例）
  'probability-distributions': {
    id: 'probability-distributions',
    route: '/probability-distributions/',
    title: 'Probability Distributions Hub',
    description: 'Normal, binomial, Poisson and other distributions.',
    groupNames: [],
    guides: [
      { title: '何时用二项/泊松', text: '固定次数与成功概率用二项；稀有事件计数用泊松。' },
    ],
    faqs: [
      { q: '正态分布的 68-95-99.7 规则？', a: '±1σ/±2σ/±3σ 覆盖对应比例的数据。' },
    ],
  },
};
