/**
 * Component Tests for ErrorBoundary
 * Issue #7: Add component tests for UI components
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Suppress console.error for expected error boundary calls in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// A component that always throws when triggered
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error: something went wrong!');
  }
  return <div data-testid="child-content">Everything is fine</div>;
}

describe('ErrorBoundary', () => {
  describe('Normal rendering (no errors)', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Hello World</div>
        </ErrorBoundary>
      );
      expect(screen.getByTestId('child')).toHaveTextContent('Hello World');
    });

    it('renders multiple children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">First</div>
          <div data-testid="child-2">Second</div>
        </ErrorBoundary>
      );
      expect(screen.getByTestId('child-1')).toHaveTextContent('First');
      expect(screen.getByTestId('child-2')).toHaveTextContent('Second');
    });

    it('does not render error UI when children are healthy', () => {
      render(
        <ErrorBoundary>
          <BuggyComponent shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('renders default error UI when a child throws', () => {
      render(
        <ErrorBoundary>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('displays the error message in the error UI', () => {
      render(
        <ErrorBoundary>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Test error: something went wrong!')).toBeInTheDocument();
    });

    it('does not render children when an error has occurred', () => {
      render(
        <ErrorBoundary>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
    });

    it('renders a "Try again" button in the error UI', () => {
      render(
        <ErrorBoundary>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('logs the error to console.error via componentDidCatch', () => {
      render(
        <ErrorBoundary>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      // ErrorBoundary calls console.error with '[ErrorBoundary]' prefix
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Custom fallback', () => {
    it('renders custom fallback when provided and error occurs', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error UI</div>}>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('custom-fallback')).toHaveTextContent('Custom error UI');
    });

    it('does not render default error UI when custom fallback is provided', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error UI</div>}>
          <BuggyComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('renders children normally when custom fallback is provided but no error', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom error UI</div>}>
          <BuggyComponent shouldThrow={false} />
        </ErrorBoundary>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.queryByTestId('custom-fallback')).not.toBeInTheDocument();
    });
  });

  describe('Recovery', () => {
    it('clears the error state when "Try again" is clicked', () => {
      // We need a component that can toggle its error state
      let shouldThrow = true;

      function ToggleableBuggy() {
        if (shouldThrow) {
          throw new Error('Toggleable error');
        }
        return <div data-testid="recovered">Recovered!</div>;
      }

      const { rerender } = render(
        <ErrorBoundary>
          <ToggleableBuggy />
        </ErrorBoundary>
      );

      // Error UI should be shown
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByTestId('recovered')).not.toBeInTheDocument();

      // Fix the error source before clicking "Try again"
      shouldThrow = false;

      // Click "Try again" — this resets error state to null and re-renders children
      fireEvent.click(screen.getByText('Try again'));

      // Now children should render successfully
      expect(screen.getByTestId('recovered')).toHaveTextContent('Recovered!');
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Nested ErrorBoundary', () => {
    it('inner ErrorBoundary catches errors before outer one', () => {
      render(
        <ErrorBoundary fallback={<div data-testid="outer-fallback">Outer caught</div>}>
          <div data-testid="outer-child">
            <ErrorBoundary fallback={<div data-testid="inner-fallback">Inner caught</div>}>
              <BuggyComponent shouldThrow={true} />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      // Inner boundary should catch the error
      expect(screen.getByTestId('inner-fallback')).toHaveTextContent('Inner caught');
      // Outer should still render its children
      expect(screen.getByTestId('outer-child')).toBeInTheDocument();
      // Outer fallback should NOT render
      expect(screen.queryByTestId('outer-fallback')).not.toBeInTheDocument();
    });
  });
});
