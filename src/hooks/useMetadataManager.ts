'use client';

import { usePathname } from 'next/navigation';
import { MetadataManager, type SEOConfig } from '@/components/seo/MetadataManager';

// Hook for using MetadataManager in client components
export function useMetadataManager() {
  const pathname = usePathname();
  const manager = MetadataManager.getInstance();
  
  // 从路径中提取工具ID
  const getToolIdFromPath = (path: string): string | undefined => {
    const match = path.match(/\/calculator\/([^\/]+)/);
    return match ? match[1] : undefined;
  };
  
  const toolId = getToolIdFromPath(pathname);
  
  return {
    manager,
    toolId,
    generateMetadata: (customConfig?: Partial<SEOConfig>) => 
      manager.generateMetadata(toolId, customConfig),
    validateConfig: (config: SEOConfig) => manager.validateSEOConfig(config)
  };
}