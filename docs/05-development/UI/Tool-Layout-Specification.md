# 统计工具页面统一布局规范

## 📋 概述

基于 Sprint2 UI 设计分析，制定所有统计工具页面的统一布局规范，确保用户体验一致性和开发维护效率。

## 🏗️ ToolLayout 组件架构

### 核心组件结构
```tsx
interface ToolLayoutProps {
  title: string;           // 工具标题，如 "Mean Calculator"
  description: string;     // 工具描述
  icon: React.ReactNode;   // 工具图标
  children: React.ReactNode; // 主要内容区域
  helpContent?: React.ReactNode; // 可选的帮助内容
  breadcrumbs?: BreadcrumbItem[]; // 面包屑导航
}
```

### 布局区域划分
```
┌─────────────────────────────────────────────┐
│                 Header                       │ ← 全站通用Header
├─────────────────────────────────────────────┤
│              Breadcrumbs                     │ ← 导航面包屑
├─────────────────────────────────────────────┤
│               Tool Header                    │ ← 工具标题区域
│  [Icon] Tool Title                          │
│  Description text...                        │
├─────────────────────────────────────────────┤
│                                             │
│              Main Content                    │ ← 工具主要功能区
│                                             │
│  ┌─────────────┐  ┌────────────────────────┐ │
│  │   Input     │  │      Results           │ │
│  │   Section   │  │      Section           │ │
│  │             │  │                        │ │
│  └─────────────┘  └────────────────────────┘ │
│                                             │
├─────────────────────────────────────────────┤
│              Help Section                    │ ← 使用说明和帮助
├─────────────────────────────────────────────┤
│                Footer                       │ ← 全站通用Footer
└─────────────────────────────────────────────┘
```

## 🎨 设计规范

### 1. 颜色和样式
- **主背景色**: `bg-gray-50`
- **内容区域**: `bg-white` + `rounded-xl shadow-sm border border-gray-200`
- **主色调**: `blue-500` (与Landing Page保持一致)
- **文字层级**: 
  - 工具标题: `text-3xl font-bold text-gray-900`
  - 描述文字: `text-lg text-gray-600`
  - 区域标题: `text-xl font-semibold text-gray-900`

### 2. 间距规范
- **外边距**: `py-8` (顶部和底部)
- **内容最大宽度**: `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8`
- **区域间间距**: `mb-8`
- **卡片内边距**: `p-6`

### 3. 响应式断点
- **移动端** (< 768px): 单列布局
- **平板端** (768px - 1024px): 灵活布局
- **桌面端** (> 1024px): 双列布局 (输入区 + 结果区)

## 🧩 可复用组件

### 1. ToolHeader 组件
```tsx
interface ToolHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}
```

### 2. ToolSection 组件
```tsx
interface ToolSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}
```

### 3. ResultCard 组件
```tsx
interface ResultCardProps {
  value: number | string;
  label: string;
  highlighted?: boolean;
  unit?: string;
}
```

## 🗺️ 导航系统

### 面包屑导航
- **层级**: Home > Tools > [Category] > [Tool Name]
- **示例**: Home > Tools > Descriptive Statistics > Mean Calculator
- **样式**: 小字体，灰色，带分隔符

### 工具间切换
- **相关工具推荐**: 在页面底部显示相关计算器
- **快速导航**: Header中的工具下拉菜单
- **分类导航**: 按统计学类别分组

## 📱 移动端优化

### 布局调整
- **单列布局**: 输入区域在上，结果区域在下
- **手势友好**: 大按钮，足够的触摸区域
- **内容折叠**: 帮助内容默认折叠，可展开

### 性能优化
- **首屏优先**: 关键功能在首屏完成
- **渐进加载**: 非关键内容延迟加载
- **离线可用**: 核心计算功能支持离线

## ♿ 无障碍访问

### 键盘导航
- **Tab顺序**: 逻辑清晰的焦点流转
- **快捷键**: Enter提交计算，Escape清空
- **焦点指示**: 明显的焦点高亮

### 屏幕阅读器
- **语义化标签**: 正确使用 `main`, `section`, `article`
- **ARIA标签**: 复杂交互添加ARIA支持
- **alt文本**: 图表和图标提供替代文本

## 🔄 状态管理

### URL状态
- **参数编码**: 支持通过URL分享计算状态
- **历史管理**: 浏览器前进后退支持
- **书签友好**: URL包含关键参数

### 本地存储
- **使用历史**: 保存最近使用的参数
- **偏好设置**: 精度、主题等用户偏好
- **缓存策略**: 合理的缓存时间

## 📊 用户行为追踪

### GA4 事件
- `tool_page_view` - 工具页面访问
- `calculation_execute` - 计算执行
- `result_copy` - 结果复制
- `help_view` - 帮助内容查看

### 性能监控
- **LCP**: 最大内容绘制时间
- **FID**: 首次输入延迟
- **CLS**: 累积布局偏移

## 🛠️ 开发指南

### 组件使用示例
```tsx
import ToolLayout from '@/components/layout/ToolLayout';
import { Calculator } from 'lucide-react';

export default function MeanCalculator() {
  return (
    <ToolLayout
      title="Mean Calculator"
      description="Calculate arithmetic mean with step-by-step explanations"
      icon={<Calculator className="h-8 w-8 text-blue-500" />}
      breadcrumbs={[
        { label: 'Tools', href: '/tools' },
        { label: 'Descriptive Statistics', href: '/tools/descriptive' },
        { label: 'Mean Calculator', href: '/tools/mean' }
      ]}
    >
      {/* 工具主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <ToolSection title="Input Your Numbers">
          {/* 输入组件 */}
        </ToolSection>
        
        {/* 结果区域 */}
        <ToolSection title="Results">
          {/* 结果组件 */}
        </ToolSection>
      </div>
    </ToolLayout>
  );
}
```

### 新工具快速创建
1. 复制现有工具模板
2. 更新工具特定逻辑
3. 配置面包屑和导航
4. 添加帮助内容
5. 测试响应式布局

## 📋 实施检查清单

### 设计一致性
- [ ] 颜色方案与品牌一致
- [ ] 字体和字号规范统一
- [ ] 间距和布局符合规范
- [ ] 图标风格保持一致

### 功能完整性
- [ ] 面包屑导航正确
- [ ] 工具间切换流畅
- [ ] 响应式布局适配
- [ ] 无障碍访问支持

### 性能要求
- [ ] 页面加载时间 < 2.5s
- [ ] 计算响应时间 < 200ms
- [ ] 移动端体验优良
- [ ] 离线功能可用

### 用户体验
- [ ] 首次使用容易上手
- [ ] 错误提示清晰友好
- [ ] 帮助文档完整准确
- [ ] 结果便于复制分享

---

**版本**: v1.0  
**更新日期**: 2025-01-09  
**维护人**: Sprint 2 开发团队