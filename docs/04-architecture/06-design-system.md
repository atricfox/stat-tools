# 设计系统规范

id: ARCH-DESIGN-SYSTEM-001
---
id: ARCH-DESIGN-SYSTEM-001
owner: @product-owner
acceptance: docs/03-acceptance/04-architecture.feature
version: 1.0
created: 2025-09-05
status: Draft
reviewers: []
---

## 目的

建立 Stat Tools 统一的设计系统，确保产品在视觉和交互体验上的一致性，提高开发效率和用户体验质量。

## 设计原则

### 1. 简洁明了 (Clarity)
- 信息层次清晰，重要内容突出
- 避免不必要的装饰元素
- 文本内容简洁易懂

### 2. 一致性 (Consistency)
- 相同元素在不同页面保持一致
- 交互行为符合用户预期
- 视觉风格统一协调

### 3. 可访问性 (Accessibility) 
- 满足WCAG 2.1 AA标准
- 支持键盘导航和屏幕阅读器
- 充分的颜色对比度

### 4. 响应性 (Responsiveness)
- 移动优先设计
- 适配不同屏幕尺寸
- 触控友好的交互元素

### 5. 性能导向 (Performance)
- 优化Core Web Vitals
- 渐进式加载
- 轻量级视觉效果

## 颜色系统

### 主色调 (Primary Colors)
统计工具的专业感和可信度体现：

```css
/* 蓝色系 - 主品牌色 */
--blue-50: #eff6ff;
--blue-100: #dbeafe; 
--blue-200: #bfdbfe;
--blue-300: #93c5fd;
--blue-400: #60a5fa;
--blue-500: #3b82f6;  /* 主色 */
--blue-600: #2563eb;
--blue-700: #1d4ed8;
--blue-800: #1e40af;
--blue-900: #1e3a8a;
--blue-950: #172554;
```

### 语义颜色 (Semantic Colors)
功能性颜色，用于状态表达：

```css
/* 成功状态 - 绿色 */
--success-50: #f0fdf4;
--success-500: #22c55e;
--success-900: #14532d;

/* 警告状态 - 橙色 */  
--warning-50: #fffbeb;
--warning-500: #f59e0b;
--warning-900: #78350f;

/* 错误状态 - 红色 */
--error-50: #fef2f2;
--error-500: #ef4444;
--error-900: #7f1d1d;

/* 信息状态 - 蓝色 */
--info-50: #f0f9ff;
--info-500: #06b6d4;  
--info-900: #164e63;
```

### 中性色 (Neutral Colors)
文本、背景和边框：

```css
/* 灰色系 */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
--gray-950: #030712;
```

### 颜色使用规范

| 用途 | 颜色 | 使用场景 |
|------|------|----------|
| 主要操作 | blue-500 | 主按钮、链接、重要信息 |
| 次要操作 | gray-500 | 次要按钮、辅助文本 |  
| 成功状态 | success-500 | 计算成功、保存成功 |
| 警告状态 | warning-500 | 输入提示、非关键错误 |
| 错误状态 | error-500 | 验证错误、操作失败 |
| 背景色 | gray-50 | 页面背景、卡片背景 |
| 文本色 | gray-900 | 主要文本内容 |
| 辅助文本 | gray-600 | 说明文字、次要信息 |

### 暗色主题适配

```css
/* 暗色主题变量 */
.dark {
  --background: var(--gray-900);
  --foreground: var(--gray-50);
  --card: var(--gray-800);
  --card-foreground: var(--gray-50);
  --primary: var(--blue-400);
  --primary-foreground: var(--gray-900);
  --muted: var(--gray-800);
  --muted-foreground: var(--gray-400);
}
```

## 字体系统

### 字体选择
```css
/* 主字体栈 */
font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* 等宽字体 - 用于代码和数字 */
font-family: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
```

### 字体级别

