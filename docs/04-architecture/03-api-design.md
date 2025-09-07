# API 设计规范

id: ARCH-API-DESIGN-001
---
id: ARCH-API-DESIGN-001
owner: @product-owner
acceptance: docs/03-acceptance/04-architecture.feature
version: 1.0
created: 2025-09-05
status: Draft
reviewers: []
---

## 目的

定义 Stat Tools 的 API 设计标准和规范，确保 API 的一致性、可用性和可维护性，为前端和第三方集成提供清晰的接口定义。

## API 设计原则

### 1. RESTful 设计
- 使用标准 HTTP 方法 (GET, POST, PUT, DELETE)
- 资源导向的 URL 设计
- 使用 HTTP 状态码表达操作结果
- 统一的响应格式

### 2. 一致性
- 统一的命名约定
- 一致的错误处理
- 统一的分页和过滤方式
- 标准化的时间格式

### 3. 安全性
- 输入验证和清理
- Rate limiting 防止滥用
- CORS 配置
- 敏感数据保护

### 4. 性能
- 适当的缓存策略
- 响应体大小优化
- 分页支持
- 批量操作支持

### 5. 可扩展性
- 版本控制策略
- 向后兼容性
- 可选参数设计
- 扩展点预留

## API 基础规范

### URL 设计规范

```
基础 URL: https://stattools.example.com/api/v1

资源路径结构:
/api/v{version}/{resource}[/{id}][/{sub-resource}]

示例:
GET  /api/v1/calculators                 # 获取计算器列表
POST /api/v1/calculators/mean           # 执行均值计算
GET  /api/v1/exports/{id}               # 获取导出文件信息
POST /api/v1/exports                    # 创建导出任务
```

### HTTP 方法使用规范

| 方法 | 用途 | 幂等性 | 安全性 | 示例 |
|------|------|--------|--------|------|
| GET | 获取资源 | ✓ | ✓ | 获取计算结果历史 |
| POST | 创建资源/执行操作 | ✗ | ✗ | 执行计算、创建导出 |
| PUT | 更新整个资源 | ✓ | ✗ | 更新用户配置 |
| PATCH | 部分更新资源 | ✗ | ✗ | 更新计算参数 |
| DELETE | 删除资源 | ✓ | ✗ | 删除历史记录 |

### 状态码规范

#### 成功状态码 (2xx)
- `200 OK` - 请求成功
- `201 Created` - 资源创建成功
- `202 Accepted` - 请求已接受，异步处理中
- `204 No Content` - 请求成功，无返回内容

#### 客户端错误 (4xx)
- `400 Bad Request` - 请求参数错误
- `401 Unauthorized` - 需要身份认证
- `403 Forbidden` - 无权限访问
- `404 Not Found` - 资源不存在
- `422 Unprocessable Entity` - 请求格式正确但语义错误
- `429 Too Many Requests` - 请求频率超限

#### 服务器错误 (5xx)
- `500 Internal Server Error` - 服务器内部错误
- `502 Bad Gateway` - 网关错误
- `503 Service Unavailable` - 服务不可用
 - `504 Gateway Timeout` - 网关超时

### 统一响应与错误模型

所有响应主体应包含可溯源的请求 ID 字段，错误响应使用统一的错误结构。

成功响应示例：

```json
{
  "data": { "mean": 2.5, "count": 4 },
  "requestId": "c1a2b3..."
}
```

错误响应示例：

```json
{
  "error_code": "INVALID_INPUT",
  "message": "numbers must be a non-empty array of finite numbers",
  "requestId": "c1a2b3..."
}
```

错误码规范（部分）：

| error_code       | 说明                     | HTTP 状态 |
|------------------|--------------------------|-----------|
| INVALID_INPUT    | 请求参数校验失败         | 400       |
| UNAUTHORIZED     | 未认证                   | 401       |
| FORBIDDEN        | 无访问权限               | 403       |
| NOT_FOUND        | 资源不存在               | 404       |
| RATE_LIMITED     | 访问频率超限             | 429       |
| SERVER_ERROR     | 未分类的服务器内部错误   | 500       |

