'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  Target, 
  Hash,
  Download,
  Share2,
  Copy,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { UnweightedGPAResult, UI_CONTENT } from '@/types/unweightedGpa';

interface UnweightedGPAResultsProps {
  result: UnweightedGPAResult;
  precision: number;
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
  onCopy?: () => void;
  onShare?: () => void;
  className?: string;
}

export default function UnweightedGPAResults({
  result,
  precision,
  onExport,
  onCopy,
  onShare,
  className = ''
}: UnweightedGPAResultsProps) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDownloadMenu]);

  const handleCopy = async () => {
    const copyText = `Unweighted GPA: ${result.gpa.toFixed(precision)}\nTotal Credits: ${result.totalCredits}\nQuality Points: ${result.totalQualityPoints.toFixed(precision)}\nAcademic Status: ${result.academicStatus.level}`;
    
    try {
      await navigator.clipboard.writeText(copyText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    const shareText = `My Unweighted GPA: ${result.gpa.toFixed(precision)} (${result.academicStatus.level}) - Calculated with ${result.totalCredits} credits`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Unweighted GPA Results',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          // Fallback to copying to clipboard
          await handleCopy();
        }
      }
    } else {
      // Fallback for browsers without Web Share API
      await handleCopy();
    }
    
    onShare?.();
  };

  const getStatusIcon = (level: string) => {
    switch (level) {
      case 'Excellent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Good':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'Satisfactory':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">GPA Results</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title={UI_CONTENT.buttons.copy}
            >
              {copySuccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title={UI_CONTENT.buttons.share}
            >
              <Share2 className="h-4 w-4" />
            </button>
            <div className="relative" ref={downloadMenuRef}>
              <button 
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title={UI_CONTENT.buttons.export}
              >
                <Download className="h-4 w-4" />
              </button>
              {showDownloadMenu && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                  <button
                    onClick={() => {
                      onExport('csv');
                      setShowDownloadMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => {
                      onExport('json');
                      setShowDownloadMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                  >
                    JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main Results Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* GPA Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {UI_CONTENT.labels.gpa}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {result.gpa.toFixed(precision)}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              Unweighted Average
            </div>
          </div>

          {/* Total Credits Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Hash className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {UI_CONTENT.labels.totalCredits}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {result.totalCredits}
            </div>
            <div className="text-sm text-green-700 mt-1">
              Credit Hours
            </div>
          </div>

          {/* Quality Points Card */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                {UI_CONTENT.labels.qualityPoints}
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {result.totalQualityPoints.toFixed(precision)}
            </div>
            <div className="text-sm text-purple-700 mt-1">
              Grade × Credits
            </div>
          </div>
        </div>

        {/* Academic Status */}
        <div className={`rounded-lg p-4 mb-6 border ${getStatusColorClass(result.academicStatus.color)}`}>
          <div className="flex items-center mb-2">
            {getStatusIcon(result.academicStatus.level)}
            <span className="ml-2 font-medium">
              {UI_CONTENT.labels.academicStatus}: {result.academicStatus.level}
            </span>
          </div>
          <p className="text-sm">
            {result.academicStatus.description}
          </p>
        </div>

        {/* Grade Distribution */}
        {Object.keys(result.gradeDistribution).length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 text-indigo-600 mr-2" />
              {UI_CONTENT.labels.gradeDistribution}
            </h4>
            <div className="space-y-2">
              {Object.entries(result.gradeDistribution).map(([grade, data]) => (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-8">
                      {grade}
                    </span>
                    <div className="ml-4 flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">{data.count}</span>
                    <span className="text-xs">
                      ({data.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-2">Course Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Total Courses: {result.courses.length}</p>
            <p>Average Credits per Course: {result.courses.length > 0 ? (result.totalCredits / result.courses.length).toFixed(1) : '0'}</p>
            <p>Calculated on: {result.metadata.calculatedAt.toLocaleDateString()}</p>
            <p>Grading System: {result.metadata.gradingSystem === 'standard-4.0' ? '4.0 Standard Scale' : '4.0 Plus/Minus Scale'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}