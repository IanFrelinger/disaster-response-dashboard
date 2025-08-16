import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SimplifiedInteraction {
  type: 'click' | 'wait' | 'screenshot' | 'waitForMapMarkers' | 'scroll';
  selector?: string;
  duration?: number;
  description: string;
  coordinates?: [number, number];
}

interface SimplifiedBeat {
  id: string;
  title: string;
  duration: number;
  description: string;
  narration: string;
  interactions: SimplifiedInteraction[];
  visualTarget: string;
  expectedOutcome: string;
}

interface SimplifiedConfig {
  app: {
    url: string;
    viewport: { width: number; height: number };
    waitForSelector: string;
    timeout: number;
  };
  beats: SimplifiedBeat[];
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

class SimplifiedNarrativeRecorder {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: SimplifiedConfig;
  private outputDir: string = 'captures';
  private audioDir: string = 'audio';
  private results: BeatResult[] = [];

  constructor() {
    this.config = this.createSimplifiedConfig();
    this.ensureOutputDirs();
  }

  private createSimplifiedConfig(): SimplifiedConfig {
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
          duration: 35,
          description: "Demonstrate hazard detection, clicking on markers, and layer toggling",
          narration: "A satellite feed has detected a new fire. Let me show you how the system automatically flags hazards and allows me to investigate. I'll click on the hazard marker to see details, then toggle different layers to understand the full situation.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for hazard investigation' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load with hazards' },
            { type: 'waitForMapMarkers', description: 'Wait for map markers to appear' },
            { type: 'click', selector: '.mapboxgl-canvas', coordinates: [960, 540], description: 'Click on hazard marker to select it' },
            { type: 'wait', duration: 2000, description: 'Wait for hazard details to appear' },
            { type: 'click', selector: '.mapboxgl-canvas', coordinates: [960, 540], description: 'Hover over hazard to show tooltip' },
            { type: 'wait', duration: 1000, description: 'Show hazard tooltip' },
            { type: 'screenshot', description: 'Capture hazard selection and details' },
            { type: 'wait', duration: 2000, description: 'Show map with hazards' },
            { type: 'screenshot', description: 'Capture layered map view' }
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
            { type: 'screenshot', description: 'Capture risk assessment and decision making' }
          ],
          visualTarget: "Risk assessment interface and evacuation decision",
          expectedOutcome: "Viewers see the data-driven decision process and understand the urgency"
        },
        {
          id: "zone-definition-drilldown",
          title: "Zone Definition & Drill-Down - Zone Definition",
          duration: 30,
          description: "Demonstrate zone selection, map navigation, and boundary tools",
          narration: "I need to define the evacuation zone. Let me select the zone on the dashboard, then use the map tools to adjust boundaries and examine affected buildings. This shows how the system connects strategic planning with tactical execution.",
          interactions: [
            { type: 'wait', duration: 1000, description: 'Show zone selection on dashboard' },
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for zone definition' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load with zone overlay' },
            { type: 'click', selector: '.mapboxgl-canvas', coordinates: [800, 400], description: 'Pan map to focus on affected area' },
            { type: 'wait', duration: 1000, description: 'Show panned view' },
            { type: 'click', selector: '.mapboxgl-canvas', coordinates: [1000, 600], description: 'Zoom in to see building details' },
            { type: 'wait', duration: 2000, description: 'Show map with zoomed view' },
            { type: 'screenshot', description: 'Capture zone definition and building details' }
          ],
          visualTarget: "Zone definition workflow with map navigation",
          expectedOutcome: "Viewers see how zones are defined and how the system connects planning with execution"
        },
        {
          id: "building-evacuation-tracking",
          title: "Building Evacuation Tracking - Building Status",
          duration: 25,
          description: "Show building status updates and evacuation progress tracking",
          narration: "Now I need to track evacuation progress. Let me update building statuses and see how the system tracks evacuation compliance. This gives me real-time visibility into the operation.",
          interactions: [
            { type: 'wait', duration: 2000, description: 'Show current building status overview' },
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Return to dashboard for building overview' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll to show building status panel' },
            { type: 'wait', duration: 2000, description: 'Show building status data' },
            { type: 'screenshot', description: 'Capture building evacuation status overview' }
          ],
          visualTarget: "Building evacuation status tracking and updates",
          expectedOutcome: "Viewers see how building status is managed and how evacuation progress is tracked"
        },
        {
          id: "route-planning-profiles",
          title: "Route Planning with Role-Based Profiles - Plan Routes",
          duration: 30,
          description: "Demonstrate different route profiles and optimization",
          narration: "Now I need to plan evacuation routes. The system has different profiles for different response types - civilian evacuation prioritizes safety, EMS balances speed and safety, fire tactical takes direct approach, and police ensures security. Let me show you how this works.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for route planning' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load with routes' },
            { type: 'wait', duration: 2000, description: 'Show route visualization' },
            { type: 'screenshot', description: 'Capture route planning with different profiles' }
          ],
          visualTarget: "Role-based route planning and optimization",
          expectedOutcome: "Viewers see how different route profiles work and how routes are optimized"
        },
        {
          id: "unit-assignment-tracking",
          title: "Unit Assignment & Status Tracking - Unit Management",
          duration: 25,
          description: "Show unit selection, assignment, and status updates",
          narration: "I need to assign emergency units to specific areas. Let me select units on the map, reassign them, and show how their status changes. This demonstrates how the system tracks resource deployment.",
          interactions: [
            { type: 'wait', duration: 1000, description: 'Show current unit positions' },
            { type: 'click', selector: '.mapboxgl-canvas', coordinates: [850, 450], description: 'Click on fire engine unit' },
            { type: 'wait', duration: 1000, description: 'Show unit details' },
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
          duration: 30,
          description: "Demonstrate AI assistant queries and recommendation acceptance",
          narration: "Now let me show you the AI decision support. I'll ask the AIP Commander what happens if we lose Highway 30. The system will analyze traffic patterns, population density, and alternative routes, then recommend actions. This shows how Foundry's ontology enables intelligent decision support.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Commander Dashboard")', description: 'Switch to dashboard for AI interaction' },
            { type: 'wait', duration: 2000, description: 'Wait for dashboard to load' },
            { type: 'scroll', description: 'Scroll to show AIP Commander tab' },
            { type: 'wait', duration: 2000, description: 'Show AI interface area' },
            { type: 'screenshot', description: 'Capture AI decision support interface' }
          ],
          visualTarget: "AI assistant interface and recommendation workflow",
          expectedOutcome: "Viewers see how AI supports decision-making and how recommendations are implemented"
        },
        {
          id: "foundry-integration-value",
          title: "Foundry Integration & Value Proposition - Technical Architecture",
          duration: 25,
          description: "Show Foundry data pipelines and operational impact",
          narration: "This system demonstrates the power of Palantir Foundry. Real-time data flows through ingestion, hazard processing, route optimization, and AI analysis. The AIP assistant is context-aware because it sits on top of Foundry's ontology. Let me show you the operational impact.",
          interactions: [
            { type: 'click', selector: 'button:has-text("Live Map")', description: 'Switch to map for Foundry integration' },
            { type: 'wait', duration: 3000, description: 'Wait for map to load' },
            { type: 'wait', duration: 2000, description: 'Show real-time data flow' },
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
        format: "mp4",
        codec: "libx264",
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
    try {
      console.log('🚀 Initializing Playwright browser for simplified narrative demo...');
      this.browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
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
      console.error('❌ Browser initialization failed:', error);
      return false;
    }
  }

  async navigateToApp(): Promise<boolean> {
    try {
      console.log(`🌐 Navigating to: ${this.config.app.url}`);
      await this.page!.goto(this.config.app.url);
      
      console.log(`⏳ Waiting for selector: ${this.config.app.waitForSelector}`);
      await this.page!.waitForSelector(this.config.app.waitForSelector);
      
      console.log('✅ App loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      return false;
    }
  }

  async executeInteraction(interaction: SimplifiedInteraction): Promise<boolean> {
    try {
      this.page!.setDefaultTimeout(30000);
      
      switch (interaction.type) {
        case 'wait':
          if (interaction.duration) {
            await this.page!.waitForTimeout(interaction.duration);
          }
          break;
          
        case 'click':
          if (interaction.coordinates) {
            // Use JavaScript approach for map interactions
            console.log(`   🔧 Using JavaScript to interact with map`);
            await this.page!.evaluate((coords) => {
              // Try to find and click on any map marker
              const markers = document.querySelectorAll('.mapboxgl-marker');
              if (markers.length > 0) {
                console.log(`Found ${markers.length} map markers, clicking first one`);
                const firstMarker = markers[0] as HTMLElement;
                firstMarker.click();
                return 'clicked-marker';
              }
              
              // Fallback: click on canvas at coordinates
              const canvas = document.querySelector('.mapboxgl-canvas');
              if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const clickEvent = new MouseEvent('click', {
                  clientX: rect.left + coords[0],
                  clientY: rect.top + coords[1],
                  bubbles: true,
                  cancelable: true,
                  view: window
                });
                canvas.dispatchEvent(clickEvent);
                return 'dispatched-event';
              }
              
              return 'no-interaction-possible';
            }, interaction.coordinates);
            
            await this.page!.waitForTimeout(2000);
          } else if (interaction.selector) {
            await this.page!.click(interaction.selector);
          }
          break;
          
        case 'waitForMapMarkers':
          console.log(`   🔧 Waiting for map markers to appear...`);
          try {
            await this.page!.waitForSelector('.mapboxgl-canvas', { timeout: 10000 });
            console.log(`   ✅ Map canvas found`);
            
            await this.page!.waitForFunction(() => {
              const markers = document.querySelectorAll('.mapboxgl-marker');
              console.log(`Found ${markers.length} map markers`);
              return markers.length > 0;
            }, { timeout: 15000 });
            console.log(`   ✅ Map markers found`);
            
            await this.page!.waitForTimeout(2000);
          } catch (e) {
            console.log(`   ⚠️ Timeout waiting for map markers: ${e}`);
          }
          break;
          
        case 'scroll':
          await this.page!.evaluate(() => {
            window.scrollBy(0, 400);
          });
          break;
          
        case 'screenshot':
          const timestamp = Date.now();
          await this.page!.screenshot({ 
            path: path.join(this.outputDir, `simplified-${timestamp}.png`),
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

  async generateTTSAudio(beat: SimplifiedBeat): Promise<string | null> {
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

  async recordBeat(beat: SimplifiedBeat): Promise<BeatResult> {
    console.log(`\n🎬 Recording simplified beat: ${beat.title} (${beat.duration}s)`);
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
      
      const actualDuration = Date.now() - startTime;
      result.success = true;
      result.actualDuration = actualDuration;
      
      console.log(`✅ Simplified beat completed successfully (${(actualDuration / 1000).toFixed(1)}s)`);
      return result;
      
    } catch (error) {
      result.error = `Beat recording failed: ${error}`;
      result.notes = `Error: ${error}`;
      return result;
    }
  }

  async generateReport(): Promise<void> {
    const totalBeats = this.results.length;
    const successfulBeats = this.results.filter(r => r.success).length;
    const successRate = (successfulBeats / totalBeats) * 100;
    
    const totalDuration = this.results.reduce((sum, r) => sum + (r.actualDuration || 0), 0);
    const expectedDuration = this.results.reduce((sum, r) => sum + (r.duration * 1000), 0);
    
    console.log('\n📊 Simplified Narrative Demo Report');
    console.log('=' .repeat(50));
    console.log(`Total beats: ${totalBeats}`);
    console.log(`Successful: ${successfulBeats}`);
    console.log(`Failed: ${totalBeats - successfulBeats}`);
    console.log(`Success rate: ${successRate.toFixed(1)}%`);
    console.log(`Actual duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log(`Expected duration: ${(expectedDuration / 1000).toFixed(1)}s`);
    
    const report = {
      totalBeats,
      successful: successfulBeats,
      failed: totalBeats - successfulBeats,
      successRate,
      actualDuration: totalDuration / 1000,
      expectedDuration: expectedDuration / 1000,
      beats: this.results
    };
    
    const reportPath = path.join(this.outputDir, 'simplified-narrative-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Report saved to: ${reportPath}`);
    
    console.log('\n🎬 Narrative Flow Summary:');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = result.actualDuration ? `${(result.actualDuration / 1000).toFixed(1)}s` : 'N/A';
      console.log(`  ${index + 1}. ${result.title} - ${duration} ${status}`);
    });
  }

  async saveRecordedVideo(): Promise<void> {
    try {
      console.log('🎬 Saving recorded video...');
      
      // The video is automatically saved by Playwright
      // We just need to wait for it to complete
      await this.page!.waitForTimeout(2000);
      
      console.log('✅ Simplified narrative video saved');
      
    } catch (error) {
      console.error('❌ Failed to save video:', error);
    }
  }

  async runSimplifiedNarrative(): Promise<void> {
    console.log('🎬 Starting Enhanced Simplified Narrative Demo Recording');
    console.log('=' .repeat(70));
    console.log(`📊 Total beats: ${this.config.beats.length}`);
    console.log(`🎯 Total duration: ${this.config.beats.reduce((sum, beat) => sum + beat.duration, 0)}s`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`🎤 Audio directory: ${this.audioDir}`);
    console.log(`🔊 TTS Provider: ${this.config.tts.provider} (${this.config.tts.voice})`);
    console.log('');
    console.log('🎭 This enhanced demo will show:');
    console.log('  • Dual-context system (Dashboard + Live Map)');
    console.log('  • Hazard detection & triage workflow');
    console.log('  • Risk scoring & decision making');
    console.log('  • Zone definition & drill-down');
    console.log('  • Building evacuation tracking');
    console.log('  • Route planning with role-based profiles');
    console.log('  • Unit assignment & status tracking');
    console.log('  • AI decision support interface');
    console.log('  • Foundry integration & value metrics');
    console.log('  • Conclusion with call to action');
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
      console.error('❌ Simplified narrative demo failed:', error);
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
  const recorder = new SimplifiedNarrativeRecorder();
  await recorder.runSimplifiedNarrative();
}

// Run if called directly
main().catch(console.error);

export { SimplifiedNarrativeRecorder };
