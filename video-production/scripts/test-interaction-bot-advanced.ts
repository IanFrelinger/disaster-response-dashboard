import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the InteractionBot class
interface HumanizedAction {
  action: string;
  selector?: string;
  coordinates?: [number, number];
  path?: [number, number][];
  duration?: number;
  milliseconds?: number;
  comment?: string;
}

class InteractionBot {
  /**
   * Transforms robotic browser automation scripts into human-like recording instructions
   */
  humanizeActions(originalActions: string[]): HumanizedAction[] {
    const humanizedActions: HumanizedAction[] = [];
    let lastKnownPosition: [number, number] | null = null;
    
    for (let i = 0; i < originalActions.length; i++) {
      const action = originalActions[i];
      const nextAction = originalActions[i + 1];
      
      // Parse the original action
      const parsedAction = this.parseAction(action);
      if (!parsedAction) continue;
      
      // Add pre-action hover for clickable elements
      if (parsedAction.action === 'click' && parsedAction.selector) {
        humanizedActions.push({
          action: 'hover',
          selector: parsedAction.selector,
          duration: 500,
          comment: 'Pre-click hover for emphasis'
        });
        humanizedActions.push({
          action: 'wait',
          milliseconds: this.randomizeTiming(300, 50)
        });
      }
      
      // Add the main action
      humanizedActions.push(parsedAction);
      
      // Add post-action wait
      const waitDuration = this.getPostActionWait(parsedAction.action);
      if (waitDuration > 0) {
        humanizedActions.push({
          action: 'wait',
          milliseconds: this.randomizeTiming(waitDuration, 50)
        });
      }
      
      // Update last known position if this action has coordinates
      if (parsedAction.coordinates) {
        lastKnownPosition = parsedAction.coordinates;
      }
      
      // Add mouse movement if next action involves coordinates
      if (nextAction && this.actionHasCoordinates(nextAction)) {
        const nextCoords = this.extractCoordinates(nextAction);
        if (nextCoords && lastKnownPosition) {
          const path = this.generateHumanizedPath(lastKnownPosition, nextCoords);
          humanizedActions.push({
            action: 'mouseMove',
            path: path,
            duration: this.calculateMoveDuration(path),
            comment: 'Smooth human-like movement to next target'
          });
        }
      }
    }
    
    return humanizedActions;
  }
  
  private parseAction(actionString: string): HumanizedAction | null {
    if (actionString.startsWith('click(')) {
      const selector = actionString.match(/click\(([^)]+)\)/)?.[1];
      if (selector) {
        return { action: 'click', selector };
      }
    } else if (actionString.startsWith('mouseClick(')) {
      const coordsMatch = actionString.match(/mouseClick\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number) as [number, number];
        return { action: 'click', coordinates: coords };
      }
    } else if (actionString.startsWith('mouseMove(')) {
      const coordsMatch = actionString.match(/mouseMove\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number) as [number, number];
        return { action: 'mouseMove', coordinates: coords };
      }
    } else if (actionString.startsWith('wait(')) {
      const ms = parseInt(actionString.match(/wait\(([^)]+)\)/)?.[1] || '1000');
      return { action: 'wait', milliseconds: ms };
    } else if (actionString.startsWith('wheel(')) {
      const delta = parseInt(actionString.match(/wheel\(([^)]+)\)/)?.[1] || '0');
      return { action: 'wheel', milliseconds: delta };
    } else if (actionString.startsWith('mouseDrag(')) {
      const coordsMatch = actionString.match(/mouseDrag\(([^)]+)\)/)?.[1];
      if (coordsMatch) {
        const coords = coordsMatch.split(',').map(Number);
        if (coords.length >= 4) {
          return { 
            action: 'mouseDrag', 
            coordinates: [coords[0], coords[1]] as [number, number],
            path: [[coords[2], coords[3]] as [number, number]]
          };
        }
      }
    } else if (actionString.startsWith('goto(')) {
      return { action: 'goto', comment: 'Navigate to app' };
    } else if (actionString.startsWith('waitForSelector(')) {
      const selector = actionString.match(/waitForSelector\(([^)]+)\)/)?.[1];
      return { action: 'waitForSelector', selector, comment: 'Wait for element' };
    } else if (actionString.startsWith('overlay(')) {
      return { action: 'overlay', comment: actionString };
    } else if (actionString.startsWith('screenshot(')) {
      return { action: 'screenshot', comment: actionString };
    }
    
    return null;
  }
  
  private actionHasCoordinates(action: string): boolean {
    return action.includes('mouseClick(') || action.includes('mouseMove(') || action.includes('mouseDrag(');
  }
  
  private extractCoordinates(action: string): [number, number] | null {
    const coordsMatch = action.match(/\(([^)]+)\)/)?.[1];
    if (coordsMatch) {
      const coords = coordsMatch.split(',').map(Number);
      if (coords.length >= 2) {
        return [coords[0], coords[1]];
      }
    }
    return null;
  }
  
  private generateHumanizedPath(from: [number, number], to: [number, number]): [number, number][] {
    const [x1, y1] = from;
    const [x2, y2] = to;
    
    // Calculate distance
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // For short distances, use direct path with slight curve
    if (distance < 100) {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 20;
      return [[x1, y1], [midX, midY], [x2, y2]];
    }
    
    // For longer distances, add intermediate points with natural curves
    const numPoints = Math.max(3, Math.floor(distance / 150));
    const path: [number, number][] = [[x1, y1]];
    
    for (let i = 1; i < numPoints - 1; i++) {
      const t = i / (numPoints - 1);
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      
      // Add slight randomness to make it more human-like
      const randomOffset = (Math.random() - 0.5) * 30;
      path.push([x + randomOffset, y + randomOffset]);
    }
    
    path.push([x2, y2]);
    return path;
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
    const baseDuration = Math.min(1000, Math.max(300, totalDistance * 2));
    return this.randomizeTiming(baseDuration, 100);
  }
  
  private getPostActionWait(actionType: string): number {
    switch (actionType) {
      case 'click':
        return 500; // Wait after clicks
      case 'wheel':
        return 400; // Wait after scrolling
      case 'mouseMove':
        return 200; // Brief pause after movement
      case 'mouseDrag':
        return 600; // Longer pause after drag operations
      default:
        return 0;
    }
  }
  
  private randomizeTiming(baseTime: number, variance: number): number {
    const randomOffset = (Math.random() - 0.5) * 2 * variance;
    return Math.max(100, baseTime + randomOffset);
  }
}

