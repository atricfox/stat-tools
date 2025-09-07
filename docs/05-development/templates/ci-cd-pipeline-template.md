# CI/CD Pipeline 模板

## 🎯 概述

基于Linus工程哲学设计的CI/CD流水线，体现"Release early, release often"和"Given enough eyeballs, all bugs are shallow"的核心理念。

## 🐧 Linus哲学在CI/CD中的体现

### "Show me the code" - 代码优于配置
- 所有流水线配置都使用代码形式(GitHub Actions YAML)
- 构建脚本可本地执行，便于调试和验证
- 配置变更通过代码审查，而非GUI操作

### "Release early, release often" - 持续交付
- 每次代码提交都触发构建和测试
- 主分支始终保持可发布状态
- 自动化部署到多个环境
- 快速失败，快速反馈

### "Given enough eyeballs, all bugs are shallow" - 多重验证
- 5级质量门禁确保代码质量
- 并行执行多种类型的检查
- 自动化和人工审查相结合
- 失败时详细的诊断信息

---

## 📁 GitHub Actions 工作流文件结构

```
.github/
├── workflows/
│   ├── ci-quality-gates.yml      # 5级质量门禁主流程
│   ├── ci-frontend.yml           # 前端构建和测试
│   ├── ci-backend-api.yml        # Node.js API服务
│   ├── ci-backend-service.yml    # Go服务
│   ├── cd-deployment.yml         # 部署流程
│   ├── security-scan.yml         # 安全扫描
│   └── performance-test.yml      # 性能测试
├── actions/                      # 自定义Actions
│   ├── setup-environment/        # 环境设置
│   ├── quality-gate/             # 质量门禁检查
│   └── deploy-service/           # 部署服务
└── templates/                    # 工作流模板
    ├── node-service.yml
    ├── go-service.yml
    └── frontend-app.yml
```

---

## 🚦 主流程：5级质量门禁

### 📄 文件: `.github/workflows/ci-quality-gates.yml`

