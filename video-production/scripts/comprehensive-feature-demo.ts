import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

interface ComprehensiveFeatureBeat {
  id: string;
  title: string;
  duration: number;
  description: string;
  narration: string;
  interactions: ComprehensiveInteraction[];
  visualTarget: string;
  expectedOutcome: string;
}

interface ComprehensiveInteraction {
  type: 'click' | 'wait' | 'screenshot' | 'waitForSelector' | 'scroll' | 'hover' | 'type' | 'check' | 'uncheck' | 'navigate' | 'drag' | 'drop' | 'select' | 'keyboard' | 'zoom' | 'pan';
  selector?: string;
  value?: string;
  duration?: number;
  description: string;
  coordinates?: [number, number];
  pauseBefore?: number;
  pauseAfter?: number;
}

class ComprehensiveFeatureDemo {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async start() {
    try {
      console.log('🚀 Starting comprehensive feature demo recording...');
      
      this.browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      this.context = await this.browser.newContext({
        recordVideo: {
          dir: this.outputDir,
          size: { width: 1920, height: 1080 }
        },
        viewport: { width: 1920, height: 1080 }
      });

      this.page = await this.context.newPage();
      
      console.log('✅ Browser and context initialized');
      
      await this.recordComprehensiveDemo();
      
    } catch (error) {
      console.error('❌ Error during recording:', error);
    } finally {
      await this.cleanup();
    }
  }