// Advanced test with complex mouse movements
async function testAdvancedInteractionBot() {
  console.log('🤖 Testing Advanced InteractionBot Features...\n');
  
  const interactionBot = new InteractionBot();
  
  // Complex action sequence that will demonstrate mouse path generation
  const complexActions = [
    "click(text=Commander Dashboard)",
    "wait(500)",
    "mouseMove(300,420)",
    "wait(300)",
    "mouseClick(740,580)",
    "wait(800)",
    "wheel(-120)",
    "wait(300)",
    "mouseDrag(960,540,960,500)",
    "wait(500)",
    "mouseMove(1200,800)",
    "overlay(status:Risk: High · Pop. at risk ~N,in,0)",
    "wait(1200)",
    "overlay(status,out,300)"
  ];
  
  console.log('📝 Complex Action Sequence:');
  complexActions.forEach((action, index) => {
    console.log(`  ${index + 1}. ${action}`);
  });
  
  console.log('\n🤖 Humanized Actions with Mouse Paths:');
  const humanizedActions = interactionBot.humanizeActions(complexActions);
  
  humanizedActions.forEach((action, index) => {
    const details = [
      action.action,
      action.selector ? `selector: ${action.selector}` : '',
      action.coordinates ? `coords: [${action.coordinates.join(', ')}]` : '',
      action.path ? `path: ${action.path.length} points (${action.path.map(p => `[${p.join(',')}]`).join(' → ')})` : '',
      action.duration ? `duration: ${action.duration}ms` : '',
      action.milliseconds ? `wait: ${action.milliseconds.toFixed(0)}ms` : '',
      action.comment ? `(${action.comment})` : ''
    ].filter(Boolean).join(' | ');
    
    console.log(`  ${index + 1}. ${details}`);
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Original actions: ${complexActions.length}`);
  console.log(`   Humanized actions: ${humanizedActions.length}`);
  console.log(`   Enhancement ratio: ${(humanizedActions.length / complexActions.length).toFixed(2)}x`);
  
  // Analyze mouse movement patterns
  const mouseMoves = humanizedActions.filter(a => a.action === 'mouseMove' && a.path);
  console.log(`   Mouse movements with paths: ${mouseMoves.length}`);
  
  if (mouseMoves.length > 0) {
    console.log('\n🖱️ Mouse Movement Analysis:');
    mouseMoves.forEach((move, index) => {
      if (move.path && move.duration) {
        const totalDistance = calculatePathDistance(move.path);
        console.log(`   Move ${index + 1}: ${move.path.length} points, ${totalDistance.toFixed(0)}px, ${move.duration}ms`);
      }
    });
  }
  
  // Save the detailed results
  const outputPath = path.join(__dirname, '..', 'output', 'advanced-humanized-actions.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const output = {
    originalActions: complexActions,
    humanizedActions: humanizedActions,
    timestamp: new Date().toISOString(),
    summary: {
      originalCount: complexActions.length,
      humanizedCount: humanizedActions.length,
      enhancementRatio: humanizedActions.length / complexActions.length,
      mouseMovesWithPaths: mouseMoves.length
    },
    mouseMovementAnalysis: mouseMoves.map(move => ({
      action: move.action,
      path: move.path,
      duration: move.duration,
      distance: move.path ? calculatePathDistance(move.path) : 0
    }))
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Advanced analysis saved to: ${outputPath}`);
}

// Helper function to calculate total path distance
function calculatePathDistance(path: [number, number][]): number {
  if (path.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    const [x1, y1] = path[i - 1];
    const [x2, y2] = path[i];
    totalDistance += Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  return totalDistance;
}

// Run the advanced test
testAdvancedInteractionBot().catch(console.error);