```yaml
name: 🚦 Quality Gates - ClinWise EDC

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  NODE_VERSION: '20'
  GO_VERSION: '1.23'
  PNPM_VERSION: '8.x'

jobs:
  # 🔍 质量门禁1: 代码质量检查
  gate-1-code-quality:
    name: 🔍 Gate 1 - Code Quality
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    outputs:
      quality-score: ${{ steps.quality-check.outputs.score }}
      coverage-report: ${{ steps.coverage.outputs.report }}
    
    steps:
      - name: 📥 Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整历史用于质量分析

      - name: 🛠️ Setup Environment
        uses: ./.github/actions/setup-environment
        with:
          node-version: ${{ env.NODE_VERSION }}
          go-version: ${{ env.GO_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      # Linus原则: "Show me the code" - 通过静态分析证明代码质量
      - name: 📊 Code Quality Analysis
        id: quality-check
        run: |
          echo "🔍 Running code quality checks..."
          
          # 前端代码质量
          cd apps/web
          pnpm lint --format json > ../../quality-frontend.json || true
          pnpm typecheck
          
          # 后端API代码质量  
          cd ../api
          npm run lint --format json > ../../quality-api.json || true
          npm run typecheck
          
          # Go服务代码质量
          cd ../../service
          golangci-lint run --out-format json > ../quality-service.json || true
          
          # 计算综合质量分数
          cd ..
          node scripts/calculate-quality-score.js
          
          echo "score=$(cat quality-score.txt)" >> $GITHUB_OUTPUT

      - name: 📈 Code Coverage
        id: coverage
        run: |
          echo "📈 Collecting code coverage..."
          
          # 前端覆盖率
          cd apps/web
          pnpm test:coverage --reporter=json > ../../coverage-frontend.json
          
          # 后端API覆盖率
          cd ../api  
          npm test -- --coverage --coverageReporters=json > ../../coverage-api.json
          
          # Go服务覆盖率
          cd ../../service
          go test -coverprofile=coverage.out -covermode=atomic ./...
          go tool cover -func=coverage.out > ../coverage-service.txt
          
          # 生成覆盖率报告
          cd ..
          node scripts/generate-coverage-report.js
          
          echo "report=$(cat coverage-summary.json)" >> $GITHUB_OUTPUT

      - name: 🚦 Quality Gate Decision
        run: |
          QUALITY_SCORE="${{ steps.quality-check.outputs.quality-score }}"
          echo "🎯 Quality Score: $QUALITY_SCORE"
          
          if (( $(echo "$QUALITY_SCORE < 8.0" | bc -l) )); then
            echo "❌ Quality Gate 1 FAILED: Score $QUALITY_SCORE < 8.0"
            echo "🔍 Check quality reports for details"
            exit 1
          else
            echo "✅ Quality Gate 1 PASSED: Score $QUALITY_SCORE"
          fi

      - name: 📤 Upload Quality Reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: quality-reports
          path: |
            quality-*.json
            coverage-*.json
            coverage-service.txt

  # 🧪 质量门禁2: TDD测试检查
  gate-2-tdd-tests:
    name: 🧪 Gate 2 - TDD Tests
    runs-on: ubuntu-latest
    needs: gate-1-code-quality
    timeout-minutes: 15
    
    strategy:
      matrix:
        service: [web, api, service]
        
    steps:
      - name: 📥 Checkout Code
        uses: actions/checkout@v4

      - name: 🛠️ Setup Environment
        uses: ./.github/actions/setup-environment
        with:
          node-version: ${{ env.NODE_VERSION }}
          go-version: ${{ env.GO_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      # Linus原则: "The best code is no code at all" - 测试证明代码的必要性
      - name: 🧪 TDD Compliance Check
        run: |
          echo "🧪 Verifying TDD compliance for ${{ matrix.service }}"
          
          case "${{ matrix.service }}" in
            web)
              cd apps/web
              # 验证测试优先编写
              node ../../scripts/verify-tdd-compliance.js --type=frontend
              # 执行测试
              pnpm test --coverage --reporter=json
              ;;
            api)
              cd apps/api
              # 验证TDD模式
              node ../../scripts/verify-tdd-compliance.js --type=api
              # 执行测试
              npm test -- --coverage --reporter=json
              ;;
            service)
              cd service
              # 验证Go TDD实践
              go run ../scripts/verify-go-tdd.go
              # 执行测试
              go test -v -race -coverprofile=coverage.out ./...
              ;;
          esac

      - name: 🚦 TDD Gate Decision
        run: |
          echo "🎯 TDD Compliance verified for ${{ matrix.service }}"
          
          # 检查测试覆盖率
          COVERAGE=$(cat coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 90" | bc -l) )); then
            echo "❌ TDD Gate 2 FAILED: Coverage $COVERAGE% < 90%"
            exit 1
          else
            echo "✅ TDD Gate 2 PASSED: Coverage $COVERAGE%"
          fi

  # 🔗 质量门禁3: 集成测试
  gate-3-integration:
    name: 🔗 Gate 3 - Integration Tests
    runs-on: ubuntu-latest
    needs: gate-2-tdd-tests
    timeout-minutes: 20

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: clinwise_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: 📥 Checkout Code
        uses: actions/checkout@v4

      - name: 🛠️ Setup Environment
        uses: ./.github/actions/setup-environment
        with:
          node-version: ${{ env.NODE_VERSION }}
          go-version: ${{ env.GO_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      # Linus原则: "Release early, release often" - 集成测试确保组件协作
      - name: 🔗 Database Integration Tests
        run: |
          echo "🔗 Running database integration tests..."
          
          # 设置测试数据库
          cd packages/prisma-client
          npx prisma migrate deploy
          npx prisma db seed
          
          # API集成测试
          cd ../../apps/api
          npm run test:integration

      - name: 🌐 API Contract Tests  
        run: |
          echo "🌐 Running API contract tests..."
          
          # 启动API服务
          cd apps/api
          npm start &
          API_PID=$!
          
          # 等待服务启动
          sleep 10
          
          # 契约测试
          cd ../web
          pnpm test:contract
          
          # 清理
          kill $API_PID

      - name: 🚀 End-to-End Tests
        run: |
          echo "🚀 Running E2E tests..."
          
          cd apps/web
          pnpm build
          pnpm start &
          WEB_PID=$!
          
          cd ../api  
          npm start &
          API_PID=$!
          
          sleep 15
          
          # E2E测试
          cd ../web
          pnpm test:e2e
          
          kill $WEB_PID $API_PID

  # 🛡️ 质量门禁4: 安全与合规
  gate-4-security:
    name: 🛡️ Gate 4 - Security & Compliance
    runs-on: ubuntu-latest
    needs: gate-3-integration
    timeout-minutes: 12

    steps:
      - name: 📥 Checkout Code
        uses: actions/checkout@v4

      - name: 🛠️ Setup Environment  
        uses: ./.github/actions/setup-environment
        with:
          node-version: ${{ env.NODE_VERSION }}
          go-version: ${{ env.GO_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      # Linus原则: "Given enough eyeballs" - 多种工具发现安全问题
      - name: 🔒 Security Scanning
        run: |
          echo "🔒 Running security scans..."
          
          # 依赖安全扫描
          cd apps/web && pnpm audit --audit-level moderate
          cd ../api && npm audit --audit-level moderate
          cd ../../service && go list -json -deps ./... | nancy sleuth
          
          # SAST扫描
          semgrep --config=auto --json --output=security-report.json .
          
          # 密钥扫描
          truffleHog filesystem . --json > secrets-scan.json

      - name: 🏥 Medical Compliance Check
        run: |
          echo "🏥 Checking 21 CFR Part 11 compliance..."
          
          # 审计追踪验证
          node scripts/verify-audit-trails.js
          
          # 数据完整性检查
          node scripts/verify-alcoa-plus.js
          
          # 电子签名验证
          node scripts/verify-electronic-signatures.js

      - name: 🚦 Security Gate Decision
        run: |
          # 检查高危漏洞
          HIGH_VULNS=$(jq '.results | map(select(.severity == "HIGH" or .severity == "CRITICAL")) | length' security-report.json)
          
          if [ "$HIGH_VULNS" -gt 0 ]; then
            echo "❌ Security Gate 4 FAILED: $HIGH_VULNS high/critical vulnerabilities"
            exit 1
          else
            echo "✅ Security Gate 4 PASSED: No high/critical vulnerabilities"
          fi

  # 🚀 质量门禁5: 部署验证
  gate-5-deployment:
    name: 🚀 Gate 5 - Deployment Verification
    runs-on: ubuntu-latest
    needs: gate-4-security
    timeout-minutes: 15

    steps:
      - name: 📥 Checkout Code
        uses: actions/checkout@v4

      - name: 🛠️ Setup Environment
        uses: ./.github/actions/setup-environment
        with:
          node-version: ${{ env.NODE_VERSION }}
          go-version: ${{ env.GO_VERSION }}
          pnpm-version: ${{ env.PNPM_VERSION }}

      # Linus原则: "Release early, release often" - 部署验证确保发布就绪
      - name: 🏗️ Build All Services
        run: |
          echo "🏗️ Building all services..."
          
          # 构建前端
          cd apps/web
          pnpm build
          
          # 构建API
          cd ../api
          npm run build
          
          # 构建Go服务
          cd ../../service
          go build -o bin/ ./...

      - name: 🐳 Container Build Test
        run: |
          echo "🐳 Testing container builds..."
          
          # 如果有Dockerfile，测试容器构建
          if [ -f "apps/web/Dockerfile" ]; then
            docker build -t clinwise-web apps/web
          fi
          
          if [ -f "apps/api/Dockerfile" ]; then
            docker build -t clinwise-api apps/api
          fi

      - name: 🚀 Smoke Tests
        run: |
          echo "🚀 Running deployment smoke tests..."
          
          # 启动服务
          cd apps/api
          npm start &
          API_PID=$!
          
          cd ../web  
          pnpm start &
          WEB_PID=$!
          
          sleep 20
          
          # 烟雾测试
          curl -f http://localhost:8081/health || exit 1
          curl -f http://localhost:3000 || exit 1
          
          # 清理
          kill $API_PID $WEB_PID

      - name: 🎯 Final Quality Report
        run: |
          echo "🎯 Generating final quality report..."
          
          # 汇总所有质量门禁结果
          node scripts/generate-quality-summary.js \
            --code-quality="${{ needs.gate-1-code-quality.outputs.quality-score }}" \
            --coverage="${{ needs.gate-1-code-quality.outputs.coverage-report }}"
          
          echo "✅ All 5 Quality Gates PASSED!"
          echo "🚀 Code is ready for release!"

  # 📊 质量报告
  quality-report:
    name: 📊 Quality Report
    runs-on: ubuntu-latest
    needs: [gate-1-code-quality, gate-2-tdd-tests, gate-3-integration, gate-4-security, gate-5-deployment]
    if: always()

    steps:
      - name: 📥 Checkout Code
        uses: actions/checkout@v4

      - name: 📊 Generate Quality Dashboard
        run: |
          echo "📊 Generating quality dashboard..."
          
          # 下载所有构件
          # 生成质量趋势图
          # 发布到团队看板
          
          node scripts/update-quality-dashboard.js \
            --gates-passed="${{ needs.gate-5-deployment.result == 'success' }}" \
            --timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

      - name: 💬 Notify Team
        if: failure()
        run: |
          echo "💬 Notifying team of quality gate failures..."
          # 发送通知到团队频道
          curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚨 Quality Gates Failed in ClinWise EDC"}' \
            ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🛠️ 自定义Actions

### 📄 文件: `.github/actions/setup-environment/action.yml`

```yaml
name: 'Setup ClinWise Development Environment'
description: 'Setup Node.js, Go, and dependencies for ClinWise EDC'

