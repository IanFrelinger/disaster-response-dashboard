#!/usr/bin/env node
/**
 * Demo of the command pattern test orchestration system
 */

import { SmokeTestCommand } from '../commands/SmokeTestCommand';
import { PerfBudgetCommand } from '../commands/PerfBudgetCommand';
import { MacroCommand } from '../commands/MacroCommand';
import { presetManager } from '../presets/presets';

// Demo function to show the command pattern in action
export async function runCommandPatternDemo() {
  console.log('🎭 Command Pattern Test Orchestration Demo');
  console.log('==========================================\n');

  // 1. Create individual commands
  console.log('1. Creating individual commands...');
  const smokeCommand = new SmokeTestCommand({
    url: 'http://localhost:3000',
    layerIds: ['terrain', 'buildings', 'hazards']
  });

  const perfCommand = new PerfBudgetCommand({
    maxMs: 5000
  });

  console.log(`✅ Created ${smokeCommand.name} command`);
  console.log(`✅ Created ${perfCommand.name} command`);

  // 2. Create a macro command
  console.log('\n2. Creating macro command...');
  const macroCommand = new MacroCommand('demo-macro', [smokeCommand, perfCommand]);
  console.log(`✅ Created macro command: ${macroCommand.name}`);
  console.log(`   Commands: ${macroCommand.getCommands().map(cmd => cmd.name).join(', ')}`);

  // 3. Show available presets
  console.log('\n3. Available presets:');
  const presets = presetManager.listPresets();
  presets.forEach(presetName => {
    const info = presetManager.getPresetInfo(presetName);
    if (info) {
      console.log(`   - ${presetName}: ${info.commandCount} commands (${info.commands.join(', ')})`);
    }
  });

  // 4. Show command factory usage
  console.log('\n4. Command factory usage:');
  const factory = presetManager['factory'];
  console.log('   Available factory methods:');
  console.log('   - factory.smoke()');
  console.log('   - factory.invariants()');
  console.log('   - factory.visual_dc()');
  console.log('   - factory.perf()');
  console.log('   - factory.robust()');
  console.log('   - factory.safe_routes()');

  // 5. Show preset composition
  console.log('\n5. Preset composition examples:');
  console.log('   smoke-min: Basic functionality test');
  console.log('   map-core: Core map features (smoke + invariants + perf)');
  console.log('   visual-reg: Visual regression testing');
  console.log('   full-map: Comprehensive testing suite');

  console.log('\n🎉 Command pattern system is ready!');
  console.log('\nUsage examples:');
  console.log('  pnpm test:compose smoke-min');
  console.log('  pnpm test:compose map-core');
  console.log('  pnpm test:compose full-map');
  console.log('  make compose PRESET=smoke-min');
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCommandPatternDemo().catch(console.error);
}
