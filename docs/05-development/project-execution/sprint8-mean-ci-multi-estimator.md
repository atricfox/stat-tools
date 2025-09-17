# Sprint 8: 多方法均值置信区间助手实现

> 基于《docs/05-development/templates/Sprint-Planning-Template.md》制订的执行计划，聚焦落地 [US-025: 多方法均值置信区间助手](../../02-requirements/user-stories/US-025.md)

## 📋 Sprint 基本信息
- **Sprint 编号**: Sprint 8
- **Sprint 主题**: Mean CI Multi-Estimator 计算器上线
- **开始日期**: 2025-09-08
- **结束日期**: 2025-09-19
- **Sprint 时长**: 2 周
- **开发模式**: 双周Sprint + TDD优先
- **Scrum Master**: @scrum-master
- **产品负责人**: @product-owner

## 🎯 Sprint 目标
1. 交付可在桌面与移动端使用的均值置信区间计算器页面，采用现有 `src/components/layout/CalculatorLayout.tsx` 模板完成布局与导航整合。
2. 构建支持 t、Bootstrap 百分位、Bootstrap BCa 与 20% 截尾均值四套区间估计的运算核心，并提供一致的诊断输出。
3. 提供符合 US-025 验收标准的结果说明、复制导出与异常数据提示，确保统计准确性与用户教育信息到位。

### 成功标准
- [ ] 页面以 CalculatorLayout 为骨架实现，并通过 Storybook/截图评审确认布局与品牌一致性。
- [ ] 同一批样本在 t、百分位、BCa 区间与 R 参考实现比对误差 < 1e-6。
- [ ] 含离群值样本触发截尾均值提示，异常数据校验覆盖 IQR 与 MAD 检测支线。
- [ ] 95%+90%+99% 置信区间在单次运行内返回，并提供可复制的 Markdown 报告片段。
- [ ] 全量单元测试、集成测试与端到端冒烟脚本通过 CI。

## ✅ DoR 快速检查结果
| 检查项 | 状态 | 备注 |
|--------|------|------|
| 用户故事描述 INVEST | ✅ | US-025 已归档并含 FR/NFR/验收标准 |
| 核心界面原型 | ✅ | 复用 `CalculatorLayout`，新增内容组件将遵循现有栅格 |
| 技术风险评估 | ✅ | Bootstrap 计算将引入 Web Worker + PRNG 校验 |
| 依赖明确 | ⚠️ | 需确认是否可引入 `seedrandom` 或复用内部 RNG 工具 |
| 测试策略草案 | ✅ | 统计核心单元测试 + Playwright 冒烟脚本草拟完毕 |

> 决议：依赖项在 Sprint Day1 与架构组对齐后执行。其余条件满足启动要求。

## 📦 Sprint 用户故事与范围
| 编号 | 标题 | 类型 | 优先级 | 预计点数 | 备注 |
|------|------|------|---------|-----------|------|
| US-025 | 多方法均值置信区间助手 | Feature | High | 21 | Sprint 主故事 |
| TEC-148 | Bootstrap 引擎数值校验脚本 | Tech Debt | Medium | 5 | 构建对照基线 |
| OPS-067 | 计算器页面监控埋点 | Ops | Medium | 3 | `calc_bootstrap_progress`、`ci_results_ready` 事件 |
| DOC-112 | 用户教育 & 帮助中心更新 | Documentation | Low | 3 | 解释四类区间差异 |

## 🏗️ 技术架构与设计
- **页面结构**: 继续采用 `CalculatorLayout.tsx` (`src/components/layout/CalculatorLayout.tsx:1`)，主内容列放置输入表单、结果区与解读；侧栏复用 RelatedTools/PopularTools。确保 props `breadcrumbs`、`currentTool` 与 `toolCategory='statistics'` 准确传递。
- **组件规划**:
  - `MeanCIForm`：数据粘贴、置信水平选择、稳健开关、Bootstrap 参数设定。
  - `MeanCIResults`：卡片呈现样本统计量与区间表格；提供 Markdown/JSON 导出按钮。
  - `DiagnosticsPanel`：展示离群检测、Bootstrap 耗时、随机种子信息。
  - `InterpretationNotice`：根据区间差异生成解读与建议。
- **运算核心**: 新建模块 `mean-ci-engine.ts`（位于 `src/lib/statistics/`）封装 t/Bootstrap/BCa/截尾逻辑；通过 `Web Worker`（`MeanCIWorker`）处理高耗时计算，主线程展示进度。
- **状态管理**: 使用 React hooks + `useReducer` 管理输入状态、计算状态与 Worker 消息，保持组件内聚。
- **可观测性**: 在完成/失败节点发送 GA4 埋点 (`calc_execute`, `calc_bootstrap_progress`, `ci_results_ready`, `export_mean_ci_report`)。