| 级别 | 大小 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| Headline 1 | 2.5rem (40px) | 1.2 | 700 | 页面主标题 |
| Headline 2 | 2rem (32px) | 1.25 | 600 | 节标题 |
| Headline 3 | 1.5rem (24px) | 1.33 | 600 | 子节标题 |
| Headline 4 | 1.25rem (20px) | 1.4 | 500 | 组件标题 |
| Body Large | 1.125rem (18px) | 1.56 | 400 | 重要正文 |
| Body | 1rem (16px) | 1.5 | 400 | 普通正文 |
| Body Small | 0.875rem (14px) | 1.43 | 400 | 辅助文本 |
| Caption | 0.75rem (12px) | 1.33 | 400 | 说明文字 |

### 字体使用规范

```css
/* Tailwind 字体类 */
.text-h1 { @apply text-4xl font-bold leading-tight; }
.text-h2 { @apply text-3xl font-semibold leading-tight; }
.text-h3 { @apply text-2xl font-semibold leading-tight; }
.text-h4 { @apply text-xl font-medium leading-snug; }
.text-body-lg { @apply text-lg font-normal leading-relaxed; }
.text-body { @apply text-base font-normal leading-relaxed; }
.text-body-sm { @apply text-sm font-normal leading-normal; }
.text-caption { @apply text-xs font-normal leading-tight; }
```

## 间距系统

### 间距标准
基于 4px 网格系统：

```css
/* Tailwind 间距扩展 */
spacing: {
  px: '1px',
  0: '0px',
  0.5: '2px',   /* 2px */
  1: '4px',     /* 4px */
  1.5: '6px',   /* 6px */
  2: '8px',     /* 8px */
  2.5: '10px',  /* 10px */
  3: '12px',    /* 12px */
  3.5: '14px',  /* 14px */
  4: '16px',    /* 16px */
  5: '20px',    /* 20px */
  6: '24px',    /* 24px */
  7: '28px',    /* 28px */
  8: '32px',    /* 32px */
  9: '36px',    /* 36px */
  10: '40px',   /* 40px */
  11: '44px',   /* 44px */
  12: '48px',   /* 48px */
  14: '56px',   /* 56px */
  16: '64px',   /* 64px */
  18: '72px',   /* 72px */
  20: '80px',   /* 80px */
  24: '96px',   /* 96px */
  28: '112px',  /* 112px */
  32: '128px',  /* 128px */
}
```

### 间距使用规范

| 间距值 | 用途 | 示例 |
|--------|------|------|
| 2px (0.5) | 细微调整 | 图标与文字间距 |
| 4px (1) | 最小间距 | 紧密相关元素 |
| 8px (2) | 小间距 | 表单元素内边距 |
| 12px (3) | 中小间距 | 卡片内元素间距 |
| 16px (4) | 标准间距 | 组件内边距 |
| 24px (6) | 中等间距 | 卡片外边距 |
| 32px (8) | 大间距 | 章节间距 |
| 48px (12) | 特大间距 | 页面区块间距 |

## 阴影系统

### 阴影级别

```css
/* 阴影定义 */
box-shadow: {
  'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
}
```

### 阴影使用场景

| 阴影级别 | 使用场景 | 元素类型 |
|----------|----------|----------|
| xs | 微妙分层 | 输入框 focus 状态 |
| sm | 轻微悬浮 | 卡片、按钮 |
| md | 中等悬浮 | 下拉菜单、工具提示 |
| lg | 明显悬浮 | 模态框、侧边栏 |
| xl | 强烈悬浮 | 图片查看器、重要通知 |
| 2xl | 最高层级 | 全屏覆盖、重要对话框 |

## 圆角系统

### 圆角定义

```css
border-radius: {
  'none': '0px',
  'sm': '2px',      /* 小圆角 - 标签、徽章 */
  'DEFAULT': '4px', /* 默认圆角 - 按钮、输入框 */
  'md': '6px',      /* 中圆角 - 卡片 */
  'lg': '8px',      /* 大圆角 - 大卡片、面板 */
  'xl': '12px',     /* 特大圆角 - 图片、容器 */
  '2xl': '16px',    /* 超大圆角 - 特殊容器 */
  '3xl': '24px',    /* 极大圆角 - 装饰元素 */
  'full': '9999px' /* 完全圆形 - 头像、圆形按钮 */
}
```

## 图标系统

### 图标库选择
```bash
# 主要图标库
npm install @heroicons/react

# 备用图标库
npm install lucide-react
```

### 图标使用规范

