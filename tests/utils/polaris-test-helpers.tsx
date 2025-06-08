/**
 * Polaris Test Helpers - Utilities for testing Polaris components
 * Provides render helpers, theme providers, and component interaction utilities
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from '@shopify/polaris';
import { vi } from 'vitest';

// Mock translations for Polaris
const mockTranslations = {
  Polaris: {
    Common: {
      checkbox: 'checkbox',
      button: 'button',
      submit: 'Submit',
      cancel: 'Cancel',
      clear: 'Clear',
      close: 'Close',
      done: 'Done',
      edit: 'Edit',
      save: 'Save',
      loading: 'Loading',
      remove: 'Remove',
      delete: 'Delete',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      previous: 'Previous',
      next: 'Next',
      pagination: 'Pagination',
      select: 'Select',
      selectAll: 'Select all',
      deselect: 'Deselect',
      deselectAll: 'Deselect all',
      required: 'Required',
      optional: 'Optional',
      error: 'Error',
      warning: 'Warning',
      success: 'Success',
      info: 'Info',
    },
    Actions: {
      moreActions: 'More actions',
    },
    Modal: {
      iFrameTitle: 'body markup',
      modalWarning: 'These required properties are missing from Modal',
    },
    Page: {
      Header: {
        rollupActionsLabel: 'View actions for %{title}',
        pageReadyAccessibilityLabel: 'Page loaded',
      },
    },
    ResourceList: {
      sortingLabel: 'Sort by',
      defaultItemSingular: 'item',
      defaultItemPlural: 'items',
      showing: 'Showing %{itemsCount} %{resource}',
      showingTotalCount: 'Showing %{itemsCount} of %{totalItemsCount} %{resource}',
      loading: 'Loading %{resource}',
      selected: '%{selectedItemsCount} selected',
      allItemsSelected: 'All %{itemsCount} %{resource} are selected',
      selectAllItems: 'Select all %{itemsCount} %{resource}',
      emptySearchResultTitle: 'No %{resourceNamePlural} found',
      emptySearchResultDescription: 'Try changing the filters or search term',
      selectButtonText: 'Select %{resourceName}',
      a11yCheckboxDeselectAllSingle: 'Deselect %{resourceNameSingular}',
      a11yCheckboxSelectAllSingle: 'Select %{resourceNameSingular}',
      a11yCheckboxDeselectAllMultiple: 'Deselect all %{itemsCount} %{resourceNamePlural}',
      a11yCheckboxSelectAllMultiple: 'Select all %{itemsCount} %{resourceNamePlural}',
      ariaLiveSingular: '%{itemsCount} item',
      ariaLivePlural: '%{itemsCount} items',
    },
    DataTable: {
      columnVisibilityButtonLabel: 'Customize table',
      navAccessibilityLabel: 'Scroll table horizontally',
      totalsRowHeading: 'Totals',
      totalRowHeading: 'Total',
    },
    TextField: {
      characterCount: '%{count} characters',
      characterCountWithMaxLength: '%{count} of %{limit} characters used',
    },
    OptionList: {
      searchResultsLabel: 'Search results',
      noResultsFound: 'No results found',
    },
    Filters: {
      moreFilters: 'More filters',
      filter: 'Filter %{resourceName}',
      noFiltersApplied: 'No filters applied',
      cancel: 'Cancel',
      done: 'Done',
      clearAllFilters: 'Clear all filters',
      clear: 'Clear',
      clearFilter: 'Clear %{filterName}',
    },
  },
};

// Polaris theme configuration for testing
type PolarisTheme = 'light' | 'light-mobile' | 'light-high-contrast-experimental' | 'dark-experimental';

const testTheme: PolarisTheme = 'light';

// Custom render function with Polaris providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: PolarisTheme;
  features?: Record<string, boolean>;
}

export function renderWithPolaris(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { theme = testTheme, features = {}, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppProvider
        i18n={mockTranslations}
        theme={theme}
        features={features}
      >
        {children}
      </AppProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper to test component accessibility
export const testAccessibility = async (component: React.ReactElement) => {
  const { container } = renderWithPolaris(component);
  
  // Check for basic accessibility attributes
  const buttons = container.querySelectorAll('button');
  const inputs = container.querySelectorAll('input');
  const labels = container.querySelectorAll('label');
  
  // Verify buttons have accessible names
  buttons.forEach((button, index) => {
    const hasAccessibleName = 
      button.getAttribute('aria-label') ||
      button.getAttribute('aria-labelledby') ||
      button.textContent?.trim();
    
    if (!hasAccessibleName) {
      console.warn(`Button ${index} lacks accessible name`);
    }
  });
  
  // Verify inputs have labels
  inputs.forEach((input, index) => {
    const hasLabel = 
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      labels.length > index;
    
    if (!hasLabel) {
      console.warn(`Input ${index} lacks proper labeling`);
    }
  });
  
  return container;
};

// Helper to simulate user interactions with Polaris components
export const userInteractions = {
  clickButton: (button: HTMLElement) => {
    button.click();
  },
  
  fillTextField: (input: HTMLInputElement, value: string) => {
    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.blur();
  },
  
  selectOption: (select: HTMLSelectElement, value: string) => {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  },
  
  toggleCheckbox: (checkbox: HTMLInputElement) => {
    checkbox.checked = !checkbox.checked;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  },
  
  openModal: (trigger: HTMLElement) => {
    trigger.click();
  },
  
  closeModal: (closeButton: HTMLElement) => {
    closeButton.click();
  },
};

// Mock Polaris components for testing
export const MockPolarisComponents = {
  Button: vi.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  )),
  
  TextField: vi.fn(({ label, value, onChange, ...props }) => (
    <div>
      <label>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    </div>
  )),
  
  Card: vi.fn(({ children, title, ...props }) => (
    <div data-testid="polaris-card" {...props}>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  )),
  
  Page: vi.fn(({ children, title, ...props }) => (
    <div data-testid="polaris-page" {...props}>
      {title && <h1>{title}</h1>}
      {children}
    </div>
  )),
  
  Modal: vi.fn(({ children, open, title, onClose, ...props }) => (
    open ? (
      <div data-testid="polaris-modal" {...props}>
        <div>
          {title && <h2>{title}</h2>}
          <button onClick={onClose}>Close</button>
          {children}
        </div>
      </div>
    ) : null
  )),
  
  Banner: vi.fn(({ children, status, title, ...props }) => (
    <div data-testid="polaris-banner" data-status={status} {...props}>
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )),
  
  DataTable: vi.fn(({ columnContentTypes, headings, rows, ...props }) => (
    <table data-testid="polaris-datatable" {...props}>
      <thead>
        <tr>
          {headings.map((heading: string, index: number) => (
            <th key={index}>{heading}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row: any[], rowIndex: number) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )),
};

// Performance testing for Polaris components
export const measureRenderPerformance = async (component: React.ReactElement) => {
  const start = performance.now();
  const result = renderWithPolaris(component);
  const end = performance.now();
  
  return {
    renderTime: end - start,
    result,
  };
};

// Theme testing utilities
export const testWithDarkTheme = (component: React.ReactElement) => {
  return renderWithPolaris(component, {
    theme: 'dark-experimental',
  });
};

export const testWithCustomTheme = (
  component: React.ReactElement,
  customTheme: PolarisTheme
) => {
  return renderWithPolaris(component, {
    theme: customTheme,
  });
};

// Responsive testing utilities
export const testResponsiveBreakpoints = (component: React.ReactElement) => {
  const breakpoints = [
    { name: 'mobile', width: 375 },
    { name: 'tablet', width: 768 },
    { name: 'desktop', width: 1024 },
    { name: 'large', width: 1440 },
  ];
  
  return breakpoints.map(({ name, width }) => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
    
    return {
      breakpoint: name,
      width,
      result: renderWithPolaris(component),
    };
  });
};

// Form validation testing
export const testFormValidation = (
  form: HTMLFormElement,
  validData: Record<string, string>,
  invalidData: Record<string, string>
) => {
  const results = {
    validSubmission: false,
    invalidSubmission: false,
    errors: [] as string[],
  };
  
  // Test valid data
  Object.entries(validData).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  results.validSubmission = true;
  
  // Test invalid data
  Object.entries(invalidData).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  
  // Check for validation errors
  const errorElements = form.querySelectorAll('[role="alert"], .error, [aria-invalid="true"]');
  results.errors = Array.from(errorElements).map(el => el.textContent || '');
  results.invalidSubmission = errorElements.length > 0;
  
  return results;
};

// Export default render function
export { renderWithPolaris as render };
export * from '@testing-library/react'; 