实现约定：
- 网关在进入点生成 `requestId`（或复用下游 trace ID）并传递到日志与响应。
- 服务端日志需结构化记录：`{ level, requestId, path, status, duration_ms, error_code }`。
- 前端/客户端遇到错误时，优先展示 `message`；同时记录 `requestId` 以便排障。

## 计算器 API 设计

### 均值计算 API

#### 请求规范
```http
POST /api/v1/calculators/mean
Content-Type: application/json

{
  "numbers": [1, 2, 3, 4, 5],
  "precision": 2,
  "ignore_non_numeric": true,
  "metadata": {
    "user_agent": "StatTools Web Client",
    "timestamp": "2025-09-05T10:30:00Z"
  }
}
```

#### 请求验证
```typescript
interface MeanCalculationRequest {
  numbers: number[]              // 必需，至少包含1个数字
  precision?: number            // 可选，0-10之间，默认2
  ignore_non_numeric?: boolean  // 可选，默认true
  metadata?: {                  // 可选，用于分析
    user_agent?: string
    timestamp?: string
    source?: string
  }
}

const validationRules = {
  numbers: {
    required: true,
    type: 'array',
    minLength: 1,
    maxLength: 10000,
    items: { type: 'number', finite: true }
  },
  precision: {
    type: 'number',
    min: 0,
    max: 10,
    default: 2
  },
  ignore_non_numeric: {
    type: 'boolean',
    default: true
  }
}
```

#### 成功响应
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=300

{
  "success": true,
  "data": {
    "result": {
      "mean": 3.00,
      "count": 5,
      "sum": 15.00,
      "precision": 2
    },
    "steps": [
      "将输入数字求和: 1 + 2 + 3 + 4 + 5 = 15",
      "计算总数: 5个数字",
      "计算均值: 15 ÷ 5 = 3.00"
    ],
    "formula": "μ = (Σx) / n",
    "explanation": "算术均值是所有数值的总和除以数值的个数。",
    "metadata": {
      "calculation_time_ms": 12,
      "algorithm_version": "1.0.0"
    }
  },
  "request_id": "req_abc123",
  "timestamp": "2025-09-05T10:30:00.123Z"
}
```

#### 错误响应
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "输入数据验证失败",
    "details": [
      {
        "field": "numbers",
        "message": "数组不能为空",
        "value": []
      }
    ],
    "suggestions": [
      "请提供至少一个有效数字",
      "确保所有数字都是有限数值"
    ]
  },
  "request_id": "req_abc123",
  "timestamp": "2025-09-05T10:30:00.123Z"
}
```

### 标准差计算 API

```http
POST /api/v1/calculators/standard-deviation
Content-Type: application/json

{
  "numbers": [1, 2, 3, 4, 5],
  "population": false,  // false=样本标准差, true=总体标准差
  "precision": 3
}
```

### 加权均值计算 API

```http
POST /api/v1/calculators/weighted-mean
Content-Type: application/json

{
  "pairs": [
    {"value": 85, "weight": 3},
    {"value": 90, "weight": 2},
    {"value": 78, "weight": 1}
  ],
  "precision": 2
}
```

### GPA计算 API

```http
POST /api/v1/calculators/gpa
Content-Type: application/json

{
  "grades": [
    {"grade": "A", "credit_hours": 3},
    {"grade": "B+", "credit_hours": 4},
    {"grade": "A-", "credit_hours": 2}
  ],
  "scale": "4.0",  // "4.0" 或 "percentage"
  "precision": 2
}
```

## 导出 API 设计

### 创建导出任务

```http
POST /api/v1/exports
Content-Type: application/json

{
  "type": "csv",
  "data": {
    "calculation_type": "mean",
    "input": [1, 2, 3, 4, 5],
    "result": {
      "mean": 3.00,
      "count": 5,
      "sum": 15.00
    }
  },
  "options": {
    "include_steps": true,
    "filename": "mean_calculation_results.csv"
  }
}
```

#### 响应
```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "success": true,
  "data": {
    "export_id": "exp_abc123",
    "status": "processing",
    "estimated_completion": "2025-09-05T10:31:00Z",
    "download_url": null
  },
  "request_id": "req_def456"
}
```

### 查询导出状态

```http
GET /api/v1/exports/exp_abc123
```