## 🧩 任务拆分 (Task Breakdown)
| 任务编号 | 模块 | 描述 | 责任人 | 预估 (人日) | 依赖 |
|----------|------|------|--------|-------------|------|
| T1 | 需求澄清 | 校对 US-025 FR/NFR，确认随机种子与 B 值默认策略 | PO + Dev Lead | 0.5 | 无 |
| T2 | 架构设计 | 设计组件树、Worker 通讯协议、导出数据结构 | Dev Lead | 1 | T1 |
| T3 | 基础输入组件 | 实现数据粘贴校验、置信水平选择、自定义 B 值 | FE Dev A | 2 | T2 |
| T4 | Bootstrap 引擎 | 编写 t、百分位、BCa、截尾算法 + 单元测试 | FE Dev B | 3 | T2 |
| T5 | Web Worker 集成 | Worker 包装、进度回传、超时保护 | FE Dev B | 2 | T4 |
| T6 | 结果与解读 UI | 构建结果表、样本卡片、Diagnostic 提示 | FE Dev A | 2.5 | T3 |
| T7 | 导出&复制 | Markdown/JSON 生成、复制剪贴板按钮 | FE Dev A | 1 | T6 |
| T8 | 事件埋点 | 绑定 calc_execute 等事件，验证数据层 | Analytics | 1 | T3/T4 |
| T9 | 测试与验证 | Vitest 单元、Playwright 冒烟、R 对照脚本 | QA | 2 | T4-T7 |
| T10 | 文档与上线 | 更新帮助中心、Changelog、发布评审材料 | Tech Writer | 1.5 | T6-T9 |

## 🧪 测试策略
- **单元测试**: `src/lib/statistics/mean-ci-engine.test.ts` 覆盖 t、百分位、BCa、截尾输出；随机种子一致性验证；边界样本（n<3、方差为0）。
- **集成测试**: React Testing Library 检查 Form -> Worker -> Result 流程；模拟离群值输入触发提示。
- **端到端**: Playwright 脚本覆盖“默认95%”“多置信水平”“截尾均值”三条用例。
- **对照验证**: 新增 `scripts/validation/mean-ci-r-compare.ts` 调用 R/`boot` 结果进行金标校验（需与数据科学团队确认运行环境）。
- **性能基准**: 使用 Lighthouse + 自定义 benchmark 确认 10,000 次 Bootstrap < 2s (桌面)，必要时暴露降级提示。

## 📐 质量与合规
- 遵循 DoD: 代码评审≥2人、单元测试覆盖率≥85%、CI 无阻塞、无 ESLint/TypeScript 错误。
- 文案需由统计顾问校审，确保解释准确；结果导出遵循数据隐私要求（不上传服务器）。
- 确保 `CalculatorLayout` 下内容区域符合无障碍标准（键盘可达、ARIA 标签补充）。

## 👥 容量规划
- 团队成员：FE Dev A (6人日)、FE Dev B (6人日)、QA (3人日)、Analytics (1人日)、Tech Writer (1.5人日)、Dev Lead (1.5人日)。
- 总容量：19 人日；缓冲 10% 用于风险处理。

## ⚠️ 风险与应对
| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| Bootstrap 性能不足 | 影响响应时间与体验 | 中 | 优先实现 Worker + 进度条；必要时提供"降级B=5,000"选项 |
| PRNG 质量不够 | 损害统计准确性 | 中 | 引入 `seedrandom` 或 Web Crypto；与数据科学确认标准 |
| 统计解释过于复杂 | 用户理解成本过高 | 低 | 文案与帮助中心同步简化案例；提供“专家模式”切换 |
| Worker 与主线程通信异常 | 功能不可用 | 低 | 编写通信协议测试，设置超时回退到同步小样本模式 |

## ✅ Definition of Done
- [ ] 所有开发任务在 GitHub 上的 Issue/Ticket 关闭。
- [ ] 计算页面在桌面与移动端均通过 UI 回归。
- [ ] `main` 分支构建通过 + 预览环境可演示。
- [ ] 统计验证报告（R 对照）归档到 `docs/validation/`。
- [ ] 产品演示脚本与帮助中心同步更新。

## 📦 验收与发布计划
- **内部验收**: Sprint Day8 由产品与统计顾问联合验收，关注区间差异与文案。
- **发布准备**: Day9 完成 SEO/内容校对，Day10 切换生产特性旗帜。
- **回滚策略**: Feature flag 控制，引导用户回退到旧版均值计算器页面。

## 🚀 Sprint 运行节奏
| 日期 | 里程碑 | 说明 |
|------|--------|------|
| Day0 (Fri) | Sprint Planning | 评审计划文档、锁定依赖、创建任务看板 |
| Day1-2 | 需求与架构 | 完成 T1-T2，确认 Worker/API 方案 |
| Day3-4 | 输入与算法开发 | 完成 T3-T4，提交核心测试 |
| Day5 | Worker & UI 联调 | T5-T6 开启，完成初版页面联通 |
| Day6 | 功能增强 | 完成导出、解读逻辑、异常提示 |
| Day7 | 埋点与QA准备 | 事件埋点落地，QA 编写测试用例 |
| Day8 | 测试回归 | 执行单元/集成/e2e + R 对照 |
| Day9 | 修复&文档 | 处理缺陷、完善帮助中心、准备演示 |
| Day10 | 演示&发布 | Demo、验收、上线开关控制 |

## 💡 最佳实践提醒
- 每日 Standup 汇报可演示的成果，确保"Release early, release often"。
- 对复杂统计逻辑建议配对编程/代码审查双人制，响应"Given enough eyeballs"。
- 保持最低必要接口，避免为未来需求过度抽象（"Perfect is achieved..."）。

