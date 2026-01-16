import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Don't re-throw - ErrorBoundary should handle all errors
  }

  public render() {
    if (this.state.hasError) {
      // If it's a Convex error, render children anyway (app works without Convex)
      if (this.state.error?.message?.includes('ConvexProvider') || 
          this.state.error?.message?.includes('Convex client') ||
          this.state.error?.message?.includes('useMutation') ||
          this.state.error?.message?.includes('useQuery') ||
          this.state.error?.message?.includes('useAction')) {
        // Reset error state and render children - app will work without Convex
        this.setState({ hasError: false, error: null });
        return this.props.children;
      }
      
      // For other errors, show fallback
      return this.props.fallback || (
        <div className="p-4 text-red-600">
          <h2>Jotain meni pieleen</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