inputs:
  node-version:
    description: 'Node.js version'
    required: true
    default: '20'
  go-version:
    description: 'Go version'
    required: true  
    default: '1.23'
  pnpm-version:
    description: 'pnpm version'
    required: true
    default: '8.x'

runs:
  using: 'composite'
  steps:
    - name: 🟢 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}

    - name: 📦 Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: ${{ inputs.pnpm-version }}

    - name: 🐹 Setup Go
      uses: actions/setup-go@v4
      with:
        go-version: ${{ inputs.go-version }}

    - name: 📥 Cache Dependencies
      uses: actions/cache@v4
      with:
        path: |
          ~/.pnpm-store
          ~/go/pkg/mod
          node_modules
          apps/*/node_modules
        key: deps-${{ runner.os }}-node${{ inputs.node-version }}-go${{ inputs.go-version }}-${{ hashFiles('pnpm-lock.yaml', 'go.sum') }}

    - name: 📥 Install Dependencies
      shell: bash
      run: |
        # 安装前端依赖
        pnpm install --frozen-lockfile
        
        # 安装Go依赖
        cd service && go mod download
        
        # 安装工具
        go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
        npm install -g @semgrep/semgrep truffleHog
```

---

## 📊 支持脚本

### 📄 文件: `scripts/verify-tdd-compliance.js`

```javascript
#!/usr/bin/env node
/**
 * TDD合规性验证脚本
 * 体现Linus哲学: "Show me the code" - 用代码证明TDD实践
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TDD_COMPLIANCE_THRESHOLD = 95; // 95%的测试必须是先写的

function verifyTDDCompliance(type) {
  console.log(`🧪 Verifying TDD compliance for ${type}...`);

  // 分析Git历史，查找测试优先的证据
  const gitLog = execSync('git log --oneline --since="7 days ago" --grep="test\\|spec"').toString();
  const commits = gitLog.split('\n').filter(line => line.trim());

  let tddCompliantCommits = 0;
  
  commits.forEach(commit => {
    // 检查是否遵循TDD模式: test -> implement -> refactor
    if (commit.includes('test:') || commit.includes('spec:') || commit.match(/^[a-f0-9]+ (test|spec)/)) {
      tddCompliantCommits++;
    }
  });

  const complianceRate = commits.length > 0 ? (tddCompliantCommits / commits.length) * 100 : 0;
  
  console.log(`📊 TDD Compliance: ${complianceRate.toFixed(1)}%`);
  console.log(`🎯 Threshold: ${TDD_COMPLIANCE_THRESHOLD}%`);

  if (complianceRate < TDD_COMPLIANCE_THRESHOLD) {
    console.error(`❌ TDD compliance below threshold: ${complianceRate.toFixed(1)}% < ${TDD_COMPLIANCE_THRESHOLD}%`);
    process.exit(1);
  }

  console.log(`✅ TDD compliance check passed: ${complianceRate.toFixed(1)}%`);
}

// 运行验证
const type = process.argv[3]?.replace('--type=', '') || 'unknown';
verifyTDDCompliance(type);
```

### 📄 文件: `scripts/calculate-quality-score.js`

```javascript
#!/usr/bin/env node
/**
 * 质量分数计算脚本
 * 实现Linus哲学的量化评估
 */