| 尺寸 | 像素值 | Tailwind类 | 使用场景 |
|------|--------|------------|----------|
| XS | 12px | w-3 h-3 | 内联图标、状态指示 |
| SM | 16px | w-4 h-4 | 按钮图标、表单图标 |
| MD | 20px | w-5 h-5 | 导航图标、操作图标 |
| LG | 24px | w-6 h-6 | 页面标题图标 |
| XL | 32px | w-8 h-8 | 特色图标、状态图标 |

### 图标颜色规范

```css
/* 图标颜色类 */
.icon-primary { @apply text-blue-500; }
.icon-secondary { @apply text-gray-500; }
.icon-success { @apply text-success-500; }
.icon-warning { @apply text-warning-500; }
.icon-error { @apply text-error-500; }
.icon-muted { @apply text-gray-400; }
```

## 组件规范

### 按钮 (Button)

#### 视觉规范
```css
/* 主要按钮 */
.btn-primary {
  @apply bg-blue-500 text-white border-transparent;
  @apply hover:bg-blue-600 focus:ring-blue-500;
  @apply disabled:bg-gray-300 disabled:text-gray-500;
}

/* 次要按钮 */
.btn-secondary {
  @apply bg-gray-100 text-gray-900 border-transparent;
  @apply hover:bg-gray-200 focus:ring-gray-500;
}

/* 轮廓按钮 */
.btn-outline {
  @apply bg-transparent text-blue-500 border-blue-500;
  @apply hover:bg-blue-50 focus:ring-blue-500;
}
```

#### 尺寸规范
| 尺寸 | 高度 | 水平内边距 | 字体大小 | 使用场景 |
|------|------|------------|----------|----------|
| xs | 24px | 8px | 12px | 紧凑操作 |
| sm | 32px | 12px | 14px | 表单操作 |
| md | 40px | 16px | 14px | 标准操作 |
| lg | 48px | 20px | 16px | 主要操作 |
| xl | 56px | 24px | 16px | 重要操作 |

### 输入框 (Input)

#### 状态样式
```css
/* 默认状态 */
.input-default {
  @apply border-gray-300 focus:border-blue-500 focus:ring-blue-500;
}

/* 错误状态 */
.input-error {
  @apply border-error-500 focus:border-error-500 focus:ring-error-500;
}

/* 成功状态 */
.input-success {
  @apply border-success-500 focus:border-success-500 focus:ring-success-500;
}

/* 禁用状态 */
.input-disabled {
  @apply bg-gray-50 text-gray-500 cursor-not-allowed;
}
```

### 卡片 (Card)

#### 卡片变体
```css
/* 基础卡片 */
.card-base {
  @apply bg-white rounded-lg border border-gray-200;
  @apply shadow-sm hover:shadow-md transition-shadow;
}

/* 交互卡片 */
.card-interactive {
  @apply card-base cursor-pointer;
  @apply hover:border-blue-200 hover:shadow-lg;
}

/* 选中卡片 */
.card-selected {
  @apply card-base border-blue-500 bg-blue-50;
}
```

## 动画系统

### 动画原则
1. **有意义**：动画应该服务于功能，不是装饰
2. **快速**：持续时间通常在200-300ms
3. **自然**：使用缓动函数模拟物理运动
4. **可访问**：尊重用户的运动偏好设置

### 动画时长
```css
/* 动画持续时间 */
transition-duration: {
  75: '75ms',    /* 微交互 */
  100: '100ms',  /* 悬停效果 */
  150: '150ms',  /* 快速过渡 */
  200: '200ms',  /* 标准过渡 */
  300: '300ms',  /* 慢速过渡 */
  500: '500ms',  /* 特殊效果 */
  700: '700ms',  /* 页面切换 */
  1000: '1000ms' /* 长动画 */
}
```

### 缓动函数
```css
/* 缓动曲线 */
transition-timing-function: {
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
}
```

### 常用动画模式

#### 悬停效果
```css
.hover-lift {
  @apply transition-all duration-200 ease-out;
  @apply hover:shadow-lg hover:-translate-y-1;
}

.hover-glow {
  @apply transition-all duration-200;
  @apply hover:shadow-lg hover:shadow-blue-500/25;
}
```

#### 加载状态
```css
.loading-spin {
  @apply animate-spin;
}

.loading-pulse {
  @apply animate-pulse;
}

.loading-bounce {
  @apply animate-bounce;
}
```

## 响应式设计

### 断点系统
```javascript
// Tailwind 断点配置
screens: {
  'xs': '475px',   // 大手机
  'sm': '640px',   // 小平板
  'md': '768px',   // 中平板
  'lg': '1024px',  // 小桌面
  'xl': '1280px',  // 桌面
  '2xl': '1536px'  // 大桌面
}
```

### 响应式组件指南

#### 网格布局
```css
/* 响应式网格 */
.grid-responsive {
  @apply grid grid-cols-1;
  @apply sm:grid-cols-2;
  @apply md:grid-cols-3;
  @apply lg:grid-cols-4;
  @apply xl:grid-cols-5;
}
```

#### 文字大小
```css
/* 响应式标题 */
.heading-responsive {
  @apply text-2xl sm:text-3xl md:text-4xl lg:text-5xl;
}

/* 响应式正文 */
.body-responsive {
  @apply text-sm sm:text-base md:text-lg;
}
```

#### 间距调整
```css
/* 响应式间距 */
.spacing-responsive {
  @apply p-4 sm:p-6 md:p-8 lg:p-10;
}

.margin-responsive {
  @apply mb-4 sm:mb-6 md:mb-8 lg:mb-10;
}
```

## 无障碍设计

### 颜色对比度
- **正常文本**：对比度至少4.5:1
- **大文本**：对比度至少3:1  
- **图形元素**：对比度至少3:1

### 焦点管理
```css
/* 焦点样式 */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* 跳过链接 */
.skip-link {
  @apply absolute -top-10 left-4 bg-blue-600 text-white p-2 rounded;
  @apply focus:top-4 z-50 transition-all;
}
```

### ARIA 标签
```html
<!-- 按钮示例 -->
<button
  aria-label="计算均值"
  aria-describedby="calculate-help"
  aria-pressed="false"
>
  计算
</button>

<!-- 输入框示例 -->
<input
  aria-label="输入数值列表"
  aria-describedby="input-help input-error"
  aria-invalid="false"
  aria-required="true"
/>
```

## 国际化设计

### 文本方向支持
```css
/* RTL支持 */
.rtl-support {
  @apply text-left rtl:text-right;
  @apply ml-2 rtl:ml-0 rtl:mr-2;
}
```

### 字体加载
```css
/* 多语言字体栈 */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  font-display: swap; /* 优化字体加载 */
}
```

## 性能优化

### CSS优化
1. **Critical CSS内联**：关键样式内联到HTML
2. **CSS分割**：按页面分割CSS文件
3. **未使用样式清理**：使用PurgeCSS清理

### 图标优化
1. **SVG内联**：小图标直接内联
2. **图标字体**：批量图标使用字体
3. **懒加载**：非关键图标懒加载

### 动画优化
1. **GPU加速**：使用transform和opacity
2. **动画降级**：支持prefers-reduced-motion
3. **帧率优化**：保持60fps

## 设计工具链

### 设计工具
- **设计稿**：Figma
- **图标库**：Heroicons、Lucide
- **原型工具**：Figma Prototype
- **颜色工具**：Coolors、Adobe Color

### 开发工具
- **CSS框架**：Tailwind CSS
- **构建工具**：PostCSS、Autoprefixer
- **测试工具**：Chromatic、Percy
- **文档工具**：Storybook

### 协作流程
1. **设计评审**：Figma评论和批注
2. **设计交付**：Figma Dev Mode
3. **实现验证**：Chromatic视觉回归测试
4. **文档同步**：Storybook组件文档

## 维护指南

### 设计系统演进
1. **版本控制**：设计token版本化管理
2. **向后兼容**：渐进式更新，避免破坏性变更
3. **文档更新**：及时更新使用指南和示例

### 质量保证
1. **定期审查**：季度设计系统审查
2. **使用监控**：跟踪组件使用情况
3. **反馈收集**：收集开发者使用反馈

---

**维护责任人**：设计师 + 前端架构师
**更新频率**：每季度评估，重大变更时更新
**工具支持**：Figma设计库 + Storybook文档