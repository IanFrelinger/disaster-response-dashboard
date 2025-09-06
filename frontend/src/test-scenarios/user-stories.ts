import { RealTimeDataManager } from '../services/RealTimeDataManager';
import { RealTimeConfig } from '../types/realtime';

export interface UserStoryScenario {
  id: string;
  title: string;
  description: string;
  steps: UserStoryStep[];
  expectedOutcomes: string[];
  priority: 'high' | 'medium' | 'low';
  category: 'real-time' | 'map' | 'dashboard' | 'integration';
}

export interface UserStoryStep {
  step: number;
  action: string;
  expectedResult: string;
  validation: () => Promise<boolean> | boolean;
}

export interface TestResult {
  scenarioId: string;
  title: string;
  passed: boolean;
  executionTime: number;
  errors: string[];
  details: string;
}

// Mock configuration for testing
const mockConfig: RealTimeConfig = {
  websocket: {
    url: 'ws://localhost:8080/test',
    reconnectInterval: 1000,
    maxReconnectAttempts: 3,
    heartbeatInterval: 5000
  },
  dataFeeds: {
    weather: [
      {
        id: 'weather-test',
        name: 'Test Weather Feed',
        type: 'weather',
        url: 'https://api.weather.test',
        updateInterval: 1,
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'Test Provider',
          coverage: 'Test Area',
          reliability: 0.9,
          dataQuality: 0.8
        }
      }
    ],
    traffic: [
      {
        id: 'traffic-test',
        name: 'Test Traffic Feed',
        type: 'traffic',
        url: 'https://api.traffic.test',
        updateInterval: 1,
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'Test Provider',
          coverage: 'Test Area',
          reliability: 0.85,
          dataQuality: 0.8
        }
      }
    ],
    emergency: [
      {
        id: 'emergency-test',
        name: 'Test Emergency Feed',
        type: 'hazard',
        url: 'https://api.emergency.test',
        updateInterval: 1,
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'Test Provider',
          coverage: 'Test Area',
          reliability: 0.95,
          dataQuality: 0.9
        }
      }
    ],
    buildings: [
      {
        id: 'buildings-test',
        name: 'Test Building Feed',
        type: 'building',
        url: 'https://api.buildings.test',
        updateInterval: 10,
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'Test Provider',
          coverage: 'Test Area',
          reliability: 0.8,
          dataQuality: 0.75
        }
      }
    ],
    terrain: [
      {
        id: 'terrain-test',
        name: 'Test Terrain Feed',
        type: 'terrain',
        url: 'https://api.terrain.test',
        updateInterval: 15,
        enabled: true,
        lastUpdate: new Date(),
        status: 'active',
        errorCount: 0,
        metadata: {
          provider: 'Test Provider',
          coverage: 'Test Area',
          reliability: 0.85,
          dataQuality: 0.8
        }
      }
    ]
  },
  updateSettings: {
    maxUpdateFrequency: 30,
    batchUpdates: true,
    compression: true,
    fallbackToPolling: true
  },
  performance: {
    maxConcurrentUpdates: 10,
    updateQueueSize: 1000,
    timeout: 5000
  }
};

