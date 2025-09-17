'use client'

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Users,
  BarChart
} from 'lucide-react';
import { CaseDetails } from '@/lib/services/structured-content';

interface StructuredCaseStudyProps {
  caseDetails: CaseDetails;
  title: string;
  className?: string;
}

export default function StructuredCaseStudy({ 
  caseDetails, 
  title,
  className = "" 
}: StructuredCaseStudyProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['background', 'problem']) // Default expanded sections
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Parse JSON arrays safely
  const parseJsonArray = (jsonString: string): string[] => {
    try {
      return JSON.parse(jsonString) || [];
    } catch {
      return [];
    }
  };

  const results = parseJsonArray(caseDetails.results);
  const lessons = parseJsonArray(caseDetails.lessons);
  const keyInsights = parseJsonArray(caseDetails.key_insights);
  const recommendations = parseJsonArray(caseDetails.recommendations);
  const toolsUsed = parseJsonArray(caseDetails.tools_used);

  // Section configuration
  const sections = [
    {
      id: 'background',
      title: 'Background & Context',
      icon: Users,
      content: caseDetails.background,
      color: 'blue'
    },
    {
      id: 'problem',
      title: 'Problem Statement',
      icon: AlertCircle,
      content: caseDetails.problem,
      color: 'red'
    },
    {
      id: 'challenge',
      title: 'Key Challenge',
      icon: Target,
      content: caseDetails.challenge,
      color: 'amber'
    },
    {
      id: 'solution',
      title: 'Solution Approach',
      icon: Lightbulb,
      content: caseDetails.solution,
      color: 'green'
    },
    {
      id: 'results',
      title: 'Results & Outcomes',
      icon: TrendingUp,
      content: null,
      items: results,
      color: 'purple'
    },
    {
      id: 'lessons',
      title: 'Lessons Learned',
      icon: CheckCircle,
      content: null,
      items: lessons,
      color: 'indigo'
    },
    {
      id: 'insights',
      title: 'Key Insights',
      icon: BarChart,
      content: null,
      items: keyInsights,
      color: 'cyan'
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      icon: Lightbulb,
      content: null,
      items: recommendations,
      color: 'green'
    }
  ];

  const getColorClasses = (color: string, isExpanded: boolean) => {
    const colors = {
      blue: isExpanded ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-blue-300',
      red: isExpanded ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200 hover:border-red-300',
      amber: isExpanded ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200 hover:border-amber-300',
      green: isExpanded ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-green-300',
      purple: isExpanded ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200 hover:border-purple-300',
      indigo: isExpanded ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:border-indigo-300',
      cyan: isExpanded ? 'bg-cyan-50 border-cyan-200' : 'bg-white border-gray-200 hover:border-cyan-300'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      red: 'text-red-600',
      amber: 'text-amber-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600',
      cyan: 'text-cyan-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Case Study Analysis</h3>
        <p className="text-gray-600">
          Structured breakdown of the {title.toLowerCase()} case study with key insights and lessons.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const hasContent = section.content || (section.items && section.items.length > 0);
          const IconComponent = section.icon;

          if (!hasContent) return null;

          return (
            <div 
              key={section.id}
              className={`border rounded-lg transition-all duration-200 ${getColorClasses(section.color, isExpanded)}`}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-opacity-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className={`w-5 h-5 ${getIconColorClasses(section.color)}`} />
                  <h4 className="font-medium text-gray-900">{section.title}</h4>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="ml-8">
                    {section.content && (
                      <div className="text-gray-700 whitespace-pre-line">
                        {section.content}
                      </div>
                    )}
                    
                    {section.items && section.items.length > 0 && (
                      <ul className="space-y-2">
                        {section.items.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tools Used Section (if available) */}
      {toolsUsed.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <BarChart className="w-4 h-4 mr-2" />
            Tools & Methods Used
          </h4>
          <div className="flex flex-wrap gap-2">
            {toolsUsed.map((tool, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{results.length}</div>
          <div className="text-sm text-gray-600">Key Results</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{lessons.length}</div>
          <div className="text-sm text-gray-600">Lessons</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{keyInsights.length}</div>
          <div className="text-sm text-gray-600">Insights</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{recommendations.length}</div>
          <div className="text-sm text-gray-600">Recommendations</div>
        </div>
      </div>
    </div>
  );
}