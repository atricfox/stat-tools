/**
 * Share manager component for research scenarios
 * Provides comprehensive sharing options with URL state management
 */

'use client'

import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Link2, 
  Copy, 
  QrCode, 
  Mail, 
  MessageSquare,
  Download,
  Eye,
  EyeOff,
  Clock,
  Users,
  Check,
  X,
  Settings,
  BookOpen,
  Globe,
  Lock,
  RefreshCw,
  Trash2,
  Edit3
} from 'lucide-react';
import { useURLState, SharedStateManager, ShareableState, CalculatorState } from '@/lib/url-state-manager';

export interface ShareManagerProps {
  currentState: CalculatorState;
  onStateChange: (state: Partial<CalculatorState>) => void;
  className?: string;
}

const ShareManager: React.FC<ShareManagerProps> = ({
  currentState,
  onStateChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareableUrl, setShareableUrl] = useState<ShareableState | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [savedStates, setSavedStates] = useState<ShareableState[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    includeMetadata: true,
    expiresIn: 0, // 0 = never expires
    isPublic: true,
    allowComments: false
  });

  const { createShareableUrl, generateQRCode } = useURLState();

  useEffect(() => {
    // Load saved states
    setSavedStates(SharedStateManager.getSharedStates());
    
    // Cleanup expired states
    SharedStateManager.cleanupExpiredStates();
  }, []);

  const handleCreateShare = async () => {
    try {
      const options = {
        includeMetadata: shareOptions.includeMetadata,
        expiresIn: shareOptions.expiresIn || undefined
      };
      
      const shareable = createShareableUrl(options);
      if (!shareable) return;

      setShareableUrl(shareable);
      
      // Generate QR code
      const qrCode = await generateQRCode();
      setQrCodeUrl(qrCode);

      // Save to local storage
      SharedStateManager.saveSharedState(shareable);
      setSavedStates(SharedStateManager.getSharedStates());
    } catch (error) {
      console.error('Failed to create share:', error);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShareVia = (method: string, url: string, title?: string) => {
    const text = title ? `${title} - StatCal Calculation` : 'Statistical Calculation Results';
    
    switch (method) {
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(`${text}: ${url}`)}`);
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: text,
            url: url
          });
        }
        break;
    }
  };

  const handleDeleteState = (id: string) => {
    SharedStateManager.deleteSharedState(id);
    setSavedStates(SharedStateManager.getSharedStates());
    
    if (shareableUrl?.id === id) {
      setShareableUrl(null);
      setQrCodeUrl(null);
    }
  };

  const handleLoadState = (state: ShareableState) => {
    // This would need integration with the main calculator to load the state
    window.location.href = state.url;
  };

  const formatExpiryOptions = () => [
    { value: 0, label: '永不过期' },
    { value: 1, label: '1小时' },
    { value: 24, label: '1天' },
    { value: 168, label: '1周' },
    { value: 720, label: '1个月' }
  ];

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '永不过期';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString();
  };

  const getUrlPreview = (url: string) => {
    if (url.length <= 60) return url;
    return `${url.substring(0, 30)}...${url.substring(url.length - 30)}`;
  };

  return (
    <div className={className}>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Share2 className="h-4 w-4 mr-2" />
        分享计算
      </button>

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                分享计算结果
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* Left Column - Share Options */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">创建分享链接</h3>
                  
                  {/* Metadata Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        标题 (可选)
                      </label>
                      <input
                        type="text"
                        value={currentState.metadata?.title || ''}
                        onChange={(e) => onStateChange({
                          metadata: {
                            ...currentState.metadata,
                            title: e.target.value
                          }
                        })}
                        placeholder="给这个计算起个名字..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        描述 (可选)
                      </label>
                      <textarea
                        value={currentState.metadata?.description || ''}
                        onChange={(e) => onStateChange({
                          metadata: {
                            ...currentState.metadata,
                            description: e.target.value
                          }
                        })}
                        placeholder="描述这个计算的目的或背景..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Share Options */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="includeMetadata"
                          checked={shareOptions.includeMetadata}
                          onChange={(e) => setShareOptions(prev => ({
                            ...prev,
                            includeMetadata: e.target.checked
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="includeMetadata" className="ml-2 text-sm text-gray-700">
                          在URL中包含标题和描述
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={shareOptions.isPublic}
                          onChange={(e) => setShareOptions(prev => ({
                            ...prev,
                            isPublic: e.target.checked
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700 flex items-center">
                          {shareOptions.isPublic ? <Globe className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
                          公开分享 (任何人都可以访问)
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          过期时间
                        </label>
                        <select
                          value={shareOptions.expiresIn}
                          onChange={(e) => setShareOptions(prev => ({
                            ...prev,
                            expiresIn: parseInt(e.target.value)
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {formatExpiryOptions().map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Create Share Button */}
                  <button
                    onClick={handleCreateShare}
                    className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    创建分享链接
                  </button>
                </div>

                {/* Advanced Options */}
                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    高级选项
                    {showAdvanced ? <EyeOff className="h-4 w-4 ml-1" /> : <Eye className="h-4 w-4 ml-1" />}
                  </button>

                  {showAdvanced && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allowComments"
                          checked={shareOptions.allowComments}
                          onChange={(e) => setShareOptions(prev => ({
                            ...prev,
                            allowComments: e.target.checked
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allowComments" className="ml-2 text-sm text-gray-700">
                          允许他人添加评论 (即将推出)
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          标签 (用逗号分隔)
                        </label>
                        <input
                          type="text"
                          value={currentState.metadata?.tags?.join(', ') || ''}
                          onChange={(e) => onStateChange({
                            metadata: {
                              ...currentState.metadata,
                              tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }
                          })}
                          placeholder="实验数据, 统计分析, 研究项目"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Share Results & History */}
              <div className="space-y-6">
                {/* Current Share */}
                {shareableUrl && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">分享链接已创建</h3>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          分享链接
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={shareableUrl.url}
                            readOnly
                            className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => handleCopy(shareableUrl.url, 'url')}
                            className={`p-2 rounded-lg transition-colors ${
                              copiedField === 'url'
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {copiedField === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          链接预览: {getUrlPreview(shareableUrl.url)}
                        </p>
                      </div>

                      {/* QR Code */}
                      {qrCodeUrl && (
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-2">
                            二维码分享
                          </label>
                          <div className="flex items-center space-x-4">
                            <img
                              src={qrCodeUrl}
                              alt="QR Code"
                              className="w-20 h-20 border border-green-300 rounded"
                            />
                            <div className="flex-1 text-sm text-green-600">
                              扫描二维码快速访问这个计算结果
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Share Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleShareVia('email', shareableUrl.url, currentState.metadata?.title)}
                          className="flex items-center px-3 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          邮件
                        </button>
                        
                        {navigator.share && (
                          <button
                            onClick={() => handleShareVia('native', shareableUrl.url, currentState.metadata?.title)}
                            className="flex items-center px-3 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 text-sm"
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            分享
                          </button>
                        )}
                      </div>

                      {/* Expiry Info */}
                      {shareableUrl.expiresAt && (
                        <div className="text-xs text-green-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          过期时间: {formatDate(shareableUrl.expiresAt)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Saved States History */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">历史分享</h3>
                    <button
                      onClick={() => {
                        SharedStateManager.cleanupExpiredStates();
                        setSavedStates(SharedStateManager.getSharedStates());
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="清理过期链接"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {savedStates.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        还没有保存的分享链接
                      </p>
                    ) : (
                      savedStates.map((state) => (
                        <div key={state.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {/* Extract title from URL or use default */}
                                分享 #{state.id}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(state.expiresAt)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleCopy(state.url, `history-${state.id}`)}
                                className={`p-1 rounded transition-colors ${
                                  copiedField === `history-${state.id}`
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                                }`}
                                title="复制链接"
                              >
                                {copiedField === `history-${state.id}` ? 
                                  <Check className="h-3 w-3" /> : 
                                  <Copy className="h-3 w-3" />
                                }
                              </button>
                              <button
                                onClick={() => handleLoadState(state)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                                title="加载此状态"
                              >
                                <BookOpen className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteState(state.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="删除"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareManager;