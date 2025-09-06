/**
 * Test presets and command factory
 */

import { SmokeTestCommand } from '../commands/SmokeTestCommand';
import { LayerInvariantCommand } from '../commands/LayerInvariantCommand';
import { VisualSnapshotCommand } from '../commands/VisualSnapshotCommand';
import { PerfBudgetCommand } from '../commands/PerfBudgetCommand';
import { RobustnessCommand } from '../commands/RobustnessCommand';
import { RouteHazardNoIntersectCommand } from '../commands/RouteHazardNoIntersectCommand';
import { MacroCommand } from '../commands/MacroCommand';
import { LAYER_IDS } from '../commands/TestCommand';

export interface CommandFactory {
  smoke(): SmokeTestCommand;
  invariants(): LayerInvariantCommand;
  visual_dc(): VisualSnapshotCommand;
  visual_california(): VisualSnapshotCommand;
  visual_florida(): VisualSnapshotCommand;
  perf(): PerfBudgetCommand;
  robust(): RobustnessCommand;
  safe_routes(): RouteHazardNoIntersectCommand;
}

export class DefaultCommandFactory implements CommandFactory {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
  }

  smoke(): SmokeTestCommand {
    return new SmokeTestCommand({
      url: this.baseUrl,
      layerIds: [...LAYER_IDS]
    });
  }

  invariants(): LayerInvariantCommand {
    return new LayerInvariantCommand({
      above: 'routes',
      below: 'hazards'
    });
  }

  visual_dc(): VisualSnapshotCommand {
    return new VisualSnapshotCommand({
      viewportKey: 'dcDowntown',
      baseline: 'map-dcDowntown.png',
      threshold: 0.1
    });
  }

  visual_california(): VisualSnapshotCommand {
    return new VisualSnapshotCommand({
      viewportKey: 'california',
      baseline: 'map-california.png',
      threshold: 0.1
    });
  }

  visual_florida(): VisualSnapshotCommand {
    return new VisualSnapshotCommand({
      viewportKey: 'florida',
      baseline: 'map-florida.png',
      threshold: 0.1
    });
  }

  perf(): PerfBudgetCommand {
    return new PerfBudgetCommand({
      maxMs: 3000
    });
  }

  robust(): RobustnessCommand {
    return new RobustnessCommand({
      failureRate: 0.3,
      endpoints: ['**/tiles/**', '**/api/**']
    });
  }

  safe_routes(): RouteHazardNoIntersectCommand {
    return new RouteHazardNoIntersectCommand({
      fixtures: [] // Will be populated with test fixtures
    });
  }
}

export interface PresetRegistry {
  [key: string]: MacroCommand;
}

export class PresetManager {
  private factory: CommandFactory;
  private presets: PresetRegistry = {};

  constructor(factory: CommandFactory) {
    this.factory = factory;
    this.initializePresets();
  }

  private initializePresets(): void {
    // Smoke test only
    this.presets['smoke-min'] = new MacroCommand('smoke-min', [
      this.factory.smoke()
    ]);

    // Core map functionality
    this.presets['map-core'] = new MacroCommand('map-core', [
      this.factory.smoke(),
      this.factory.invariants(),
      this.factory.perf()
    ]);

    // Visual regression testing
    this.presets['visual-reg'] = new MacroCommand('visual-reg', [
      this.factory.visual_dc()
    ]);

    // Visual regression with multiple viewports
    this.presets['visual-multi'] = new MacroCommand('visual-multi', [
      this.factory.visual_dc(),
      this.factory.visual_california(),
      this.factory.visual_florida()
    ]);

    // Robustness testing
    this.presets['robust'] = new MacroCommand('robust', [
      this.factory.smoke(),
      this.factory.robust()
    ]);

    // Route safety testing
    this.presets['safe-routes'] = new MacroCommand('safe-routes', [
      this.factory.smoke(),
      this.factory.safe_routes()
    ]);

    // Full comprehensive testing
    this.presets['full-map'] = new MacroCommand('full-map', [
      this.factory.smoke(),
      this.factory.invariants(),
      this.factory.visual_dc(),
      this.factory.perf(),
      this.factory.robust(),
      this.factory.safe_routes()
    ]);

    // Performance focused
    this.presets['perf-focused'] = new MacroCommand('perf-focused', [
      this.factory.smoke(),
      this.factory.perf()
    ]);

    // Visual focused
    this.presets['visual-focused'] = new MacroCommand('visual-focused', [
      this.factory.smoke(),
      this.factory.visual_dc(),
      this.factory.visual_california(),
      this.factory.visual_florida()
    ]);
  }

  getPreset(name: string): MacroCommand | undefined {
    return this.presets[name];
  }

  listPresets(): string[] {
    return Object.keys(this.presets);
  }

  getPresetInfo(name: string): { name: string; commandCount: number; commands: string[] } | null {
    const preset = this.presets[name];
    if (!preset) return null;

    return {
      name: preset.name,
      commandCount: preset.getCommandCount(),
      commands: preset.getCommands().map(cmd => cmd.name)
    };
  }

  addCustomPreset(name: string, commands: string[]): MacroCommand {
    const commandInstances = commands.map(cmdName => {
      switch (cmdName) {
        case 'smoke': return this.factory.smoke();
        case 'invariants': return this.factory.invariants();
        case 'visual_dc': return this.factory.visual_dc();
        case 'visual_california': return this.factory.visual_california();
        case 'visual_florida': return this.factory.visual_florida();
        case 'perf': return this.factory.perf();
        case 'robust': return this.factory.robust();
        case 'safe_routes': return this.factory.safe_routes();
        default: throw new Error(`Unknown command: ${cmdName}`);
      }
    });

    const preset = new MacroCommand(name, commandInstances);
    this.presets[name] = preset;
    return preset;
  }
}

// Default factory and manager
export const defaultFactory = new DefaultCommandFactory(
  process.env.FRONTEND_URL || 'http://localhost:5173'
);

export const presetManager = new PresetManager(defaultFactory);

// Export commonly used presets
export const presets = presetManager;
