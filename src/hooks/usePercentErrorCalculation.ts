import { useState, useCallback } from 'react';
import { UserMode } from '@/components/calculator/UserModeSelector';

export interface PercentErrorResult {
  percentError: number;
  absoluteError: number;
  theoreticalValue: number;
  experimentalValue: number;
  steps: string[];
  // Research mode specific
  relativeError?: number;
  accuracy?: number;
  // Teacher mode specific
  gradeEquivalent?: string;
  interpretation?: string;
}

export interface UsePercentErrorCalculationReturn {
  result: PercentErrorResult | null;
  calculatePercentError: (theoreticalValue: string, experimentalValue: string) => void;
  clearResults: () => void;
  loadExample: () => { theoretical: string; experimental: string };
}

export function usePercentErrorCalculation(
  userMode: UserMode,
  precision: number = 2
): UsePercentErrorCalculationReturn {
  const [result, setResult] = useState<PercentErrorResult | null>(null);

  const calculatePercentError = useCallback((theoreticalStr: string, experimentalStr: string) => {
    if (!theoreticalStr.trim() || !experimentalStr.trim()) {
      setResult(null);
      return;
    }

    const theoretical = parseFloat(theoreticalStr.trim());
    const experimental = parseFloat(experimentalStr.trim());

    if (isNaN(theoretical) || isNaN(experimental)) {
      setResult({
        percentError: 0,
        absoluteError: 0,
        theoreticalValue: theoretical || 0,
        experimentalValue: experimental || 0,
        steps: ['输入无效: 请输入有效的数值']
      });
      return;
    }

    if (theoretical === 0) {
      setResult({
        percentError: 0,
        absoluteError: 0,
        theoreticalValue: theoretical,
        experimentalValue: experimental,
        steps: ['错误: 理论值不能为零']
      });
      return;
    }

    const absoluteError = Math.abs(experimental - theoretical);
    const percentError = (absoluteError / Math.abs(theoretical)) * 100;

    // Base calculation steps
    const steps = [
      userMode === 'research' 
        ? `理论值: ${theoretical.toFixed(precision)}`
        : userMode === 'teacher'
          ? `期望值: ${theoretical.toFixed(precision)}`
          : `理论值: ${theoretical.toFixed(precision)}`,
      userMode === 'research' 
        ? `实验值: ${experimental.toFixed(precision)}`
        : userMode === 'teacher'
          ? `学生结果: ${experimental.toFixed(precision)}`
          : `实验值: ${experimental.toFixed(precision)}`,
      `绝对误差 = |${experimental.toFixed(precision)} - ${theoretical.toFixed(precision)}| = ${absoluteError.toFixed(precision)}`,
      `百分比误差 = (${absoluteError.toFixed(precision)} / |${theoretical.toFixed(precision)}|) × 100% = ${percentError.toFixed(precision)}%`
    ];

    let additionalData: any = {};

    // Research mode specific calculations
    if (userMode === 'research') {
      const relativeError = absoluteError / Math.abs(theoretical);
      const accuracy = 100 - percentError;

      steps.push(
        `相对误差 = ${relativeError.toFixed(precision + 2)}`,
        `准确度 = ${accuracy.toFixed(precision)}%`
      );

      additionalData = {
        relativeError: parseFloat(relativeError.toFixed(precision + 2)),
        accuracy: parseFloat(accuracy.toFixed(precision))
      };
    }

    // Teacher mode specific calculations
    if (userMode === 'teacher') {
      let gradeEquivalent = '';
      let interpretation = '';

      if (percentError <= 2) {
        gradeEquivalent = 'A (优秀)';
        interpretation = '非常精确的测量结果';
      } else if (percentError <= 5) {
        gradeEquivalent = 'B (良好)';
        interpretation = '良好的测量结果，有轻微误差';
      } else if (percentError <= 10) {
        gradeEquivalent = 'C (可接受)';
        interpretation = '可接受的测量结果，有中等误差';
      } else if (percentError <= 20) {
        gradeEquivalent = 'D (较差)';
        interpretation = '较差的测量结果，有明显误差';
      } else {
        gradeEquivalent = 'F (不合格)';
        interpretation = '不合格的测量结果，误差过大';
      }

      steps.push(
        `评估等级: ${gradeEquivalent}`,
        `结果分析: ${interpretation}`
      );

      additionalData = {
        gradeEquivalent,
        interpretation
      };
    }

    setResult({
      percentError: parseFloat(percentError.toFixed(precision)),
      absoluteError: parseFloat(absoluteError.toFixed(precision)),
      theoreticalValue: theoretical,
      experimentalValue: experimental,
      steps,
      ...additionalData
    });
  }, [userMode, precision]);

  const clearResults = useCallback(() => {
    setResult(null);
  }, []);

  const loadExample = useCallback(() => {
    switch (userMode) {
      case 'student':
        return { theoretical: '9.8', experimental: '9.6' };
      case 'research':
        return { theoretical: '25.00', experimental: '24.75' };
      case 'teacher':
        return { theoretical: '100', experimental: '95' };
      default:
        return { theoretical: '9.8', experimental: '9.6' };
    }
  }, [userMode]);

  return {
    result,
    calculatePercentError,
    clearResults,
    loadExample
  };
}