#### 响应（处理完成）
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "export_id": "exp_abc123",
    "status": "completed",
    "download_url": "https://r2.example.com/exports/exp_abc123.csv?signature=...",
    "expires_at": "2025-09-12T10:30:00Z",
    "file_size": 1024,
    "created_at": "2025-09-05T10:30:00Z",
    "completed_at": "2025-09-05T10:30:30Z"
  }
}
```

## 响应格式标准

### 统一响应结构

```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Array<{
      field?: string
      message: string
      value?: any
    }>
    suggestions?: string[]
  }
  meta?: {
    pagination?: PaginationInfo
    rate_limit?: RateLimitInfo
  }
  request_id: string
  timestamp: string
}

interface PaginationInfo {
  page: number
  per_page: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

interface RateLimitInfo {
  limit: number
  remaining: number
  reset_at: string
}
```

### 分页响应示例

```http
GET /api/v1/history?page=2&per_page=10
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": [
    {
      "id": "calc_123",
      "type": "mean",
      "result": { "mean": 3.5 },
      "created_at": "2025-09-05T10:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 2,
      "per_page": 10,
      "total_count": 156,
      "total_pages": 16,
      "has_next": true,
      "has_prev": true
    }
  }
}
```

## 错误处理标准

### 错误代码规范

| 错误代码 | HTTP状态码 | 描述 | 示例场景 |
|----------|------------|------|----------|
| `INVALID_INPUT` | 400 | 输入参数无效 | 数字数组为空 |
| `VALIDATION_ERROR` | 422 | 数据验证失败 | 精度超出范围 |
| `RATE_LIMITED` | 429 | 请求频率超限 | 超过每分钟100次限制 |
| `CALCULATION_ERROR` | 400 | 计算逻辑错误 | 除零错误 |
| `EXPORT_FAILED` | 500 | 导出处理失败 | R2存储错误 |
| `RESOURCE_NOT_FOUND` | 404 | 资源不存在 | 导出ID无效 |
| `SERVICE_UNAVAILABLE` | 503 | 服务不可用 | 维护期间 |

### 错误响应格式

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string           // 用户友好的错误描述
    details?: ErrorDetail[]   // 具体字段错误信息
    suggestions?: string[]    // 修复建议
    debug_info?: {           // 仅开发环境
      stack_trace?: string
      internal_error?: string
    }
  }
  request_id: string
  timestamp: string
}

interface ErrorDetail {
  field?: string
  message: string
  value?: any
  constraint?: string
}
```

### 错误响应示例

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入数据验证失败",
    "details": [
      {
        "field": "precision",
        "message": "精度必须在0到10之间",
        "value": 15,
        "constraint": "min: 0, max: 10"
      },
      {
        "field": "numbers.2",
        "message": "数字不能是无穷大",
        "value": "Infinity"
      }
    ],
    "suggestions": [
      "设置precision为0-10之间的整数",
      "检查输入数字的有效性"
    ]
  },
  "request_id": "req_abc123",
  "timestamp": "2025-09-05T10:30:00.123Z"
}
```

## 安全与限制

### Rate Limiting

```http
# 请求头
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1633104000

