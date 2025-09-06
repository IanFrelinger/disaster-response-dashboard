import React, { useEffect, useState } from 'react';
import { useDataFusion } from '../../services/foundryDataFusion';
import { dataFusion } from '../../services/foundryDataFusion';

export const DataFusionDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});

  const fusedData = useDataFusion();

  useEffect(() => {
    // Test the data fusion service directly
    const testDataFusion = async () => {
      try {
        console.log('🧪 DataFusionDebugger: Testing data fusion service...');
        
        // Test 1: Check if the service instance exists
        const serviceExists = !!dataFusion;
        console.log('✅ Service instance exists:', serviceExists);

        // Test 2: Check current state
        const currentState = dataFusion.getState();
        console.log('📊 Current state:', currentState);

        // Test 3: Test data loading
        if (dataFusion && typeof (dataFusion as any).testDataLoading === 'function') {
          await (dataFusion as any).testDataLoading();
        }

        // Test 4: Check state after loading
        const updatedState = dataFusion.getState();
        console.log('📊 Updated state:', updatedState);

        setTestResults({
          serviceExists,
          currentState,
          updatedState,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ DataFusionDebugger: Test failed:', error);
        setTestResults({
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    };

    testDataFusion();
  }, []);

  useEffect(() => {
    // Update debug info when fused data changes
    setDebugInfo({
      hazards: {
        active: fusedData.hazards?.active?.length || 0,
        critical: fusedData.hazards?.critical?.length || 0,
        total: fusedData.hazards?.total || 0,
        lastUpdated: fusedData.hazards?.lastUpdated
      },
      units: {
        available: fusedData.units?.available?.length || 0,
        dispatched: fusedData.units?.dispatched?.length || 0,
        total: fusedData.units?.total || 0,
        lastUpdated: fusedData.units?.lastUpdated
      },
      routes: {
        safe: fusedData.routes?.safe?.length || 0,
        compromised: fusedData.routes?.compromised?.length || 0,
        total: fusedData.routes?.total || 0,
        lastUpdated: fusedData.routes?.lastUpdated
      },
      timestamp: new Date().toISOString()
    });
  }, [fusedData]);

  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md z-50 text-xs">
      <h3 className="font-bold mb-2">🔍 Data Fusion Debugger</h3>
      
      <div className="mb-3">
        <h4 className="font-semibold text-green-400">📊 Current Data:</h4>
        <div className="ml-2">
          <div>Hazards: {debugInfo.hazards?.active || 0} active, {debugInfo.hazards?.total || 0} total</div>
          <div>Units: {debugInfo.units?.available || 0} available, {debugInfo.units?.total || 0} total</div>
          <div>Routes: {debugInfo.routes?.safe || 0} safe, {debugInfo.routes?.total || 0} total</div>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-blue-400">🧪 Test Results:</h4>
        <div className="ml-2">
          {testResults.serviceExists !== undefined && (
            <div>Service exists: {testResults.serviceExists ? '✅' : '❌'}</div>
          )}
          {testResults.error && (
            <div className="text-red-400">Error: {testResults.error}</div>
          )}
          {testResults.timestamp && (
            <div>Tested: {new Date(testResults.timestamp).toLocaleTimeString()}</div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-yellow-400">🔧 Actions:</h4>
        <button
          onClick={() => {
            if (dataFusion && typeof (dataFusion as any).testDataLoading === 'function') {
              (dataFusion as any).testDataLoading();
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs mr-2"
        >
          Test Data Loading
        </button>
        <button
          onClick={() => console.log('Current state:', dataFusion.getState())}
          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          Log State
        </button>
      </div>

      <div className="text-xs text-gray-400">
        Last update: {debugInfo.timestamp ? new Date(debugInfo.timestamp).toLocaleTimeString() : 'Never'}
      </div>
    </div>
  );
};
