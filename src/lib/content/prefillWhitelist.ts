/**
 * 预填参数白名单配置
 * Sprint 13 - T004: 安全的参数预填白名单
 */

// 计算器参数白名单配置
export const CALCULATOR_PREFILL_WHITELIST: Record<string, {
  allowedParams: string[];
  paramTypes: Record<string, 'string' | 'number' | 'boolean' | 'array'>;
  paramValidation?: Record<string, (value: any) => boolean>;
  maxValues?: Record<string, number>;
}> = {
  '/calculator/mean': {
    allowedParams: ['numbers', 'precision'],
    paramTypes: {
      numbers: 'string',  // 逗号分隔的数字字符串
      precision: 'number'
    },
    paramValidation: {
      numbers: (value) => {
        if (typeof value !== 'string') return false;
        const nums = value.split(',').map(n => n.trim());
        return nums.every(n => !isNaN(parseFloat(n)));
      },
      precision: (value) => {
        const num = Number(value);
        return !isNaN(num) && num >= 0 && num <= 10;
      }
    },
    maxValues: {
      numbers: 100  // 最多100个数字
    }
  },
  
  '/calculator/median': {
    allowedParams: ['numbers', 'showQuartiles'],
    paramTypes: {
      numbers: 'string',
      showQuartiles: 'boolean'
    },
    paramValidation: {
      numbers: (value) => {
        if (typeof value !== 'string') return false;
        const nums = value.split(',').map(n => n.trim());
        return nums.every(n => !isNaN(parseFloat(n)));
      }
    },
    maxValues: {
      numbers: 100
    }
  },
  
  '/calculator/standard-deviation': {
    allowedParams: ['numbers', 'type', 'precision'],
    paramTypes: {
      numbers: 'string',
      type: 'string',
      precision: 'number'
    },
    paramValidation: {
      numbers: (value) => {
        if (typeof value !== 'string') return false;
        const nums = value.split(',').map(n => n.trim());
        return nums.every(n => !isNaN(parseFloat(n)));
      },
      type: (value) => ['sample', 'population'].includes(value),
      precision: (value) => {
        const num = Number(value);
        return !isNaN(num) && num >= 0 && num <= 10;
      }
    },
    maxValues: {
      numbers: 100
    }
  },
  
  '/calculator/weighted-mean': {
    allowedParams: ['values', 'weights', 'precision'],
    paramTypes: {
      values: 'string',
      weights: 'string',
      precision: 'number'
    },
    paramValidation: {
      values: (value) => {
        if (typeof value !== 'string') return false;
        const vals = value.split(',').map(v => v.trim());
        return vals.every(v => !isNaN(parseFloat(v)));
      },
      weights: (value) => {
        if (typeof value !== 'string') return false;
        const wts = value.split(',').map(w => w.trim());
        return wts.every(w => !isNaN(parseFloat(w)) && parseFloat(w) >= 0);
      }
    },
    maxValues: {
      values: 50,
      weights: 50
    }
  },
  
  '/calculator/gpa': {
    allowedParams: ['courses', 'scale'],
    paramTypes: {
      courses: 'array',
      scale: 'string'
    },
    paramValidation: {
      scale: (value) => ['4.0', '4.3', '4.5'].includes(value)
    }
  },
  
  '/calculator/unweighted-gpa': {
    allowedParams: ['courses', 'gradingSystem'],
    paramTypes: {
      courses: 'array',
      gradingSystem: 'string'
    },
    paramValidation: {
      gradingSystem: (value) => ['standard', 'plusminus'].includes(value)
    }
  },
  
  '/calculator/variance': {
    allowedParams: ['numbers', 'type'],
    paramTypes: {
      numbers: 'string',
      type: 'string'
    },
    paramValidation: {
      numbers: (value) => {
        if (typeof value !== 'string') return false;
        const nums = value.split(',').map(n => n.trim());
        return nums.every(n => !isNaN(parseFloat(n)));
      },
      type: (value) => ['sample', 'population'].includes(value)
    },
    maxValues: {
      numbers: 100
    }
  },
  
  '/calculator/range': {
    allowedParams: ['numbers'],
    paramTypes: {
      numbers: 'string'
    },
    paramValidation: {
      numbers: (value) => {
        if (typeof value !== 'string') return false;
        const nums = value.split(',').map(n => n.trim());
        return nums.every(n => !isNaN(parseFloat(n)));
      }
    },
    maxValues: {
      numbers: 100
    }
  },
  
  '/calculator/percent-error': {
    allowedParams: ['theoretical', 'experimental', 'precision'],
    paramTypes: {
      theoretical: 'number',
      experimental: 'number',
      precision: 'number'
    },
    paramValidation: {
      theoretical: (value) => !isNaN(Number(value)),
      experimental: (value) => !isNaN(Number(value)),
      precision: (value) => {
        const num = Number(value);
        return !isNaN(num) && num >= 0 && num <= 10;
      }
    }
  },
  
  '/calculator/confidence-interval': {
    allowedParams: ['mean', 'stdDev', 'sampleSize', 'confidenceLevel'],
    paramTypes: {
      mean: 'number',
      stdDev: 'number',
      sampleSize: 'number',
      confidenceLevel: 'string'
    },
    paramValidation: {
      mean: (value) => !isNaN(Number(value)),
      stdDev: (value) => !isNaN(Number(value)) && Number(value) >= 0,
      sampleSize: (value) => {
        const num = Number(value);
        return !isNaN(num) && num > 0 && Number.isInteger(num);
      },
      confidenceLevel: (value) => ['90', '95', '99'].includes(value)
    }
  }
};

