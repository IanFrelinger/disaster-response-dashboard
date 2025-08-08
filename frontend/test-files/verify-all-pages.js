/**
 * Verify All Pages After White Screen Fix
 * Quick check to ensure all pages load correctly
 */

import http from 'http';

const pages = [
  { path: '/', name: 'Home' },
  { path: '/simple-test', name: 'Simple Test' },
  { path: '/data-fusion', name: 'Data Fusion Demo' },
  { path: '/foundry-terrain', name: 'Foundry 3D Demo' },
  { path: '/foundry-test', name: 'Foundry Test' },
  { path: '/terrain-3d', name: '3D Terrain Demo' }
];

function testPage(path, name) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3001${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${name} (${path}) - Status: ${res.statusCode}, Content: ${data.length} chars`);
          
          // Check for specific content based on page
          if (path === '/simple-test' && data.includes('Simple Test Page')) {
            console.log(`   ✅ Found SimpleTest content`);
          } else if (path === '/data-fusion' && data.includes('Foundry Data Fusion Demo')) {
            console.log(`   ✅ Found DataFusionDemo content`);
          } else if (path === '/foundry-terrain' && data.includes('Foundry 3D Terrain Demo')) {
            console.log(`   ✅ Found FoundryTerrain3DDemo content`);
          } else if (path === '/foundry-test' && data.includes('Foundry Integration Test')) {
            console.log(`   ✅ Found SimpleFoundryTest content`);
          } else if (path === '/terrain-3d' && data.includes('3D Terrain Visualization')) {
            console.log(`   ✅ Found Terrain3DTest content`);
          } else if (path === '/' && data.includes('Simple Test Page')) {
            console.log(`   ✅ Found homepage content`);
          }
          
          resolve(true);
        } else {
          console.log(`❌ ${name} (${path}) - Status: ${res.statusCode}`);
          reject(new Error(`Status: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${name} (${path}) - Error: ${err.message}`);
      reject(err);
    });

    req.setTimeout(10000, () => {
      console.log(`❌ ${name} (${path}) - Timeout`);
      reject(new Error('Timeout'));
    });
  });
}

async function verifyAllPages() {
  console.log('🧪 Verifying All Pages After White Screen Fix\n');
  
  const results = [];
  
  for (const page of pages) {
    try {
      await testPage(page.path, page.name);
      results.push({ ...page, status: '✅ PASS' });
    } catch (error) {
      results.push({ ...page, status: '❌ FAIL', error: error.message });
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📋 Summary:');
  results.forEach(result => {
    console.log(`  ${result.status} ${result.name} (${result.path})`);
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  const passed = results.filter(r => r.status === '✅ PASS').length;
  const failed = results.filter(r => r.status === '❌ FAIL').length;
  
  console.log(`\n🎯 Results: ${passed}/${results.length} pages working`);
  
  if (failed === 0) {
    console.log('🎉 All pages are working correctly!');
    console.log('\n🌐 You can now access:');
    pages.forEach(page => {
      console.log(`  - ${page.name}: http://localhost:3001${page.path}`);
    });
  } else {
    console.log(`⚠️ ${failed} page(s) have issues that need attention.`);
  }
}

verifyAllPages();
