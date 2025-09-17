'use client'

import React, { useState, useEffect } from 'react';
import { StructuredContent } from '@/lib/services/structured-content';
import StructuredHowtoSteps from '@/components/content/StructuredHowtoSteps';
import StructuredCaseStudy from '@/components/content/StructuredCaseStudy';
import { Loader2, BookOpen, FileText } from 'lucide-react';

export default function StructuredContentDemoPage() {
  const [selectedContent, setSelectedContent] = useState<StructuredContent | null>(null);
  const [contentList, setContentList] = useState<StructuredContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'howto' | 'case'>('howto');

  useEffect(() => {
    loadStats();
    loadContent();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/structured-content');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/structured-content?type=${activeTab}`);
      const data = await response.json();
      setContentList(data.items || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecificContent = async (slug: string) => {
    try {
      const response = await fetch(`/api/structured-content?slug=${slug}`);
      const data = await response.json();
      setSelectedContent(data);
    } catch (error) {
      console.error('Error loading specific content:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Structured Content Demo
          </h1>
          <p className="text-gray-600">
            Demonstration of the new structured content system with interactive how-to guides and case studies.
          </p>
          
          {/* Stats */}
          {stats && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">{stats.totalHowtos}</div>
                <div className="text-sm text-gray-600">How-to Guides</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-green-600">{stats.totalCaseStudies}</div>
                <div className="text-sm text-gray-600">Case Studies</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">{stats.totalSteps}</div>
                <div className="text-sm text-gray-600">Total Steps</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-indigo-600">{stats.avgStepsPerHowto}</div>
                <div className="text-sm text-gray-600">Avg Steps/Guide</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Library</h2>
              
              {/* Tabs */}
              <div className="flex space-x-1 mb-4">
                <button
                  onClick={() => setActiveTab('howto')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'howto'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  How-to Guides
                </button>
                <button
                  onClick={() => setActiveTab('case')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'case'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Case Studies
                </button>
              </div>

              {/* Content List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-2">
                  {contentList.map((content) => (
                    <button
                      key={content.id}
                      onClick={() => loadSpecificContent(content.slug)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedContent?.id === content.id
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {content.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {content.summary}
                      </p>
                      {activeTab === 'howto' && content.steps && (
                        <div className="text-xs text-blue-600 mt-1">
                          {content.steps.length} steps
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content Display */}
          <div className="lg:col-span-2">
            {selectedContent ? (
              <div className="space-y-6">
                {/* Content Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedContent.title}
                      </h1>
                      <p className="text-gray-600 mb-4">
                        {selectedContent.summary}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Type: {selectedContent.type}</span>
                        <span>Reading time: {selectedContent.reading_time} min</span>
                        <span>Updated: {new Date(selectedContent.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedContent.type === 'howto'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedContent.type === 'howto' ? 'How-to Guide' : 'Case Study'}
                    </span>
                  </div>
                </div>

                {/* Structured Content */}
                {selectedContent.type === 'howto' && selectedContent.steps && (
                  <StructuredHowtoSteps 
                    steps={selectedContent.steps}
                    title={`${selectedContent.steps.length}-Step Guide`}
                  />
                )}

                {selectedContent.type === 'case' && selectedContent.caseDetails && (
                  <StructuredCaseStudy 
                    caseDetails={selectedContent.caseDetails}
                    title={selectedContent.title}
                  />
                )}

                {/* Original Content (for comparison) */}
                <details className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <summary className="font-medium text-gray-900 cursor-pointer">
                    View Original Markdown Content
                  </summary>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {selectedContent.content.substring(0, 1000)}...
                    </pre>
                  </div>
                </details>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  {activeTab === 'howto' ? (
                    <BookOpen className="w-12 h-12 mx-auto" />
                  ) : (
                    <FileText className="w-12 h-12 mx-auto" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select Content to View
                </h3>
                <p className="text-gray-600">
                  Choose a {activeTab === 'howto' ? 'how-to guide' : 'case study'} from the list to see its structured content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}