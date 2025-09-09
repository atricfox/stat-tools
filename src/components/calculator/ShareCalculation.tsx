/**
 * ShareCalculation component for sharing weighted mean calculations
 * Provides multiple sharing options with enhanced UX
 */

'use client'

import React, { useState, useCallback } from 'react';
import { 
  Share2, 
  Copy, 
  QrCode, 
  Download, 
  Clock, 
  Eye, 
  Link2,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import { WeightedShareableState } from '@/lib/weighted-url-state-manager';
import { WeightedMeanResult } from '@/types/weightedMean';

interface ShareCalculationProps {
  onCreateShare: (options: ShareOptions) => WeightedShareableState | null;
  onGenerateQR: (options: { size?: number; title?: string }) => Promise<string | null>;
  result?: WeightedMeanResult;
  className?: string;
}

interface ShareOptions {
  includeMetadata?: boolean;
  expiresIn?: number;
  makeShort?: boolean;
  title?: string;
}

const ShareCalculation: React.FC<ShareCalculationProps> = ({
  onCreateShare,
  onGenerateQR,
  result,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareState, setShareState] = useState<WeightedShareableState | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [expiresIn, setExpiresIn] = useState<number | undefined>(undefined);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [makeShort, setMakeShort] = useState(false);

  const handleCreateShare = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const options: ShareOptions = {
        includeMetadata,
        expiresIn,
        makeShort,
        title: title.trim() || undefined
      };

      const newShareState = onCreateShare(options);
      if (!newShareState) {
        throw new Error('Failed to create shareable URL');
      }

      setShareState(newShareState);

      // Generate QR code if requested
      if (qrCodeUrl === null) {
        const qr = await onGenerateQR({
          size: 200,
          title: title.trim() || 'Weighted Mean Calculation'
        });
        setQrCodeUrl(qr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  }, [onCreateShare, onGenerateQR, includeMetadata, expiresIn, makeShort, title, qrCodeUrl]);

  const handleCopyUrl = useCallback(async () => {
    if (!shareState) return;

    try {
      await navigator.clipboard.writeText(shareState.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy URL to clipboard');
    }
  }, [shareState]);

  const handleDownloadQR = useCallback(() => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `weighted-mean-qr-${title || 'calculation'}.svg`;
    link.click();
  }, [qrCodeUrl, title]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setShareState(null);
    setQrCodeUrl(null);
    setCopied(false);
    setError(null);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
        title="Share calculation"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Share Calculation</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Result Preview */}
          {result && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Calculation Preview</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Weighted Mean:</span>
                  <span className="font-medium text-blue-900 ml-1">{result.weightedMean}</span>
                </div>
                <div>
                  <span className="text-blue-700">Valid Pairs:</span>
                  <span className="font-medium text-blue-900 ml-1">{result.validPairs}</span>
                </div>
              </div>
            </div>
          )}

          {/* Share Options Form */}
          {!shareState && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Spring 2025 GPA Calculation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Expiration
                </label>
                <select
                  value={expiresIn || ''}
                  onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Never expires</option>
                  <option value="24">24 hours</option>
                  <option value="168">1 week</option>
                  <option value="720">30 days</option>
                  <option value="2160">90 days</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include calculation metadata</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={makeShort}
                    onChange={(e) => setMakeShort(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Create short URL</span>
                </label>
              </div>

              <button
                onClick={handleCreateShare}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Share Link...' : 'Create Share Link'}
              </button>
            </div>
          )}

          {/* Share Result */}
          {shareState && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">Share link created successfully!</span>
                </div>
                
                <div className="space-y-2 text-sm text-green-800">
                  <div className="flex items-center">
                    <Link2 className="h-3 w-3 mr-1" />
                    <span>ID: {shareState.id}</span>
                  </div>
                  {shareState.expiresAt && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Expires: {new Date(shareState.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* URL Copy Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={shareState.shortUrl || shareState.url}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className={`px-3 py-2 border-t border-r border-b border-gray-300 rounded-r-md ${
                      copied ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              {qrCodeUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code
                  </label>
                  <div className="flex flex-col items-center space-y-2">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code for sharing" 
                      className="border border-gray-200 rounded"
                    />
                    <button
                      onClick={handleDownloadQR}
                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download QR
                    </button>
                  </div>
                </div>
              )}

              {/* Preview Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Calculator Type:</span>
                  <span className="font-medium">Weighted Mean</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Points:</span>
                  <span className="font-medium">{shareState.preview.pairCount} pairs</span>
                </div>
                {shareState.preview.weightedMean && (
                  <div className="flex items-center justify-between">
                    <span>Result:</span>
                    <span className="font-medium">{shareState.preview.weightedMean}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-t">
          <p>Share links allow others to view and reproduce your weighted mean calculation. No personal data is transmitted.</p>
        </div>
      </div>
    </div>
  );
};

export default ShareCalculation;