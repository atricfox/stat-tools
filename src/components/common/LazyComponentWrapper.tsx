/**
 * Lazy component wrapper with loading states and error boundaries
 * Provides consistent loading experience for code-split components
 */

'use client'

import React, { Suspense, ErrorInfo, ComponentType, ReactNode } from 'react';
import { Loader2, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

interface LazyComponentWrapperProps {
  children: ReactNode;
  fallback?: ComponentType | ReactNode;
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
  className?: string;
  name?: string;
  showLoadingText?: boolean;
}

interface LazyErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

/**
 * Default loading component
 */
const DefaultLoadingFallback: React.FC<{ name?: string; showText?: boolean }> = ({ 
  name, 
  showText = true 
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="relative">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      <div className="absolute inset-0 border-2 border-blue-100 rounded-full animate-pulse" />
    </div>
    {showText && (
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-gray-900">
          Loading {name ? `${name} component` : 'component'}...
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Preparing the interface for you
        </p>
      </div>
    )}
  </div>
);

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ 
  error: Error; 
  retry: () => void; 
  name?: string;
}> = ({ error, retry, name }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="h-8 w-8 text-red-600" />
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Failed to Load Component
    </h3>
    
    <p className="text-sm text-gray-600 mb-1">
      {name ? `The ${name} component` : 'This component'} couldn't be loaded.
    </p>
    
    <p className="text-xs text-gray-500 mb-6 max-w-md">
      This might be due to a network issue or a temporary problem. 
      Please try again or refresh the page.
    </p>
    
    <div className="flex space-x-3">
      <button
        onClick={retry}
        className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </button>
      
      <button
        onClick={() => window.location.reload()}
        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
      >
        Refresh Page
      </button>
    </div>
    
    {process.env.NODE_ENV === 'development' && (
      <details className="mt-6 text-left">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
          Error Details (Development)
        </summary>
        <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto max-w-md">
          {error.message}
          {error.stack && (
            <>
              {'\n\n'}
              {error.stack}
            </>
          )}
        </pre>
      </details>
    )}
  </div>
);

/**
 * Error boundary for lazy-loaded components
 */
class LazyErrorBoundary extends React.Component<
  {
    children: ReactNode;
    errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
    name?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  },
  LazyErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<LazyErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
    
    // Report error to monitoring service
    this.props.onError?.(error, errorInfo);
    
    // Track component load failures
    if (typeof window !== 'undefined') {
      console.warn(`Component load failed: ${this.props.name || 'unknown'}`, {
        error: error.message,
        stack: error.stack,
        retryCount: this.state.retryCount
      });
    }
  }

  retry = () => {
    if (this.state.retryCount < 3) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: this.state.retryCount + 1
      });
    } else {
      // Max retries reached, suggest page refresh
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const ErrorFallback = this.props.errorFallback || DefaultErrorFallback;
      return (
        <ErrorFallback 
          error={this.state.error} 
          retry={this.retry}
          name={this.props.name}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Main lazy component wrapper
 */
const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  fallback,
  errorFallback,
  className = '',
  name,
  showLoadingText = true
}) => {
  // Render fallback component or default loading
  const loadingFallback = React.useMemo(() => {
    if (React.isValidElement(fallback)) {
      return fallback;
    }
    
    if (typeof fallback === 'function') {
      const FallbackComponent = fallback;
      return <FallbackComponent />;
    }
    
    return <DefaultLoadingFallback name={name} showText={showLoadingText} />;
  }, [fallback, name, showLoadingText]);

  return (
    <div className={`lazy-component-wrapper ${className}`}>
      <LazyErrorBoundary 
        errorFallback={errorFallback} 
        name={name}
        onError={(error, errorInfo) => {
          // Report to error tracking service
          console.error('Lazy component error boundary triggered:', {
            component: name,
            error: error.message,
            stack: error.stack,
            errorInfo
          });
        }}
      >
        <Suspense fallback={loadingFallback}>
          {children}
        </Suspense>
      </LazyErrorBoundary>
    </div>
  );
};

/**
 * Specialized loading components for different contexts
 */
export const LoadingFallbacks = {
  // Minimal loading for small components
  minimal: ({ name }: { name?: string }) => (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      {name && <span className="ml-2 text-sm text-gray-600">Loading {name}...</span>}
    </div>
  ),

  // Card-style loading for component cards
  card: ({ name }: { name?: string }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading {name || 'component'}...</p>
        </div>
      </div>
    </div>
  ),

  // Skeleton loading for complex components
  skeleton: ({ name }: { name?: string }) => (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="h-20 bg-gray-100 rounded"></div>
      {name && (
        <p className="text-xs text-gray-400 text-center">Loading {name}...</p>
      )}
    </div>
  ),

  // High-performance loading for research components
  research: ({ name }: { name?: string }) => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-8">
      <div className="text-center">
        <div className="relative inline-flex">
          <Zap className="h-8 w-8 text-purple-600 animate-bounce" />
          <div className="absolute inset-0 border-2 border-purple-200 rounded-full animate-ping" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-purple-900">
          Preparing Advanced Analysis
        </h3>
        <p className="text-sm text-purple-700 mt-2">
          Loading {name || 'research tools'}...
        </p>
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
};

/**
 * Hook for lazy component performance tracking
 */
export const useLazyComponentTracking = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Track component load time
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // Google Analytics 4 event
        (window as any).gtag('event', 'lazy_component_load', {
          component_name: componentName,
          load_time: loadTime,
          event_category: 'performance'
        });
      }
      
      console.debug(`Lazy component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    };
  }, [componentName]);
};

export { LazyErrorBoundary };
export default LazyComponentWrapper;