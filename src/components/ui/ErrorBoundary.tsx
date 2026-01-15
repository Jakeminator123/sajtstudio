'use client'

import { Component, ReactNode } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Button to avoid SSR issues
const Button = dynamic(() => import('@/components/ui/Button'), { ssr: false })

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Log error to API endpoint
    this.logErrorToAPI(error, errorInfo)
  }

  private logErrorToAPI(error: Error, errorInfo: React.ErrorInfo) {
    // Use setTimeout to avoid blocking error handling
    setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
          fetch('/api/errors', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'boundary',
              message: error.message || error.toString(),
              stack: error.stack,
              componentStack: errorInfo.componentStack,
              timestamp: new Date().toISOString(),
            }),
          }).catch(() => {
            // Silently fail if API is not available
          })
        }
      } catch {
        // Silently fail if fetch is not available
      }
    }, 0)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 px-6"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8" aria-hidden="true">
              <svg
                className="w-24 h-24 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
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
              ariaLabel="Ladda om sidan för att försöka igen"
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
      )
    }

    return this.props.children
  }
}

// Export as default with SSR safety check
const ErrorBoundary =
  typeof window !== 'undefined'
    ? ErrorBoundaryComponent
    : ({ children }: { children: ReactNode }) => <>{children}</>

export default ErrorBoundary

// Hook to reset error boundary
export function useErrorBoundary() {
  return {
    resetErrorBoundary: () => {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    },
  }
}
