/**
 * MacroCommand - Composes multiple commands into a single test suite
 */

import type { TestCommand, TestContext, TestResult } from './TestCommand';

export class MacroCommand implements TestCommand {
  name: string;
  private commands: TestCommand[];

  constructor(name: string, commands: TestCommand[]) {
    this.name = name;
    this.commands = commands;
  }

  async run(ctx: TestContext): Promise<TestResult> {
    const startTime = Date.now();
    const artifacts: string[] = [];
    const results: TestResult[] = [];
    
    console.log(`🔍 Running macro command: ${this.name} (${this.commands.length} commands)`);

    for (let i = 0; i < this.commands.length; i++) {
      const command = this.commands[i];
      if (!command) continue;
      
      console.log(`\n📋 Running command ${i + 1}/${this.commands.length}: ${command.name}`);
      
      try {
        const result = await command.run(ctx);
        results.push(result);
        artifacts.push(...(result.artifacts || []));
        
        console.log(`${result.ok ? '✅' : '❌'} ${command.name}: ${result.details}`);
        
        // Stop on first failure if configured
        if (!result.ok && ctx.env.stopOnFirstFailure !== false) {
          console.log(`🛑 Stopping on first failure: ${command.name}`);
          break;
        }
      } catch (error) {
        const errorResult: TestResult = {
          name: command.name,
          ok: false,
          details: `Command failed with error: ${error instanceof Error ? error.message : String(error)}`,
          durationMs: 0,
          error: error instanceof Error ? error : new Error(String(error))
        };
        
        results.push(errorResult);
        console.log(`❌ ${command.name}: ${errorResult.details}`);
        
        if (ctx.env.stopOnFirstFailure !== false) {
          console.log(`🛑 Stopping on error: ${command.name}`);
          break;
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const successCount = results.filter(r => r.ok).length;
    const totalCount = results.length;
    const allPassed = successCount === totalCount;

    const details = `Macro command completed: ${successCount}/${totalCount} commands passed\n\n`;
    const commandDetails = results.map((result, index) => 
      `${index + 1}. ${result.name}: ${result.ok ? '✅' : '❌'} (${result.durationMs}ms)`
    ).join('\n');

    console.log(`\n📊 Macro command summary: ${successCount}/${totalCount} passed`);

    return {
      name: this.name,
      ok: allPassed,
      details: details + commandDetails,
      artifacts,
      durationMs
    };
  }

  addCommand(command: TestCommand): void {
    this.commands.push(command);
  }

  removeCommand(commandName: string): boolean {
    const index = this.commands.findIndex(cmd => cmd.name === commandName);
    if (index !== -1) {
      this.commands.splice(index, 1);
      return true;
    }
    return false;
  }

  getCommands(): TestCommand[] {
    return [...this.commands];
  }

  getCommandCount(): number {
    return this.commands.length;
  }
}