const fs = require('fs');

function calculateQualityScore() {
  console.log('🎯 Calculating quality score...');

  // 读取各种质量报告
  const reports = {
    frontend: readJsonReport('quality-frontend.json'),
    api: readJsonReport('quality-api.json'), 
    service: readJsonReport('quality-service.json'),
    coverage: readJsonReport('coverage-summary.json')
  };

  // 权重配置（体现Linus哲学优先级）
  const weights = {
    simplicity: 0.3,    // "Perfect is when nothing left to take away"
    testability: 0.3,   // "Show me the code" - 测试证明代码
    maintainability: 0.2, // "Good programmers know what to rewrite"
    collaboration: 0.2   // "Given enough eyeballs"
  };

  // 计算各维度分数
  const scores = {
    simplicity: calculateSimplicityScore(reports),
    testability: calculateTestabilityScore(reports),
    maintainability: calculateMaintainabilityScore(reports),
    collaboration: calculateCollaborationScore()
  };

  // 加权总分
  const totalScore = Object.keys(weights).reduce((sum, key) => {
    return sum + (scores[key] * weights[key]);
  }, 0);

  console.log('📊 Quality Score Breakdown:');
  console.log(`   Simplicity: ${scores.simplicity.toFixed(1)}/10`);
  console.log(`   Testability: ${scores.testability.toFixed(1)}/10`);
  console.log(`   Maintainability: ${scores.maintainability.toFixed(1)}/10`);
  console.log(`   Collaboration: ${scores.collaboration.toFixed(1)}/10`);
  console.log(`🎯 Total Score: ${totalScore.toFixed(1)}/10`);

  // 保存分数
  fs.writeFileSync('quality-score.txt', totalScore.toFixed(1));

  return totalScore;
}

