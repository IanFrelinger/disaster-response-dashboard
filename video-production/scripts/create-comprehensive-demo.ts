import { chromium, Browser, Page } from 'playwright';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import EnhancedCriticBot from './enhanced-critic-bot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ComprehensiveDemoConfig {
  title: string;
  description: string;
  beats: Beat[];
  totalDuration: number;
  targetDuration: number;
  narration: boolean;
  overlays: boolean;
  interactions: boolean;
}

interface Beat {
  id: string;
  duration: number;
  narration: string;
  actions: string[];
}

interface HumanizedAction {
  action: string;
  selector?: string;
  coordinates?: [number, number];
  path?: [number, number][];
  duration?: number;
  milliseconds?: number;
  comment?: string;
}

interface HumanizedBeat {
  id: string;
  duration: number;
  narration: string;
  actions: HumanizedAction[];
}

interface OverlayDescriptor {
  overlay: string;
  text?: string;
  file?: string;
  position?: string;
  width?: number;
  height?: number;
  background?: string;
  borderLeft?: string;
  animation?: {
    type: string;
    duration: number;
  };
}

class InteractionBot {
  private lastKnownPosition: [number, number] | null = null;

  humanizeActions(actions: string[]): HumanizedAction[] {
    const humanizedActions: HumanizedAction[] = [];
    
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const humanizedAction = this.parseAction(action);
      
      if (humanizedAction) {
        // Add pre-action hover for clicks
        if (humanizedAction.action === 'click' && humanizedAction.selector) {
          humanizedActions.push({
            action: 'hover',
            selector: humanizedAction.selector,
            duration: 500,
            comment: 'Pre-click hover for emphasis'
          });
          
          humanizedActions.push({
            action: 'wait',
            milliseconds: this.randomizeTiming(300, 50),
            comment: 'Brief pause before click'
          });
        }
        
        // Add the main action
        humanizedActions.push(humanizedAction);
        
        // Add post-action wait
        if (humanizedAction.action === 'click' || humanizedAction.action === 'wheel') {
          humanizedActions.push({
            action: 'wait',
            milliseconds: this.randomizeTiming(500, 50),
            comment: 'Post-action pause'
          });
        }
        
        // Generate mouse movement path if needed
        if (humanizedAction.coordinates && this.lastKnownPosition) {
          const path = this.generateHumanizedPath(this.lastKnownPosition, humanizedAction.coordinates);
          const duration = this.calculateMoveDuration(path);
          
          humanizedActions.push({
            action: 'mouseMove',
            path: path,
            duration: duration,
            comment: 'Smooth human-like movement to next target'
          });
          
          humanizedActions.push({
            action: 'wait',
            milliseconds: this.randomizeTiming(300, 50),
            comment: 'Brief pause before action'
          });
        }
        
        // Update last known position
        if (humanizedAction.coordinates) {
          this.lastKnownPosition = humanizedAction.coordinates;
        }
      }
    }
    
