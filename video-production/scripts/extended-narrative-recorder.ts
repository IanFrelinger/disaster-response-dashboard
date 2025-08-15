#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface NarrativeBeat {
  id: string;
  title: string;
  duration: number;
  description: string;
  narration: string;
  interactions: NarrativeInteraction[];
  visualTarget: string;
  expectedOutcome: string;
}

interface NarrativeInteraction {
  type: 'click' | 'hover' | 'type' | 'wait' | 'screenshot' | 'waitForSelector' | 'scroll' | 'drag' | 'select' | 'keyboard' | 'toggle' | 'pan' | 'zoom';
  selector?: string;
  value?: string;
  duration?: number;
  description: string;
  coordinates?: [number, number];
  action?: string;
}

interface NarrativeConfig {
  app: {
    url: string;
    viewport: { width: number; height: number };
    waitForSelector: string;
    timeout: number;
  };
  beats: NarrativeBeat[];
  recording: {
    format: string;
    codec: string;
    quality: string;
    fps: number;
  };
  tts: {
    provider: string;
    voice: string;
    rate: number;
    pitch: number;
  };
}

interface BeatResult {
  id: string;
  title: string;
  duration: number;
  success: boolean;
  error?: string;
  actualDuration?: number;
  notes?: string;
}

class ExtendedNarrativeRecorder {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: NarrativeConfig;
  private outputDir: string = 'captures';
  private audioDir: string = 'audio';
  private results: BeatResult[] = [];

  constructor() {
    this.config = this.createNarrativeConfig();
    this.ensureOutputDirs();
  }

