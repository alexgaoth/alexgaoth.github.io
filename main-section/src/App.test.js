import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page title', () => {
  render(<App />);
  expect(screen.getByText(/this is alex gaoth/i)).toBeInTheDocument();
});
