import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

// Mock the WebViewer component since it requires the browser environment
// and dynamic imports that aren't available in the test environment.
jest.mock('@/components/WebViewer', () => {
  return function MockWebViewer() {
    return <div data-testid="webviewer-mock">WebViewer</div>;
  };
});

describe('Home page', () => {
  it('renders the page header', () => {
    render(<Home />);
    expect(screen.getByText('Apryse WebViewer - Next.js Sample')).toBeInTheDocument();
  });

  it('renders the Guides button', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /guides/i })).toBeInTheDocument();
  });

  it('renders the WebViewer component', () => {
    render(<Home />);
    expect(screen.getByTestId('webviewer-mock')).toBeInTheDocument();
  });
});