  private createNarrativeConfig(): NarrativeConfig {
    return {
      app: {
        url: process.env.HOST_FRONTEND_URL || "http://localhost:3000",
        viewport: { width: 1920, height: 1080 },
        waitForSelector: "#root",
        timeout: 30000
      },
      beats: [
        {
          id: "intro-context",
          title: "Introduction - Dual Context Setup",
          duration: 25,
          description: "Establish both Commander Dashboard and Live Map contexts to show the dual-view system",
          narration: "Welcome to the Disaster Response Command Center. As an Incident Commander, I need to see both the high-level operational overview and the tactical map view. Let me show you how this system brings everything together.",
          interactions: [
            { type: 'waitForSelector', selector: '#root', description: 'Wait for app to load' },
            { type: 'wait', duration: 3000, description: 'Show initial Commander Dashboard view' },
            { type: 'screenshot', description: 'Capture Commander Dashboard overview' },
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to Live Map view' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load and render' },
            { type: 'screenshot', description: 'Capture Live Map view' },
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard' },
            { type: 'wait', duration: 2000, description: 'Show dashboard context' }
          ],
          visualTarget: "Dual-context system: Dashboard overview and tactical map",
          expectedOutcome: "Viewers see both contexts and understand the system's dual-view capability"
        },
        {
          id: "hazard-detection-triage",
          title: "Hazard Detection & Triage - Detect & Verify",
          duration: 30,
          description: "Demonstrate hazard detection, clicking on markers, and layer toggling",
          narration: "A satellite feed has detected a new fire. Let me show you how the system automatically flags hazards and allows me to investigate. I'll click on the hazard marker to see details, then toggle different layers to understand the full situation.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for hazard investigation' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load with hazards' },
            { type: 'click', selector: '.mapboxgl-canvas', coordinates: [960, 540], description: 'Click on hazard marker to select it' },
            { type: 'wait', duration: 2000, description: 'Wait for hazard details to appear' },
            { type: 'hover', selector: '.mapboxgl-canvas', coordinates: [960, 540], description: 'Hover over hazard to show tooltip' },
            { type: 'wait', duration: 1000, description: 'Show hazard tooltip' },
            { type: 'screenshot', description: 'Capture hazard selection and details' },
            { type: 'toggle', action: 'hazards', description: 'Toggle hazards layer off to show base map' },
            { type: 'wait', duration: 1000, description: 'Show map without hazards' },
            { type: 'toggle', action: 'weather', description: 'Enable weather layer' },
            { type: 'wait', duration: 1000, description: 'Show weather overlay' },
            { type: 'toggle', action: 'evac-zones', description: 'Enable evacuation zones layer' },
            { type: 'wait', duration: 1000, description: 'Show evacuation zones' },
            { type: 'screenshot', description: 'Capture layered map view with weather and zones' }
          ],
          visualTarget: "Hazard detection workflow with layer toggling",
          expectedOutcome: "Viewers see how hazards are detected, investigated, and contextualized with weather and zone data"
        },
        {
          id: "risk-scoring-decision",
          title: "Risk Scoring & Decision Making - Triage & Risk",
          duration: 25,
          description: "Show risk assessment and evacuation decision based on data analysis",
          narration: "Now I need to assess the risk. The system has calculated that 3,241 residents are at risk with only 2 hours before the fire reaches critical infrastructure. Let me review the risk assessment and make the evacuation decision.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Switch to dashboard for risk assessment' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll to show risk assessment panel' },
            { type: 'wait', duration: 1000, description: 'Show risk assessment data' },
            { type: 'click', selector: '.zone-card', description: 'Click on affected zone to see details' },
            { type: 'wait', duration: 1000, description: 'Show zone risk details' },
            { type: 'screenshot', description: 'Capture risk assessment and decision making' }
          ],
          visualTarget: "Risk assessment interface and evacuation decision",
          expectedOutcome: "Viewers see the data-driven decision process and understand the urgency"
        },
        {
          id: "zone-definition-drilldown",
          title: "Zone Definition & Drill-Down - Zone Definition",
          duration: 35,
          description: "Demonstrate zone selection, map navigation, and boundary tools",
          narration: "I need to define the evacuation zone. Let me select the zone on the dashboard, then use the map tools to adjust boundaries and examine affected buildings. This shows how the system connects strategic planning with tactical execution.",
          interactions: [
            { type: 'wait', duration: 1000, description: 'Show zone selection on dashboard' },
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for zone definition' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load with zone overlay' },
            { type: 'pan', description: 'Pan map to focus on affected area' },
            { type: 'wait', duration: 1000, description: 'Show panned view' },
            { type: 'zoom', action: 'in', description: 'Zoom in to see building details' },
            { type: 'wait', duration: 1000, description: 'Show zoomed view' },
            { type: 'click', selector: '.zone-progress-bar', description: 'Click on zone progress to open details' },
            { type: 'wait', duration: 2000, description: 'Wait for zone details modal' },
            { type: 'screenshot', description: 'Capture zone definition and building details' }
          ],
          visualTarget: "Zone definition workflow with map navigation",
          expectedOutcome: "Viewers see how zones are defined and how the system connects planning with execution"
        },
        {
          id: "building-evacuation-tracking",
          title: "Building Evacuation Tracking - Building Status",
          duration: 30,
          description: "Show building status updates and evacuation progress tracking",
          narration: "Now I need to track evacuation progress. Let me update building statuses and see how the system tracks evacuation compliance. This gives me real-time visibility into the operation.",
          interactions: [
            { type: 'click', selector: '.building-card', description: 'Click on building to open details' },
            { type: 'wait', duration: 1000, description: 'Wait for building modal' },
            { type: 'click', selector: 'button:has-text("✓ Evacuated")', description: 'Mark building as evacuated' },
            { type: 'wait', duration: 1000, description: 'Show status update' },
            { type: 'click', selector: 'button:has-text("×")', description: 'Close building modal' },
            { type: 'wait', duration: 1000, description: 'Return to building list' },
            { type: 'click', selector: '.building-card', description: 'Select another building' },
            { type: 'wait', duration: 1000, description: 'Show second building details' },
            { type: 'click', selector: 'button:has-text("⏳ Not Evacuated")', description: 'Mark building as not evacuated' },
            { type: 'wait', duration: 1000, description: 'Show second status update' },
            { type: 'screenshot', description: 'Capture building status tracking workflow' }
          ],
          visualTarget: "Building evacuation status tracking and updates",
          expectedOutcome: "Viewers see how building status is managed and evacuation progress is tracked"
        },
        {
          id: "route-planning-profiles",
          title: "Route Planning with Role-Based Profiles - Plan Routes",
          duration: 35,
          description: "Demonstrate different route profiles and optimization",
          narration: "Now I need to plan evacuation routes. The system has different profiles for different response types - civilian evacuation prioritizes safety, EMS balances speed and safety, fire tactical takes direct approach, and police ensures security. Let me show you how this works.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for route planning' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load with routes' },
            { type: 'click', selector: 'button:has-text("CIVILIAN_EVACUATION")', description: 'Select civilian evacuation profile' },
            { type: 'wait', duration: 1000, description: 'Show civilian routes' },
            { type: 'click', selector: '.route-card', description: 'Click on civilian route to see details' },
            { type: 'wait', duration: 1000, description: 'Show route details' },
            { type: 'click', selector: 'button:has-text("View on Map")', description: 'View route on map' },
            { type: 'wait', duration: 1000, description: 'Show route visualization' },
            { type: 'click', selector: 'button:has-text("EMS_RESPONSE")', description: 'Switch to EMS profile' },
            { type: 'wait', duration: 1000, description: 'Show EMS routes' },
            { type: 'click', selector: 'button:has-text("🔧 Optimize Route")', description: 'Optimize selected route' },
            { type: 'wait', duration: 2000, description: 'Show route optimization' },
            { type: 'screenshot', description: 'Capture route planning with different profiles' }
          ],
          visualTarget: "Role-based route planning and optimization",
          expectedOutcome: "Viewers see how different route profiles work and how routes are optimized"
        },
        {
          id: "unit-assignment-tracking",
          title: "Unit Assignment & Status Tracking - Unit Management",
          duration: 30,
          description: "Show unit selection, assignment, and status updates",
          narration: "I need to assign emergency units to specific areas. Let me select units on the map, reassign them, and show how their status changes. This demonstrates how the system tracks resource deployment.",
          interactions: [
            { type: 'wait', duration: 1000, description: 'Show current unit positions' },
            { type: 'click', selector: '.mapboxgl-canvas', coordinates: [850, 450], description: 'Click on fire engine unit' },
            { type: 'wait', duration: 1000, description: 'Show unit details' },
            { type: 'drag', description: 'Drag unit to new location' },
            { type: 'wait', duration: 1000, description: 'Show unit reassignment' },
            { type: 'click', selector: '.mapboxgl-canvas', coordinates: [900, 500], description: 'Click on ambulance unit' },
            { type: 'wait', duration: 1000, description: 'Show ambulance details' },
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard to see updates' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll to show unit assignment panel' },
            { type: 'screenshot', description: 'Capture unit assignment and status tracking' }
          ],
          visualTarget: "Unit assignment workflow and status tracking",
          expectedOutcome: "Viewers see how units are managed and how assignments affect the overall operation"
        },
        {
          id: "ai-decision-support",
          title: "AI Decision Support & Replanning - AI Assistant",
          duration: 40,
          description: "Demonstrate AI assistant queries and recommendation acceptance",
          narration: "Now let me show you the AI decision support. I'll ask the AIP Commander what happens if we lose Highway 30. The system will analyze traffic patterns, population density, and alternative routes, then recommend actions. This shows how Foundry's ontology enables intelligent decision support.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Switch to dashboard for AI interaction' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll to show AIP Commander tab' },
            { type: 'click', selector: 'button:has-text("AIP")', description: 'Switch to AIP Commander view' },
            { type: 'wait', duration: 2000, description: 'Wait for AIP interface to load' },
            { type: 'type', selector: 'input[type="text"]', value: 'What if we lose Highway 30?', description: 'Type AI query about Highway 30' },
            { type: 'wait', duration: 1000, description: 'Show typed query' },
            { type: 'click', selector: 'button:has-text("Ask Commander")', description: 'Submit query to AI' },
            { type: 'wait', duration: 3000, description: 'Wait for AI processing' },
            { type: 'click', selector: '.recommendation-card', description: 'Click on AI recommendation' },
            { type: 'wait', duration: 1000, description: 'Show recommendation details' },
            { type: 'click', selector: 'button:has-text("Accept")', description: 'Accept AI recommendation' },
            { type: 'wait', duration: 2000, description: 'Show recommendation acceptance' },
            { type: 'screenshot', description: 'Capture AI decision support workflow' }
          ],
          visualTarget: "AI assistant interface and recommendation workflow",
          expectedOutcome: "Viewers see how AI supports decision-making and how recommendations are implemented"
        },
        {
          id: "search-filters-efficiency",
          title: "Search & Filter Efficiency - Operational Efficiency",
          duration: 25,
          description: "Demonstrate search capabilities and filtering for quick access",
          narration: "In an emergency, I need to find information quickly. Let me show you how the search and filter system works. I can quickly locate specific buildings, zones, or hazards to make informed decisions faster.",
          interactions: [
            { type: 'wait', duration: 1000, description: 'Show current view' },
            { type: 'click', selector: '.search-input', description: 'Click on search input field' },
            { type: 'type', selector: '.search-input', value: 'Zone A', description: 'Type search query for Zone A' },
            { type: 'wait', duration: 1000, description: 'Show search results' },
            { type: 'click', selector: '.filter-dropdown', description: 'Click on filter dropdown' },
            { type: 'wait', duration: 1000, description: 'Show filter options' },
            { type: 'click', selector: 'option:has-text("High Priority")', description: 'Select high priority filter' },
            { type: 'wait', duration: 1000, description: 'Show filtered results' },
            { type: 'click', selector: '.search-result', description: 'Click on search result' },
            { type: 'screenshot', description: 'Capture search and filter workflow' }
          ],
          visualTarget: "Search and filter interface for quick information access",
          expectedOutcome: "Viewers see how the system enables quick information retrieval"
        },
        {
          id: "modal-form-interactions",
          title: "Modal & Form Interactions - System Usability",
          duration: 20,
          description: "Show modal interactions and form updates",
          narration: "Let me demonstrate how the system handles detailed information through modals and forms. I'll open a building detail modal, update some information, and show the keyboard shortcuts for efficient operation.",
          interactions: [
            { type: 'wait', duration: 1000, description: 'Show current view' },
            { type: 'click', selector: '.building-card', description: 'Click on building to open modal' },
            { type: 'wait', duration: 2000, description: 'Wait for modal to open' },
            { type: 'click', selector: '.form-field', description: 'Click on form field to edit' },
            { type: 'type', selector: '.form-field', value: 'Updated notes', description: 'Type updated information' },
            { type: 'wait', duration: 1000, description: 'Show form update' },
            { type: 'keyboard', value: 'Escape', description: 'Press Escape to close modal' },
            { type: 'wait', duration: 1000, description: 'Show modal closing' },
            { type: 'screenshot', description: 'Capture modal and form interactions' }
          ],
          visualTarget: "Modal interactions and form updates with keyboard shortcuts",
          expectedOutcome: "Viewers see how the system handles detailed information and supports efficient operation"
        },
        {
          id: "foundry-integration-value",
          title: "Foundry Integration & Value Proposition - Technical Architecture",
          duration: 30,
          description: "Show Foundry data pipelines and operational impact",
          narration: "This system demonstrates the power of Palantir Foundry. Real-time data flows through ingestion, hazard processing, route optimization, and AI analysis. The AIP assistant is context-aware because it sits on top of Foundry's ontology. Let me show you the operational impact.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for Foundry integration' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load' },
            { type: 'hover', selector: '.mapboxgl-canvas', description: 'Show data pipeline indicators' },
            { type: 'wait', duration: 1000, description: 'Show real-time data flow' },
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard for metrics' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll to show impact metrics' },
            { type: 'wait', duration: 2000, description: 'Show ROI and impact data' },
            { type: 'screenshot', description: 'Capture Foundry integration and value metrics' }
          ],
          visualTarget: "Foundry data pipelines and operational impact metrics",
          expectedOutcome: "Viewers understand how Foundry enables the system and see measurable value"
        },
        {
          id: "conclusion-call-action",
          title: "Conclusion & Call to Action - Final Summary",
          duration: 25,
          description: "Final summary with call to action",
          narration: "This platform demonstrates how real-time data, AI assistance, and streamlined coordination can modernize emergency response. We've seen 65-90% faster decision-making, reduced staffing needs, and a common operating picture for every responder. I'd love to talk about piloting this system with your teams to show how it can improve response times and save lives.",
          interactions: [
            { type: 'wait', duration: 1000, description: 'Show final dashboard view' },
            { type: 'scroll', description: 'Scroll to show conclusion area' },
            { type: 'wait', duration: 2000, description: 'Show call to action' },
            { type: 'screenshot', description: 'Capture conclusion and call to action' }
          ],
          visualTarget: "Conclusion with call to action and impact summary",
          expectedOutcome: "Viewers are inspired to learn more and understand the system's value proposition"
        }
      ],
      recording: {
        format: "webm",
        codec: "vp9",
        quality: "high",
        fps: 30
      },
      tts: {
        provider: "say",
        voice: "Alex",
        rate: 175,
        pitch: 100
      }
    };
  }

  private ensureOutputDirs(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async initialize(): Promise<boolean> {
    console.log('🚀 Initializing Playwright browser for extended narrative demo...');
    
    try {
      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: this.config.app.viewport,
        recordVideo: {
          dir: this.outputDir,
          size: this.config.app.viewport
        }
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(this.config.app.timeout);
      
      console.log('✅ Browser initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      return false;
    }
  }

  async navigateToApp(): Promise<boolean> {
    if (!this.page) {
      console.error('❌ Page not initialized');
      return false;
    }
    
    console.log(`🌐 Navigating to: ${this.config.app.url}`);
    
    try {
      await this.page.goto(this.config.app.url, { waitUntil: 'networkidle' });
      
      if (this.config.app.waitForSelector) {
        console.log(`⏳ Waiting for selector: ${this.config.app.waitForSelector}`);
        await this.page.waitForSelector(this.config.app.waitForSelector);
      }
      
      await this.page.waitForTimeout(2000);
      
      console.log('✅ App loaded successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to navigate to app:', error);
      return false;
    }
  }

  private async executeInteraction(interaction: NarrativeInteraction): Promise<boolean> {
    if (!this.page) {
      console.error('❌ Page not initialized during interaction execution');
      return false;
    }

    try {
      console.log(`  🔧 ${interaction.description}`);
      
      switch (interaction.type) {
        case 'waitForSelector':
          if (interaction.selector) {
            await this.page.waitForSelector(interaction.selector);
          }
          break;
          
        case 'click':
          if (interaction.selector) {
            await this.page.click(interaction.selector);
          } else if (interaction.coordinates) {
            await this.page.click('.mapboxgl-canvas', { position: { x: interaction.coordinates[0], y: interaction.coordinates[1] } });
          }
          break;
          
        case 'hover':
          if (interaction.selector) {
            await this.page.hover(interaction.selector);
          } else if (interaction.coordinates) {
            await this.page.hover('.mapboxgl-canvas', { position: { x: interaction.coordinates[0], y: interaction.coordinates[1] } });
          }
          break;
          
        case 'type':
          if (interaction.selector && interaction.value) {
            await this.page.type(interaction.selector, interaction.value);
          }
          break;
          
        case 'drag':
          // Simulate dragging on map
          await this.page.mouse.down();
          await this.page.mouse.move(100, 100);
          await this.page.mouse.move(200, 200);
          await this.page.mouse.move(300, 300);
          await this.page.mouse.up();
          break;
          
        case 'pan':
          // Simulate map panning
          await this.page.mouse.down();
          await this.page.mouse.move(800, 400);
          await this.page.mouse.up();
          break;
          
        case 'zoom':
          if (interaction.action === 'in') {
            await this.page.mouse.wheel(0, -100);
          } else {
            await this.page.mouse.wheel(0, 100);
          }
          break;
          
        case 'toggle':
          // Simulate layer toggling
          if (interaction.action === 'hazards') {
            await this.page.click('button:has-text("Hazards")');
          } else if (interaction.action === 'weather') {
            await this.page.click('button:has-text("Weather")');
          } else if (interaction.action === 'evac-zones') {
            await this.page.click('button:has-text("Evac Zones")');
          }
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
          
        case 'scroll':
          await this.page.evaluate(() => {
            window.scrollBy(0, 400);
          });
          break;
          
        case 'wait':
          if (interaction.duration) {
            await this.page.waitForTimeout(interaction.duration);
          }
          break;
          
        case 'screenshot':
          const timestamp = Date.now();
          await this.page.screenshot({ 
            path: path.join(this.outputDir, `narrative-${timestamp}.png`),
            fullPage: true 
          });
          break;
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Interaction failed: ${interaction.description}`, error);
      return false;
    }
  }

  async generateTTSAudio(beat: NarrativeBeat): Promise<string | null> {
    const audioPath = path.join(this.audioDir, `${beat.id}.wav`);
    const aiffPath = path.join(this.audioDir, `${beat.id}.aiff`);
    
    try {
      console.log(`  🎤 Generating TTS for: ${beat.title}`);
      
      const tempTextFile = path.join(this.audioDir, `${beat.id}.txt`);
      fs.writeFileSync(tempTextFile, beat.narration);
      
      const command = `say -v ${this.config.tts.voice} -r ${this.config.tts.rate} -f "${tempTextFile}" -o "${aiffPath}"`;
      
      await execAsync(command);
      
      if (fs.existsSync(tempTextFile)) {
        fs.unlinkSync(tempTextFile);
      }
      
      if (fs.existsSync(aiffPath)) {
        console.log(`  ✅ TTS generated: ${aiffPath}`);
        
        try {
          const convertCommand = `ffmpeg -i "${aiffPath}" -acodec pcm_s16le -ar 44100 "${audioPath}" -y`;
          await execAsync(convertCommand);
          
          if (fs.existsSync(aiffPath)) {
            fs.unlinkSync(aiffPath);
          }
          
          if (fs.existsSync(audioPath)) {
            console.log(`  ✅ Converted to WAV: ${audioPath}`);
            return audioPath;
          }
        } catch (convertError) {
          console.log(`  ⚠️  Could not convert to WAV, keeping AIFF: ${aiffPath}`);
          return aiffPath;
        }
        
        return aiffPath;
      } else {
        console.error(`  ❌ TTS file not created: ${aiffPath}`);
        return null;
      }
      
    } catch (error) {
      console.error(`  ❌ TTS generation failed: ${error}`);
      return null;
    }
  }

  async recordBeat(beat: NarrativeBeat): Promise<BeatResult> {
    console.log(`\n🎬 Recording narrative beat: ${beat.title} (${beat.duration}s)`);
    console.log(`📝 Description: ${beat.description}`);
    console.log(`🎤 Narration: ${beat.narration.substring(0, 100)}...`);
    console.log(`🎯 Visual Target: ${beat.visualTarget}`);
    console.log(`✅ Expected Outcome: ${beat.expectedOutcome}`);
    
    const result: BeatResult = {
      id: beat.id,
      title: beat.title,
      duration: beat.duration,
      success: false
    };

    try {
      const startTime = Date.now();
      
      const audioPath = await this.generateTTSAudio(beat);
      if (audioPath) {
        result.notes = `Audio generated: ${audioPath}`;
      }
      
      for (const interaction of beat.interactions) {
        const success = await this.executeInteraction(interaction);
        if (!success) {
          result.error = `Interaction failed: ${interaction.description}`;
          result.notes = `Failed at interaction: ${interaction.description}`;
          return result;
        }
      }
      
      const elapsed = Date.now() - startTime;
      const remainingWait = Math.max(0, (beat.duration * 1000) - elapsed);
      
      if (remainingWait > 0) {
        console.log(`  ⏳ Waiting ${remainingWait}ms to complete beat duration`);
        await this.page!.waitForTimeout(remainingWait);
      }
      
      result.success = true;
      result.actualDuration = (Date.now() - startTime) / 1000;
      result.notes = `Visual target: ${beat.visualTarget}. Expected outcome: ${beat.expectedOutcome}`;
      
      console.log(`✅ Narrative beat completed successfully (${result.actualDuration.toFixed(1)}s)`);
      
    } catch (error) {
      result.error = `Narrative beat recording failed: ${error}`;
      console.error(`❌ Narrative beat failed: ${error}`);
    }
    
    return result;
  }

  async saveRecordedVideo(): Promise<void> {
    console.log('🎬 Saving recorded video...');
    
    try {
      const files = fs.readdirSync(this.outputDir);
      const videoFiles = files.filter(file => file.endsWith('.webm'));
      
      if (videoFiles.length === 0) {
        console.log('⚠️ No video files found in output directory');
        return;
      }
      
      const videoFile = videoFiles[0];
      const sourcePath = path.join(this.outputDir, videoFile);
      const targetPath = path.join(this.outputDir, 'disaster-response-extended-narrative.mp4');
      
      try {
        const convertCommand = `ffmpeg -i "${sourcePath}" -c:v libx264 -preset fast -crf 23 "${targetPath}" -y`;
        await execAsync(convertCommand);
        
        fs.unlinkSync(sourcePath);
        
        console.log(`✅ Extended narrative video saved as: ${targetPath}`);
        
        const stats = fs.statSync(targetPath);
        const fileSize = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`📊 File size: ${fileSize} MB`);
        
      } catch (convertError) {
        console.log(`⚠️ Could not convert to MP4, keeping original: ${videoFile}`);
        const newPath = path.join(this.outputDir, 'disaster-response-extended-narrative.webm');
        fs.renameSync(sourcePath, newPath);
        console.log(`✅ Extended narrative video saved as: ${newPath}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to save extended narrative video:', error);
    }
  }

  async generateReport(): Promise<void> {
    const reportPath = path.join(this.outputDir, 'extended-narrative-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results,
      summary: {
        totalBeats: this.results.length,
        successfulBeats: this.results.filter(r => r.success).length,
        failedBeats: this.results.filter(r => !r.success).length,
        totalDuration: this.results.reduce((sum, r) => sum + (r.actualDuration || 0), 0),
        expectedDuration: this.config.beats.reduce((sum, beat) => sum + beat.duration, 0),
        audioFiles: this.results.filter(r => r.notes?.includes('Audio generated')).length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Extended Narrative Demo Report');
    console.log('=' .repeat(50));
    console.log(`Total beats: ${report.summary.totalBeats}`);
    console.log(`Successful: ${report.summary.successfulBeats}`);
    console.log(`Failed: ${report.summary.failedBeats}`);
    console.log(`Success rate: ${((report.summary.successfulBeats / report.summary.totalBeats) * 100).toFixed(1)}%`);
    console.log(`Actual duration: ${report.summary.totalDuration.toFixed(1)}s`);
    console.log(`Expected duration: ${report.summary.expectedDuration}s`);
    console.log(`Audio files generated: ${report.summary.audioFiles}`);
    console.log(`Report saved to: ${reportPath}`);
    
    if (report.summary.failedBeats > 0) {
      console.log('\n❌ Failed beats:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.title}: ${result.error}`);
      });
    }
    
    console.log('\n🎬 Narrative Flow Summary:');
    this.results.forEach((result, index) => {
      if (result.success) {
        console.log(`  ${index + 1}. ${result.title} - ${result.actualDuration?.toFixed(1)}s`);
      }
    });
    
    console.log('\n🎬 Next Steps:');
    console.log('1. Review the recorded extended narrative video in the captures directory');
    console.log('2. Check the generated audio files in the audio directory');
    console.log('3. Use video editing software to combine video and audio');
    console.log('4. Add professional graphics, transitions, and polish');
    console.log('5. The video now shows the complete golden path with real interactions!');
  }

  async runExtendedNarrative(): Promise<void> {
    console.log('🎬 Starting Extended Narrative Demo Recording');
    console.log('=' .repeat(70));
    console.log(`📊 Total beats: ${this.config.beats.length}`);
    console.log(`🎯 Total duration: ${this.config.beats.reduce((sum, beat) => sum + beat.duration, 0)}s`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`🎤 Audio directory: ${this.audioDir}`);
    console.log(`🔊 TTS Provider: ${this.config.tts.provider} (${this.config.tts.voice})`);
    console.log('');
    console.log('🎭 This demo will show:');
    console.log('  • Real UI interactions driving the narrative');
    console.log('  • Complete golden path from detection to conclusion');
    console.log('  • Foundry integration and AI decision support');
    console.log('  • Professional emergency response workflow');
    console.log('');

    try {
      if (!(await this.initialize())) {
        throw new Error('Failed to initialize browser');
      }

      if (!(await this.navigateToApp())) {
        throw new Error('Failed to navigate to app');
      }

      for (const beat of this.config.beats) {
        const result = await this.recordBeat(beat);
        this.results.push(result);
        
        if (!result.success) {
          console.log(`⚠️ Beat failed, but continuing with next beat...`);
        }
      }

      await this.generateReport();
      await this.saveRecordedVideo();

    } catch (error) {
      console.error('❌ Extended narrative demo failed:', error);
    } finally {
      if (this.page) {
        console.log('🎬 Finalizing video recording...');
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Main execution
async function main() {
  const recorder = new ExtendedNarrativeRecorder();
  await recorder.runExtendedNarrative();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ExtendedNarrativeRecorder };
