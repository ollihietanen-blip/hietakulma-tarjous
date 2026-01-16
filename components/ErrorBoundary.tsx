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
    // Log error to console in both dev and production
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Also log to help with debugging in production
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Could send to error tracking service here
      console.error('Production error details:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
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
      
      // For other errors, show fallback with better styling
      return this.props.fallback || (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#F9F7F2',
          color: '#1a1a1a'
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#dc2626' }}>
              Jotain meni pieleen
            </h2>
            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
              {this.state.error?.message || 'Tuntematon virhe'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Päivitä sivu
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
