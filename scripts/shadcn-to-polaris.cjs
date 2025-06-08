#!/usr/bin/env node

/**
 * shadcn/ui to Polaris Component Converter
 * 
 * Specialized converter for transforming shadcn/ui components to Shopify Polaris.
 * Complements the V0 converter with deeper shadcn-specific transformations.
 */

const fs = require('fs');
const path = require('path');

// Import the main converter functions
const { 
  convertCode, 
  convertFile, 
  convertDirectory 
} = require('./v0-to-polaris.cjs');

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

/**
 * Extended shadcn/ui Component Mappings
 * More comprehensive mappings specific to shadcn components
 */
const SHADCN_MAPPINGS = {
  // Form components
  'Form': {
    polaris: 'Form',
    props: {
      'onSubmit': 'onSubmit',
      'className': null
    },
    imports: ['Form'],
    wrapper: 'FormLayout'
  },

  'FormField': {
    polaris: 'FormLayout.Group',
    transformation: 'formField',
    imports: ['FormLayout']
  },

  'FormItem': {
    polaris: null,
    transformation: 'formItem'
  },

  'FormLabel': {
    polaris: null, // Use label prop on field components
    transformation: 'fieldLabel'
  },

  'FormControl': {
    polaris: null, // Direct field component
    transformation: 'fieldControl'
  },

  'FormMessage': {
    polaris: null, // Use error prop on field components
    transformation: 'fieldError'
  },

  // Navigation components
  'NavigationMenu': {
    polaris: 'Navigation',
    props: {
      'className': null
    },
    imports: ['Navigation'],
    transformation: 'navigation'
  },

  'NavigationMenuList': {
    polaris: null,
    transformation: 'navigationList'
  },

  'NavigationMenuItem': {
    polaris: null, // Navigation.Item
    transformation: 'navigationItem'
  },

  // Sheet/Drawer components
  'Sheet': {
    polaris: 'Modal',
    props: {
      'open': 'open',
      'onOpenChange': 'onClose',
      'className': null
    },
    imports: ['Modal'],
    enhancement: 'drawer'
  },

  'SheetContent': {
    polaris: null,
    transformation: 'modalContent'
  },

  'SheetHeader': {
    polaris: null,
    transformation: 'modalHeader'
  },

  'SheetTitle': {
    polaris: null,
    transformation: 'modalTitle'
  },

  // Dropdown components
  'DropdownMenu': {
    polaris: 'Popover',
    props: {
      'open': 'active',
      'onOpenChange': 'onClose',
      'className': null
    },
    imports: ['Popover', 'ActionList'],
    transformation: 'dropdown'
  },

  'DropdownMenuTrigger': {
    polaris: null,
    transformation: 'popoverActivator'
  },

  'DropdownMenuContent': {
    polaris: 'ActionList',
    transformation: 'actionList'
  },

  'DropdownMenuItem': {
    polaris: null, // ActionList.Item
    transformation: 'actionListItem'
  },

  // Toast components
  'Toast': {
    polaris: 'Toast',
    props: {
      'variant': {
        'default': null,
        'destructive': 'error'
      },
      'className': null
    },
    imports: ['Toast'],
    enhancement: 'appBridgeToast'
  },

  // Tabs components
  'Tabs': {
    polaris: 'Tabs',
    props: {
      'value': 'selected',
      'onValueChange': 'onSelect',
      'className': null
    },
    imports: ['Tabs']
  },

  'TabsList': {
    polaris: null,
    transformation: 'tabsList'
  },

  'TabsTrigger': {
    polaris: null, // tabs prop on Tabs component
    transformation: 'tabItem'
  },

  'TabsContent': {
    polaris: null, // children of Tabs
    transformation: 'tabContent'
  },

  // Accordion components
  'Accordion': {
    polaris: 'Collapsible',
    props: {
      'type': null, // Polaris doesn't have accordion types
      'className': null
    },
    imports: ['Collapsible']
  },

  'AccordionItem': {
    polaris: 'Collapsible',
    transformation: 'collapsibleItem'
  },

  'AccordionTrigger': {
    polaris: null, // Use title prop
    transformation: 'collapsibleTrigger'
  },

  'AccordionContent': {
    polaris: null, // Children of Collapsible
    transformation: 'collapsibleContent'
  },

  // Command components (search/autocomplete)
  'Command': {
    polaris: 'Combobox',
    props: {
      'className': null
    },
    imports: ['Combobox'],
    transformation: 'command'
  },

  'CommandInput': {
    polaris: null, // Built into Combobox
    transformation: 'comboboxInput'
  },

  'CommandList': {
    polaris: null,
    transformation: 'comboboxList'
  },

  'CommandItem': {
    polaris: null, // options prop
    transformation: 'comboboxOption'
  },

  // Calendar/Date components
  'Calendar': {
    polaris: 'DatePicker',
    props: {
      'mode': null, // Different API in Polaris
      'selected': 'selected',
      'onSelect': 'onMonthChange',
      'className': null
    },
    imports: ['DatePicker'],
    transformation: 'calendar'
  },

  // Popover components
  'Popover': {
    polaris: 'Popover',
    props: {
      'open': 'active',
      'onOpenChange': 'onClose',
      'className': null
    },
    imports: ['Popover']
  },

  'PopoverTrigger': {
    polaris: null,
    transformation: 'popoverActivator'
  },

  'PopoverContent': {
    polaris: null,
    transformation: 'popoverContent'
  }
};

