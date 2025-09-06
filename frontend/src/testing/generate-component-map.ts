#!/usr/bin/env ts-node

/**
 * Component Map Generator Script
 * Runs the dynamic component mapper and generates test configurations
 */

import { DynamicComponentMapper } from './dynamic-component-mapper';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🔍 Starting dynamic component discovery...');
  
  const mapper = new DynamicComponentMapper();
  
  try {
    // Discover all components
    const components = await mapper.discoverComponents();
    console.log(`✅ Discovered ${components.length} components:`);
    
    components.forEach(component => {
      console.log(`  - ${component.name} (${component.props.length} props, ${component.interactions.length} interactions)`);
    });
    
    // Generate test configurations
    const configs = mapper.generateAllTestConfigs();
    
    // Save to file
    const outputPath = path.join(__dirname, 'generated-component-map.ts');
    await mapper.saveComponentMap(outputPath);
    console.log(`💾 Saved component map to: ${outputPath}`);
    
    // Generate summary
    const totalProps = configs.reduce((sum, config) => sum + config.props.length, 0);
    const totalInteractions = configs.reduce((sum, config) => sum + config.interactions.length, 0);
    
    console.log('\n📊 Summary:');
    console.log(`  - Components: ${configs.length}`);
    console.log(`  - Total props: ${totalProps}`);
    console.log(`  - Total interactions: ${totalInteractions}`);
    console.log(`  - Error boundaries: ${configs.filter(c => c.errorBoundary).length}`);
    console.log(`  - Async components: ${configs.filter(c => c.async).length}`);
    
    // Check for changes
    const changes = await mapper.checkForChanges();
    if (changes.length > 0) {
      console.log(`\n🔄 Detected changes in ${changes.length} components`);
    } else {
      console.log('\n✅ No changes detected');
    }
    
  } catch (error) {
    console.error('❌ Error during component discovery:', error);
    process.exit(1);
  }
}

// Run main function if this is the entry point
main().catch(console.error);
