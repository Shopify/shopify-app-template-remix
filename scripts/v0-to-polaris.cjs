#!/usr/bin/env node

/**
 * V0-to-Polaris Conversion Pipeline
 * 
 * Converts V0 components to Shopify Polaris components with proper mapping
 * and style conversion.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}→ ${msg}${colors.reset}`),
};

// Component mapping from V0/shadcn to Polaris
const componentMap = {
  // Basic Components
  Button: {
    polaris: 'Button',
    props: {
      variant: {
        default: 'primary',
        secondary: 'secondary',
        outline: 'outline',
        ghost: 'plain',
        link: 'plain',
      },
      size: {
        default: 'medium',
        sm: 'slim',
        lg: 'large',
      },
    },
  },
  Card: {
    polaris: 'Card',
    props: {
      variant: {
        default: 'default',
        outline: 'outline',
      },
    },
  },
  Input: {
    polaris: 'TextField',
    props: {
      type: {
        text: 'text',
        password: 'password',
        email: 'email',
        number: 'number',
      },
    },
  },
  Select: {
    polaris: 'Select',
    props: {
      variant: {
        default: 'default',
        outline: 'outline',
      },
    },
  },
  Dialog: {
    polaris: 'Modal',
    props: {
      size: {
        default: 'default',
        sm: 'small',
        lg: 'large',
      },
    },
  },
  Badge: {
    polaris: 'Badge',
    props: {
      variant: {
        default: 'default',
        secondary: 'info',
        destructive: 'critical',
        outline: 'warning',
      },
    },
  },
  Alert: {
    polaris: 'Banner',
    props: {
      variant: {
        default: 'info',
        destructive: 'critical',
        warning: 'warning',
      },
    },
  },
  Separator: {
    polaris: 'Divider',
  },
  Table: {
    polaris: 'DataTable',
  },
};

// Style conversion from Tailwind to Polaris design tokens
const styleMap = {
  // Colors
  'bg-blue-500': 'var(--p-color-bg-primary)',
  'bg-gray-100': 'var(--p-color-bg-secondary)',
  'text-gray-900': 'var(--p-color-text)',
  'text-gray-500': 'var(--p-color-text-secondary)',
  
  // Spacing
  'p-4': 'var(--p-space-4)',
  'm-2': 'var(--p-space-2)',
  'gap-4': 'var(--p-space-4)',
  
  // Typography
  'text-sm': 'var(--p-text-body-sm)',
  'text-base': 'var(--p-text-body)',
  'text-lg': 'var(--p-text-heading)',
  
  // Borders
  'rounded-md': 'var(--p-border-radius-200)',
  'border': 'var(--p-border-width-025)',
};

async function convertComponent(sourcePath, targetPath) {
  try {
    log.step(`Converting component: ${sourcePath}`);
    
    // Read source file
    const sourceCode = fs.readFileSync(sourcePath, 'utf8');
    
    // Parse component
    const componentInfo = parseComponent(sourceCode);
    
    // Convert to Polaris
    const polarisCode = convertToPolaris(componentInfo);
    
    // Write converted file
    fs.writeFileSync(targetPath, polarisCode);
    
    log.success(`Converted: ${targetPath}`);
    return true;
  } catch (error) {
    log.error(`Failed to convert ${sourcePath}: ${error.message}`);
    return false;
  }
}

function parseComponent(sourceCode) {
  // Basic component parsing
  const componentInfo = {
    name: '',
    props: {},
    children: [],
    styles: [],
  };
  
  // Extract component name
  const nameMatch = sourceCode.match(/export\s+function\s+(\w+)/);
  if (nameMatch) {
    componentInfo.name = nameMatch[1];
  }
  
  // Extract props
  const propsMatch = sourceCode.match(/interface\s+(\w+)Props\s*{([^}]*)}/);
  if (propsMatch) {
    const propsText = propsMatch[2];
    const propLines = propsText.split('\n');
    propLines.forEach(line => {
      const propMatch = line.match(/(\w+):\s*([^;]+)/);
      if (propMatch) {
        componentInfo.props[propMatch[1]] = propMatch[2].trim();
      }
    });
  }
  
  // Extract styles
  const styleMatches = sourceCode.match(/className="([^"]+)"/g);
  if (styleMatches) {
    styleMatches.forEach(match => {
      const classes = match.match(/className="([^"]+)"/)[1].split(' ');
      componentInfo.styles.push(...classes);
    });
  }
  
  return componentInfo;
}

function convertToPolaris(componentInfo) {
  const polarisComponent = componentMap[componentInfo.name];
  if (!polarisComponent) {
    throw new Error(`No Polaris mapping found for component: ${componentInfo.name}`);
  }
  
  // Generate imports
  let imports = [
    'import {',
    `  ${polarisComponent.polaris},`,
    '} from "@shopify/polaris";',
    'import "@shopify/polaris/build/esm/styles.css";',
  ].join('\n');
  
  // Generate component
  let component = [
    `export function ${componentInfo.name}(props) {`,
    '  return (',
    `    <${polarisComponent.polaris}`,
  ];
  
  // Add props
  Object.entries(componentInfo.props).forEach(([key, value]) => {
    if (polarisComponent.props?.[key]) {
      const polarisValue = polarisComponent.props[key][value] || value;
      component.push(`      ${key}="${polarisValue}"`);
    } else {
      component.push(`      ${key}={${value}}`);
    }
  });
  
  // Add styles
  const polarisStyles = componentInfo.styles
    .map(style => styleMap[style])
    .filter(Boolean)
    .join(' ');
  
  if (polarisStyles) {
    component.push(`      style={{ ${polarisStyles} }}`);
  }
  
  // Close component
  component.push('    />');
  component.push('  );');
  component.push('}');
  
  return [imports, '', ...component].join('\n');
}

async function main() {
  try {
    log.header('🚀 V0-to-Polaris Conversion Pipeline\n');
    
    // Get source directory
    const sourceDir = process.argv[2];
    if (!sourceDir) {
      throw new Error('Please provide source directory');
    }
    
    // Create target directory
    const targetDir = path.join('app', 'components', 'admin');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Find all component files
    const files = fs.readdirSync(sourceDir)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));
    
    // Convert each component
    let successCount = 0;
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      const success = await convertComponent(sourcePath, targetPath);
      if (success) successCount++;
    }
    
    log.success(`\n✨ Conversion complete!`);
    log.info(`Successfully converted ${successCount} of ${files.length} components`);
    
  } catch (error) {
    log.error(`Conversion failed: ${error.message}`);
    process.exit(1);
  }
}

main(); 