/**
 * shadcn-specific Style Patterns
 */
const SHADCN_STYLE_PATTERNS = {
  // Common shadcn class patterns
  'cn(': {
    replacement: '// Use Polaris component props instead of cn()',
    note: 'Remove cn() utility, use Polaris component styling'
  },

  'clsx(': {
    replacement: '// Use Polaris component props instead of clsx()',
    note: 'Remove clsx() utility, use Polaris component styling'
  },

  // shadcn theme variables
  'hsl(var(--': {
    replacement: 'var(--p-',
    note: 'Convert shadcn CSS variables to Polaris tokens'
  },

  // shadcn animation classes
  'animate-': {
    note: 'Polaris has limited animation support, consider alternatives'
  }
};

/**
 * Transform shadcn-specific Patterns
 */
function transformShadcnPatterns(code) {
  log.step('Transforming shadcn-specific patterns...');
  
  let transformed = code;
  const transformations = [];

  // Remove shadcn utility imports
  transformed = transformed.replace(
    /import\s+.*?from\s+['"`].*?(cn|clsx|class-variance-authority).*?['"`];?\n?/g,
    '// Removed shadcn utility imports\n'
  );

  // Transform shadcn style patterns
  for (const [pattern, config] of Object.entries(SHADCN_STYLE_PATTERNS)) {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    
    if (regex.test(transformed)) {
      if (config.replacement) {
        transformed = transformed.replace(regex, config.replacement);
      }
      
      transformations.push({
        pattern,
        note: config.note
      });
    }
  }

  // Transform variant props to Polaris equivalents
  transformed = transformVariantProps(transformed);

  log.success(`Applied ${transformations.length} shadcn-specific transformations`);
  return { transformed, transformations };
}

/**
 * Transform Variant Props
 */
function transformVariantProps(code) {
  // Transform variant={{ size: "lg" }} to size="large"
  const variantRegex = /variant=\{\{\s*(\w+):\s*["'](\w+)["']\s*\}\}/g;
  
  return code.replace(variantRegex, (match, prop, value) => {
    // Common variant mappings
    const mappings = {
      size: {
        sm: 'small',
        md: 'medium',
        lg: 'large',
        xl: 'large'
      },
      variant: {
        default: 'primary',
        secondary: 'secondary',
        destructive: 'critical',
        outline: 'secondary',
        ghost: 'plain'
      }
    };

    const mapping = mappings[prop];
    if (mapping && mapping[value]) {
      return `${prop}="${mapping[value]}"`;
    }

    return `${prop}="${value}"`;
  });
}

/**
 * Enhanced Form Conversion
 */
function convertShadcnForm(code) {
  log.step('Converting shadcn form patterns to Polaris...');
  
  let converted = code;

  // Transform react-hook-form patterns
  if (converted.includes('useForm') || converted.includes('Controller')) {
    converted = converted.replace(
      /import.*?react-hook-form.*?;/g,
      '// Consider using Polaris form validation patterns'
    );

    converted = converted.replace(
      /<Controller[^>]*>/g,
      '// Convert Controller to Polaris form field'
    );
  }

  // Transform Zod schema patterns
  if (converted.includes('z.')) {
    converted = converted.replace(
      /import.*?zod.*?;/g,
      '// Consider using Shopify validation utilities'
    );
  }

  return converted;
}

/**
 * Convert shadcn Component to Polaris
 */
async function convertShadcnComponent(code, options = {}) {
  log.header('🔄 Converting shadcn/ui component to Polaris');

  // Apply shadcn-specific transformations first
  const shadcnResult = transformShadcnPatterns(code);
  let transformed = shadcnResult.transformed;

  // Convert forms if present
  transformed = convertShadcnForm(transformed);

  // Apply general V0-to-Polaris conversion
  const conversionResult = await convertCode(transformed, {
    ...options,
    isShadcn: true
  });

  return {
    ...conversionResult,
    shadcnTransformations: shadcnResult.transformations
  };
}

/**
 * CLI Interface for shadcn converter
 */
async function runShadcnCLI() {
  log.header('🎨 shadcn/ui to Polaris Converter');
  console.log();

  const args = process.argv.slice(2);
  const options = parseCliArgs(args);

  if (options.help) {
    showShadcnHelp();
    return;
  }

  try {
    if (options.file) {
      await convertShadcnFile(options.file, options);
    } else if (options.directory) {
      await convertShadcnDirectory(options.directory, options);
    } else {
      await interactiveShadcnMode();
    }
  } catch (error) {
    log.error(`Conversion failed: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Convert shadcn File
 */
async function convertShadcnFile(filePath, options = {}) {
  log.info(`Converting shadcn component: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const originalCode = fs.readFileSync(filePath, 'utf8');
  const result = await convertShadcnComponent(originalCode, options);

  if (options.dryRun) {
    log.warning('Dry run mode - no files will be modified');
    console.log('\n--- SHADCN CONVERSION PREVIEW ---');
    console.log(result.transformed);
    console.log('\n--- END PREVIEW ---\n');
  } else {
    const outputPath = options.output || filePath.replace(/\.(jsx?|tsx?)$/, '.polaris.$1');
    fs.writeFileSync(outputPath, result.transformed);
    log.success(`Converted shadcn component saved to: ${outputPath}`);
  }

  if (options.verbose) {
    console.log('\n--- SHADCN CONVERSION REPORT ---');
    console.log('Original shadcn patterns found:');
    result.shadcnTransformations?.forEach(t => {
      console.log(`  • ${t.pattern}: ${t.note}`);
    });
  }

  return result;
}

/**
 * Convert shadcn Directory
 */
async function convertShadcnDirectory(dirPath, options = {}) {
  log.info(`Converting shadcn components directory: ${dirPath}`);

  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath, { recursive: true })
    .filter(file => /\.(jsx?|tsx?)$/.test(file))
    .map(file => path.join(dirPath, file));

  log.info(`Found ${files.length} shadcn component files to convert`);

  const results = [];
  
  for (const file of files) {
    try {
      const result = await convertShadcnFile(file, { ...options, output: null });
      results.push({ file, success: true, result });
      log.success(`✓ ${file}`);
    } catch (error) {
      results.push({ file, success: false, error: error.message });
      log.error(`✗ ${file}: ${error.message}`);
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  log.header(`\nshadcn Conversion complete: ${successful} successful, ${failed} failed`);
  
  return results;
}

/**
 * Parse CLI Arguments
 */
function parseCliArgs(args) {
  const options = {
    dryRun: false,
    verbose: false,
    isPage: false,
    addAppBridge: false,
    preserveHooks: true // Default for shadcn components
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--file':
      case '-f':
        options.file = args[++i];
        break;
      case '--directory':
      case '-d':
        options.directory = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--page':
        options.isPage = true;
        break;
      case '--app-bridge':
        options.addAppBridge = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * Interactive Mode
 */
async function interactiveShadcnMode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  try {
    log.header('Interactive shadcn/ui to Polaris Conversion');
    console.log();

    const inputPath = await question('Enter shadcn component file or directory path: ');
    const isPage = await question('Is this a page component? (y/n): ');
    const addAppBridge = await question('Add App Bridge integration? (y/n): ');
    const dryRun = await question('Run in dry-run mode? (y/n): ');

    const options = {
      isPage: isPage.toLowerCase() === 'y',
      addAppBridge: addAppBridge.toLowerCase() === 'y',
      dryRun: dryRun.toLowerCase() === 'y',
      verbose: true
    };

    if (fs.lstatSync(inputPath).isDirectory()) {
      await convertShadcnDirectory(inputPath, options);
    } else {
      await convertShadcnFile(inputPath, options);
    }

  } finally {
    rl.close();
  }
}

/**
 * Show Help
 */
function showShadcnHelp() {
  console.log(`
${colors.bright}shadcn/ui to Polaris Converter${colors.reset}

${colors.cyan}USAGE:${colors.reset}
  node scripts/shadcn-to-polaris.cjs [options]

${colors.cyan}OPTIONS:${colors.reset}
  -f, --file <path>      Convert a single shadcn component file
  -d, --directory <path> Convert all shadcn components in directory
  -o, --output <path>    Output file path (for single file conversion)
  --dry-run              Preview conversion without writing files
  --page                 Add Shopify Page wrapper
  --app-bridge           Add App Bridge integration
  -v, --verbose          Show detailed conversion report
  -h, --help             Show this help message

${colors.cyan}EXAMPLES:${colors.reset}
  # Convert single shadcn component
  node scripts/shadcn-to-polaris.cjs -f components/ui/button.tsx

  # Convert entire shadcn ui directory
  node scripts/shadcn-to-polaris.cjs -d components/ui --dry-run

  # Interactive mode
  node scripts/shadcn-to-polaris.cjs

${colors.cyan}SHADCN COMPONENT MAPPINGS:${colors.reset}
  Form → Polaris FormLayout
  Sheet → Polaris Modal (with drawer behavior)
  DropdownMenu → Polaris Popover + ActionList
  NavigationMenu → Polaris Navigation
  Command → Polaris Combobox
  Tabs → Polaris Tabs
  Accordion → Polaris Collapsible
  Calendar → Polaris DatePicker
  Toast → Polaris Toast (with App Bridge)
`);
}

// Run CLI if called directly
if (require.main === module) {
  runShadcnCLI().catch(error => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  convertShadcnComponent,
  convertShadcnFile,
  convertShadcnDirectory,
  transformShadcnPatterns,
  SHADCN_MAPPINGS
}; 