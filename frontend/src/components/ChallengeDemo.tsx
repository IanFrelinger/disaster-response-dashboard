import React from 'react';

export const ChallengeDemo: React.FC = () => {
  console.log('🚨 ChallengeDemo component is executing!');
  
  return (
    <div>
      {/* Enhanced Header - Matching Live Map Style */}
      <div className="ios-card" style={{ margin: '0 0 var(--ios-spacing-lg) 0' }}>
        <div className="ios-container" style={{ padding: 0 }}>
          <div className="ios-flex-between">
            <div>
              <h1 className="ios-headline" style={{ color: 'var(--ios-blue)', margin: 0, marginBottom: 'var(--ios-spacing-xs)' }}>
                🚨 Challenge Demo Component
              </h1>
              <p className="ios-caption" style={{ margin: 0 }}>
                Component testing and verification for React application development
              </p>
            </div>
            
            <div className="ios-flex" style={{ gap: 'var(--ios-spacing-md)' }}>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-green)' }}>✅</span>
                <span className="ios-caption" style={{ margin: 0 }}>Mounted</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-blue)' }}>⚛️</span>
                <span className="ios-caption" style={{ margin: 0 }}>React</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-purple)' }}>📝</span>
                <span className="ios-caption" style={{ margin: 0 }}>TypeScript</span>
              </div>
              <div className="ios-flex" style={{ gap: 'var(--ios-spacing-xs)' }}>
                <span className="ios-caption" style={{ margin: 0, color: 'var(--ios-orange)' }}>🔧</span>
                <span className="ios-caption" style={{ margin: 0 }}>Development</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Content */}
      <div className="ios-card large">
        <div className="ios-container">
          <div style={{ textAlign: 'center' }}>
            <h2 className="ios-headline" style={{ color: 'var(--ios-blue)', marginBottom: 'var(--ios-spacing-lg)' }}>
              🚨 ChallengeDemo Component Loaded Successfully!
            </h2>
            <p className="ios-body">This is a test to verify the component is mounting properly.</p>
            <p className="ios-body">If you can see this message, the React app is working correctly.</p>
            <p className="ios-body"><strong>Last Updated: {new Date().toLocaleTimeString()}</strong></p>
            <p className="ios-body"><strong>Component ID: {Math.random().toString(36).substr(2, 9)}</strong></p>
            
            <div className="ios-card" style={{ 
              background: 'var(--ios-blue-light)', 
              padding: 'var(--ios-spacing-lg)', 
              margin: 'var(--ios-spacing-lg) 0',
              border: '1px solid var(--ios-blue)'
            }}>
              <h3 className="ios-subheadline" style={{ color: 'var(--ios-blue)', marginBottom: 'var(--ios-spacing-md)' }}>
                ✅ Component Status: MOUNTED
              </h3>
              <p className="ios-body">TypeScript compilation: SUCCESS</p>
              <p className="ios-body">React rendering: SUCCESS</p>
              <p className="ios-body">Component tree: LOADED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
