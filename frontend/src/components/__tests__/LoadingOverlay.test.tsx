import { render, screen } from '@testing-library/react';
import LoadingOverlay from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders loading overlay when visible', () => {
    render(<LoadingOverlay isVisible={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<LoadingOverlay isVisible={false} />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    const customMessage = 'Fetching your cycling data...';

    render(<LoadingOverlay isVisible={true} message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('displays default message when no message provided', () => {
    render(<LoadingOverlay isVisible={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<LoadingOverlay isVisible={true} message="Test message" />);

    const overlay = screen.getByText('Test message').closest('div');
    expect(overlay).toHaveClass('overlay');
  });
});