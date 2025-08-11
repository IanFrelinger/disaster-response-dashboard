import React from 'react';

export const ChallengeDemo: React.FC = () => {
  console.log('🚨 ChallengeDemo component is executing!');
  
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      backgroundColor: '#f0f8ff',
      border: '2px solid #0066cc',
      borderRadius: '8px',
      margin: '1rem'
    }}>
      <h2>🚨 ChallengeDemo Component Loaded Successfully!</h2>
      <p>This is a test to verify the component is mounting properly.</p>
      <p>If you can see this message, the React app is working correctly.</p>
      <p><strong>Last Updated: {new Date().toLocaleTimeString()}</strong></p>
      <p><strong>Component ID: {Math.random().toString(36).substr(2, 9)}</strong></p>
      <div style={{ 
        background: '#e3f2fd', 
        padding: '1rem', 
        borderRadius: '8px', 
        margin: '1rem 0',
        border: '1px solid #2196f3'
      }}>
        <h3>✅ Component Status: MOUNTED</h3>
        <p>TypeScript compilation: SUCCESS</p>
        <p>React rendering: SUCCESS</p>
        <p>Component tree: LOADED</p>
      </div>
    </div>
  );
};
