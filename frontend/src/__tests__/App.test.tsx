import { render } from '@testing-library/react';
import App from '../App';

// Mock the child components to avoid complex dependencies
jest.mock('../components/LoginPage', () => {
  return function MockLoginPage() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../components/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

// Mock react-router-dom components to avoid routing complexity in tests
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }: { element: React.ReactNode }) => <div data-testid="route">{element}</div>,
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>
}));

describe('App Component', () => {
  it('renders App container with correct class', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toHaveClass('App');
  });

  it('renders router wrapper', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('router')).toBeTruthy();
  });
});