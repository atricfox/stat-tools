/**
 * Copy results component with multiple format options
 * Provides easy ways to copy calculation results for students
 */

'use client'

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Share2, 
  FileText,
  Code,
  Table,
  Hash,
  BookOpen,
  Mail,
  MessageSquare,
  Printer,
  Link,
  Users
} from 'lucide-react';
import { MeanCalculationResult } from '@/lib/calculations';

export interface CopyFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  generate: (result: MeanCalculationResult, precision: number) => string;
}

export interface CopyResultsProps {
  result: MeanCalculationResult;
  precision?: number;
  context?: 'student' | 'research' | 'teacher';
  showSteps?: boolean;
  className?: string;
}

const CopyResults: React.FC<CopyResultsProps> = ({
  result,
  precision = 2,
  context = 'student',
  showSteps = true,
  className = ''
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('simple');

  // Define copy formats based on context
  const formats: CopyFormat[] = [
    {
      id: 'simple',
      name: '简单格式',
      description: '适合作业提交',
      icon: FileText,
      generate: (result, precision) => 
        `平均数 = ${result.mean.toFixed(precision)}`
    },
    {
      id: 'detailed',
      name: '详细格式',
      description: '包含完整信息',
      icon: BookOpen,
      generate: (result, precision) => 
        `平均数计算结果：
数据个数：${result.count}
数据总和：${result.sum.toFixed(precision)}
平均数：${result.mean.toFixed(precision)}
${result.standardDeviation ? `标准差：${result.standardDeviation.toFixed(precision)}` : ''}`
    },
    {
      id: 'steps',
      name: '计算步骤',
      description: '显示推理过程',
      icon: Hash,
      generate: (result, precision) => 
        `平均数计算步骤：
1. 数据个数：n = ${result.count}
2. 数据总和：∑x = ${result.sum.toFixed(precision)}
3. 计算平均数：x̄ = ∑x ÷ n = ${result.sum.toFixed(precision)} ÷ ${result.count} = ${result.mean.toFixed(precision)}`
    },
    {
      id: 'table',
      name: '表格格式',
      description: '适合报告',
      icon: Table,
      generate: (result, precision) => 
        `| 统计量 | 数值 |
|--------|------|
| 样本大小 | ${result.count} |
| 总和 | ${result.sum.toFixed(precision)} |
| 平均数 | ${result.mean.toFixed(precision)} |
${result.standardDeviation ? `| 标准差 | ${result.standardDeviation.toFixed(precision)} |` : ''}`
    },
    {
      id: 'json',
      name: 'JSON格式',
      description: '程序使用',
      icon: Code,
      generate: (result, precision) => 
        JSON.stringify({
          mean: Number(result.mean.toFixed(precision)),
          count: result.count,
          sum: Number(result.sum.toFixed(precision)),
          ...(result.standardDeviation && { standardDeviation: Number(result.standardDeviation.toFixed(precision)) })
        }, null, 2)
    }
  ];

  // Filter formats based on context
  const contextFormats = formats.filter(format => {
    if (context === 'student') {
      return ['simple', 'detailed', 'steps'].includes(format.id);
    } else if (context === 'research') {
      return ['detailed', 'table', 'json'].includes(format.id);
    } else { // teacher
      return ['detailed', 'steps', 'table'].includes(format.id);
    }
  });

  const handleCopy = async (format: CopyFormat) => {
    try {
      const text = format.generate(result, precision);
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format.id);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleShare = async () => {
    const format = contextFormats.find(f => f.id === selectedFormat);
    if (!format) return;

    const text = format.generate(result, precision);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '统计计算结果',
          text: text
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback to copying link
      handleCopy(format);
    }
  };

  const handleDownload = () => {
    const format = contextFormats.find(f => f.id === selectedFormat);
    if (!format) return;

    const text = format.generate(result, precision);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mean-calculation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getContextualActions = () => {
    const actions = {
      student: [
        { icon: Mail, label: '发送给老师', action: () => {}, description: '通过邮件发送' },
        { icon: Printer, label: '打印作业', action: () => window.print(), description: '打印当前页面' }
      ],
      research: [
        { icon: Link, label: '生成链接', action: () => {}, description: '创建分享链接' },
        { icon: Download, label: '导出数据', action: handleDownload, description: '下载为文件' }
      ],
      teacher: [
        { icon: Users, label: '分享给学生', action: handleShare, description: '分享给班级' },
        { icon: MessageSquare, label: '添加备注', action: () => {}, description: '添加教学备注' }
      ]
    };
    return actions[context];
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Copy className="h-5 w-5 text-blue-600 mr-2" />
            复制结果
          </h3>
          <div className="text-sm text-gray-500">
            选择格式并复制
          </div>
        </div>
      </div>

      {/* Format Selection */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contextFormats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-3 text-left border rounded-lg transition-all ${
                selectedFormat === format.id
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-2">
                <format.icon className={`h-4 w-4 mr-2 ${
                  selectedFormat === format.id ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <span className="font-medium text-sm">{format.name}</span>
              </div>
              <p className="text-xs text-gray-600">{format.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">预览</h4>
        <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {contextFormats.find(f => f.id === selectedFormat)?.generate(result, precision)}
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {/* Primary copy button */}
          <button
            onClick={() => {
              const format = contextFormats.find(f => f.id === selectedFormat);
              if (format) handleCopy(format);
            }}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              copiedFormat === selectedFormat
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copiedFormat === selectedFormat ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                复制
              </>
            )}
          </button>

          {/* Context-specific actions */}
          {getContextualActions().map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title={action.description}
            >
              <action.icon className="h-4 w-4 mr-1" />
              <span className="text-sm">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Quick copy buttons for all formats */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">快速复制:</div>
          <div className="flex flex-wrap gap-1">
            {contextFormats.map((format) => (
              <button
                key={`quick-${format.id}`}
                onClick={() => handleCopy(format)}
                className={`flex items-center px-2 py-1 text-xs rounded transition-colors ${
                  copiedFormat === format.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={`复制${format.name}`}
              >
                <format.icon className="h-3 w-3 mr-1" />
                {copiedFormat === format.id ? '已复制' : format.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Context-specific tips */}
      {context === 'student' && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>作业提示:</strong> 使用"详细格式"或"计算步骤"格式可以展示你的解题过程，获得更好的分数。
          </div>
        </div>
      )}

      {context === 'teacher' && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <div className="text-sm text-green-800">
            <strong>教学建议:</strong> 鼓励学生使用"计算步骤"格式来展示他们的数学推理过程。
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyResults;