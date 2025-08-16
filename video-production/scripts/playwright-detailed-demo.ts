import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DemoAction {
  timestamp: number;
  action: string;
  selector?: string;
  description: string;
  waitTime?: number;
}

class DetailedDemoVideoCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createDetailedDemoVideo() {
    console.log('🎬 Creating Detailed 5:40 Demo Video with Exact Interactions...');
    
    try {
      await this.initializeBrowser();
      await this.executeTimeline();
      await this.generateFinalVideo();
      
      console.log('✅ Detailed demo video creation completed!');
      console.log('🎬 5:40 demonstration with precise interactions ready');
      
    } catch (error) {
      console.error('❌ Error during video creation:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser with precise settings...');
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: this.outputDir,
        size: { width: 1920, height: 1080 }
      }
    });

    // Set zoom for readability (110-125%)
    await this.page.evaluate(() => {
      document.body.style.zoom = '1.1';
    });
    
    console.log('✅ Browser initialized with 1920x1080 viewport and 110% zoom');
  }

  private async executeTimeline() {
    const timeline: DemoAction[] = [
      // 0:00-0:30 — Introduction & Problem (title card)
      { timestamp: 0, action: 'intro', description: 'Show intro title card' },
      { timestamp: 2000, action: 'fade_in_title', description: 'Animate title fade-in' },
      { timestamp: 4000, action: 'fade_in_subtitle', description: 'Animate subtitle slide-up' },
      { timestamp: 8000, action: 'crossfade_to_browser', description: 'Crossfade to browser window' },

      // 0:30-1:00 — Users & Roles (Commander Dashboard)
      { timestamp: 30000, action: 'navigate_to_dashboard', selector: 'button:has-text("Commander Dashboard")', description: 'Click Commander Dashboard button' },
      { timestamp: 31000, action: 'wait_for_load', waitTime: 2000, description: 'Wait for dashboard to load' },
      { timestamp: 33000, action: 'hover_roles_area', description: 'Move cursor over roles area' },
      { timestamp: 35000, action: 'show_lower_third', description: 'Show user roles lower third' },
      { timestamp: 38000, action: 'hover_zone_a', description: 'Hover Zone A card' },

      // 1:00-1:40 — Data Flow & API Overview (diagram slide)
      { timestamp: 60000, action: 'show_tech_architecture', description: 'Cut to technical architecture slide' },
      { timestamp: 62000, action: 'highlight_data_ingestion', description: 'Zoom-pan to data ingestion' },
      { timestamp: 69000, action: 'highlight_processing', description: 'Pan to processing section' },
      { timestamp: 77000, action: 'highlight_delivery', description: 'Pan to delivery section' },
      { timestamp: 83000, action: 'crossfade_to_api_diagram', description: 'Crossfade to API data-flow diagram' },
      { timestamp: 85000, action: 'highlight_api_endpoints', description: 'Overlay API endpoint callouts' },

      // 1:40-2:20 — Hazard Detection & Triage (Live Map)
      { timestamp: 100000, action: 'navigate_to_live_map', selector: 'button:has-text("Live Map")', description: 'Click Live Map button' },
      { timestamp: 101000, action: 'wait_for_map', waitTime: 2000, description: 'Wait for map to load' },
      { timestamp: 103000, action: 'zoom_in_map', description: 'Zoom in (mouse wheel ×2)' },
      { timestamp: 105000, action: 'pan_to_hazards', description: 'Pan toward hazard cluster' },
      { timestamp: 108000, action: 'toggle_hazards_layer', description: 'Toggle Hazards checkbox off/on' },
      { timestamp: 111000, action: 'click_hazard_marker', description: 'Click red hazard marker' },
      { timestamp: 113000, action: 'hover_hazard_tooltip', description: 'Hover hazard tooltip' },
      { timestamp: 115000, action: 'toggle_weather_layer', description: 'Toggle Weather layer' },

      // 2:20-3:00 — Zones & Building Status (Commander Dashboard)
      { timestamp: 140000, action: 'navigate_to_dashboard_again', selector: 'button:has-text("Commander Dashboard")', description: 'Click Commander Dashboard again' },
      { timestamp: 141000, action: 'scroll_zone_list', description: 'Scroll down zone list slowly' },
      { timestamp: 144000, action: 'click_zone_a_card', description: 'Click Zone A card' },
      { timestamp: 146000, action: 'hover_progress_bar', description: 'Hover progress bar' },
      { timestamp: 148000, action: 'scroll_building_list', description: 'Scroll building list' },
      { timestamp: 152000, action: 'hover_special_needs', description: 'Move cursor to Special needs badge' },

      // 3:00-3:40 — Routing concept (A Star) — conceptual overlay
      { timestamp: 180000, action: 'navigate_to_live_map_again', selector: 'button:has-text("Live Map")', description: 'Click Live Map again' },
      { timestamp: 181000, action: 'show_route_overlay', description: 'Crossfade route overlay image' },
      { timestamp: 183000, action: 'animate_route_draw', description: 'Animate route draw (left→right wipe)' },
      { timestamp: 185000, action: 'show_route_profiles', description: 'Show route profiles callout' },
      { timestamp: 192000, action: 'highlight_hazard_buffers', description: 'Highlight hazard buffers' },
      { timestamp: 198000, action: 'fade_out_profiles', description: 'Fade out profiles callout' },

      // 3:40-4:10 — AI Decision Support (concept)
      { timestamp: 220000, action: 'show_aip_commander', description: 'Cut to AIP Commander screen' },
      { timestamp: 221000, action: 'type_question', description: 'Type question in input bar' },
      { timestamp: 224000, action: 'show_recommendation', description: 'Fade-in recommendation card' },
      { timestamp: 228000, action: 'pulse_recommendation', description: 'Pulse recommendation card border' },

      // 4:10-4:50 — Tech Deep Dive (hazard processing + API)
      { timestamp: 250000, action: 'return_to_api_diagram', description: 'Cut back to API data-flow diagram' },
      { timestamp: 251000, action: 'zoom_hazard_processing', description: 'Zoom-in to Hazard Processing' },
      { timestamp: 252000, action: 'show_processing_callouts', description: 'Overlay processing micro-callouts' },
      { timestamp: 260000, action: 'pan_to_routing', description: 'Pan to Routing section' },
      { timestamp: 266000, action: 'highlight_api_endpoints_detailed', description: 'Sequentially highlight API endpoints' },
      { timestamp: 282000, action: 'flash_websocket', description: 'Flash WebSocket stream label' },

      // 4:50-5:20 — Impact & Value (slide)
      { timestamp: 290000, action: 'show_impact_slide', description: 'Cut to Impact slide' },
      { timestamp: 291000, action: 'animate_time_savings', description: 'Animate Time Savings +40% bar' },
      { timestamp: 293000, action: 'animate_coordination', description: 'Animate Coordination +60% bar' },
      { timestamp: 295000, action: 'animate_checkmarks', description: 'Animate checkmarks' },

      // 5:20-5:40 — Conclusion & CTA
      { timestamp: 320000, action: 'fade_to_conclusion', description: 'Fade to conclusion artwork' },
      { timestamp: 322000, action: 'show_contact_info', description: 'Show contact information lower-third' },
      { timestamp: 332000, action: 'fade_out_contact', description: 'Fade out contact info' },
      { timestamp: 340000, action: 'fade_to_black', description: 'Fade to black' }
    ];

    console.log(`📹 Executing ${timeline.length} precise actions over 5:40...`);
    
    // Start with intro
    await this.executeIntro();
    
    // Execute timeline actions
    for (const action of timeline) {
      if (action.timestamp > 0) { // Skip intro actions as they're handled separately
        await this.waitForTimestamp(action.timestamp);
        await this.executeAction(action);
      }
    }
  }

  private async executeIntro() {
    console.log('🎬 Creating intro sequence...');
    
    // Create intro overlay
    await this.page!.evaluate(() => {
      const introDiv = document.createElement('div');
      introDiv.innerHTML = `
        <div id="intro-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); 
                    z-index: 1000; display: flex; align-items: center; justify-content: center; 
                    color: white; font-family: Arial, sans-serif;">
          <div style="text-align: center; max-width: 800px; padding: 40px;">
            <h1 id="main-title" style="font-size: 48px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); opacity: 0;">
              Disaster Response Platform
            </h1>
            <h2 id="subtitle" style="font-size: 24px; margin-bottom: 30px; color: #ffd700; opacity: 0;">
              Palantir Building Challenge – Ian Frelinger
            </h2>
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px; opacity: 0;">
              Emergencies move fast—tools shouldn't slow us down
            </p>
          </div>
        </div>
      `;
      document.body.appendChild(introDiv);
    });

    // Animate title fade-in at 2s
    await this.page!.waitForTimeout(2000);
    await this.page!.evaluate(() => {
      const title = document.getElementById('main-title');
      if (title) title.style.transition = 'opacity 1s ease-in';
      if (title) title.style.opacity = '1';
    });

    // Animate subtitle at 4s
    await this.page!.waitForTimeout(2000);
    await this.page!.evaluate(() => {
      const subtitle = document.getElementById('subtitle');
      if (subtitle) subtitle.style.transition = 'opacity 1s ease-in';
      if (subtitle) subtitle.style.opacity = '1';
    });

    // Hold for 2s, then crossfade to browser
    await this.page!.waitForTimeout(2000);
    await this.page!.evaluate(() => {
      const intro = document.getElementById('intro-overlay');
      if (intro) {
        intro.style.transition = 'opacity 2s ease-out';
        intro.style.opacity = '0';
      }
    });

    await this.page!.waitForTimeout(2000);
  }

  private async waitForTimestamp(targetTimestamp: number) {
    const startTime = Date.now();
    const elapsed = startTime - this.startTime;
    const waitTime = targetTimestamp - elapsed;
    
    if (waitTime > 0) {
      await this.page!.waitForTimeout(waitTime);
    }
  }

  private async executeAction(action: DemoAction) {
    console.log(`🎬 ${action.timestamp}ms: ${action.description}`);
    
    try {
      switch (action.action) {
        case 'navigate_to_dashboard':
          await this.page!.click(action.selector!);
          await this.page!.waitForLoadState('networkidle');
          break;
          
        case 'navigate_to_live_map':
          await this.page!.click(action.selector!);
          await this.page!.waitForLoadState('networkidle');
          break;
          
        case 'wait_for_load':
          await this.page!.waitForTimeout(action.waitTime || 2000);
          break;
          
        case 'hover_roles_area':
          await this.page!.hover('.dashboard-container');
          break;
          
        case 'show_lower_third':
          await this.page!.evaluate(() => {
            const lowerThird = document.createElement('div');
            lowerThird.innerHTML = `
              <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                          background: rgba(0,0,0,0.8); color: white; padding: 15px; 
                          border-radius: 8px; z-index: 1000; border-left: 4px solid #ffd700;">
                Incident Commander · Planner · Dispatcher
              </div>
            `;
            document.body.appendChild(lowerThird);
          });
          break;
          
        case 'hover_zone_a':
          await this.page!.hover('[data-zone-card="Zone A"]');
          await this.page!.waitForTimeout(500);
          break;
          
        case 'show_tech_architecture':
          await this.showTechnicalArchitecture();
          break;
          
        case 'zoom_in_map':
          await this.page!.evaluate(() => {
            const canvas = document.querySelector('.mapboxgl-canvas') as HTMLElement;
            if (canvas) {
              // Simulate mouse wheel zoom
              const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
              canvas.dispatchEvent(wheelEvent);
            }
          });
          await this.page!.waitForTimeout(300);
          break;
          
        case 'pan_to_hazards':
          await this.page!.evaluate(() => {
            const canvas = document.querySelector('.mapboxgl-canvas') as HTMLElement;
            if (canvas) {
              // Simulate click-drag pan
              const rect = canvas.getBoundingClientRect();
              const startX = rect.width / 2;
              const startY = rect.height / 2;
              const endX = startX - 200;
              const endY = startY - 100;
              
              canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: startX, clientY: startY }));
              canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: endX, clientY: endY }));
              canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: endX, clientY: endY }));
            }
          });
          break;
          
        case 'toggle_hazards_layer':
          // Toggle hazards layer checkbox if it exists
          await this.page!.evaluate(() => {
            const hazardsCheckbox = document.querySelector('input[type="checkbox"][value="hazards"]') as HTMLInputElement;
            if (hazardsCheckbox) {
              hazardsCheckbox.checked = false;
              hazardsCheckbox.dispatchEvent(new Event('change'));
              setTimeout(() => {
                hazardsCheckbox.checked = true;
                hazardsCheckbox.dispatchEvent(new Event('change'));
              }, 300);
            }
          });
          break;
          
        case 'click_hazard_marker':
          await this.page!.click('.mapboxgl-marker');
          break;
          
        case 'hover_hazard_tooltip':
          await this.page!.hover('.mapboxgl-popup');
          await this.page!.waitForTimeout(800);
          break;
          
        case 'scroll_zone_list':
          await this.page!.evaluate(() => {
            const zoneList = document.querySelector('.zone-list') || document.querySelector('.dashboard-container');
            if (zoneList) {
              zoneList.scrollTop += 100;
            }
          });
          break;
          
        case 'click_zone_a_card':
          await this.page!.click('[data-zone-card="Zone A"]');
          break;
          
        case 'hover_progress_bar':
          await this.page!.hover('.progress-bar');
          await this.page!.waitForTimeout(500);
          break;
          
        case 'show_route_overlay':
          await this.showRouteOverlay();
          break;
          
        case 'show_aip_commander':
          await this.showAIPCommander();
          break;
          
        case 'type_question':
          await this.page!.evaluate(() => {
            const input = document.querySelector('input[placeholder*="question"]') as HTMLInputElement;
            if (input) {
              input.value = "What happens if we lose Highway 30?";
              input.dispatchEvent(new Event('input'));
            }
          });
          break;
          
        case 'show_recommendation':
          await this.page!.evaluate(() => {
            const recDiv = document.createElement('div');
            recDiv.innerHTML = `
              <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                          background: rgba(0,0,0,0.9); color: white; padding: 20px; 
                          border-radius: 10px; z-index: 1000; max-width: 400px; border: 2px solid #ffd700;">
                <h3 style="margin-top: 0; color: #ffd700;">AI Recommendation</h3>
                <p>Evacuate Zone B via Route 3; stage EMS at Oak Ridge. ETA 14 min.</p>
              </div>
            `;
            document.body.appendChild(recDiv);
          });
          break;
          
        case 'show_impact_slide':
          await this.showImpactSlide();
          break;
          
        case 'fade_to_conclusion':
          await this.showConclusion();
          break;
          
        default:
          console.log(`⚠️ Action ${action.action} not implemented yet`);
          await this.page!.waitForTimeout(1000);
      }
      
      // Add standard pause between actions
      await this.page!.waitForTimeout(300);
      
    } catch (error) {
      console.error(`❌ Error executing action ${action.action}:`, error);
    }
  }

  private async showTechnicalArchitecture() {
    await this.page!.evaluate(() => {
      const techDiv = document.createElement('div');
      techDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
                    z-index: 1000; color: white; font-family: 'Courier New', monospace; 
                    padding: 40px; display: flex; align-items: center; justify-content: center;">
          <div style="max-width: 1200px; width: 100%;">
            <h1 style="text-align: center; margin-bottom: 40px; color: #ffd700; font-size: 36px;">
              Technical Architecture
            </h1>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 40px;">
              <div id="data-ingestion" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #ff4444;">
                <h3 style="color: #ff4444; margin-top: 0;">📡 Data Ingestion</h3>
                <ul style="list-style: none; padding: 0;">
                  <li>🛰️ NASA FIRMS</li>
                  <li>🌤️ NOAA Weather</li>
                  <li>🚨 911 Feeds</li>
                  <li>👥 Population Data</li>
                  <li>🚗 Traffic GPS</li>
                </ul>
              </div>
              
              <div id="processing" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #44ff44;">
                <h3 style="color: #44ff44; margin-top: 0;">⚙️ Processing</h3>
                <ul style="list-style: none; padding: 0;">
                  <li>🔗 H3 Indexing</li>
                  <li>🔥 ML Risk/Spread</li>
                  <li>📊 Risk Assessment</li>
                  <li>🔄 Real-time Updates</li>
                </ul>
              </div>
              
              <div id="delivery" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #4444ff;">
                <h3 style="color: #4444ff; margin-top: 0;">🎯 Delivery</h3>
                <ul style="list-style: none; padding: 0;">
                  <li>⚛️ React + Mapbox</li>
                  <li>🔌 WebSocket API</li>
                  <li>📱 Responsive UI</li>
                  <li>🤖 AI Assistant</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(techDiv);
    });
  }

  private async showRouteOverlay() {
    await this.page!.evaluate(() => {
      const routeDiv = document.createElement('div');
      routeDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.7); z-index: 1000; pointer-events: none;">
          <svg width="100%" height="100%" style="position: absolute;">
            <path d="M 200 400 Q 400 300 600 400 T 1000 400" 
                  stroke="#4444ff" stroke-width="4" fill="none" 
                  stroke-dasharray="10,5" opacity="0.8">
              <animate attributeName="stroke-dashoffset" from="0" to="15" dur="2s" repeatCount="indefinite"/>
            </path>
          </svg>
          
          <div style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); 
                      background: rgba(0,0,0,0.8); color: white; padding: 20px; 
                      border-radius: 10px; border-left: 4px solid #4444ff;">
            <h3 style="margin-top: 0; color: #4444ff;">Route Profiles</h3>
            <div style="margin: 10px 0;">🚶 Civilian Evacuation</div>
            <div style="margin: 10px 0;">🚑 EMS Response</div>
            <div style="margin: 10px 0;">🚒 Fire Tactical</div>
            <div style="margin: 10px 0;">👮 Police Escort</div>
          </div>
        </div>
      `;
      document.body.appendChild(routeDiv);
    });
  }

  private async showAIPCommander() {
    await this.page!.evaluate(() => {
      const aipDiv = document.createElement('div');
      aipDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); 
                    z-index: 1000; color: white; font-family: Arial, sans-serif; 
                    padding: 40px; display: flex; align-items: center; justify-content: center;">
          <div style="max-width: 800px; width: 100%;">
            <h1 style="text-align: center; margin-bottom: 40px; color: #ffd700; font-size: 36px;">
              🤖 AI Commander Interface
            </h1>
            
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin-bottom: 30px;">
              <h2 style="color: #ffd700; margin-top: 0;">Natural Language Queries</h2>
              <div style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                <strong>User:</strong> "What happens if we lose Highway 30?"
              </div>
              <div id="ai-response" style="margin: 20px 0; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px; opacity: 0;">
                <strong>AI Response:</strong> "Highway 30 closure would affect evacuation routes for Zone A. 
                Alternative routes via Highway 101 would add 8 minutes to evacuation time. 
                Recommend pre-positioning additional units at Highway 101 intersection."
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(aipDiv);
    });
  }

  private async showImpactSlide() {
    await this.page!.evaluate(() => {
      const impactDiv = document.createElement('div');
      impactDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); 
                    z-index: 1000; color: white; font-family: Arial, sans-serif; 
                    padding: 40px; display: flex; align-items: center; justify-content: center;">
          <div style="max-width: 1000px; width: 100%;">
            <h1 style="text-align: center; margin-bottom: 40px; color: #ffd700; font-size: 36px;">
              📊 Impact & Value Proposition
            </h1>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-bottom: 40px;">
              <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 15px;">
                <h2 style="color: #ffd700; margin-top: 0; text-align: center;">⏱️ Time Savings</h2>
                <div id="time-savings" style="text-align: center; font-size: 48px; color: #44ff44; margin: 20px 0; height: 0; overflow: hidden;">
                  40%
                </div>
                <p style="text-align: center; margin: 0;">Faster decision-making</p>
              </div>
              <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 15px;">
                <h2 style="color: #ffd700; margin-top: 0; text-align: center;">🤝 Coordination</h2>
                <div id="coordination" style="text-align: center; font-size: 48px; color: #44ff44; margin: 20px 0; height: 0; overflow: hidden;">
                  60%
                </div>
                <p style="text-align: center; margin: 0;">Improved situational awareness</p>
              </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px;">
              <h2 style="color: #ffd700; margin-top: 0;">Key Benefits</h2>
              <div id="benefits" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
                <div style="opacity: 0;">✅ Unified sources</div>
                <div style="opacity: 0;">✅ Automated processing</div>
                <div style="opacity: 0;">✅ Scalable architecture</div>
                <div style="opacity: 0;">✅ Real-time updates</div>
                <div style="opacity: 0;">✅ Human judgment preserved</div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(impactDiv);
    });
  }

  private async showConclusion() {
    await this.page!.evaluate(() => {
      const conclusionDiv = document.createElement('div');
      conclusionDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    z-index: 1000; color: white; font-family: Arial, sans-serif; 
                    display: flex; align-items: center; justify-content: center;">
          <div style="text-align: center; max-width: 800px; padding: 40px;">
            <h1 style="font-size: 48px; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
              Conclusion & Next Steps
            </h1>
            
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin-bottom: 30px;">
              <h2 style="color: #ffd700; margin-top: 0;">Key Achievements</h2>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
                <div>✅ Unified emergency coordination</div>
                <div>✅ Real-time data fusion</div>
                <div>✅ Intuitive interface design</div>
                <div>✅ Human judgment preserved</div>
              </div>
            </div>
            
            <div id="contact-info" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; opacity: 0;">
              <h3 style="color: #ffd700; margin-top: 0;">Contact Information</h3>
              <div style="font-size: 18px; margin: 10px 0;">
                Ian Frelinger<br>
                <a href="mailto:ian.frelinger@example.com" style="color: #ffd700;">ian.frelinger@example.com</a><br>
                <a href="https://github.com/ianfrelinger" style="color: #ffd700;">github.com/ianfrelinger</a>
              </div>
              <div style="margin-top: 15px; font-size: 16px; color: #cccccc;">
                Ready to discuss pilot projects and collaborations
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(conclusionDiv);
    });
  }

  private async generateFinalVideo() {
    console.log('🎬 Generating final video...');
    
    // Get the recorded video file
    const videoFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length === 0) {
      console.error('❌ No video files found to combine');
      return;
    }
    
    const inputFile = path.join(this.outputDir, videoFiles[0]);
    const outputPath = path.join(this.outputDir, 'detailed-demo-video-final.mp4');
    
    try {
      // Convert webm to mp4 with proper settings
      const ffmpegCommand = `ffmpeg -i "${inputFile}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
      execSync(ffmpegCommand, { stdio: 'inherit' });
      
      console.log(`✅ Final video generated: ${outputPath}`);
      
      // Clean up the original webm file
      if (fs.existsSync(inputFile)) {
        fs.unlinkSync(inputFile);
      }
      
    } catch (error) {
      console.error('❌ Error generating final video:', error);
    }
  }

  private async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }

  private startTime = Date.now();
}

// Run the detailed video creation
const creator = new DetailedDemoVideoCreator();
creator.createDetailedDemoVideo().catch(console.error);