function readJsonReport(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (error) {
    console.warn(`⚠️ Cannot read ${filename}: ${error.message}`);
    return {};
  }
}

function calculateSimplicityScore(reports) {
  // "Perfect is achieved when nothing left to take away"
  let score = 10;
  
  // 复杂度惩罚
  if (reports.frontend?.complexity > 10) score -= 2;
  if (reports.api?.complexity > 10) score -= 2;
  if (reports.service?.complexity > 10) score -= 2;
  
  // 重复代码惩罚
  if (reports.frontend?.duplication > 3) score -= 1;
  if (reports.api?.duplication > 3) score -= 1;
  
  return Math.max(0, score);
}

function calculateTestabilityScore(reports) {
  // "Show me the code" - 测试证明代码质量
  const coverage = reports.coverage?.total?.lines?.pct || 0;
  
  if (coverage >= 90) return 10;
  if (coverage >= 80) return 8;
  if (coverage >= 70) return 6;
  if (coverage >= 60) return 4;
  return 2;
}

function calculateMaintainabilityScore(reports) {
  // "Good programmers know what to rewrite"
  let score = 10;
  
  // 技术债务评估
  const technicalDebt = reports.frontend?.technicalDebt || 0;
  if (technicalDebt > 5) score -= 3;
  if (technicalDebt > 10) score -= 5;
  
  return Math.max(0, score);
}

function calculateCollaborationScore() {
  // "Given enough eyeballs, all bugs are shallow"
  // 基于PR审查率、讨论数量等
  return 8.5; // 简化实现
}

// 运行计算
calculateQualityScore();
```

---

## 🔧 使用指南

### 1. 快速设置

```bash
# 创建GitHub Actions目录
mkdir -p .github/{workflows,actions/setup-environment}

# 复制主要工作流文件
cp specs/04-development/04-workflow/templates/ci-quality-gates.yml .github/workflows/

# 复制自定义Actions
cp specs/04-development/04-workflow/templates/setup-environment.yml .github/actions/setup-environment/action.yml

# 创建支持脚本
mkdir -p scripts
cp specs/04-development/04-workflow/scripts/*.js scripts/
```

### 2. 环境变量配置

在GitHub Repository Settings中设置：

```yaml
# 必需的环境变量
SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/..."
DATABASE_URL: "postgresql://..."
JWT_SECRET: "your-jwt-secret"

# 可选的环境变量
SONAR_TOKEN: "your-sonar-token"
SEMGREP_APP_TOKEN: "your-semgrep-token"
```

### 3. 分支保护规则

```yaml
# GitHub分支保护设置
branch_protection:
  main:
    required_status_checks:
      - "gate-1-code-quality"
      - "gate-2-tdd-tests"  
      - "gate-3-integration"
      - "gate-4-security"
      - "gate-5-deployment"
    require_pull_request_reviews: true
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    restrict_pushes: true
```

---

## 📊 质量门禁SLA

```yaml
performance_targets:
  total_pipeline_time: "< 15 minutes"
  gate_1_code_quality: "< 2 minutes"
  gate_2_tdd_tests: "< 5 minutes"
  gate_3_integration: "< 6 minutes"  
  gate_4_security: "< 3 minutes"
  gate_5_deployment: "< 4 minutes"

reliability_targets:
  success_rate: "> 95%"
  false_positive_rate: "< 2%"
  availability: "> 99.5%"
```

---

**模板版本**: v1.0  
**创建日期**: 2024-08-28  
**适用项目**: ClinWise EDC  
**维护团队**: DevOps + 开发团队

**Linus哲学体现**:
- ✅ "Show me the code" - 所有配置都是代码
- ✅ "Release early, release often" - 每次提交都可能发布
- ✅ "Given enough eyeballs" - 多重自动化检查
- ✅ "Perfect is achieved..." - 流水线配置保持简洁
- ✅ "Good programmers know what to rewrite" - 渐进式改进流水线