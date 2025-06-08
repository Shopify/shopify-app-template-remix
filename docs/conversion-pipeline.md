# V0-to-Polaris Conversion Pipeline

## Overview

The V0-to-Polaris conversion pipeline is a comprehensive set of tools for converting V0/shadcn components to Shopify Polaris components. This system automates the transformation of UI components while preserving logic, state management, and event handling.

## Features

### 1. V0 Code Import & Analysis
- Parse V0 exported React components
- Extract component structure and TypeScript types
- Identify shadcn/ui components and patterns
- Preserve React hooks (useState, useEffect, etc.)
- Extract event handlers and props

### 2. Component Mapping Engine
Automated mapping of common component patterns:

| shadcn Component | Polaris Component | Notes |
|------------------|-------------------|--------|
| Button | Button | Variant mappings included |
| Card | Card | Automatic sectioning |
| Input | TextField | Full prop mapping |
| Select | Select | Options array conversion |
| Dialog | Modal | Content restructuring |
| Badge | Badge | Tone mappings |
| Alert | Banner | Status to tone conversion |
| Separator | Divider | Simple replacement |
| Table | DataTable | Structure transformation |

### 3. Style Conversion
- Tailwind classes → Polaris design tokens
- CSS-in-JS → Polaris component props
- Responsive patterns → Polaris responsive system
- Custom styles → Polaris-compatible alternatives

### 4. Logic Preservation
- Event handlers (onClick → onAction)
- State management patterns
- Form validation logic
- API integration patterns

### 5. Shopify Enhancement
- App Bridge integration
- Shopify admin page layouts (Page, Layout)
- Navigation patterns
- Proper import statements

## Tools

### V0-to-Polaris Converter (`scripts/v0-to-polaris.cjs`)

Main conversion tool for V0 components.

**Usage:**
```bash
# Convert single file
node scripts/v0-to-polaris.cjs -f components/MyComponent.tsx --page

# Convert directory with preview
node scripts/v0-to-polaris.cjs -d src/components --dry-run

# Interactive mode
node scripts/v0-to-polaris.cjs

# Using yarn scripts
yarn convert:v0
```

**Options:**
- `--file, -f`: Convert single file
- `--directory, -d`: Convert entire directory
- `--output, -o`: Specify output file
- `--dry-run`: Preview without writing files
- `--page`: Add Shopify Page wrapper
- `--app-bridge`: Add App Bridge integration
- `--verbose, -v`: Detailed conversion report

### shadcn-to-Polaris Converter (`scripts/shadcn-to-polaris.cjs`)

Specialized converter for shadcn/ui components with enhanced mappings.

**Usage:**
```bash
# Convert shadcn component
node scripts/shadcn-to-polaris.cjs -f components/ui/button.tsx

# Convert ui directory
node scripts/shadcn-to-polaris.cjs -d components/ui --dry-run

# Using yarn scripts
yarn convert:shadcn
```

**Extended Mappings:**
- Form components → FormLayout
- Navigation → Polaris Navigation
- Sheet/Drawer → Modal with drawer behavior
- DropdownMenu → Popover + ActionList
- Command → Combobox
- Tabs → Polaris Tabs
- Accordion → Collapsible
- Calendar → DatePicker

## Conversion Process

### 1. Code Analysis
```javascript
// Extracts component structure
const analysis = parseV0Component(code);
// Returns: imports, hooks, handlers, exports
```

### 2. Component Transformation
```javascript
// Maps components to Polaris equivalents
const result = transformComponent(code, options);
// Applies prop mappings and component replacements
```

### 3. Style Conversion
```javascript
// Converts Tailwind to Polaris patterns
const styled = convertStyles(transformedCode);
// Replaces className with Polaris component props
```

### 4. Shopify Enhancement
```javascript
// Adds Shopify-specific features
const enhanced = addShopifyEnhancements(styledCode, options);
// Includes imports, Page wrapper, App Bridge
```

## Configuration

### Component Mappings
Component mappings are defined in `COMPONENT_MAPPINGS` with:
- Target Polaris component
- Prop transformations
- Required imports
- Special handling instructions

### Style Mappings
Style conversions are defined in `STYLE_MAPPINGS` with:
- Tailwind class mappings
- Polaris design tokens
- Component recommendations
- Layout patterns

## CLI Interface

Both tools provide:
- **Interactive mode**: Guided conversion process
- **Batch processing**: Convert entire directories
- **Dry-run mode**: Preview changes without writing files
- **Progress reporting**: Detailed conversion logs
- **Error handling**: Graceful failure handling

## Output & Reports

### Conversion Report
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "original": { "size": 1024, "lines": 42 },
  "transformed": { "size": 1156, "lines": 48 },
  "summary": {
    "componentsConverted": 5,
    "stylesConverted": 12,
    "enhancements": 3
  }
}
```

### Generated Code
- Clean Polaris imports
- Proper TypeScript types
- Accessibility attributes
- Shopify coding standards

## Examples

### Before (V0/shadcn)
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card className="p-4">
      <CardHeader>
        <h2>Title</h2>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={handleClick}>
          Delete
        </Button>
      </CardContent>
    </Card>
  )
}
```

### After (Polaris)
```tsx
import { Button, Card, Page, Layout } from "@shopify/polaris";

export function MyComponent() {
  return (
    <Page title="Page Title">
      <Layout>
        <Layout.Section>
          <Card title="Title" sectioned>
            <Button variant="critical" onAction={handleClick}>
              Delete
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

## Development Workflow

1. **Import V0 components** into your project
2. **Run conversion tools** with dry-run to preview
3. **Review generated code** and make manual adjustments
4. **Test components** in Storybook or preview system
5. **Integrate** into your Shopify app

## Best Practices

- Always use `--dry-run` first to preview changes
- Keep original files as backup
- Review generated imports and remove unused ones
- Test converted components thoroughly
- Use `--verbose` for debugging conversion issues
- Leverage the preview system for visual testing

## Limitations

- Some complex components may require manual adjustment
- Custom CSS requires manual conversion
- Advanced shadcn patterns may need review
- Animation classes have limited Polaris equivalents
- Form validation libraries need manual integration

## Integration

The conversion pipeline integrates with:
- **Storybook**: Auto-generated stories for converted components
- **Preview System**: Visual testing environment
- **Testing**: Vitest and React Testing Library compatibility
- **Development**: Hot reload and dev server integration 