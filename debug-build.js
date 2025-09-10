#!/usr/bin/env node

// 调试脚本：捕获和分析构建时的 self 错误

const { spawn } = require('child_process');

console.log('开始调试构建过程...');

// 设置环境变量来捕获更详细的错误信息
const env = {
  ...process.env,
  NODE_ENV: 'production',
  DEBUG: '*',
};

// 创建一个修补的 global 对象来捕获 self 访问
const originalProcess = process.on;
process.on = function(event, handler) {
  if (event === 'unhandledRejection') {
    const wrappedHandler = function(reason, promise) {
      if (reason && reason.message && reason.message.includes('self is not defined')) {
        console.log('\n🚨 捕获到 self is not defined 错误:');
        console.log('错误堆栈:', reason.stack);
        
        // 尝试提供更多上下文
        console.log('\n当前 global 对象的键:', Object.keys(global).slice(0, 20));
        console.log('typeof self:', typeof self);
        console.log('typeof globalThis:', typeof globalThis);
        console.log('typeof window:', typeof window);
      }
      return handler(reason, promise);
    };
    return originalProcess.call(this, event, wrappedHandler);
  }
  return originalProcess.call(this, event, handler);
};

// 运行构建命令
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'pipe',
  env
});

let buildOutput = '';
let buildError = '';

buildProcess.stdout.on('data', (data) => {
  const output = data.toString();
  buildOutput += output;
  process.stdout.write(output);
});

buildProcess.stderr.on('data', (data) => {
  const error = data.toString();
  buildError += error;
  process.stderr.write(error);
});

buildProcess.on('close', (code) => {
  console.log(`\n构建进程退出，代码: ${code}`);
  
  if (code !== 0) {
    console.log('\n📊 构建失败分析:');
    console.log('退出代码:', code);
    
    if (buildError.includes('self is not defined')) {
      console.log('\n✅ 确认：错误与 self 未定义有关');
      
      // 分析可能的原因
      console.log('\n🔍 可能的解决方案:');
      console.log('1. 检查是否有第三方库在服务端访问了 self');
      console.log('2. 检查 Next.js 配置是否正确');
      console.log('3. 检查是否有客户端专用代码被服务端执行');
    }
  } else {
    console.log('\n✅ 构建成功！');
  }
});

// 处理脚本本身的错误
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes('self is not defined')) {
    console.log('\n🎯 在调试脚本中捕获到 self 错误!');
    console.log('这证明错误确实与 self 访问有关');
    
    // 添加临时的 self polyfill 来看看能否解决
    if (typeof globalThis !== 'undefined' && !globalThis.self) {
      console.log('尝试添加 self polyfill...');
      globalThis.self = globalThis;
    }
  }
});