import React from 'react';
import { GraduationCap, Microscope, Users } from 'lucide-react';

export type UserMode = 'student' | 'research' | 'teacher';

interface UserModeSelectorProps {
  userMode: UserMode;
  onModeChange: (mode: UserMode) => void;
}

const UserModeSelector: React.FC<UserModeSelectorProps> = ({ userMode, onModeChange }) => {
  const getModeConfig = (mode: UserMode) => {
    switch (mode) {
      case 'student':
        return {
          icon: GraduationCap,
          color: 'blue',
          title: 'Student Mode',
          description: 'Basic mean calculation with step-by-step explanations'
        };
      case 'research':
        return {
          icon: Microscope,
          color: 'purple', 
          title: 'Research Mode',
          description: 'Advanced statistical analysis with confidence intervals'
        };
      case 'teacher':
        return {
          icon: Users,
          color: 'green',
          title: 'Teacher Mode',
          description: 'Grade analysis with distribution and class statistics'
        };
    }
  };

  return (
    <div className="flex justify-center mb-4">
      <div className="bg-gray-100 rounded-lg p-1 inline-flex">
        {(['student', 'research', 'teacher'] as UserMode[]).map((mode) => {
          const config = getModeConfig(mode);
          const IconComponent = config.icon;
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                userMode === mode
                  ? `bg-white text-${config.color}-600 shadow-sm`
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              <span className="capitalize">{mode}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UserModeSelector;