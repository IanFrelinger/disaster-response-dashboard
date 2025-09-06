/**
 * DESIGN TOKENS ENFORCEMENT RULE
 * 
 * This ESLint rule ensures that colors, spacing, and other design values
 * use CSS custom properties (design tokens) instead of hardcoded values.
 * 
 * Usage: Include this in your .eslintrc.js or .eslintrc.cjs
 */

module.exports = {
  rules: {
    // Custom rule to enforce design token usage
    'no-hardcoded-design-values': {
      create(context) {
        return {
          // Check for hardcoded colors in JSX style props
          JSXAttribute(node) {
            if (node.name.name === 'style' && node.value.type === 'JSXExpressionContainer') {
              const styleValue = node.value.expression;
              if (styleValue.type === 'ObjectExpression') {
                styleValue.properties.forEach(prop => {
                  if (prop.key.name === 'color' || 
                      prop.key.name === 'backgroundColor' || 
                      prop.key.name === 'borderColor' ||
                      prop.key.name === 'outlineColor' ||
                      prop.key.name === 'fill' ||
                      prop.key.name === 'stroke') {
                    const value = prop.value.value;
                    if (value && !value.startsWith('var(--') && !value.startsWith('#')) {
                      context.report({
                        node: prop,
                        message: `Use design token instead of hardcoded color: ${value}. Use var(--ios-color-primary) or similar.`
                      });
                    }
                  }
                });
              }
            }
          },
          
          // Check for hardcoded spacing in JSX style props
          JSXAttribute(node) {
            if (node.name.name === 'style' && node.value.type === 'JSXExpressionContainer') {
              const styleValue = node.value.expression;
              if (styleValue.type === 'ObjectExpression') {
                styleValue.properties.forEach(prop => {
                  if (prop.key.name === 'padding' || 
                      prop.key.name === 'margin' || 
                      prop.key.name === 'gap' ||
                      prop.key.name === 'width' ||
                      prop.key.name === 'height' ||
                      prop.key.name === 'minWidth' ||
                      prop.key.name === 'minHeight' ||
                      prop.key.name === 'maxWidth' ||
                      prop.key.name === 'maxHeight' ||
                      prop.key.name === 'top' ||
                      prop.key.name === 'right' ||
                      prop.key.name === 'bottom' ||
                      prop.key.name === 'left' ||
                      prop.key.name === 'borderRadius' ||
                      prop.key.name === 'borderWidth' ||
                      prop.key.name === 'fontSize' ||
                      prop.key.name === 'lineHeight' ||
                      prop.key.name === 'letterSpacing') {
                    const value = prop.value.value;
                    if (value && typeof value === 'string' && !value.startsWith('var(--')) {
                      context.report({
                        node: prop,
                        message: `Use design token instead of hardcoded spacing: ${value}. Use var(--ios-spacing-md) or similar.`
                      });
                    }
                  }
                });
              }
            }
          }
        };
      }
    }
  }
};
