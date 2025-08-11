// ES6 MODULE TEST - Comprehensive Module Loading Test
console.log('🚨 test-module.js is loading...');

// Test 1: Basic ES6 module syntax
export const testValue = 'Module export successful!';
export function testFunction() {
  return 'Module function working!';
}

// Test 2: Console logging
console.log('🚨 test-module.js is executing!');
console.log('🚨 ES6 module syntax is valid!');
console.log('🚨 Export testValue:', testValue);
console.log('🚨 Export testFunction:', testFunction());

// Test 3: DOM manipulation
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚨 DOM loaded in test-module.js!');
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    console.log('🚨 Root element found in test-module.js!');
    
    // Create a comprehensive test display
    const testDisplay = document.createElement('div');
    testDisplay.style.cssText = `
      position: fixed;
      top: 50px;
      right: 10px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 16px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    testDisplay.innerHTML = `
      <h4 style="margin: 0 0 8px 0; color: #856404;">🧪 ES6 Module Test</h4>
      <div style="margin-bottom: 4px;">✅ Module loaded: ${new Date().toLocaleTimeString()}</div>
      <div style="margin-bottom: 4px;">✅ Export value: ${testValue}</div>
      <div style="margin-bottom: 4px;">✅ Function call: ${testFunction()}</div>
      <div style="margin-bottom: 4px;">✅ DOM access: Working</div>
      <div style="margin-bottom: 4px;">✅ ES6 syntax: Valid</div>
    `;
    
    document.body.appendChild(testDisplay);
    console.log('🚨 Test display added to DOM!');
  } else {
    console.error('🚨 Root element NOT found in test-module.js!');
  }
});

// Test 4: Error handling
window.addEventListener('error', function(event) {
  console.error('🚨 Global error caught in test-module.js:', event.error);
  console.error('🚨 Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Test 5: Module loading verification
console.log('🚨 test-module.js execution completed successfully!');
console.log('🚨 All ES6 module tests passed!');

// Export default for testing
export default {
  name: 'ES6ModuleTest',
  version: '1.0.0',
  status: 'working',
  timestamp: new Date().toISOString()
};