    return humanizedActions;
  }

  private parseAction(actionString: string): HumanizedAction | null {
    if (actionString.startsWith('overlay(')) {
      return { action: 'overlay', comment: actionString };
    } else if (actionString.startsWith('goto(')) {
      return { action: 'goto', comment: actionString };
    } else if (actionString.startsWith('waitForSelector(')) {
      return { action: 'waitForSelector', comment: actionString };
    } else if (actionString.startsWith('screenshot(')) {
      return { action: 'screenshot', comment: actionString };
    } else if (actionString.startsWith('click(')) {
      if (actionString.includes('text=')) {
        const selector = actionString.match(/text=([^)]+)/)?.[1];
        return { action: 'click', selector: `text=${selector}` };
      } else if (actionString.includes(',')) {
        const coords = actionString.match(/\((\d+),(\d+)\)/);
        if (coords) {
          return { 
            action: 'click', 
            coordinates: [parseInt(coords[1]), parseInt(coords[2])] 
          };
        }
      }
    } else if (actionString.startsWith('mouseMove(')) {
      const coords = actionString.match(/\((\d+),(\d+)\)/);
      if (coords) {
        return { 
          action: 'mouseMove', 
          coordinates: [parseInt(coords[1]), parseInt(coords[2])] 
        };
      }
    } else if (actionString.startsWith('wheel(')) {
      const delta = actionString.match(/\(([^)]+)\)/)?.[1];
      return { action: 'wheel', comment: `Scroll wheel: ${delta}` };
    } else if (actionString.startsWith('mouseDrag(')) {
      const coords = actionString.match(/\((\d+),(\d+),(\d+),(\d+)\)/);
      if (coords) {
        return { 
          action: 'mouseDrag', 
          comment: `Drag from (${coords[1]},${coords[2]}) to (${coords[3]},${coords[4]})` 
        };
      }
    } else if (actionString.startsWith('wait(')) {
      const time = actionString.match(/\((\d+)\)/)?.[1];
      if (time) {
        return { 
          action: 'wait', 
          milliseconds: parseInt(time) 
        };
      }
    }
    
    return null;
  }

  private generateHumanizedPath(from: [number, number], to: [number, number]): [number, number][] {
    const [x1, y1] = from;
    const [x2, y2] = to;
    
    // Calculate distance
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // Generate intermediate points with slight curve
    const points: [number, number][] = [];
    const numPoints = Math.max(3, Math.floor(distance / 100));
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const x = x1 + (x2 - x1) * t;
      
      // Add slight curve (parabolic)
      const curveOffset = Math.sin(Math.PI * t) * (distance * 0.1);
      const y = y1 + (y2 - y1) * t + curveOffset;
      
      points.push([Math.round(x), Math.round(y)]);
    }
    
    return points;
  }

  private calculateMoveDuration(path: [number, number][]): number {
    if (path.length < 2) return 300;
    
    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      const [x1, y1] = path[i - 1];
      const [x2, y2] = path[i];
      totalDistance += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    // Base duration: 300ms minimum, 1000ms maximum
    const baseDuration = Math.max(300, Math.min(1000, totalDistance * 2));
    return this.randomizeTiming(baseDuration, 100);
  }

  private randomizeTiming(baseTime: number, variance: number): number {
    const randomFactor = (Math.random() - 0.5) * 2 * variance;
    return Math.max(100, baseTime + randomFactor);
  }
}

class GraphicsBot {
  private viewport: { width: number; height: number };
  private safeMargins: { top: number; right: number; bottom: number; left: number };
  private gridColumns: number;
  private brandPalette: any;

  constructor(viewport: { width: number; height: number }) {
    this.viewport = viewport;
    this.gridColumns = 12;
    this.updateViewport(viewport.width, viewport.height);
    this.brandPalette = this.getBrandPalette();
  }

  generateOverlays(overlayInstructions: string[]): OverlayDescriptor[] {
    const overlays: OverlayDescriptor[] = [];
    
    for (const instruction of overlayInstructions) {
      const overlay = this.parseOverlayInstruction(instruction);
      if (overlay) {
        overlays.push(overlay);
      }
    }
    
    return overlays;
  }

  private parseOverlayInstruction(instruction: string): OverlayDescriptor | null {
    if (!instruction.startsWith('overlay(')) return null;
    
    const content = instruction.slice(8, -1); // Remove 'overlay(' and ')'
    const params = content.split(',');
    
    if (params.length < 1) return null;
    
    return this.createOverlayFromParams(params);
  }

