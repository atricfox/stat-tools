#!/usr/bin/env bash
set -euo pipefail

# Stat Tools 环境变量设置脚本
# 用于快速创建开发环境配置

echo "🚀 Stat Tools 环境变量设置向导"
echo "======================================"

ENV_FILE=".env.local"

# 检查是否已存在 .env.local
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  $ENV_FILE 已存在"
    read -p "是否覆盖现有文件? (y/N): " overwrite
    overwrite=${overwrite:-N}
    if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
        echo "❌ 取消设置"
        exit 0
    fi
fi

echo "📝 创建 $ENV_FILE..."

# 从 .env.example 复制
cp .env.example "$ENV_FILE"

echo "✅ 已创建 $ENV_FILE"
echo ""
echo "📋 后续步骤:"
echo "1. 编辑 $ENV_FILE 文件"
echo "2. 填入实际的环境变量值"
echo "3. 设置 Cloudflare 相关配置"
echo ""
echo "🔐 重要提醒:"
echo "- 不要将 .env.local 提交到 Git"
echo "- 生产环境密钥应通过 CI/CD 或 wrangler secret 设置"
echo "- 定期轮换敏感密钥"
echo ""
echo "📚 参考文档:"
echo "- Next.js 环境变量: https://nextjs.org/docs/basic-features/environment-variables"
echo "- Cloudflare Workers: https://developers.cloudflare.com/workers/"

# 提示用户编辑文件
if command -v code >/dev/null 2>&1; then
    read -p "是否用 VS Code 打开 $ENV_FILE 进行编辑? (y/N): " open_vscode
    open_vscode=${open_vscode:-N}
    if [[ "$open_vscode" =~ ^[Yy]$ ]]; then
        code "$ENV_FILE"
    fi
elif command -v nano >/dev/null 2>&1; then
    read -p "是否用 nano 打开 $ENV_FILE 进行编辑? (y/N): " open_nano
    open_nano=${open_nano:-N}
    if [[ "$open_nano" =~ ^[Yy]$ ]]; then
        nano "$ENV_FILE"
    fi
fi

echo ""
echo "🎉 环境变量设置完成!"