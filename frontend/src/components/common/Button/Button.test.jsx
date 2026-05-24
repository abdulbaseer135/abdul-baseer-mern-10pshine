import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const { container } = render(<Button className="custom-class">Test</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('custom-class');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders button with primary variant by default', () => {
    const { container } = render(<Button>Primary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('btn-primary');
  });

  it('renders button with custom variant', () => {
    const { container } = render(<Button variant="danger">Danger</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('btn-danger');
  });

  it('renders button with different sizes', () => {
    const { container: smContainer } = render(<Button size="sm">Small</Button>);
    const { container: lgContainer } = render(<Button size="lg">Large</Button>);
    
    const smButton = smContainer.querySelector('button');
    const lgButton = lgContainer.querySelector('button');
    
    expect(smButton).toHaveClass('px-2.5');
    expect(lgButton).toHaveClass('px-4');
  });
});

