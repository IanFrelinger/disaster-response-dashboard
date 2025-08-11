// SIMPLE ES6 MODULE TEST - No imports, no exports
console.log('🚨 simple-test.js is loading...');

// Basic test
const message = 'Simple module is working!';
console.log('🚨 Message:', message);

// DOM test
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚨 DOM loaded in simple-test.js!');
  
  // Add a simple indicator
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: #d1ecf1;
    border: 1px solid #bee5eb;
    border-radius: 4px;
    padding: 8px;
    font-size: 12px;
    z-index: 9999;
  `;
  indicator.textContent = '🔵 Simple Module OK';
  document.body.appendChild(indicator);
  
  console.log('🚨 Simple module test completed!');
});

console.log('🚨 simple-test.js execution completed!');
