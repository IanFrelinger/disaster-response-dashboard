import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { TestModeProvider, TestModeStyles } from './components/testing/TestModeProvider'
import './index.css'

console.log('main.tsx is executing!');
console.log('React import successful:', React);
console.log('ReactDOM import successful:', ReactDOM);

const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

if (rootElement) {
  try {
    console.log('Attempting to mount React application...');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <TestModeProvider>
          <TestModeStyles />
          <App />
        </TestModeProvider>
      </React.StrictMode>
    );
    console.log('React application mounted successfully!');
    
    // Set app idle state for testing
    (window as any).__appIdle = true;
  } catch (error) {
    console.error('Error mounting React application:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    console.error('Error stack:', errorStack);
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px;">
        <h1>React Mount Error</h1>
        <p>Error: ${errorMessage}</p>
        <p>Stack: ${errorStack}</p>
        <p>Check console for details.</p>
      </div>
    `;
  }
} else {
  console.error('Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px;">
              <h1>Root Element Error</h1>
      <p>Root element with id "root" not found!</p>
      <p>Available elements:</p>
      <pre>${document.body.innerHTML}</pre>
    </div>
  `;
}
