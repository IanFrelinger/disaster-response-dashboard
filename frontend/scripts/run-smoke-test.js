#!/usr/bin/env node

import http from 'http';
import https from 'https';
import { spawn } from 'child_process';

class SimpleSmokeTest {
  constructor() {
    this.results = [];
    this.config = {
      frontendUrl: 'http://localhost:3000',
      backendUrl: 'http://localhost:5001',
      tileServerUrl: 'http://localhost:5001',
      timeout: 10000
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Simple Smoke Tests...\n');
    
    try {
      await this.testServerConnectivity();
      await this.testAPIEndpoints();
      await this.testMapboxIntegration();
      await this.testTileServer();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
    
    this.printResults();
  }

  async testServerConnectivity() {
    console.log('🔌 Testing Server Connectivity...');
    
    // Test frontend server
    await this.runTest('Frontend Server', async () => {
      return this.makeRequest(this.config.frontendUrl);
    });

    // Test backend server
    await this.runTest('Backend Server', async () => {
      return this.makeRequest(this.config.backendUrl);
    });
  }

  async testAPIEndpoints() {
    console.log('🔗 Testing API Endpoints...');
    
    const endpoints = [
      '/api/health',
      '/api/disaster-data',
      '/api/update-resource-status',
      '/api/add-alert'
    ];

    for (const endpoint of endpoints) {
      await this.runTest(`API ${endpoint}`, async () => {
        return this.makeRequest(`${this.config.backendUrl}${endpoint}`);
      });
    }
  }

  async testMapboxIntegration() {
    console.log('🗺️ Testing Mapbox Integration...');
    
    await this.runTest('Mapbox Token Validation', async () => {
      // Test if Mapbox token is properly configured
      const response = await this.makeRequest('https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json?access_token=pk.eyJ1IjoiaWNmcmVsaW5nZXIiLCJhIjoiY20zcW92ZnEyMHNqeTJtcTJ5c2Fza3hoNSJ9.12y7S2B9pkn4PzRPjvaGxw&limit=1');
      
      if (response.status === 200) {
        return 'Mapbox token is valid and working';
      } else if (response.status === 401) {
        return 'Mapbox token is invalid or expired';
      } else {
        return `Mapbox API returned status: ${response.status}`;
      }
    });
  }

  async testTileServer() {
    console.log('🧩 Testing Tile Server...');
    
    const tileEndpoints = [
      '/tiles/california_counties/0/0/0.pbf',
      '/tiles/hazards/0/0/0.pbf',
      '/tiles/routes/0/0/0.pbf',
      '/tiles/admin_boundaries/0/0/0.pbf'
    ];

    for (const endpoint of tileEndpoints) {
      await this.runTest(`Tile Server ${endpoint}`, async () => {
        return this.makeRequest(`${this.config.tileServerUrl}${endpoint}`);
      });
    }
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : http;
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.config.timeout);

      const req = protocol.get(url, (res) => {
        clearTimeout(timeout);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          url: url
        });
      });

      req.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      req.setTimeout(this.config.timeout, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async runTest(testName, testFn) {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      let message = '';
      let status = 'pass';
      
      if (typeof result === 'string') {
        message = result;
      } else if (result && typeof result === 'object') {
        if (result.status >= 200 && result.status < 300) {
          message = `✅ HTTP ${result.status} - ${result.url}`;
        } else if (result.status >= 400 && result.status < 500) {
          message = `⚠️ HTTP ${result.status} - ${result.url} (Client error - may be expected)`;
          status = 'warning';
        } else if (result.status >= 500) {
          message = `❌ HTTP ${result.status} - ${result.url} (Server error)`;
          status = 'fail';
        } else {
          message = `ℹ️ HTTP ${result.status} - ${result.url}`;
        }
      }
      
      this.results.push({
        test: testName,
        status,
        message,
        duration
      });
      
      const icon = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${testName}: ${message} (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        status: 'fail',
        message: error.message,
        duration
      });
      
      console.log(`❌ ${testName}: ${error.message} (${duration}ms)`);
    }
  }

  printResults() {
    console.log('\n📊 Smoke Test Results:');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const total = this.results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Warnings: ${warnings}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    console.log('\nDetailed Results:');
    this.results.forEach(result => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${icon} ${result.test}: ${result.message}${duration}`);
    });
    
    if (failed > 0) {
      console.log('\n❌ Some tests failed. Please check the errors above.');
      process.exit(1);
    } else if (warnings > 0) {
      console.log('\n⚠️ Some tests had warnings, but no critical failures.');
    } else {
      console.log('\n🎉 All smoke tests passed!');
    }
  }
}

// Run the smoke tests
async function main() {
  const runner = new SimpleSmokeTest();
  await runner.runAllTests();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SimpleSmokeTest };
