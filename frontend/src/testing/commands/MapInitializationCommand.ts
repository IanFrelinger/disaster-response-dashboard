/**
 * MapInitializationCommand - Tests map initialization and basic functionality
 */

import { BaseCommand, TestContext, TestResult, CommandInput, GLOBAL_TIMEOUTS } from './BaseCommand';

export interface MapInitializationInput extends CommandInput {
  expectedLayers?: string[];
  checkTerrain?: boolean;
  checkBuildings?: boolean;
  checkInteractions?: boolean;
}

export class MapInitializationCommand extends BaseCommand {
  name = 'MapInitialization';
  private input: MapInitializationInput;

  constructor(input: MapInitializationInput) {
    super(input);
    this.input = input;
  }

  async run(ctx: TestContext): Promise<TestResult> {
    this.startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const artifacts: string[] = [];

    try {
      if (!ctx.page) {
        throw new Error('Page not available in test context');
      }

      console.log('🗺️ Running map initialization test');

      // Wait for map container
      await this.executeWithTimeout(
        () => ctx.page.waitForSelector('.map-container-3d'),
        GLOBAL_TIMEOUTS.elementWait,
        'Map container not found'
      );

      // Click on "Open 3D Map" button if it exists
      try {
        await this.executeWithTimeout(
          () => ctx.page.waitForSelector('button:has-text("Open 3D Map")'),
          GLOBAL_TIMEOUTS.elementWait,
          '3D Map button not found'
        );
        await ctx.page.click('button:has-text("Open 3D Map")');
        console.log('✅ 3D Map button clicked');
      } catch (error) {
        console.log('ℹ️ 3D Map button not found, assuming already in 3D mode');
      }

      // Wait for map to be ready
      await this.executeWithTimeout(
        () => this.waitForMapReady(ctx.page),
        GLOBAL_TIMEOUTS.mapReady,
        'Map not ready after initialization'
      );

      // Check for expected layers
      if (this.input.expectedLayers) {
        for (const layerId of this.input.expectedLayers) {
          try {
            await this.executeWithTimeout(
              () => this.checkLayerExists(ctx.page, layerId),
              GLOBAL_TIMEOUTS.layerLoad,
              `Layer "${layerId}" not found`
            );
          } catch (error) {
            errors.push(`Expected layer not found: ${layerId}`);
          }
        }
      }

      // Check terrain if requested
      if (this.input.checkTerrain) {
        try {
          await this.executeWithTimeout(
            () => this.checkTerrain(ctx.page),
            GLOBAL_TIMEOUTS.validation,
            'Terrain check timeout'
          );
        } catch (error) {
          errors.push(`Terrain check failed: ${error}`);
        }
      }

      // Check buildings if requested
      if (this.input.checkBuildings) {
        try {
          await this.executeWithTimeout(
            () => this.checkBuildings(ctx.page),
            GLOBAL_TIMEOUTS.validation,
            'Buildings check timeout'
          );
        } catch (error) {
          errors.push(`Buildings check failed: ${error}`);
        }
      }

      // Check interactions if requested
      if (this.input.checkInteractions) {
        try {
          await this.executeWithTimeout(
            () => this.checkInteractions(ctx.page),
            GLOBAL_TIMEOUTS.interaction,
            'Interaction check timeout'
          );
        } catch (error) {
          errors.push(`Interaction check failed: ${error}`);
        }
      }

      const success = errors.length === 0;
      
      if (!success && this.input.failFast) {
        throw new Error(`Map initialization test failed: ${errors.join(', ')}`);
      }

      return this.createResult(success, errors, warnings, artifacts, {
        layersChecked: this.input.expectedLayers?.length || 0,
        terrainChecked: this.input.checkTerrain || false,
        buildingsChecked: this.input.checkBuildings || false,
        interactionsChecked: this.input.checkInteractions || false
      });

    } catch (error) {
      return this.createResult(false, [`Map initialization test failed: ${error}`], warnings, artifacts);
    }
  }

  private async waitForMapReady(page: any): Promise<void> {
    await page.waitForFunction(() => {
      const map = (window as any).__map;
      return map && map.isStyleLoaded() && map.areTilesLoaded();
    }, { timeout: GLOBAL_TIMEOUTS.mapReady });
  }

  private async checkLayerExists(page: any, layerId: string): Promise<boolean> {
    return await page.evaluate((id: string) => {
      const map = (window as any).__map;
      if (!map) return false;
      return map.getLayer(id) !== undefined;
    }, layerId);
  }

  private async checkTerrain(page: any): Promise<boolean> {
    return await page.evaluate(() => {
      const map = (window as any).__map;
      if (!map) return false;
      return map.getTerrain() !== null;
    });
  }

  private async checkBuildings(page: any): Promise<boolean> {
    return await page.evaluate(() => {
      const map = (window as any).__map;
      if (!map) return false;
      const layer = map.getLayer('3d-buildings');
      return layer !== undefined;
    });
  }

  private async checkInteractions(page: any): Promise<boolean> {
    return await page.evaluate(() => {
      const map = (window as any).__map;
      if (!map) return false;
      
      // Test basic map interactions
      try {
        const center = map.getCenter();
        return center && typeof center.lat === 'number' && typeof center.lng === 'number';
      } catch {
        return false;
      }
    });
  }
}
