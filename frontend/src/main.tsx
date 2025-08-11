import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚨 main.tsx is executing!');
console.log('🚨 React import successful:', React);
console.log('🚨 ReactDOM import successful:', ReactDOM);

const rootElement = document.getElementById('root');
console.log('🚨 Root element found:', rootElement);

if (rootElement) {
  try {
    console.log('🚨 Attempting to mount React application...');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('🚨 React application mounted successfully!');
  } catch (error) {
    console.error('🚨 Error mounting React application:', error);
    console.error('🚨 Error stack:', error.stack);
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px;">
        <h1>🚨 React Mount Error</h1>
        <p>Error: ${error}</p>
        <p>Stack: ${error.stack}</p>
        <p>Check console for details.</p>
      </div>
    `;
  }
} else {
  console.error('🚨 Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px;">
      <h1>🚨 Root Element Error</h1>
      <p>Root element with id "root" not found!</p>
      <p>Available elements:</p>
      <pre>${document.body.innerHTML}</pre>
    </div>
  `;
}
