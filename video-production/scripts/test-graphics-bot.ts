import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { GraphicsBot, OverlayDescriptor, ChartConfig, DalleConfig } from './graphics-bot.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the GraphicsBot
async function testGraphicsBot() {
  console.log('🎨 Testing GraphicsBot...\n');
  
  const graphicsBot = new GraphicsBot({ width: 1920, height: 1080 });
  
  // Sample overlay instructions from the record.config.json
  const sampleOverlays = [
    "overlay(title:Disaster Response Platform,in,0)",
    "overlay(subtitle:Palantir Building Challenge — Ian Frelinger,in,800)",
    "overlay(callout:Ingestion: FIRMS, NOAA, 911, Population, Traffic,in,300)",
    "overlay(badge:Evacuated · In Progress · Refused · No Contact,in,0)",
    "overlay(chip:GET /api/hazards,in,2800)",
    "overlay(status:Risk: High · Pop. at risk ~N,in,0)",
    "overlay(diagram:assets/diagrams/api_data_flow.png,in,0)"
  ];
  
  console.log('📝 Sample Overlay Instructions:');
  sampleOverlays.forEach((overlay, index) => {
    console.log(`  ${index + 1}. ${overlay}`);
  });
  
  console.log('\n🎨 Generated Overlay Descriptors:');
  const overlayDescriptors = graphicsBot.generateOverlays(sampleOverlays);
  
  overlayDescriptors.forEach((descriptor, index) => {
    const details = [
      `Type: ${descriptor.overlay}`,
      descriptor.text ? `Text: "${descriptor.text}"` : '',
      descriptor.file ? `File: ${descriptor.file}` : '',
      `Position: ${descriptor.position}`,
      `Size: ${descriptor.width}x${descriptor.height}`,
      `Background: ${descriptor.background}`,
      `Animation: ${descriptor.animation?.type} (${descriptor.animation?.duration}ms)`
    ].filter(Boolean).join(' | ');
    
    console.log(`  ${index + 1}. ${details}`);
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Original overlays: ${sampleOverlays.length}`);
  console.log(`   Generated descriptors: ${overlayDescriptors.length}`);
  
  // Test chart generation
  console.log('\n📈 Testing Chart Generation:');
  try {
    const chartConfig: ChartConfig = {
      title: 'Disaster Response API Performance',
      xLabel: 'Time (hours)',
      yLabel: 'Response Time (ms)',
      data: [120, 95, 87, 134, 156, 98, 112, 89, 145, 167],
      chartType: 'line',
      filename: 'api_performance_chart.png'
    };
    
    console.log('  📊 Generating line chart...');
    const chartPath = await graphicsBot.generateChart(chartConfig);
    console.log(`  ✅ Chart generated: ${chartPath}`);
    
    // Test bar chart
    const barChartConfig: ChartConfig = {
      title: 'API Endpoint Usage',
      xLabel: 'Endpoints',
      yLabel: 'Requests per Hour',
      data: [45, 32, 28, 19, 15, 12],
      chartType: 'bar',
      filename: 'api_usage_chart.png'
    };
    
    console.log('  📊 Generating bar chart...');
    const barChartPath = await graphicsBot.generateChart(barChartConfig);
    console.log(`  ✅ Bar chart generated: ${barChartPath}`);
    
  } catch (error) {
    console.error('  ❌ Chart generation error:', error);
  }
  
  // Test DALL-E image generation
  console.log('\n🎨 Testing DALL-E Image Generation:');
  try {
    const dalleConfig: DalleConfig = {
      prompt: 'Abstract gradient background with emergency response colors - red, orange, and blue flowing together in a professional, modern style suitable for a disaster response dashboard presentation.',
      filename: 'abstract_background.png',
      size: '1792x1024'
    };
    
    console.log('  🎨 Generating DALL-E image...');
    const imagePath = await graphicsBot.generateDalleImage(dalleConfig);
    console.log(`  ✅ Image path: ${imagePath}`);
    
  } catch (error) {
    console.error('  ❌ DALL-E generation error:', error);
  }
  
  // Test safe positioning
  console.log('\n📍 Testing Safe Positioning:');
  const testOverlay = { width: 300, height: 100 };
  
  ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].forEach(position => {
    const coords = graphicsBot.calculateSafePosition(position, testOverlay);
    console.log(`  ${position}: (${coords.x}, ${coords.y})`);
  });
  
  // Test brand palette
  console.log('\n🎨 Brand Palette:');
  const palette = graphicsBot.getBrandPalette();
  Object.entries(palette).forEach(([name, color]) => {
    console.log(`  ${name}: ${color}`);
  });
  
  // Save the results to a file for inspection
  const outputPath = path.join(__dirname, '..', 'output', 'graphics-bot-results.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const output = {
    originalOverlays: sampleOverlays,
    generatedDescriptors: overlayDescriptors,
    timestamp: new Date().toISOString(),
    summary: {
      originalCount: sampleOverlays.length,
      generatedCount: overlayDescriptors.length,
      viewport: { width: 1920, height: 1080 },
      safeMargins: { top: 60, right: 60, bottom: 60, left: 60 }
    }
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 GraphicsBot results saved to: ${outputPath}`);
}

// Run the test
testGraphicsBot().catch(console.error);