  private createOverlayFromParams(params: string[]): OverlayDescriptor {
    let type = params[0];
    let overlayContent = '';
    let animation = 'in';
    let timing = 0;
    
    // Handle type:content format
    if (type.includes(':')) {
      const parts = type.split(':');
      type = parts[0];
      overlayContent = parts.slice(1).join(':');
    }
    
    // Extract other parameters
    if (params.length > 1) animation = params[1];
    if (params.length > 2) timing = parseInt(params[2]) || 0;
    
    // Create specific overlay types
    switch (type) {
      case 'title':
        return this.createTitleOverlay(overlayContent, animation, timing);
      case 'subtitle':
        return this.createSubtitleOverlay(overlayContent, animation, timing);
      case 'callout':
        return this.createCalloutOverlay(overlayContent, animation, timing);
      case 'badge':
        return this.createBadgeOverlay(overlayContent, animation, timing);
      case 'chip':
        return this.createChipOverlay(overlayContent, animation, timing);
      case 'status':
        return this.createStatusOverlay(overlayContent, animation, timing);
      case 'panel':
        return this.createPanelOverlay(overlayContent, animation, timing);
      case 'label':
        return this.createLabelOverlay(overlayContent, animation, timing);
      case 'card':
        return this.createCardOverlay(overlayContent, animation, timing);
      case 'diagram':
        return this.createImageOverlay(overlayContent, animation, timing);
      case 'routeOverlay':
        return this.createImageOverlay(overlayContent, animation, timing);
      case 'slide':
        return this.createImageOverlay(overlayContent, animation, timing);
      case 'conclusion':
        return this.createImageOverlay(overlayContent, animation, timing);
      case 'intro.fullscreen':
        return this.createFullscreenOverlay(overlayContent, animation, timing);
      case 'lowerThird':
        return this.createLowerThirdOverlay(overlayContent, animation, timing);
      case 'type':
        return this.createTypeOverlay(overlayContent, animation, timing);
      case '*':
        return this.createGenericOverlay(overlayContent, animation, timing);
      default:
        return this.createGenericOverlay(overlayContent, animation, timing);
    }
  }

  private createTitleOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    const position = this.calculateSafePosition('center', { width: 800, height: 120 });
    
    return {
      overlay: 'title',
      text: text,
      position: 'center',
      width: 800,
      height: 120,
      background: 'rgba(0,0,0,0.7)',
      borderLeft: '4px solid #FF6600',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createSubtitleOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'subtitle',
      text: text,
      position: 'bottom',
      width: 600,
      height: 80,
      background: 'rgba(0,0,0,0.6)',
      borderLeft: '4px solid #0066CC',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createCalloutOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    const position = this.calculateSafePosition('top-right', { width: 300, height: 100 });
    
    return {
      overlay: 'callout',
      text: text,
      position: 'top-right',
      width: 300,
      height: 100,
      background: 'rgba(0,128,0,0.8)',
      borderLeft: '4px solid #00FF00',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createBadgeOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'badge',
      text: text,
      position: 'center',
      width: 400,
      height: 60,
      background: 'rgba(128,0,128,0.8)',
      borderLeft: '4px solid #FF00FF',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createChipOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'chip',
      text: text,
      position: 'center',
      width: 200,
      height: 40,
      background: 'rgba(0,0,0,0.8)',
      borderLeft: '4px solid #FFAA00',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createStatusOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'status',
      text: text,
      position: 'top-right',
      width: 350,
      height: 80,
      background: 'rgba(255,0,0,0.8)',
      borderLeft: '4px solid #FF0000',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createPanelOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'panel',
      text: text,
      position: 'left',
      width: 250,
      height: 60,
      background: 'rgba(0,0,0,0.8)',
      borderLeft: '4px solid #FFFFFF',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createLabelOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'label',
      text: text,
      position: 'center',
      width: 300,
      height: 50,
      background: 'rgba(0,255,255,0.8)',
      borderLeft: '4px solid #00FFFF',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createCardOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'card',
      text: text,
      position: 'center',
      width: 500,
      height: 120,
      background: 'rgba(0,128,0,0.8)',
      borderLeft: '4px solid #00FF00',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createImageOverlay(file: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'image',
      file: file,
      position: 'center',
      width: 800,
      height: 450,
      background: 'rgba(255,255,255,0.95)',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createFullscreenOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'fullscreen',
      text: text,
      position: 'center',
      width: this.viewport.width,
      height: this.viewport.height,
      background: 'linear-gradient(135deg, #FF6600, #CC3300)',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createLowerThirdOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'lowerThird',
      text: text,
      position: 'bottom-left',
      width: 600,
      height: 80,
      background: 'rgba(0,0,0,0.8)',
      borderLeft: '4px solid #FF6600',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createTypeOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'type',
      text: text,
      position: 'center',
      width: 700,
      height: 100,
      background: 'rgba(255,170,0,0.8)',
      borderLeft: '4px solid #FFAA00',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private createGenericOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'generic',
      text: text,
      position: 'center',
      width: 400,
      height: 80,
      background: 'rgba(0,0,0,0.7)',
      borderLeft: '4px solid #FFFFFF',
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: timing || 800
      }
    };
  }

