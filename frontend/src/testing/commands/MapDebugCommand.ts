/**
 * MapDebugCommand - Debug map state and layer initialization
 */

import { BaseCommand, TestContext, TestResult, CommandInput, GLOBAL_TIMEOUTS } from './BaseCommand';

export interface MapDebugInput extends CommandInput {
  debugLayers: string[];
  takeScreenshot: boolean;
  checkMapState: boolean;
  checkLayerState: boolean;
}

export class MapDebugCommand extends BaseCommand<MapDebugInput> {
  name = 'MapDebug';

  async run(context: TestContext): Promise<TestResult> {
    this.startTime = Date.now();
    
    try {
      console.log('🔍 Running map debug command');
      
      const debugResults: any = {};
      
      // Check map state
      if (this.input.checkMapState) {
        console.log('🗺️ Checking map state...');
        const mapState = await this.checkMapState(context.page);
        debugResults.mapState = mapState;
        console.log('Map state:', mapState);
      }
      
      // Check layer state
      if (this.input.checkLayerState) {
        console.log('🔍 Checking layer state...');
        const layerState = await this.checkLayerState(context.page, this.input.debugLayers);
        debugResults.layerState = layerState;
        console.log('Layer state:', layerState);
      }
      
      // Take screenshot if requested
      if (this.input.takeScreenshot) {
        console.log('📸 Taking debug screenshot...');
        const screenshotPath = `${context.artifactsDir}/map-debug-${Date.now()}.png`;
        await context.page.screenshot({ path: screenshotPath, fullPage: true });
        debugResults.screenshotPath = screenshotPath;
      }
      
      // Check console errors
      const consoleErrors = await this.getConsoleErrors(context.page);
      debugResults.consoleErrors = consoleErrors;
      
      if (consoleErrors.length > 0) {
        console.log('❌ Console errors found:', consoleErrors);
      }
      
      return this.createResult(
        true,
        [],
        [],
        this.input.takeScreenshot ? [debugResults.screenshotPath] : [],
        debugResults
      );
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Map debug failed: ${errorMessage}`);
      
      return this.createResult(
        false,
        [errorMessage],
        [],
        [],
        { error: errorMessage }
      );
    }
  }

  private async checkMapState(page: any): Promise<any> {
    return await page.evaluate(() => {
      const map = (window as any).__map;
      if (!map) {
        return { error: 'Map not found' };
      }
      
      return {
        isStyleLoaded: map.isStyleLoaded ? map.isStyleLoaded() : false,
        areTilesLoaded: map.areTilesLoaded ? map.areTilesLoaded() : false,
        isMoving: map.isMoving ? map.isMoving() : false,
        isZooming: map.isZooming ? map.isZooming() : false,
        isRotating: map.isRotating ? map.isRotating() : false,
        isPitching: map.isPitching ? map.isPitching() : false,
        isDragging: map.isDragging ? map.isDragging() : false,
        isBoxZooming: map.isBoxZooming ? map.isBoxZooming() : false,
        isDoubleClickZooming: map.isDoubleClickZooming ? map.isDoubleClickZooming() : false,
        isTouchZooming: map.isTouchZooming ? map.isTouchZooming() : false,
        isTouchRotating: map.isTouchRotating ? map.isTouchRotating() : false,
        isTouchPitching: map.isTouchPitching ? map.isTouchPitching() : false,
        isTouchDragging: map.isTouchDragging ? map.isTouchDragging() : false,
        center: map.getCenter ? map.getCenter() : null,
        zoom: map.getZoom ? map.getZoom() : null,
        pitch: map.getPitch ? map.getPitch() : null,
        bearing: map.getBearing ? map.getBearing() : null,
        style: map.getStyle ? map.getStyle() : null,
        sources: map.getStyle ? Object.keys(map.getStyle().sources || {}) : [],
        layers: map.getStyle ? Object.keys(map.getStyle().layers || {}) : []
      };
    });
  }

  private async checkLayerState(page: any, layerIds: string[]): Promise<any> {
    return await page.evaluate((ids: string[]) => {
      const map = (window as any).__map;
      if (!map) {
        return { error: 'Map not found' };
      }
      
      const layerStates: any = {};
      
      for (const id of ids) {
        try {
          const baseLayer = map.getLayer(id);
          const optimizedLayer = map.getLayer(`${id}-optimized`);
          const activeLayer = optimizedLayer || baseLayer;
          
          layerStates[id] = {
            baseLayer: !!baseLayer,
            optimizedLayer: !!optimizedLayer,
            activeLayer: !!activeLayer,
            visible: activeLayer ? map.getLayoutProperty(id, 'visibility') !== 'none' : false,
            features: activeLayer ? map.queryRenderedFeatures({ layers: [id, `${id}-optimized`] }).length : 0
          };
        } catch (error) {
          layerStates[id] = { error: error instanceof Error ? error.message : String(error) };
        }
      }
      
      return layerStates;
    }, layerIds);
  }

  private async getConsoleErrors(page: any): Promise<string[]> {
    return await page.evaluate(() => {
      return (window as any).consoleErrors || [];
    });
  }
}
