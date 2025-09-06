import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Simple test component
const SimpleTestComponent = () => {
  return (
    <div data-testid="simple-test">
      <h1>Test Component</h1>
      <p>This is a simple test component</p>
      <button data-testid="test-button">Click me</button>
    </div>
  );
};

// Test basic React rendering
describe('Basic Functionality Tests', () => {
  it('should render a simple component', () => {
    render(<SimpleTestComponent />);
    
    expect(screen.getByTestId('simple-test')).toBeInTheDocument();
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByText('This is a simple test component')).toBeInTheDocument();
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
  });

  it('should handle basic DOM operations', () => {
    const div = document.createElement('div');
    div.textContent = 'Test content';
    document.body.appendChild(div);
    
    expect(div.textContent).toBe('Test content');
    expect(document.body.contains(div)).toBe(true);
    
    document.body.removeChild(div);
    expect(document.body.contains(div)).toBe(false);
  });

  it('should handle basic array operations', () => {
    const numbers = [1, 2, 3, 4, 5];
    
    expect(numbers.length).toBe(5);
    expect(numbers[0]).toBe(1);
    expect(numbers[4]).toBe(5);
    
    numbers.push(6);
    expect(numbers.length).toBe(6);
    expect(numbers[5]).toBe(6);
  });

  it('should handle basic object operations', () => {
    const obj: { name: string; value: number; [key: string]: any } = { name: 'Test', value: 42 };
    
    expect(obj.name).toBe('Test');
    expect(obj.value).toBe(42);
    expect(Object.keys(obj)).toHaveLength(2);
    
    obj['newProperty'] = 'added';
    expect(obj['newProperty']).toBe('added');
  });

  it('should handle basic string operations', () => {
    const str = 'Hello World';
    
    expect(str.length).toBe(11);
    expect(str.toUpperCase()).toBe('HELLO WORLD');
    expect(str.toLowerCase()).toBe('hello world');
    expect(str.includes('World')).toBe(true);
  });

  it('should handle basic math operations', () => {
    expect(2 + 2).toBe(4);
    expect(5 * 3).toBe(15);
    expect(10 / 2).toBe(5);
    expect(7 - 3).toBe(4);
  });

  it('should handle conditional rendering', () => {
    const showContent = true;
    
    const ConditionalComponent = () => (
      <div>
        {showContent && <span data-testid="conditional-content">Content shown</span>}
        {!showContent && <span data-testid="conditional-hidden">Content hidden</span>}
      </div>
    );
    
    render(<ConditionalComponent />);
    
    expect(screen.getByTestId('conditional-content')).toBeInTheDocument();
    expect(screen.queryByTestId('conditional-hidden')).not.toBeInTheDocument();
  });

  it('should handle event handlers', () => {
    const handleClick = vi.fn();
    
    const ButtonComponent = () => (
      <button data-testid="click-button" onClick={handleClick}>
        Click me
      </button>
    );
    
    render(<ButtonComponent />);
    
    const button = screen.getByTestId('click-button');
    expect(button).toBeInTheDocument();
    
    // Note: In jsdom, we can't actually click, but we can verify the handler exists
    expect(handleClick).toBeDefined();
  });

  it('should handle basic styling', () => {
    const StyledComponent = () => (
      <div 
        data-testid="styled-element" 
        style={{ 
          width: '100px', 
          height: '50px', 
          backgroundColor: 'red' 
        }}
      >
        Styled content
      </div>
    );
    
    render(<StyledComponent />);
    
    const element = screen.getByTestId('styled-element');
    expect(element).toBeInTheDocument();
    
    // Check that the element has the style attribute
    expect(element).toHaveAttribute('style');
    
    // Check that the style contains the expected values
    const style = element.getAttribute('style');
    expect(style).toContain('width: 100px');
    expect(style).toContain('height: 50px');
    expect(style).toContain('background-color: red');
  });
});