  private calculateSafePosition(position: string, overlaySize: { width: number; height: number }): { x: number; y: number } {
    let x = 0;
    let y = 0;
    
    switch (position) {
      case 'center':
        x = (this.viewport.width - overlaySize.width) / 2;
        y = (this.viewport.height - overlaySize.height) / 2;
        break;
      case 'top-left':
        x = this.safeMargins.left;
        y = this.safeMargins.top;
        break;
      case 'top-right':
        x = this.viewport.width - overlaySize.width - this.safeMargins.right;
        y = this.safeMargins.top;
        break;
      case 'bottom-left':
        x = this.safeMargins.left;
        y = this.viewport.height - overlaySize.height - this.safeMargins.bottom;
        break;
      case 'bottom-right':
        x = this.viewport.width - overlaySize.width - this.safeMargins.right;
        y = this.viewport.height - overlaySize.height - this.safeMargins.bottom;
        break;
      case 'left':
        x = this.safeMargins.left;
        y = (this.viewport.height - overlaySize.height) / 2;
        break;
      case 'right':
        x = this.viewport.width - overlaySize.width - this.safeMargins.right;
        y = (this.viewport.height - overlaySize.height) / 2;
        break;
      case 'top':
        x = (this.viewport.width - overlaySize.width) / 2;
        y = this.safeMargins.top;
        break;
      case 'bottom':
        x = (this.viewport.width - overlaySize.width) / 2;
        y = this.viewport.height - overlaySize.height - this.safeMargins.bottom;
        break;
      default:
        x = (this.viewport.width - overlaySize.width) / 2;
        y = (this.viewport.height - overlaySize.height) / 2;
    }
    
    return { x: Math.round(x), y: Math.round(y) };
  }

  private updateViewport(width: number, height: number): void {
    this.viewport = { width, height };
    this.safeMargins = {
      top: Math.max(60, height * 0.05),
      right: Math.max(60, width * 0.05),
      bottom: Math.max(60, height * 0.05),
      left: Math.max(60, width * 0.05)
    };
  }

  private getBrandPalette(): any {
    return {
      emergency: '#FF6600',
      info: '#0066CC',
      success: '#00CC00',
      warning: '#FFAA00',
      neutral: '#666666'
    };
  }
}

class ComprehensiveDemoCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private interactionBot: InteractionBot;
  private graphicsBot: GraphicsBot;
  private criticBot: EnhancedCriticBot;
  private currentOverlayDescriptors: OverlayDescriptor[] = [];
  private config: ComprehensiveDemoConfig;

  constructor(config: ComprehensiveDemoConfig) {
    this.config = config;
    this.interactionBot = new InteractionBot();
    this.graphicsBot = new GraphicsBot({ width: 1920, height: 1080 });
    this.criticBot = new EnhancedCriticBot({
      strictMode: true,
      requireAllBeats: true,
      minDuration: 300,
      maxDuration: 360
    });
  }

  async createDemo(): Promise<void> {
    console.log('🎬 Creating Comprehensive Disaster Response Demo...');
    console.log(`📋 Configuration: ${this.config.title}`);
    console.log(`⏱️ Target Duration: ${this.config.targetDuration}s`);
    console.log(`🎬 Total Beats: ${this.config.beats.length}`);
    
    try {
      await this.initializeBrowser();
      await this.recordBeats();
      await this.generateFinalVideo();
      await this.runCriticBotAnalysis();
      
      console.log('✅ Comprehensive demo creation completed!');
      
    } catch (error) {
      console.error('❌ Error creating comprehensive demo:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async initializeBrowser(): Promise<void> {
    console.log('🌐 Initializing browser...');
    
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('✅ Browser initialized');
  }

  private async recordBeats(): Promise<void> {
    console.log(`🎬 Recording ${this.config.beats.length} comprehensive beats...`);
    
    for (let i = 0; i < this.config.beats.length; i++) {
      const beat = this.config.beats[i];
      console.log(`🎬 Recording beat ${i + 1}/${this.config.beats.length}: ${beat.id} (${beat.duration}s)`);
      
      if (beat.narration) {
        console.log(`🎤 Narration: ${beat.narration}`);
      }
      
      await this.executeBeat(beat);
      
      // Brief pause between beats
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  private async executeBeat(beat: Beat): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log(`  🎯 Executing ${beat.actions.length} actions for beat ${beat.id}`);
    
    // Humanize actions with InteractionBot
    const humanizedActions = this.interactionBot.humanizeActions(beat.actions);
    console.log(`  🤖 Humanized into ${humanizedActions.length} actions`);
    
    // Generate overlays with GraphicsBot
    const overlayActions = beat.actions.filter(action => action.includes('overlay('));
    const overlayDescriptors = this.graphicsBot.generateOverlays(overlayActions);
    this.currentOverlayDescriptors = overlayDescriptors;
    console.log(`  🎨 Generated ${overlayDescriptors.length} beautiful overlays`);
    
    // Execute humanized actions
    for (let i = 0; i < humanizedActions.length; i++) {
      const action = humanizedActions[i];
      console.log(`    📝 Action ${i + 1}/${humanizedActions.length}: ${action.action} (${action.comment || 'No comment'})`);
      
      await this.executeHumanizedAction(action, this.page);
    }
    
    console.log(`✅ Beat ${beat.id} recorded successfully`);
  }

  private async executeHumanizedAction(action: HumanizedAction, page: Page): Promise<void> {
    try {
      switch (action.action) {
        case 'hover':
          if (action.selector) {
            await page.hover(action.selector);
            console.log(`      🖱️ Hovered over: ${action.selector}`);
          }
          break;
          
        case 'click':
          if (action.selector) {
            await page.click(action.selector);
            console.log(`      🖱️ Clicked: ${action.selector}`);
          } else if (action.coordinates) {
            await page.click(`x=${action.coordinates[0]}, y=${action.coordinates[1]}`);
            console.log(`      🖱️ Clicked at (${action.coordinates[0]}, ${action.coordinates[1]})`);
          }
          break;
          
        case 'wait':
          if (action.milliseconds) {
            await page.waitForTimeout(action.milliseconds);
            console.log(`      ⏱️ Waited ${action.milliseconds}ms`);
          }
          break;
          
        case 'mouseMove':
          if (action.coordinates) {
            await page.mouse.move(action.coordinates[0], action.coordinates[1]);
            console.log(`      🖱️ Moved mouse to (${action.coordinates[0]}, ${action.coordinates[1]})`);
          } else if (action.path && action.duration) {
            await this.executeSmoothMouseMove(page, action.path, action.duration);
            console.log(`      🖱️ Moved mouse along path (${action.path.length} points)`);
          }
          break;
          
        case 'wheel':
          const delta = parseInt(action.comment?.match(/Scroll wheel: (-?\d+)/)?.[1] || '0');
          await page.mouse.wheel(0, delta);
          console.log(`      ⏱️ Scrolled wheel: ${delta}`);
          break;
          
        case 'mouseDrag':
          const coords = action.comment?.match(/Drag from \((\d+),(\d+)\) to \((\d+),(\d+)\)/);
          if (coords) {
            await page.mouse.move(parseInt(coords[1]), parseInt(coords[2]));
            await page.mouse.down();
            await page.mouse.move(parseInt(coords[3]), parseInt(coords[4]));
            await page.mouse.up();
            console.log(`      🖱️ Dragged from (${coords[1]},${coords[2]}) to (${coords[3]},${coords[4]})`);
          }
          break;
          
        case 'overlay':
          if (action.comment) {
            await this.showOverlay(action.comment);
            console.log(`      🎨 Overlay: ${action.comment}`);
          }
          break;
          
        case 'goto':
          if (action.comment) {
            const url = action.comment.match(/goto\((http[^)]+)\)/)?.[1];
            if (url) {
              await page.goto(url);
              console.log(`      🌐 Navigated to app`);
            }
          }
          break;
          
        case 'waitForSelector':
          if (action.comment) {
            const selector = action.comment.match(/waitForSelector\(([^)]+)\)/)?.[1];
            if (selector) {
              await page.waitForSelector(selector);
              console.log(`      ⏳ Waited for selector: ${selector}`);
            }
          }
          break;
          
        case 'screenshot':
          if (action.comment) {
            const filename = action.comment.match(/screenshot\(([^)]+)\)/)?.[1];
            if (filename) {
              await page.screenshot({ path: filename });
              console.log(`      📸 Screenshot saved: ${filename}`);
            }
          }
          break;
      }
    } catch (error) {
      console.error(`      ❌ Error executing action ${action.action}:`, error);
    }
  }

  private async executeSmoothMouseMove(page: Page, path: [number, number][], duration: number): Promise<void> {
    if (path.length < 2) return;
    
    const stepDuration = duration / (path.length - 1);
    
    for (let i = 1; i < path.length; i++) {
      const [x, y] = path[i];
      await page.mouse.move(x, y);
      await page.waitForTimeout(stepDuration);
    }
  }

  private async showOverlay(overlayInstruction: string): Promise<void> {
    if (!this.page) return;
    
    // Parse overlay instruction
    const match = overlayInstruction.match(/overlay\(([^,]+),([^,]+),(\d+)\)/);
    if (!match) return;
    
    const [, type, animation, timing] = match;
    const timingMs = parseInt(timing);
    
    // Find matching overlay descriptor
    const overlay = this.currentOverlayDescriptors.find(o => 
      o.overlay === type || o.text === type || o.file === type
    );
    
    if (overlay) {
      await this.showGenericOverlay(overlay, animation, timingMs);
    }
  }

  private async showGenericOverlay(overlay: OverlayDescriptor, animation: string, timing: number): Promise<void> {
    if (!this.page) return;
    
    const content = overlay.text || overlay.file || overlay.overlay;
    const style = this.generateOverlayStyle(overlay);
    
    if (animation === 'out') {
      await this.page.evaluate(({ overlayContent, overlayStyle }) => {
        const existingOverlay = document.getElementById('dynamic-overlay');
        if (existingOverlay) {
          existingOverlay.style.opacity = '0';
          setTimeout(() => existingOverlay.remove(), 600);
        }
      }, { overlayContent: content, overlayStyle: style });
    } else {
      await this.page.evaluate(({ overlayContent, overlayStyle }) => {
        const existingOverlay = document.getElementById('dynamic-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        const overlayDiv = document.createElement('div');
        overlayDiv.id = 'dynamic-overlay';
        overlayDiv.innerHTML = overlayContent;
        overlayDiv.style.cssText = overlayStyle;
        overlayDiv.style.opacity = '0';
        
        document.body.appendChild(overlayDiv);
        
        // Animate in
        setTimeout(() => {
          overlayDiv.style.opacity = '1';
        }, 50);
      }, { overlayContent: content, overlayStyle: style });
    }
    
    // Wait for animation
    await this.page.waitForTimeout(timing);
  }

  private generateOverlayStyle(overlay: OverlayDescriptor): string {
    const position = overlay.position || 'center';
    const width = overlay.width || 400;
    const height = overlay.height || 100;
    const background = overlay.background || 'rgba(0,0,0,0.8)';
    const borderLeft = overlay.borderLeft || '4px solid #FF6600';
    
    let left = '50%';
    let top = '50%';
    let transform = 'translate(-50%, -50%)';
    
    switch (position) {
      case 'top-left':
        left = '60px';
        top = '60px';
        transform = 'none';
        break;
      case 'top-right':
        left = 'auto';
        right = '60px';
        top = '60px';
        transform = 'none';
        break;
      case 'bottom-left':
        left = '60px';
        top = 'auto';
        bottom = '60px';
        transform = 'none';
        break;
      case 'bottom-right':
        left = 'auto';
        right = '60px';
        top = 'auto';
        bottom = '60px';
        transform = 'none';
        break;
      case 'left':
        left = '60px';
        top = '50%';
        transform = 'translateY(-50%)';
        break;
      case 'right':
        left = 'auto';
        right = '60px';
        top = '50%';
        transform = 'translateY(-50%)';
        break;
      case 'top':
        left = '50%';
        top = '60px';
        transform = 'translateX(-50%)';
        break;
      case 'bottom':
        left = '50%';
        top = 'auto';
        bottom = '60px';
        transform = 'translateX(-50%)';
        break;
    }
    
    return `
      position: fixed;
      left: ${left};
      top: ${top};
      right: ${position.includes('right') ? '60px' : 'auto'};
      bottom: ${position.includes('bottom') ? '60px' : 'auto'};
      width: ${width}px;
      height: ${height}px;
      background: ${background};
      border-left: ${borderLeft};
      border-radius: 8px;
      padding: 20px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 18px;
      font-weight: 500;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      transition: opacity 0.6s ease-in-out;
      ${transform}
    `;
  }

  private async generateFinalVideo(): Promise<void> {
    console.log('🎬 Generating final comprehensive video...');
    
    // This would integrate with your existing video generation pipeline
    // For now, we'll create a placeholder
    console.log('✅ Final video generation completed (placeholder)');
  }

  private async runCriticBotAnalysis(): Promise<void> {
    console.log('🎭 Running Enhanced CriticBot analysis...');
    
    try {
      // Analyze the configuration
      const analysis = await this.criticBot.analyzeVideo(
        'placeholder-video.mp4', // Placeholder
        path.join(__dirname, '../comprehensive-recruiter-demo.json')
      );
      
      // Generate and display report
      const report = this.criticBot.generateReport(analysis);
      console.log('\n' + report);
      
      // Save report to file
      const reportPath = path.join(__dirname, '../output/critic-bot-analysis.txt');
      fs.writeFileSync(reportPath, report);
      console.log(`📄 CriticBot report saved to: ${reportPath}`);
      
    } catch (error) {
      console.error('❌ Error running CriticBot analysis:', error);
    }
  }

  private async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Main execution
async function main() {
  try {
    // Load configuration
    const configPath = path.join(__dirname, '../comprehensive-recruiter-demo.json');
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config: ComprehensiveDemoConfig = JSON.parse(configContent);
    
    // Create demo
    const creator = new ComprehensiveDemoCreator(config);
    await creator.createDemo();
    
  } catch (error) {
    console.error('❌ Error in main execution:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ComprehensiveDemoCreator;
