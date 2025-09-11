# Unweighted GPA Calculator - UI线框图设计

> 基于现有GPA Calculator的UI/UX设计，针对Unweighted GPA的特定需求进行调整

## 1. 页面整体布局

```
┌─────────────────────────────────────────────────────────────────────┐
│                        StatCal Header                              │
├─────────────────────────────────────────────────────────────────────┤
│  🏠 Home > Calculators > Unweighted GPA Calculator                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  # Unweighted GPA Calculator                                       │
│  Calculate your standard GPA without course difficulty weights     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Control Panel                              │   │
│  │ ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │ │ Grading System  │ │ Precision   │ │ Sample Data     │   │   │
│  │ │ [4.0 Standard▼] │ │ [2 digits▼] │ │ [Load Example]  │   │   │
│  │ └─────────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Course Data Input                           │   │
│  │                                                             │   │
│  │ ┌─────────────┬─────────────┬─────────────┬─────────────┐  │   │
│  │ │Course Name  │Credits      │Letter Grade │Actions      │  │   │
│  │ ├─────────────┼─────────────┼─────────────┼─────────────┤  │   │
│  │ │Mathematics  │[    4    ]  │[    A    ▼] │[×]          │  │   │
│  │ │English Lit  │[    3    ]  │[    B    ▼] │[×]          │  │   │
│  │ │Chemistry    │[    4    ]  │[    A-   ▼] │[×]          │  │   │
│  │ │History      │[    3    ]  │[    B+   ▼] │[×]          │  │   │
│  │ │[New Course] │[        ]   │[     ▼]     │             │  │   │
│  │ └─────────────┴─────────────┴─────────────┴─────────────┘  │   │
│  │                                                             │   │
│  │ [➕ Add Course]  [🗑️ Clear All]  [📤 Load Example]         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. 结果展示区域

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GPA Results                                  │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                  │
│  │📊 Final GPA │ │📚 Total     │ │⭐ Quality   │                  │
│  │             │ │   Credits   │ │   Points    │                  │
│  │    3.45     │ │     14      │ │    48.3     │                  │
│  │             │ │             │ │             │                  │
│  │Unweighted   │ │Credits Hrs  │ │Grade Points │                  │
│  └─────────────┘ └─────────────┘ └─────────────┘                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 Grade Distribution                          │   │
│  │                                                             │   │
│  │    A  ████████████ 2 courses (50%)                        │   │
│  │    B  ██████ 1 course (25%)                               │   │
│  │   A-  ██████ 1 course (25%)                               │   │
│  │   B+  ████ 0 courses (0%)                                 │   │
│  │    C  ██ 0 courses (0%)                                   │   │
│  │                                                             │   │
│  │ 📈 Academic Status: Good Standing (3.0+)                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Action Buttons                                 │   │
│  │ [📋Copy] [📤Share] [💾Export▼] [📊Visualization]           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. 计算步骤展示（可折叠）

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 Calculation Steps                                    [▼Hide]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Step 1: Course Grade Points Conversion                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Mathematics: A (4.0) × 4 credits = 16.0 quality points     │   │
│  │ English Lit: B (3.0) × 3 credits = 9.0 quality points      │   │
│  │ Chemistry: A- (3.7) × 4 credits = 14.8 quality points      │   │
│  │ History: B+ (3.3) × 3 credits = 9.9 quality points         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Step 2: Totals Calculation                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Total Quality Points: 16.0 + 9.0 + 14.8 + 9.9 = 49.7       │   │
│  │ Total Credits: 4 + 3 + 4 + 3 = 14                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Step 3: GPA Calculation                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Unweighted GPA = Total Quality Points ÷ Total Credits       │   │
│  │ Unweighted GPA = 49.7 ÷ 14 = 3.55                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 4. 帮助和说明区域（可折叠）

```
┌─────────────────────────────────────────────────────────────────────┐
│  ❓ How to Use Unweighted GPA Calculator                [▼Hide]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📋 Quick Guide:                                                   │
│  1. Select your grading system (4.0 Standard/Plus-Minus)          │
│  2. Add courses with name, credits, and letter grade              │
│  3. View your calculated unweighted GPA instantly                 │
│                                                                     │
│  ✨ Key Features:                                                  │
│  • All courses weighted equally (no difficulty multipliers)       │
│  • Standard 4.0 scale: A=4.0, B=3.0, C=2.0, D=1.0, F=0.0       │
│  • Plus/Minus support: A+=4.0, A-=3.7, B+=3.3, B-=2.7          │
│  • Real-time calculation and grade distribution analysis          │
│                                                                     │
│  🆚 Unweighted vs Weighted GPA:                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Unweighted GPA (This Calculator):                          │   │
│  │ • All courses count equally                                │   │
│  │ • Standard 4.0 scale for all classes                      │   │
│  │ • Used by many colleges for fair comparison                │   │
│  │                                                             │   │
│  │ Weighted GPA:                                              │   │
│  │ • AP/IB/Honors courses get extra points                   │   │
│  │ • Can exceed 4.0 scale                                    │   │
│  │ • Shows academic rigor and challenge level                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  📚 Grading Systems Supported:                                    │
│  • 4.0 Standard Scale (most common)                               │
│  • 4.0 Plus/Minus Scale (with A+, A-, B+, etc.)                 │
│                                                                     │
│  💡 Tips for Students:                                            │
│  • Most competitive colleges recalculate using unweighted GPA    │
│  • Focus on consistent performance across all subjects           │
│  • Aim for 3.0+ for good standing, 3.5+ for competitive schools │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 5. 移动端响应式设计