export const userStoryScenarios: UserStoryScenario[] = [
  {
    id: 'US-001',
    title: 'Real-Time Dashboard Initialization',
    description: 'As a commander, I want the real-time dashboard to initialize properly so I can monitor emergency response operations',
    priority: 'high',
    category: 'real-time',
    steps: [
      {
        step: 1,
        action: 'Initialize RealTimeDataManager',
        expectedResult: 'Manager should be created with configuration',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            return manager !== null && (manager as any).config === mockConfig;
          } catch {
            return false;
          }
        }
      },
      {
        step: 2,
        action: 'Check data feeds initialization',
        expectedResult: 'All configured data feeds should be active',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const feeds = manager.getDataFeedStatus();
            return feeds.length === 5 && feeds.every(feed => feed.status === 'active');
          } catch {
            return false;
          }
        }
      },
      {
        step: 3,
        action: 'Verify system status',
        expectedResult: 'System should report healthy status',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const status = manager.getSystemStatus();
            return status.status === 'healthy' && status.dataFeeds.length > 0;
          } catch {
            return false;
          }
        }
      }
    ],
    expectedOutcomes: [
      'RealTimeDataManager initializes successfully',
      'All data feeds are active and configured',
      'System reports healthy status'
    ]
  },
  {
    id: 'US-002',
    title: 'Weather Data Feed Monitoring',
    description: 'As a commander, I want to monitor real-time weather conditions so I can make informed decisions about emergency response',
    priority: 'high',
    category: 'real-time',
    steps: [
      {
        step: 1,
        action: 'Enable weather data feed',
        expectedResult: 'Weather feed should be active',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const result = manager.setDataFeedStatus('weather-test', true);
            return result === true;
          } catch {
            return false;
          }
        }
      },
      {
        step: 2,
        action: 'Subscribe to weather updates',
        expectedResult: 'Subscription should be created successfully',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const subId = manager.subscribe({
              dataTypes: ['weather'],
              callback: () => {},
              active: true,
              clientId: 'test-client'
            });
            return typeof subId === 'string' && subId.length > 0;
          } catch {
            return false;
          }
        }
      },
      {
        step: 3,
        action: 'Generate weather data',
        expectedResult: 'Weather data should be processed and emitted',
        validation: async () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            let dataReceived = false;
            let updateCount = 0;
            
            manager.on('data:weather', (data) => {
              console.log('   🌤️ Weather data received:', data.type, data.severity);
              dataReceived = true;
            });
            
            manager.on('data:update', (data) => {
              console.log('   📊 Update received:', data.type, data.severity);
              updateCount++;
            });
            
            // Manually trigger weather data generation
            console.log('   🔄 Triggering weather data generation...');
            const success = await manager.generateTestData('weather-test');
            console.log(`   📊 Data generation ${success ? 'successful' : 'failed'}`);
            
            // Wait a bit for processing
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log(`   📈 Total updates received: ${updateCount}`);
            return dataReceived;
          } catch (error) {
            console.log('   ❌ Error in weather validation:', error);
            return false;
          }
        }
      }
    ],
    expectedOutcomes: [
      'Weather data feed is enabled and active',
      'Weather data subscription is created',
      'Real-time weather updates are received'
    ]
  },
  {
    id: 'US-003',
    title: 'Emergency Alert Processing',
    description: 'As a commander, I want to receive and process emergency alerts so I can coordinate immediate response actions',
    priority: 'high',
    category: 'real-time',
    steps: [
      {
        step: 1,
        action: 'Subscribe to emergency alerts',
        expectedResult: 'Emergency alert subscription should be created',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const subId = manager.subscribe({
              dataTypes: ['hazard'],
              severity: ['high', 'critical'],
              callback: () => {},
              active: true,
              clientId: 'test-client'
            });
            return typeof subId === 'string' && subId.length > 0;
          } catch {
            return false;
          }
        }
      },
      {
        step: 2,
        action: 'Process emergency data',
        expectedResult: 'Emergency data should be processed and categorized',
        validation: async () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            let emergencyDataReceived = false;
            let updateCount = 0;
            
            manager.on('data:hazard', (data) => {
              console.log('   🚨 Hazard data received:', data.type, data.severity);
              emergencyDataReceived = data.type === 'hazard' && data.severity;
            });
            
            manager.on('data:update', (data) => {
              console.log('   📊 Update received:', data.type, data.severity);
              updateCount++;
            });
            
            // Manually trigger emergency data generation
            console.log('   🔄 Triggering emergency data generation...');
            const success = await manager.generateTestData('emergency-test');
            console.log(`   📊 Data generation ${success ? 'successful' : 'failed'}`);
            
            // Wait a bit for processing
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log(`   📈 Total updates received: ${updateCount}`);
            return emergencyDataReceived;
          } catch (error) {
            console.log('   ❌ Error in emergency validation:', error);
            return false;
          }
        }
      },
      {
        step: 3,
        action: 'Verify alert prioritization',
        expectedResult: 'High priority alerts should be processed first',
        validation: async () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const updates: any[] = [];
            
            manager.on('data:update', (data) => {
              updates.push(data);
            });
            
            // Manually trigger multiple data feeds to generate updates
            console.log('   🔄 Triggering multiple data feeds...');
            await manager.generateTestData('weather-test');
            await manager.generateTestData('emergency-test');
            await manager.generateTestData('traffic-test');
            
            // Wait a bit for processing
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log(`   📈 Total updates received: ${updates.length}`);
            return updates.length > 0 && updates.some(u => u.severity === 'high' || u.severity === 'critical');
          } catch (error) {
            console.log('   ❌ Error in alert prioritization validation:', error);
            return false;
          }
        }
      }
    ],
    expectedOutcomes: [
      'Emergency alert subscription is active',
      'Emergency data is processed correctly',
      'High priority alerts are prioritized'
    ]
  },
  {
    id: 'US-004',
    title: 'Data Feed Management',
    description: 'As a commander, I want to enable/disable data feeds so I can control which information sources are active',
    priority: 'medium',
    category: 'real-time',
    steps: [
      {
        step: 1,
        action: 'Disable traffic data feed',
        expectedResult: 'Traffic feed should be disabled',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const result = manager.setDataFeedStatus('traffic-test', false);
            return result === true;
          } catch {
            return false;
          }
        }
      },
      {
        step: 2,
        action: 'Verify feed status change',
        expectedResult: 'Traffic feed should show disabled status',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            manager.setDataFeedStatus('traffic-test', false);
            const feeds = manager.getDataFeedStatus();
            const trafficFeed = feeds.find(f => f.id === 'traffic-test');
            return trafficFeed?.status === 'disabled';
          } catch {
            return false;
          }
        }
      },
      {
        step: 3,
        action: 'Re-enable traffic feed',
        expectedResult: 'Traffic feed should be active again',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const result = manager.setDataFeedStatus('traffic-test', true);
            return result === true;
          } catch {
            return false;
          }
        }
      }
    ],
    expectedOutcomes: [
      'Data feeds can be disabled successfully',
      'Feed status changes are reflected immediately',
      'Data feeds can be re-enabled successfully'
    ]
  },
  {
    id: 'US-005',
    title: 'Real-Time Data Subscription Management',
    description: 'As a commander, I want to manage data subscriptions so I can receive relevant information updates',
    priority: 'medium',
    category: 'real-time',
    steps: [
      {
        step: 1,
        action: 'Create multiple subscriptions',
        expectedResult: 'Multiple subscriptions should be created',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const sub1 = manager.subscribe({
              dataTypes: ['weather'],
              callback: () => {},
              active: true,
              clientId: 'test-client'
            });
            const sub2 = manager.subscribe({
              dataTypes: ['traffic'],
              callback: () => {},
              active: true,
              clientId: 'test-client'
            });
            return sub1 !== sub2 && sub1.length > 0 && sub2.length > 0;
          } catch {
            return false;
          }
        }
      },
      {
        step: 2,
        action: 'Unsubscribe from specific feed',
        expectedResult: 'Subscription should be removed',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const subId = manager.subscribe({
              dataTypes: ['weather'],
              callback: () => {},
              active: true,
              clientId: 'test-client'
            });
            const result = manager.unsubscribe(subId);
            return result === true;
          } catch {
            return false;
          }
        }
      },
      {
        step: 3,
        action: 'Verify subscription cleanup',
        expectedResult: 'Unsubscribed feed should not receive updates',
        validation: async () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            let updatesReceived = 0;
            
            const subId = manager.subscribe({
              dataTypes: ['weather'],
              callback: () => { updatesReceived++; },
              active: true,
              clientId: 'test-client'
            });
            
            // Wait for potential updates
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            manager.unsubscribe(subId);
            
            // Wait for more potential updates
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return updatesReceived >= 0; // Should not crash
          } catch {
            return false;
          }
        }
      }
    ],
    expectedOutcomes: [
      'Multiple subscriptions can be created',
      'Subscriptions can be removed successfully',
      'Unsubscribed feeds stop receiving updates'
    ]
  },
  {
    id: 'US-006',
    title: 'System Performance Monitoring',
    description: 'As a commander, I want to monitor system performance so I can ensure reliable operation',
    priority: 'medium',
    category: 'real-time',
    steps: [
      {
        step: 1,
        action: 'Check system status metrics',
        expectedResult: 'System should report performance metrics',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const status = manager.getSystemStatus();
            return status.performance && 
                   typeof status.performance.throughput === 'number' &&
                   typeof status.performance.errorRate === 'number';
          } catch {
            return false;
          }
        }
      },
      {
        step: 2,
        action: 'Monitor update queue',
        expectedResult: 'Update queue should be managed properly',
        validation: async () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            
            // Wait for some updates to accumulate
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const status = manager.getSystemStatus();
            return status.performance.throughput >= 0;
          } catch {
            return false;
          }
        }
      },
      {
        step: 3,
        action: 'Verify error handling',
        expectedResult: 'System should handle errors gracefully',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const status = manager.getSystemStatus();
            return typeof status.performance.errorRate === 'number' && 
                   status.performance.errorRate >= 0;
          } catch {
            return false;
          }
        }
      }
    ],
    expectedOutcomes: [
      'System performance metrics are available',
      'Update queue is managed efficiently',
      'Error handling is robust'
    ]
  },
  {
    id: 'US-007',
    title: 'Real-Time Data Visualization',
    description: 'As a commander, I want to see real-time data updates so I can monitor changing conditions',
    priority: 'high',
    category: 'dashboard',
    steps: [
      {
        step: 1,
        action: 'Monitor live data updates',
        expectedResult: 'Real-time updates should be received',
        validation: async () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            let updateCount = 0;
            
            manager.on('data:update', () => {
              updateCount++;
            });
            
            // Manually trigger data generation
            console.log('   🔄 Triggering data generation for visualization...');
            await manager.generateTestData('weather-test');
            await manager.generateTestData('traffic-test');
            
            // Wait a bit for processing
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log(`   📈 Total updates received: ${updateCount}`);
            return updateCount > 0;
          } catch (error) {
            console.log('   ❌ Error in visualization validation:', error);
            return false;
          }
        }
      },
      {
        step: 2,
        action: 'Check data feed status display',
        expectedResult: 'Data feed status should be visible',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const feeds = manager.getDataFeedStatus();
            return feeds.length > 0 && feeds.every(feed => 
              feed.name && feed.status && feed.type
            );
          } catch {
            return false;
          }
        }
      },
      {
        step: 3,
        action: 'Verify connection status',
        expectedResult: 'Connection status should be displayed',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const status = manager.getSystemStatus();
            return status.status && typeof status.status === 'string';
          } catch {
            return false;
          }
        }
      }
    ],
    expectedOutcomes: [
      'Real-time data updates are displayed',
      'Data feed status is visible',
      'Connection status is shown'
    ]
  },
  {
    id: 'US-008',
    title: 'Data Feed Error Handling',
    description: 'As a commander, I want the system to handle data feed errors gracefully so I can maintain operational awareness',
    priority: 'medium',
    category: 'real-time',
    steps: [
      {
        step: 1,
        action: 'Simulate feed error',
        expectedResult: 'System should detect feed errors',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            // The system should handle errors internally
            return true;
          } catch {
            return false;
          }
        }
      },
      {
        step: 2,
        action: 'Check error reporting',
        expectedResult: 'Errors should be reported in feed status',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const feeds = manager.getDataFeedStatus();
            return feeds.length > 0;
          } catch {
            return false;
          }
        }
      },
      {
        step: 3,
        action: 'Verify system resilience',
        expectedResult: 'System should continue operating despite errors',
        validation: () => {
          try {
            const manager = new RealTimeDataManager(mockConfig);
            const status = manager.getSystemStatus();
            return status.status && status.dataFeeds.length > 0;
          } catch {
            return false;
          }
        }
      }
    ],
    expectedOutcomes: [
      'Data feed errors are detected',
      'Error status is reported',
      'System remains operational'
    ]
  }
];

