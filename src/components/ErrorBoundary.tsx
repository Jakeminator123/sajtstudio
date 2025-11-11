'use client';

import { Component, ReactNode } from 'react';
import Button from '@/components/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // You can log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <svg
                className="w-24 h-24 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Något gick fel</h1>
            <p className="text-gray-600 mb-8">
              Vi beklagar, men något oväntat har hänt. Prova att ladda om sidan.
            </p>
            
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              size="md"
            >
              Ladda om sidan
            </Button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left text-sm text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">
                  Teknisk information
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to reset error boundary
export function useErrorBoundary() {
  return {
    resetErrorBoundary: () => window.location.reload(),
  };
}
