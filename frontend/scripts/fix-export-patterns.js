#!/usr/bin/env node

/**
 * Script to fix mixed export patterns across all components
 * Standardizes components to use named exports consistently
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const COMPONENTS_DIR = 'src/components';
const TACMAP_DIR = 'src/components/tacmap';
const OUTPUT_FILE = 'export-fixes-applied.md';

// Export patterns to fix
const EXPORT_PATTERNS = [
  // Pattern 1: Both named and default export
  {
    name: 'Mixed Named + Default Export',
    pattern: /export const (\w+).*?export default \1/gs,
    fix: (match, componentName) => {
      // Remove the default export, keep named export
      return match.replace(/export default \w+;?\s*$/, '');
    }
  },
  // Pattern 2: Default export after named export
  {
    name: 'Default Export After Named Export',
    pattern: /export const (\w+).*?export default \1/gs,
    fix: (match, componentName) => {
      return match.replace(/export default \w+;?\s*$/, '');
    }
  },
  // Pattern 3: Named export after default export
  {
    name: 'Named Export After Default Export',
    pattern: /export default (\w+).*?export const \1/gs,
    fix: (match, componentName) => {
      // Remove the named export, keep default export
      return match.replace(/export const \w+.*?;?\s*$/gm, '');
    }
  }
];

// Import patterns to fix
const IMPORT_PATTERNS = [
  // Pattern 1: Default import for named export
  {
    name: 'Default Import for Named Export',
    pattern: /import (\w+) from ['"](\.\/\w+)['"]/g,
    fix: (match, importName, filePath) => {
      return `import { ${importName} } from '${filePath}'`;
    }
  },
  // Pattern 2: Named import for default export
  {
    name: 'Named Import for Default Export',
    pattern: /import \{ (\w+) \} from ['"](\.\/\w+)['"]/g,
    fix: (match, importName, filePath) => {
      return `import ${importName} from '${filePath}'`;
    }
  }
];

// Statistics
let filesProcessed = 0;
let filesFixed = 0;
let totalFixes = 0;
const appliedFixes = [];

/**
 * Check if a file has mixed exports
 */
function hasMixedExports(content) {
  const hasNamedExport = /export const \w+/.test(content);
  const hasDefaultExport = /export default \w+/.test(content);
  return hasNamedExport && hasDefaultExport;
}

/**
 * Apply export pattern fixes
 */
function fixExportPatterns(content, filePath) {
  let fixedContent = content;
  let fixesApplied = 0;

  // Apply export pattern fixes
  for (const pattern of EXPORT_PATTERNS) {
    const matches = fixedContent.match(pattern.pattern);
    if (matches) {
      fixedContent = pattern.fix(fixedContent, matches[1]);
      fixesApplied++;
      appliedFixes.push({
        file: filePath,
        pattern: pattern.name,
        description: `Fixed ${pattern.name}`
      });
    }
  }

  // Standardize to named exports (recommended approach)
  if (hasMixedExports(fixedContent)) {
    // Remove default exports, keep named exports
    fixedContent = fixedContent.replace(/export default \w+;?\s*$/gm, '');
    fixesApplied++;
    appliedFixes.push({
      file: filePath,
      pattern: 'Standardization',
      description: 'Standardized to named exports only'
    });
  }

  return { fixedContent, fixesApplied };
}

/**
 * Apply import pattern fixes
 */
function fixImportPatterns(content, filePath) {
  let fixedContent = content;
  let fixesApplied = 0;

  // Apply import pattern fixes
  for (const pattern of IMPORT_PATTERNS) {
    const matches = fixedContent.match(pattern.pattern);
    if (matches) {
      fixedContent = pattern.fix(fixedContent, matches[1], matches[2]);
      fixesApplied++;
      appliedFixes.push({
        file: filePath,
        pattern: 'Import Fix',
        description: `Fixed ${pattern.name}`
      });
    }
  }

  return { fixedContent, fixesApplied };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    filesProcessed++;

    // Check if file needs fixing
    if (!hasMixedExports(content)) {
      return;
    }

    console.log(`🔧 Fixing: ${filePath}`);

    // Apply fixes
    let { fixedContent, fixesApplied } = fixExportPatterns(content, filePath);
    const importFixes = fixImportPatterns(fixedContent, filePath);
    
    fixedContent = importFixes.fixedContent;
    fixesApplied += importFixes.fixesApplied;

    if (fixesApplied > 0) {
      // Backup original file
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, content);
      
      // Write fixed content
      fs.writeFileSync(filePath, fixedContent);
      
      filesFixed++;
      totalFixes += fixesApplied;
      
      console.log(`  ✅ Applied ${fixesApplied} fixes`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Generate fix report
 */
function generateReport() {
  const report = `# Export Pattern Fixes Applied

Generated: ${new Date().toISOString()}

## Summary

- **Files Processed**: ${filesProcessed}
- **Files Fixed**: ${filesFixed}
- **Total Fixes Applied**: ${totalFixes}

## Fixes Applied

${appliedFixes.map(fix => `
### ${fix.file}
- **Pattern**: ${fix.pattern}
- **Description**: ${fix.description}
`).join('')}

## Next Steps

1. **Run ESLint** to verify no mixed exports remain:
   \`\`\`bash
   npm run lint
   \`\`\`

2. **Test the render gauntlet** to verify components now render:
   \`\`\`bash
   npm run test:unit -- src/testing/tests/render-gauntlet.test.tsx
   \`\`\`

3. **Verify imports work** in your application

## Export Convention

Going forward, use **named exports** consistently:

\`\`\`typescript
// ✅ Good - Named export only
export const ComponentName: React.FC<Props> = ({ ... }) => { ... };

// ❌ Bad - Mixed exports
export const ComponentName = ...;
export default ComponentName;
\`\`\`

## Import Convention

\`\`\`typescript
// ✅ Good - Named import
import { ComponentName } from './ComponentName';

// ❌ Bad - Default import for named export
import ComponentName from './ComponentName';
\`\`\`
`;

  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`\n📋 Report generated: ${OUTPUT_FILE}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 Starting export pattern fixes...\n');

  // Get component files
  const componentFiles = [
    ...await glob(`${COMPONENTS_DIR}/**/*.tsx`),
    ...await glob(`${TACMAP_DIR}/**/*.tsx`)
  ];

  // Process all component files
  for (const filePath of componentFiles) {
    processFile(filePath);
  }

  // Generate report
  generateReport();

  console.log(`\n🎉 Export pattern fixes complete!`);
  console.log(`📊 Files processed: ${filesProcessed}`);
  console.log(`🔧 Files fixed: ${filesFixed}`);
  console.log(`✅ Total fixes applied: ${totalFixes}`);
  
  if (filesFixed > 0) {
    console.log(`\n📋 Check ${OUTPUT_FILE} for detailed report`);
    console.log(`🚀 Next: Run 'npm run lint' to verify fixes`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { processFile, fixExportPatterns, fixImportPatterns };
