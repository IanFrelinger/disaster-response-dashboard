import React, { useState } from 'react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  duration?: number;
}

export const SmokeTestRunner: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runSmokeTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests: Array<{
      name: string;
      test: () => Promise<boolean>;
      message: string;
    }> = [
      {
        name: 'Map Container Rendering',
        test: async () => {
          const container = document.querySelector('.tacmap-container');
          return !!container;
        },
        message: 'Map container should be rendered'
      },
      {
        name: 'Mapbox GL Loading',
        test: async () => {
          const canvas = document.querySelector('canvas');
          return !!canvas;
        },
        message: 'Mapbox GL canvas should be present'
      },
      {
        name: 'Zoom Controls',
        test: async () => {
          const zoomControls = document.querySelector('.zoom-controls');
          return !!zoomControls;
        },
        message: 'Zoom controls should be visible'
      },
      {
        name: 'Layer Controls',
        test: async () => {
          const layerButton = document.querySelector('[aria-label*="layer"]');
          return !!layerButton;
        },
        message: 'Layer control button should be present'
      },
      {
        name: 'CSS Styles Loading',
        test: async () => {
          const styles = getComputedStyle(document.documentElement);
          return styles.getPropertyValue('--tacmap-primary') === '#00FFFF';
        },
        message: 'Tactical map CSS variables should be loaded'
      },
      {
        name: 'Event Listeners',
        test: async () => {
          // Test if we can add event listeners
          let testPassed = false;
          const testElement = document.createElement('div');
          testElement.addEventListener('click', () => {
            testPassed = true;
          });
          testElement.click();
          return testPassed;
        },
        message: 'Event listeners should be functional'
      },
      {
        name: 'Animation Support',
        test: async () => {
          return 'animate' in document.documentElement;
        },
        message: 'CSS animations should be supported'
      },
      {
        name: 'WebGL Support',
        test: async () => {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          return !!gl;
        },
        message: 'WebGL should be supported'
      }
    ];

    for (const test of tests) {
      setCurrentTest(test.name);
      const startTime = performance.now();
      
      try {
        const result = await test.test();
        const duration = performance.now() - startTime;
        
        setTestResults(prev => [...prev, {
          name: test.name,
          status: result ? 'pass' : 'fail',
          message: result ? test.message : `Failed: ${test.message}`,
          duration
        }]);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        const duration = performance.now() - startTime;
        setTestResults(prev => [...prev, {
          name: test.name,
          status: 'fail',
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          duration
        }]);
      }
    }

    setIsRunning(false);
    setCurrentTest('Tests Complete');
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'pending':
        return '⏳';
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass':
        return 'text-green-500';
      case 'fail':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
    }
  };

  const summary = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'pass').length,
    failed: testResults.filter(r => r.status === 'fail').length,
    pending: testResults.filter(r => r.status === 'pending').length
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Smoke Test Runner</h3>
        <button
          onClick={runSmokeTests}
          disabled={isRunning}
          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded text-sm"
        >
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>
      </div>

      {isRunning && (
        <div className="mb-4 text-sm text-cyan-400">
          Running: {currentTest}
        </div>
      )}

      {testResults.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm mb-2">
            Summary: {summary.passed}/{summary.total} passed
          </div>
          
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(result.status)}</span>
                <span className={getStatusColor(result.status)}>
                  {result.name}
                </span>
              </div>
              {result.duration && (
                <span className="text-gray-400 text-xs">
                  {result.duration.toFixed(0)}ms
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {summary.failed > 0 && (
        <div className="mt-4 p-2 bg-red-900 border border-red-700 rounded text-xs">
          <div className="font-semibold mb-1">Failed Tests:</div>
          {testResults
            .filter(r => r.status === 'fail')
            .map((result, index) => (
              <div key={index} className="text-red-300">
                • {result.name}: {result.message}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
