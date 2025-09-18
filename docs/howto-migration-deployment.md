# How-To Guides内容迁移部署指南

## 迁移概览

本迁移将How-To Guides从非结构化的长文本内容转换为结构化的步骤格式，解决当前"Step-by-Step Instructions"显示为空的问题。

## 迁移前准备

### 1. 数据备份
```bash
# 备份当前数据库
cp data/statcal.db data/statcal-backup-$(date +%Y%m%d).db

# 验证备份
sqlite3 data/statcal-backup-*.db "SELECT COUNT(*) FROM slim_content WHERE type = 'howto';"
```

### 2. 环境检查
```bash
# 检查依赖
npm run type-check
npm run lint

# 确认数据库连接
npm run db:check
```

## 迁移步骤

### 阶段1: 应用Schema更改
```bash
# 应用新的数据库结构
sqlite3 data/statcal.db < migrations/007_howto_steps_schema.sql

# 验证表创建
sqlite3 data/statcal.db ".tables" | grep -E "(howto_steps|howto_metadata|migration_log)"
```

### 阶段2: 内容解析测试
```bash
# 运行解析测试
npm run test:migration

# 预览迁移效果（不实际修改数据）
npm run migrate:howto:dry
```

### 阶段3: 分批迁移
```bash
# 先迁移高优先级内容（5个）
npm run migrate:howto:priority

# 检查迁移状态
npm run test:migration

# 如果高优先级迁移成功，继续迁移全部
npm run migrate:howto
```

### 阶段4: 验证结果
```bash
# 生成迁移报告
npm run test:migration

# 检查前端显示
npm run dev
# 访问 http://localhost:3011/how-to/how-to-use-median-calculator
```

## 迁移监控

### 数据库查询检查
```sql
-- 检查迁移状态
SELECT 
  status,
  COUNT(*) as count,
  SUM(steps_extracted) as total_steps
FROM migration_log 
WHERE migration_name = 'howto_structure_migration'
GROUP BY status;

-- 检查步骤数据
SELECT 
  howto_slug,
  COUNT(*) as step_count,
  GROUP_CONCAT(name, '; ') as step_names
FROM howto_steps 
GROUP BY howto_slug
ORDER BY step_count DESC;

-- 检查元数据
SELECT 
  howto_slug,
  JSON_EXTRACT(prerequisites, '$') as prereq_count,
  JSON_EXTRACT(outcomes, '$') as outcome_count,
  estimated_time
FROM howto_metadata;
```

### 前端验证清单
- [ ] How-To列表页正常显示
- [ ] 详情页标题和摘要正确
- [ ] Step-by-Step Instructions显示步骤
- [ ] 步骤可以展开/折叠
- [ ] 深度链接（#step-1）工作正常
- [ ] 提示和警告正确显示
- [ ] 相关链接正常

## 回滚策略

### 如果需要回滚
```bash
# 方法1: 删除新表（保留原始内容）
sqlite3 data/statcal.db "DROP TABLE IF EXISTS howto_steps;"
sqlite3 data/statcal.db "DROP TABLE IF EXISTS howto_metadata;"
sqlite3 data/statcal.db "DROP TABLE IF EXISTS migration_log;"

# 方法2: 完全恢复备份
cp data/statcal-backup-*.db data/statcal.db

# 重启前端服务
npm run dev
```

### 部分回滚特定项目
```bash
# 回滚单个How-To指南
npm run migrate:howto --single=how-to-use-median-calculator --force
```

## 性能监控

### 预期性能指标
- **页面加载时间**: < 500ms (相比当前无改变)
- **数据库查询**: 新增1-2个联表查询
- **内存使用**: 轻微增加（结构化数据）
- **缓存命中率**: 应保持在85%以上

### 监控查询
```bash
# 检查查询性能
sqlite3 data/statcal.db "EXPLAIN QUERY PLAN SELECT * FROM howto_steps WHERE howto_slug = 'test';"

# 监控缓存使用
# (在应用日志中查看cache hit/miss)
```

## 故障排除

### 常见问题

**1. 迁移失败: "No steps extracted"**
- 检查: 原始内容格式是否包含可识别的步骤
- 解决: 手动调整内容格式或更新解析规则

**2. 前端显示错误: "Cannot read properties of undefined"**
- 检查: EnhancedContentService是否正确初始化
- 解决: 确认数据库连接和表结构

**3. 步骤顺序错误**
- 检查: step_order字段是否正确设置
- 解决: 重新运行迁移脚本

### 调试命令
```bash
# 详细模式运行迁移
npm run migrate:howto:dry -- --verbose

# 检查特定项目的解析结果
npm run migrate:howto -- --single=how-to-use-median-calculator --dry-run

# 查看详细错误日志
sqlite3 data/statcal.db "SELECT * FROM migration_log WHERE status = 'failed';"
```

## 成功标准

### 迁移完成条件
- [ ] 所有11个How-To指南成功迁移
- [ ] 每个指南至少有2个步骤
- [ ] 前端正常显示步骤内容
- [ ] 用户交互功能正常
- [ ] 性能无明显降低
- [ ] SEO结构化数据正确

### 验收测试
1. 访问每个How-To详情页
2. 验证步骤展开/折叠功能
3. 测试深度链接功能
4. 检查移动端响应式显示
5. 验证搜索功能包含新步骤内容

## 联系信息

如遇到问题，请提供以下信息：
- 迁移报告输出
- 错误日志
- 浏览器控制台错误
- 具体的How-To slug和问题描述

这个迁移计划确保了平滑的过渡，同时提供了全面的监控和回滚机制。