```
┌─────────────────────┐
│      StatCal        │
├─────────────────────┤
│🏠 Home > Calculators │
│                     │
│# Unweighted GPA     │
│  Calculator         │
│                     │
│┌───────────────────┐│
││ Grading System    ││
││ [4.0 Standard ▼]  ││
││                   ││
││ Precision         ││
││ [2 digits ▼]      ││
│└───────────────────┘│
│                     │
│📚 Courses:          │
│┌───────────────────┐│
││Mathematics        ││
││Credits: [4] A ▼   ││
││[×]                ││
│├───────────────────┤│
││English Lit        ││
││Credits: [3] B ▼   ││
││[×]                ││
│└───────────────────┘│
│                     │
│[➕ Add Course]      │
│                     │
│📊 Results:          │
│┌───────────────────┐│
││   GPA: 3.45       ││
││Credits: 14        ││
││Points: 48.3       ││
│└───────────────────┘│
│                     │
│[📋Copy][📤Share]    │
│                     │
└─────────────────────┘
```

## 6. 关键交互流程

### 6.1 添加课程流程
```
用户操作流程:
1. 点击"Add Course"按钮
2. 输入课程名称（文本输入）
3. 选择学分数（数字输入，0.5-10范围）
4. 选择成绩等级（下拉选择）
5. 系统自动计算并更新GPA结果

验证逻辑:
- 课程名称: 必填，1-50字符
- 学分数: 必填，0.5-10数字，支持小数
- 成绩等级: 必须从有效选项中选择
```

### 6.2 评分系统切换流程
```
用户操作流程:
1. 点击"Grading System"下拉菜单
2. 选择新的评分系统（4.0 Standard / 4.0 Plus-Minus）
3. 系统检查现有数据兼容性
4. 如不兼容，显示警告并提供选项：
   - 清除现有数据
   - 加载示例数据
   - 保持当前数据（可能出错）
5. 重新计算所有GPA结果
```

### 6.3 结果导出流程
```
用户操作流程:
1. 点击"Export"按钮
2. 选择导出格式（CSV/JSON/PDF）
3. 系统生成文件包含：
   - 课程清单和成绩
   - GPA计算结果
   - 成绩分布统计
   - 计算步骤说明
4. 自动下载文件
```

## 7. 设计规范

### 7.1 色彩方案
- **主色调**: 蓝色系 (#3B82F6) - 专业、学术
- **成功色**: 绿色 (#10B981) - GPA结果、成功状态
- **警告色**: 橙色 (#F59E0B) - 注意事项、验证警告
- **错误色**: 红色 (#EF4444) - 错误提示、删除操作
- **中性色**: 灰色系 (#6B7280) - 边框、次要文本

### 7.2 字体规范
- **标题**: Inter/Roboto, 24-32px, font-weight: 600
- **子标题**: Inter/Roboto, 18-20px, font-weight: 500
- **正文**: Inter/Roboto, 14-16px, font-weight: 400
- **数字**: Roboto Mono, 16-20px, font-weight: 500（GPA结果）

### 7.3 间距和布局
- **容器边距**: 16px (mobile) / 24px (desktop)
- **组件间距**: 24px 垂直间距
- **卡片内边距**: 16px (mobile) / 24px (desktop)
- **按钮高度**: 40px (mobile) / 44px (desktop)

## 8. 可访问性设计

### 8.1 键盘导航
- 支持Tab键顺序导航
- 支持Enter键确认操作
- 支持ESC键取消/关闭
- 表格支持方向键导航

### 8.2 屏幕阅读器
- 所有表单字段有适当的label
- 计算结果有aria-live区域
- 错误提示与相关字段关联
- 图表数据提供文本替代

### 8.3 视觉可访问性
- 颜色对比度符合WCAG AA标准
- 支持高对比度模式
- 文字大小支持放大到200%
- 交互元素有足够的点击区域

## 9. 与现有GPA Calculator的差异

### 9.1 简化的输入界面
- 移除课程类型选择（普通/AP/IB/荣誉）
- 移除权重/难度系数输入
- 专注于基础的学分和成绩输入

### 9.2 调整的结果展示
- 强调"Unweighted"标识
- 简化的统计分析（无需权重相关指标）
- 添加与Weighted GPA的对比说明

### 9.3 教育内容调整
- 重点解释Unweighted vs Weighted区别
- 提供大学申请相关的GPA使用建议
- 包含标准4.0评分系统的详细说明

这个设计完全基于现有GPA Calculator的成熟UI/UX框架，确保了一致性和可用性，同时针对Unweighted GPA的特定需求进行了适当的简化和调整。