  private createComprehensiveConfig(): ComprehensiveFeatureBeat[] {
    return [
      {
        id: "intro-dashboard",
        title: "Introduction - Commander Dashboard Overview",
        duration: 20,
        description: "Show the main dashboard with all available view modes",
        narration: "Welcome to the Disaster Response Dashboard. I'm Ian Frelinger, Incident Commander. Here we have a comprehensive command center with multiple operational views. Let me show you the full range of capabilities available to emergency responders.",
        interactions: [
          { type: 'waitForSelector', selector: '#root', description: 'Wait for app to load' },
          { type: 'wait', duration: 3000, description: 'Show initial dashboard view' },
          { type: 'screenshot', description: 'Capture dashboard overview' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before navigation' },
          { type: 'scroll', description: 'Scroll to show all navigation buttons' },
          { type: 'wait', duration: 1000, description: 'Let content settle' },
          { type: 'screenshot', description: 'Capture full navigation menu' }
        ],
        visualTarget: "Commander Dashboard with all view modes visible",
        expectedOutcome: "Viewers see the comprehensive dashboard and understand available capabilities"
      },
      {
        id: "route-planning-demo",
        title: "Route Planning with A* Star Algorithm",
        duration: 35,
        description: "Demonstrate role-based routing with different profiles and A* Star algorithm",
        narration: "Now let me show you our intelligent route planning system. This uses the A* Star algorithm to calculate optimal evacuation routes for different response types. Each profile - civilian evacuation, EMS response, fire tactical, and police escort - has different safety constraints and priorities.",
        interactions: [
          { type: 'click', selector: 'button:has-text("🛣️ Routing")', description: 'Switch to routing view' },
          { type: 'wait', duration: 3000, description: 'Wait for routing interface to load' },
          { type: 'screenshot', description: 'Capture routing interface' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before profile selection' },
          { type: 'click', selector: 'button:has-text("Civilian")', description: 'Select civilian evacuation profile' },
          { type: 'wait', duration: 2000, description: 'Show civilian route details' },
          { type: 'screenshot', description: 'Capture civilian route profile' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before EMS profile' },
          { type: 'click', selector: 'button:has-text("EMS")', description: 'Select EMS response profile' },
          { type: 'wait', duration: 2000, description: 'Show EMS route details' },
          { type: 'screenshot', description: 'Capture EMS route profile' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before fire profile' },
          { type: 'click', selector: 'button:has-text("Fire Tactical")', description: 'Select fire tactical profile' },
          { type: 'wait', duration: 2000, description: 'Show fire route details' },
          { type: 'screenshot', description: 'Capture fire route profile' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before police profile' },
          { type: 'click', selector: 'button:has-text("Police")', description: 'Select police escort profile' },
          { type: 'wait', duration: 2000, description: 'Show police route details' },
          { type: 'screenshot', description: 'Capture police route profile' }
        ],
        visualTarget: "A* Star route planning with different profiles and constraints",
        expectedOutcome: "Viewers understand how different route profiles optimize for safety vs speed"
      },
      {
        id: "unit-management-demo",
        title: "Unit Management with Drag-and-Drop Assignment",
        duration: 40,
        description: "Show comprehensive unit management including drag-and-drop assignment and status tracking",
        narration: "Next, let me demonstrate our unit management system. This provides real-time tracking of all emergency units with drag-and-drop assignment to zones and routes. You can see unit status, capabilities, and current assignments at a glance.",
        interactions: [
          { type: 'click', selector: 'button:has-text("🚒 Units")', description: 'Switch to unit management view' },
          { type: 'wait', duration: 3000, description: 'Wait for unit interface to load' },
          { type: 'screenshot', description: 'Capture unit management interface' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before unit selection' },
          { type: 'click', selector: '.unit-card:first-child', description: 'Select first unit to show details' },
          { type: 'wait', duration: 2000, description: 'Show unit details panel' },
          { type: 'screenshot', description: 'Capture unit details' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before switching views' },
          { type: 'click', selector: 'button:has-text("Assignments")', description: 'Switch to assignments view' },
          { type: 'wait', duration: 2000, description: 'Show assignment interface' },
          { type: 'screenshot', description: 'Capture assignments view' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before status view' },
          { type: 'click', selector: 'button:has-text("Status")', description: 'Switch to status management' },
          { type: 'wait', duration: 2000, description: 'Show status controls' },
          { type: 'screenshot', description: 'Capture status management' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before capabilities view' },
          { type: 'click', selector: 'button:has-text("Capabilities")', description: 'Switch to capabilities overview' },
          { type: 'wait', duration: 2000, description: 'Show unit capabilities' },
          { type: 'screenshot', description: 'Capture capabilities view' }
        ],
        visualTarget: "Unit management with real-time status and drag-and-drop assignment",
        expectedOutcome: "Viewers see comprehensive unit tracking and management capabilities"
      },
      {
        id: "technical-architecture-demo",
        title: "Technical Architecture & Foundry Integration",
        duration: 30,
        description: "Show system architecture, data flow, and Foundry integration details",
        narration: "Let me show you the technical architecture behind this system. This includes our data flow, Foundry integration for data fusion and ontology, and performance metrics that demonstrate the platform's value.",
        interactions: [
          { type: 'click', selector: 'button:has-text("🏗️ Architecture")', description: 'Switch to technical architecture view' },
          { type: 'wait', duration: 3000, description: 'Wait for architecture interface to load' },
          { type: 'screenshot', description: 'Capture architecture overview' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before data flow view' },
          { type: 'click', selector: 'button:has-text("Data Flow")', description: 'Switch to data flow view' },
          { type: 'wait', duration: 2000, description: 'Show data flow diagram' },
          { type: 'screenshot', description: 'Capture data flow architecture' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before Foundry view' },
          { type: 'click', selector: 'button:has-text("Foundry")', description: 'Switch to Foundry integration view' },
          { type: 'wait', duration: 2000, description: 'Show Foundry features' },
          { type: 'screenshot', description: 'Capture Foundry integration' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before metrics view' },
          { type: 'click', selector: 'button:has-text("Metrics")', description: 'Switch to performance metrics' },
          { type: 'wait', duration: 2000, description: 'Show performance metrics' },
          { type: 'screenshot', description: 'Capture performance metrics' }
        ],
        visualTarget: "Technical architecture with data flow and Foundry integration",
        expectedOutcome: "Viewers understand the technical foundation and data integration capabilities"
      },
      {
        id: "ai-decision-support-demo",
        title: "AI Decision Support & AIP Commander",
        duration: 25,
        description: "Demonstrate AI-powered decision support with natural language queries",
        narration: "Now let me show you our AI decision support system. The AIP Commander provides natural language interface for complex emergency decisions, with explainable AI that shows confidence levels and reasoning.",
        interactions: [
          { type: 'click', selector: 'button:has-text("AIP Commander")', description: 'Switch to AI decision support' },
          { type: 'wait', duration: 3000, description: 'Wait for AI interface to load' },
          { type: 'screenshot', description: 'Capture AI interface' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before typing query' },
          { type: 'type', selector: 'input[type="text"]', value: 'What if we lose Highway 30?', description: 'Type AI query about Highway 30' },
          { type: 'wait', duration: 1000, description: 'Show typed query' },
          { type: 'click', selector: 'button:has-text("Ask Commander")', description: 'Submit query to AI' },
          { type: 'wait', duration: 3000, description: 'Wait for AI processing' },
          { type: 'screenshot', description: 'Capture AI response' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before recommendation' },
          { type: 'click', selector: '.recommendation-card', description: 'Click on AI recommendation' },
          { type: 'wait', duration: 2000, description: 'Show recommendation details' },
          { type: 'screenshot', description: 'Capture recommendation details' }
        ],
        visualTarget: "AI decision support with natural language queries and explainable responses",
        expectedOutcome: "Viewers see AI-powered decision support in action"
      },
      {
        id: "integrated-workflow-demo",
        title: "Integrated Workflow - End-to-End Operations",
        duration: 30,
        description: "Show how all components work together in a complete emergency response workflow",
        narration: "Finally, let me demonstrate how all these components work together. From initial hazard detection through route planning, unit assignment, and AI support - this is a complete emergency response platform that gives commanders unprecedented situational awareness and decision support.",
        interactions: [
          { type: 'click', selector: 'button:has-text("Operations")', description: 'Return to operations view' },
          { type: 'wait', duration: 2000, description: 'Show operations dashboard' },
          { type: 'screenshot', description: 'Capture operations overview' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before showing integration' },
          { type: 'scroll', description: 'Scroll through operations data' },
          { type: 'wait', duration: 2000, description: 'Show comprehensive operations view' },
          { type: 'screenshot', description: 'Capture integrated operations' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before final overview' },
          { type: 'click', selector: 'button:has-text("Conditions")', description: 'Show weather conditions' },
          { type: 'wait', duration: 2000, description: 'Show weather integration' },
          { type: 'screenshot', description: 'Capture weather integration' },
          { type: 'pauseBefore', duration: 1000, description: 'Pause before conclusion' },
          { type: 'click', selector: 'button:has-text("Assets")', description: 'Show asset management' },
          { type: 'wait', duration: 2000, description: 'Show asset overview' },
          { type: 'screenshot', description: 'Capture asset management' }
        ],
        visualTarget: "Integrated workflow showing all components working together",
        expectedOutcome: "Viewers see the complete platform integration and operational value"
      }
    ];
  }

  async recordComprehensiveDemo() {
    if (!this.page) throw new Error('Page not initialized');

    console.log('🎬 Starting comprehensive feature demo recording...');
    
    // Navigate to the application
    await this.page.goto('http://localhost:5173');
    await this.page.waitForSelector('#root', { timeout: 30000 });
    
    console.log('✅ Application loaded successfully');

    const beats = this.createComprehensiveConfig();
    
    for (const beat of beats) {
      console.log(`\n🎯 Recording Beat: ${beat.title}`);
      console.log(`📝 Description: ${beat.description}`);
      console.log(`🎤 Narration: ${beat.narration}`);
      
      await this.executeBeat(beat);
      
      console.log(`✅ Beat completed: ${beat.title}`);
    }

    console.log('\n🎉 Comprehensive feature demo recording completed!');
  }

  async executeBeat(beat: ComprehensiveFeatureBeat) {
    if (!this.page) throw new Error('Page not initialized');

    for (const interaction of beat.interactions) {
      try {
        console.log(`  🔄 Executing: ${interaction.description}`);
        
        if (interaction.pauseBefore) {
          await this.page.waitForTimeout(interaction.pauseBefore);
        }

        await this.executeInteraction(interaction, beat);

        if (interaction.pauseAfter) {
          await this.page.waitForTimeout(interaction.pauseAfter);
        }

        console.log(`    ✅ Completed: ${interaction.description}`);
        
      } catch (error) {
        console.error(`    ❌ Failed: ${interaction.description}`, error);
        // Continue with next interaction
      }
    }
  }

  async executeInteraction(interaction: ComprehensiveInteraction, beat: ComprehensiveFeatureBeat) {
    if (!this.page) throw new Error('Page not initialized');

    switch (interaction.type) {
      case 'click':
        if (interaction.coordinates) {
          await this.page.click('body', { position: { x: interaction.coordinates[0], y: interaction.coordinates[1] } });
        } else if (interaction.selector) {
          await this.page.click(interaction.selector);
        }
        break;

      case 'wait':
        await this.page.waitForTimeout(interaction.duration || 1000);
        break;

      case 'screenshot':
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `comprehensive-demo-${beat.id}-${timestamp}.png`;
        await this.page.screenshot({ 
          path: path.join(this.outputDir, filename),
          fullPage: true 
        });
        console.log(`    📸 Screenshot saved: ${filename}`);
        break;

      case 'waitForSelector':
        if (interaction.selector) {
          await this.page.waitForSelector(interaction.selector, { timeout: 10000 });
        }
        break;

      case 'scroll':
        await this.page.evaluate(() => {
          window.scrollBy(0, 300);
        });
        break;

      case 'hover':
        if (interaction.selector) {
          await this.page.hover(interaction.selector);
        }
        break;

      case 'type':
        if (interaction.selector && interaction.value) {
          await this.page.fill(interaction.selector, interaction.value);
        }
        break;

      case 'check':
        if (interaction.selector) {
          await this.page.check(interaction.selector);
        }
        break;

      case 'uncheck':
        if (interaction.selector) {
          await this.page.uncheck(interaction.selector);
        }
        break;

      case 'navigate':
        // Navigation is handled by click interactions
        break;

      case 'drag':
        // Drag and drop would be implemented here
        break;

      case 'drop':
        // Drop would be implemented here
        break;

      case 'select':
        if (interaction.selector && interaction.value) {
          await this.page.selectOption(interaction.selector, interaction.value);
        }
        break;

      case 'keyboard':
        if (interaction.value) {
          await this.page.keyboard.press(interaction.value);
        }
        break;

      case 'zoom':
        // Zoom would be implemented here
        break;

      case 'pan':
        // Pan would be implemented here
        break;

      default:
        console.warn(`    ⚠️ Unknown interaction type: ${interaction.type}`);
    }
  }

  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      
      console.log('🧹 Cleanup completed');
      
      // Convert video to MP4
      await this.saveRecordedVideo();
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  async saveRecordedVideo() {
    try {
      console.log('🎥 Converting recorded video to MP4...');
      
      // Find the recorded video file
      const files = fs.readdirSync(this.outputDir);
      const webmFile = files.find(file => file.endsWith('.webm'));
      
      if (webmFile) {
        const webmPath = path.join(this.outputDir, webmFile);
        const mp4Path = path.join(this.outputDir, 'comprehensive-feature-demo.mp4');
        
        // Use ffmpeg to convert WebM to MP4
        const { exec } = require('child_process');
        exec(`ffmpeg -i "${webmPath}" -c:v libx264 -c:a aac "${mp4Path}"`, (error: any, stdout: any, stderr: any) => {
          if (error) {
            console.error('❌ FFmpeg conversion failed:', error);
            return;
          }
          console.log('✅ Video converted successfully to MP4');
          console.log(`📁 Output file: ${mp4Path}`);
          
          // Clean up WebM file
          fs.unlinkSync(webmPath);
          console.log('🗑️ WebM file cleaned up');
        });
      } else {
        console.log('⚠️ No WebM video file found for conversion');
      }
      
    } catch (error) {
      console.error('❌ Error saving recorded video:', error);
    }
  }
}

// Run the comprehensive feature demo
const demo = new ComprehensiveFeatureDemo();
demo.start().catch(console.error);
