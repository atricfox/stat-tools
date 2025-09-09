/**
 * Grade Point System Selector Component
 * Allows users to select and view different grading systems (4.0/4.3/4.5)
 * Shows grade mappings, conversion rules, and official sources
 */

'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Info, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  Check,
  Settings
} from 'lucide-react';
import { GradePointSystem, GradeMapping } from '@/types/gpa';
import { DEFAULT_GRADE_SYSTEMS } from '@/lib/gpaCalculation';

interface GradePointSystemSelectorProps {
  system: GradePointSystem;
  onSystemChange: (system: GradePointSystem) => void;
  supportedSystems?: GradePointSystem[];
  showConversionTable?: boolean;
  allowCustom?: boolean;
  className?: string;
}

export default function GradePointSystemSelector({
  system,
  onSystemChange,
  supportedSystems = Object.values(DEFAULT_GRADE_SYSTEMS),
  showConversionTable = true,
  allowCustom = false,
  className = ''
}: GradePointSystemSelectorProps) {
  const [showMappingTable, setShowMappingTable] = useState(false);
  const [selectedSystemId, setSelectedSystemId] = useState(system.id);

  const handleSystemChange = (systemId: string) => {
    setSelectedSystemId(systemId);
    const selectedSystem = supportedSystems.find(s => s.id === systemId);
    if (selectedSystem) {
      onSystemChange(selectedSystem);
    }
  };

  const renderGradeMapping = (mapping: GradeMapping) => (
    <tr key={mapping.letterGrade} className="border-b border-gray-100">
      <td className="py-2 px-3 font-medium text-gray-900">
        {mapping.letterGrade}
      </td>
      <td className="py-2 px-3 text-center text-gray-700">
        {mapping.gradePoints.toFixed(1)}
      </td>
      <td className="py-2 px-3 text-center text-gray-600 text-sm">
        {mapping.percentageMin && mapping.percentageMax 
          ? `${mapping.percentageMin}-${mapping.percentageMax}%`
          : mapping.numericMin && mapping.numericMax
          ? `${mapping.numericMin}-${mapping.numericMax}`
          : '-'
        }
      </td>
      <td className="py-2 px-3 text-gray-600 text-sm">
        {mapping.description || '-'}
      </td>
    </tr>
  );

  const renderSystemInfo = (selectedSystem: GradePointSystem) => (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-start">
        <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-2">
            {selectedSystem.name}
          </h4>
          <p className="text-sm text-blue-800 mb-2">
            <strong>Country:</strong> {selectedSystem.country}
          </p>
          <p className="text-sm text-blue-700 mb-2">
            {selectedSystem.description}
          </p>
          {selectedSystem.source && (
            <a 
              href={selectedSystem.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Official Source
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const selectedSystem = supportedSystems.find(s => s.id === selectedSystemId) || system;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* System Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          Grading System
        </label>
        
        <div className="relative">
          <select
            value={selectedSystemId}
            onChange={(e) => handleSystemChange(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {supportedSystems.map(sys => (
              <option key={sys.id} value={sys.id}>
                {sys.name} - {sys.country} (Scale: {sys.scale})
              </option>
            ))}
            {allowCustom && (
              <option value="custom">Custom Grading System</option>
            )}
          </select>
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Official Badge */}
        {selectedSystem.isOfficial && (
          <div className="flex items-center mt-2">
            <Check className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-xs text-green-600 font-medium">
              Official Standard
            </span>
          </div>
        )}
      </div>

      {/* System Information */}
      {renderSystemInfo(selectedSystem)}

      {/* Grade Mapping Table Toggle */}
      {showConversionTable && (
        <div>
          <button
            onClick={() => setShowMappingTable(!showMappingTable)}
            className="flex items-center w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex-1">
              <span className="font-medium text-gray-900">
                Grade Conversion Table
              </span>
              <p className="text-sm text-gray-600 mt-1">
                View letter grade to grade point mappings
              </p>
            </div>
            {showMappingTable ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {/* Grade Mapping Table */}
          {showMappingTable && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h5 className="font-medium text-gray-900">
                  {selectedSystem.name} Conversion Table
                </h5>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-3 text-left font-medium text-gray-700">
                        Letter Grade
                      </th>
                      <th className="py-3 px-3 text-center font-medium text-gray-700">
                        Grade Points
                      </th>
                      <th className="py-3 px-3 text-center font-medium text-gray-700">
                        Range
                      </th>
                      <th className="py-3 px-3 text-left font-medium text-gray-700">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSystem.mappings.map(renderGradeMapping)}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer with Statistics */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span>
                    {selectedSystem.mappings.length} grade levels • 
                    Scale: 0.0 - {selectedSystem.scale}
                  </span>
                  {selectedSystem.source && (
                    <a 
                      href={selectedSystem.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Verify
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom System Notice */}
      {selectedSystemId === 'custom' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <Settings className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">
                  Custom Grading System
                </h4>
                <p className="text-sm text-blue-700">
                  Define your own grade mappings and point values. This feature allows you to 
                  create a personalized grading system that matches your institution&apos;s standards.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // This would open the custom system editor
                console.log('Open custom system editor');
              }}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Create Custom System
            </button>
          </div>
        </div>
      )}

      {/* Comparison Helper */}
      {supportedSystems.length > 1 && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <p className="mb-2">
            <strong>Quick Comparison:</strong>
          </p>
          <ul className="space-y-1">
            <li>• <strong>4.0 Scale:</strong> Most common in US universities (A=4.0)</li>
            <li>• <strong>4.3 Scale:</strong> Used in Canada, includes A+ grade (A+=4.3)</li>
            <li>• <strong>4.5 Scale:</strong> European system with different grade interpretation</li>
          </ul>
          <p className="mt-2 text-gray-400">
            Choose the system that matches your institution or target school.
          </p>
        </div>
      )}
    </div>
  );
}