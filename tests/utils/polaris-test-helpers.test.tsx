/**
 * Tests for Polaris Test Helpers
 * Verifies that the Polaris testing utilities are working correctly
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithPolaris, userInteractions } from './polaris-test-helpers';

// Simple test component
const TestButton = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) => (
  <button onClick={onClick}>{children}</button>
);

const TestInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <div>
    <label>{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

describe('Polaris Test Helpers', () => {
  describe('renderWithPolaris', () => {
    it('renders components with Polaris providers', () => {
      renderWithPolaris(<TestButton>Test Button</TestButton>);
      
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('renders components with custom theme', () => {
      renderWithPolaris(
        <TestButton>Dark Theme Button</TestButton>,
        {
          theme: 'dark-experimental'
        }
      );
      
      expect(screen.getByText('Dark Theme Button')).toBeInTheDocument();
    });

    it('renders components with custom features', () => {
      renderWithPolaris(
        <TestButton>Feature Button</TestButton>,
        {
          features: { newFeature: true }
        }
      );
      
      expect(screen.getByText('Feature Button')).toBeInTheDocument();
    });
  });

  describe('userInteractions', () => {
    it('clicks buttons correctly', () => {
      let clicked = false;
      const handleClick = () => { clicked = true; };
      
      renderWithPolaris(<TestButton onClick={handleClick}>Click Me</TestButton>);
      
      const button = screen.getByText('Click Me');
      userInteractions.clickButton(button);
      
      expect(clicked).toBe(true);
    });

    it('fills text fields correctly', () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return <TestInput label="Test Input" value={value} onChange={setValue} />;
      };
      
      renderWithPolaris(<TestComponent />);
      
      const input = screen.getByRole('textbox');
      userInteractions.fillTextField(input as HTMLInputElement, 'test value');
      
      expect(input).toHaveValue('test value');
    });

    it('selects options correctly', () => {
      renderWithPolaris(
        <select>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
      );
      
      const select = screen.getByRole('combobox');
      userInteractions.selectOption(select as HTMLSelectElement, 'option2');
      
      expect((select as HTMLSelectElement).value).toBe('option2');
    });

    it('toggles checkboxes correctly', () => {
      renderWithPolaris(<input type="checkbox" />);
      
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      
      userInteractions.toggleCheckbox(checkbox);
      expect(checkbox.checked).toBe(true);
      
      userInteractions.toggleCheckbox(checkbox);
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('renders complex components with Polaris providers', () => {
      const ComplexComponent = () => (
        <div>
          <TestButton>Primary Button</TestButton>
          <TestInput label="Email" value="" onChange={() => {}} />
        </div>
      );
      
      renderWithPolaris(<ComplexComponent />);
      
      expect(screen.getByText('Primary Button')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('handles multiple user interactions', () => {
      let buttonClicked = false;
      const handleClick = () => { buttonClicked = true; };
      
      const InteractiveComponent = () => {
        const [checked, setChecked] = React.useState(false);
        return (
          <div>
            <TestButton onClick={handleClick}>Click Me</TestButton>
            <input 
              type="checkbox" 
              checked={checked} 
              onChange={(e) => setChecked(e.target.checked)}
            />
          </div>
        );
      };
      
      renderWithPolaris(<InteractiveComponent />);
      
      const button = screen.getByText('Click Me');
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      
      userInteractions.clickButton(button);
      userInteractions.toggleCheckbox(checkbox);
      
      expect(buttonClicked).toBe(true);
      expect(checkbox.checked).toBe(true);
    });
  });
}); 