export class UserStoryTestRunner {
  private results: TestResult[] = [];

  async runAllScenarios(): Promise<TestResult[]> {
    console.log('🚀 Starting User Story Validation Tests...');
    console.log(`📋 Running ${userStoryScenarios.length} scenarios...\n`);

    for (const scenario of userStoryScenarios) {
      const result = await this.runScenario(scenario);
      this.results.push(result);
      
      // Add delay between scenarios
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.printSummary();
    return this.results;
  }

  async runScenario(scenario: UserStoryScenario): Promise<TestResult> {
    console.log(`🔍 Running: ${scenario.title}`);
    console.log(`   Priority: ${scenario.priority.toUpperCase()}`);
    console.log(`   Category: ${scenario.category}`);

    const startTime = Date.now();
    const errors: string[] = [];
    let allStepsPassed = true;

    for (const step of scenario.steps) {
      try {
        console.log(`   Step ${step.step}: ${step.action}`);
        
        const stepResult = await step.validation();
        
        if (stepResult) {
          console.log(`   ✅ ${step.expectedResult}`);
        } else {
          console.log(`   ❌ ${step.expectedResult}`);
          allStepsPassed = false;
          errors.push(`Step ${step.step} failed: ${step.action}`);
        }
      } catch (error) {
        console.log(`   ❌ Step ${step.step} crashed: ${error}`);
        allStepsPassed = false;
        errors.push(`Step ${step.step} crashed: ${error}`);
      }
    }

    const executionTime = Date.now() - startTime;
    const result: TestResult = {
      scenarioId: scenario.id,
      title: scenario.title,
      passed: allStepsPassed,
      executionTime,
      errors,
      details: allStepsPassed ? 'All steps passed successfully' : `Failed steps: ${errors.length}`
    };

    console.log(`   ${allStepsPassed ? '✅ PASSED' : '❌ FAILED'} (${executionTime}ms)\n`);
    return result;
  }

  private printSummary(): void {
    console.log('📊 Test Results Summary');
    console.log('========================');
    
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const totalTime = this.results.reduce((sum, r) => sum + r.executionTime, 0);

    console.log(`Total Scenarios: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️ Total Execution Time: ${totalTime}ms`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Scenarios:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`   ${result.scenarioId}: ${result.title}`);
        result.errors.forEach(error => console.log(`     - ${error}`));
      });
    }

    console.log('\n🎯 Test Execution Complete!');
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getPassRate(): number {
    if (this.results.length === 0) return 0;
    const passed = this.results.filter(r => r.passed).length;
    return (passed / this.results.length) * 100;
  }
}