# 超限响应
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "请求频率超出限制",
    "details": [
      {
        "message": "每分钟最多100次请求，请稍后再试"
      }
    ]
  }
}
```

### 输入验证和限制

```typescript
const API_LIMITS = {
  // 数组大小限制
  MAX_NUMBERS_COUNT: 10000,
  MAX_EXPORT_SIZE: 1024 * 1024, // 1MB
  
  // 字符串长度限制  
  MAX_FILENAME_LENGTH: 255,
  MAX_METADATA_SIZE: 1024,
  
  // 数值范围限制
  MAX_PRECISION: 10,
  MAX_NUMBER_VALUE: Number.MAX_SAFE_INTEGER,
  MIN_NUMBER_VALUE: Number.MIN_SAFE_INTEGER,
  
  // 时间限制
  MAX_EXPORT_TTL: 7 * 24 * 60 * 60, // 7天
  CALCULATION_TIMEOUT: 30000 // 30秒
}
```

### CORS 配置

```typescript
const corsConfig = {
  origin: [
    'https://stattools.example.com',
    'https://www.stattools.example.com',
    /^https:\/\/.*\.stattools\.example\.com$/
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  credentials: false,
  maxAge: 86400 // 24小时
}
```

## API 版本控制

### 版本策略
- **URL版本控制**: `/api/v1/`, `/api/v2/`
- **语义化版本**: 主版本.次版本.补丁版本
- **向后兼容**: 同一主版本内保持向后兼容
- **弃用策略**: 提前6个月公告，提供迁移指南

### 版本生命周期
```
v1.0.0 -> v1.1.0 -> v1.2.0 -> v2.0.0
   ^         ^         ^         ^
   |         |         |         |
   首发      功能增强   bug修复    破坏性更新
```

### API变更类型

| 变更类型 | 版本更新 | 向后兼容 | 示例 |
|----------|----------|----------|------|
| 新增端点 | 次版本 | ✓ | 添加新计算器 |
| 新增可选参数 | 次版本 | ✓ | 添加format参数 |
| 新增响应字段 | 补丁版本 | ✓ | 添加calculation_id |
| 修改必需参数 | 主版本 | ✗ | precision变为必需 |
| 删除端点 | 主版本 | ✗ | 移除旧端点 |
| 修改响应格式 | 主版本 | ✗ | 改变data结构 |

## API 文档和测试

### OpenAPI 规范

```yaml
openapi: 3.0.3
info:
  title: Stat Tools API
  description: 统计计算工具API
  version: 1.0.0
  contact:
    name: API Support
    url: https://stattools.example.com/support
    email: api@stattools.example.com

servers:
  - url: https://stattools.example.com/api/v1
    description: Production server
  - url: https://staging.stattools.example.com/api/v1
    description: Staging server

paths:
  /calculators/mean:
    post:
      summary: 计算算术均值
      operationId: calculateMean
      tags: [Calculators]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MeanCalculationRequest'
      responses:
        '200':
          description: 计算成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MeanCalculationResponse'
        '400':
          description: 输入错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    MeanCalculationRequest:
      type: object
      required: [numbers]
      properties:
        numbers:
          type: array
          items:
            type: number
          minItems: 1
          maxItems: 10000
        precision:
          type: integer
          minimum: 0
          maximum: 10
          default: 2
```

### API测试策略

```typescript
// API集成测试示例
describe('Mean Calculator API', () => {
  test('should calculate mean correctly', async () => {
    const response = await request(app)
      .post('/api/v1/calculators/mean')
      .send({
        numbers: [1, 2, 3, 4, 5],
        precision: 2
      })
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(response.body.data.result.mean).toBe(3.00)
    expect(response.body.data.result.count).toBe(5)
  })
  
  test('should handle validation errors', async () => {
    const response = await request(app)
      .post('/api/v1/calculators/mean')
      .send({
        numbers: [],
        precision: 15
      })
      .expect(400)
    
    expect(response.body.success).toBe(false)
    expect(response.body.error.code).toBe('INVALID_INPUT')
    expect(response.body.error.details).toHaveLength(2)
  })
})
```

## 监控和分析

### API指标监控

```typescript
const apiMetrics = {
  // 响应时间
  response_time: {
    p50: 120,  // 50% 请求在120ms内完成
    p95: 500,  // 95% 请求在500ms内完成
    p99: 1000  // 99% 请求在1000ms内完成
  },
  
  // 错误率
  error_rate: {
    total: 0.5,     // 总错误率 < 0.5%
    client_error: 2, // 4xx错误率 < 2%
    server_error: 0.1 // 5xx错误率 < 0.1%
  },
  
  // 吞吐量
  throughput: {
    requests_per_second: 100,
    peak_rps: 500
  }
}
```

### 日志格式

```json
{
  "timestamp": "2025-09-05T10:30:00.123Z",
  "level": "info",
  "type": "api_request",
  "request_id": "req_abc123",
  "method": "POST",
  "path": "/api/v1/calculators/mean",
  "status_code": 200,
  "response_time_ms": 145,
  "user_agent": "StatTools Web Client",
  "ip_address": "203.0.113.1",
  "request_size": 256,
  "response_size": 1024,
  "cache_hit": false,
  "errors": [],
  "metadata": {
    "calculation_type": "mean",
    "numbers_count": 5,
    "precision": 2
  }
}
```

---

**维护责任人**：后端开发团队
**审查周期**：每季度评估API设计
**版本策略**：语义化版本控制，向后兼容