/**
 * 验证并清理预填参数
 */
export function sanitizePrefillParams(
  calculatorPath: string,
  params: Record<string, any>
): Record<string, any> {
  const whitelist = CALCULATOR_PREFILL_WHITELIST[calculatorPath];
  
  if (!whitelist) {
    console.warn(`No whitelist configuration for calculator: ${calculatorPath}`);
    return {};
  }
  
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    // 检查参数是否在白名单中
    if (!whitelist.allowedParams.includes(key)) {
      console.warn(`Parameter "${key}" is not whitelisted for ${calculatorPath}`);
      continue;
    }
    
    // 类型验证
    const expectedType = whitelist.paramTypes[key];
    if (expectedType === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        console.warn(`Invalid number value for "${key}": ${value}`);
        continue;
      }
      sanitized[key] = num;
    } else if (expectedType === 'boolean') {
      sanitized[key] = value === 'true' || value === true;
    } else if (expectedType === 'array') {
      // 处理数组类型（通常是JSON字符串）
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (Array.isArray(parsed)) {
          sanitized[key] = parsed;
        }
      } catch {
        console.warn(`Invalid array value for "${key}": ${value}`);
        continue;
      }
    } else {
      sanitized[key] = String(value);
    }
    
    // 自定义验证
    if (whitelist.paramValidation?.[key]) {
      if (!whitelist.paramValidation[key](sanitized[key])) {
        console.warn(`Validation failed for "${key}": ${sanitized[key]}`);
        delete sanitized[key];
        continue;
      }
    }
    
    // 最大值限制（用于数组长度）
    if (whitelist.maxValues?.[key] && typeof sanitized[key] === 'string') {
      const items = sanitized[key].split(',');
      if (items.length > whitelist.maxValues[key]) {
        console.warn(`Too many values for "${key}": ${items.length} (max: ${whitelist.maxValues[key]})`);
        sanitized[key] = items.slice(0, whitelist.maxValues[key]).join(',');
      }
    }
  }
  
  return sanitized;
}

/**
 * 生成带预填参数的安全URL
 */
export function generatePrefillUrl(
  calculatorPath: string,
  params: Record<string, any>
): string {
  const sanitizedParams = sanitizePrefillParams(calculatorPath, params);
  
  if (Object.keys(sanitizedParams).length === 0) {
    return calculatorPath;
  }
  
  const queryString = new URLSearchParams(
    Object.entries(sanitizedParams).map(([key, value]) => [
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value)
    ])
  ).toString();
  
  return `${calculatorPath}?${queryString}`;
}

/**
 * 从URL解析预填参数
 */
export function parsePrefillParams(url: string): {
  path: string;
  params: Record<string, any>;
} {
  const urlObj = new URL(url, 'http://example.com'); // 使用虚拟域名处理相对路径
  const path = urlObj.pathname;
  const params: Record<string, any> = {};
  
  urlObj.searchParams.forEach((value, key) => {
    // 尝试解析JSON（用于数组类型）
    try {
      const parsed = JSON.parse(value);
      params[key] = parsed;
    } catch {
      // 不是JSON，作为普通字符串处理
      params[key] = value;
    }
  });
  
  return { path, params: sanitizePrefillParams(path, params) };
}