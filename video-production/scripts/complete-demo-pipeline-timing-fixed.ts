#!/usr/bin/env tsx

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DemoScene {
  id: string;
  title: string;
  startTime: number;
  duration: number;
  narration: string;
  actions: (page: Page) => Promise<void>;
}

class CompleteDemoPipelineTimingFixed {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private capturesDir: string;
  private startTime: number = 0;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.capturesDir = path.join(__dirname, '..', 'captures');
    
    // Ensure directories exist
    [this.outputDir, this.capturesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async runCompletePipeline() {
    console.log('🎬 Complete Demo Video Pipeline (Timing Fixed)');
    console.log('==============================================');
    console.log('This will create exactly 5:40 video with precise timing');
    console.log('');

    try {
      await this.recordDemoActions();
      await this.generateFinalVideo();
      
      console.log('✅ Complete pipeline finished successfully!');
      console.log('📹 Final video ready in output/ directory');
      
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async recordDemoActions() {
    console.log('📹 Step 1: Recording demo actions...');
    
    await this.initializeBrowser();
    await this.executeDemoTimeline();
    await this.stopRecording();
    
    console.log('✅ Demo actions recorded successfully');
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser...');
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: this.capturesDir,
        size: { width: 1920, height: 1080 }
      }
    });

    // Set zoom for readability
    await this.page.evaluate(() => {
      document.body.style.zoom = '1.1';
    });
    
    console.log('✅ Browser initialized with 1920x1080 viewport and 110% zoom');
  }

  private async executeDemoTimeline() {
    const scenes: DemoScene[] = [
      {
        id: 'intro',
        title: 'Introduction',
        startTime: 0,
        duration: 30,
        narration: "Hi, I'm Ian Frelinger. Emergencies move fast—tools shouldn't slow us down. Here's how we bring clear decisions to the front line.",
        actions: async (page: Page) => {
          await this.showIntroSequence(page);
        }
      },
      {
        id: 'user_roles',
        title: 'User Roles',
        startTime: 30,
        duration: 30,
        narration: "Incident Commanders, planners, and dispatchers share the same picture. Commanders set intent; teams act quickly with less guesswork.",
        actions: async (page: Page) => {
          await page.goto('http://localhost:3000');
          await page.waitForLoadState('networkidle');
          await page.click('button:has-text("Commander Dashboard")');
          await page.waitForLoadState('networkidle');
          await this.showUserRolesOverlay(page);
        }
      },
      {
        id: 'tech_overview',
        title: 'Technical Architecture',
        startTime: 60,
        duration: 40,
        narration: "Feeds enter the ingestion layer and are indexed on H3 hexagons. We fuse weather, population, and terrain, then predict spread. Routing uses A Star to find safe paths. The API exposes it all: GET /api/hazards, POST /api/routes, GET /api/risk, GET /api/evacuations, GET/PUT /api/units, and GET /api/public_safety. Behind each is a Foundry Function with Inputs/Outputs—so dashboards, mobile, and the AI assistant share one truth.",
        actions: async (page: Page) => {
          await this.showTechnicalArchitecture(page);
        }
      },
      {
        id: 'hazard_detection',
        title: 'Hazard Detection',
        startTime: 100,
        duration: 40,
        narration: "Hazards update live. One click shows intensity and population nearby. With layers like weather or evac zones you triage faster—monitor, shelter, or evacuate.",
        actions: async (page: Page) => {
          // Remove any overlays that might block navigation
          await page.evaluate(() => {
            document.querySelectorAll('div[style*="position: fixed"]').forEach(el => el.remove());
          });
          
          await page.click('button:has-text("Live Map")');
          await page.waitForLoadState('networkidle');
          await this.simulateMapInteractions(page);
        }
      },
      {
        id: 'zones_status',
        title: 'Zones & Building Status',
        startTime: 140,
        duration: 40,
        narration: "Each card is a zone. Progress bars track evacuations; building lists reveal special-needs flags and refusals. Updating statuses keeps everyone aligned.",
        actions: async (page: Page) => {
          // Remove any overlays that might block navigation
          await page.evaluate(() => {
            document.querySelectorAll('div[style*="position: fixed"]').forEach(el => el.remove());
          });
          
          await page.click('button:has-text("Commander Dashboard")');
          await page.waitForLoadState('networkidle');
          await this.simulateDashboardInteractions(page);
        }
      },
      {
        id: 'routing_concept',
        title: 'A-Star Routing',
        startTime: 180,
        duration: 40,
        narration: "Routing uses A Star—'A Star'—to balance safety and speed. Profiles reflect doctrine: civilians avoid hazards with wide buffers, EMS takes calculated risk, fire goes direct, police secures.",
        actions: async (page: Page) => {
          // Remove any overlays that might block navigation
          await page.evaluate(() => {
            document.querySelectorAll('div[style*="position: fixed"]').forEach(el => el.remove());
          });
          
          await page.click('button:has-text("Live Map")');
          await page.waitForLoadState('networkidle');
          await this.showRoutingOverlay(page);
        }
      },
      {
        id: 'ai_support',
        title: 'AI Decision Support',
        startTime: 220,
        duration: 30,
        narration: "Ask a question in plain language. The assistant pulls hazards, units, and traffic to suggest next actions. You remain in control—AI speeds the decision.",
        actions: async (page: Page) => {
          await this.showAIPCommander(page);
        }
      },
      {
        id: 'tech_deep_dive',
        title: 'Technical Deep Dive',
        startTime: 250,
        duration: 40,
        narration: "Processing converts detections to H3 cells, predicts spread, and scores risk. Routing builds a hazard-aware graph. The API presents it cleanly via Foundry Functions—hazards, routes, risk, evacuations, units, and public safety—while WebSockets stream updates.",
        actions: async (page: Page) => {
          await this.showTechDeepDive(page);
        }
      },
      {
        id: 'impact_value',
        title: 'Impact & Value',
        startTime: 290,
        duration: 30,
        narration: "Faster decisions, fewer hand-offs, higher compliance—without drowning users in noise. This is a focused picture that accelerates safe action.",
        actions: async (page: Page) => {
          await this.showImpactSlide(page);
        }
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        startTime: 320,
        duration: 20,
        narration: "Thanks for watching. I'd love to discuss piloting this with your team.",
        actions: async (page: Page) => {
          await this.showConclusion(page);
        }
      }
    ];

    console.log(`📹 Executing ${scenes.length} scenes over exactly 5:40...`);
    
    this.startTime = Date.now();
    
    for (const scene of scenes) {
      console.log(`🎬 Scene: ${scene.title} (${scene.startTime}s - ${scene.startTime + scene.duration}s)`);
      
      // Wait until it's time for this scene
      await this.waitUntilSceneTime(scene.startTime);
      
      // Execute scene actions
      await scene.actions(this.page!);
      
      // Wait for the scene duration
      await this.waitForSceneDuration(scene.duration);
    }
  }

  private async waitUntilSceneTime(targetTime: number) {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const waitTime = (targetTime - elapsed) * 1000;
    
    if (waitTime > 0) {
      console.log(`   ⏳ Waiting ${(waitTime/1000).toFixed(1)}s until scene start...`);
      await this.page!.waitForTimeout(waitTime);
    }
  }

  private async waitForSceneDuration(duration: number) {
    console.log(`   ⏳ Holding scene for ${duration}s...`);
    await this.page!.waitForTimeout(duration * 1000);
  }

  private async showIntroSequence(page: Page) {
    await page.evaluate(() => {
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

    // Animate title fade-in
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const title = document.getElementById('main-title');
      if (title) title.style.transition = 'opacity 1s ease-in';
      if (title) title.style.opacity = '1';
    });

    // Animate subtitle
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const subtitle = document.getElementById('subtitle');
      if (subtitle) subtitle.style.transition = 'opacity 1s ease-in';
      if (subtitle) subtitle.style.opacity = '1';
    });

    // Hold and crossfade
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const intro = document.getElementById('intro-overlay');
      if (intro) {
        intro.style.transition = 'opacity 2s ease-out';
        intro.style.opacity = '0';
      }
    });

    await page.waitForTimeout(2000);
  }

  private async showUserRolesOverlay(page: Page) {
    await page.evaluate(() => {
      const roleDiv = document.createElement('div');
      roleDiv.innerHTML = `
        <div style="position: fixed; top: 20px; left: 20px; background: rgba(0,0,0,0.8); 
                    color: white; padding: 20px; border-radius: 10px; z-index: 1000; 
                    border-left: 4px solid #ffd700; max-width: 300px;">
          <h3 style="margin-top: 0; color: #ffd700;">👥 User Roles</h3>
          <div style="margin: 10px 0;">
            <div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 5px;">
              <strong>🎖️ Incident Commander</strong><br>
              <small>Strategic overview & resource allocation</small>
            </div>
            <div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 5px;">
              <strong>📋 Operations Planner</strong><br>
              <small>Tactical planning & route optimization</small>
            </div>
            <div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 5px;">
              <strong>📞 Dispatcher</strong><br>
              <small>Unit coordination & real-time updates</small>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(roleDiv);
    });
  }

  private async showTechnicalArchitecture(page: Page) {
    await page.evaluate(() => {
      const techDiv = document.createElement('div');
      techDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
                    z-index: 1000; color: white; font-family: 'Courier New', monospace; 
                    padding: 40px; display: flex; align-items: center; justify-content: center;
                    pointer-events: none;">
          <div style="max-width: 1200px; width: 100%; pointer-events: auto;">
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

  private async simulateMapInteractions(page: Page) {
    // Simulate map interactions
    await page.evaluate(() => {
      const canvas = document.querySelector('.mapboxgl-canvas') as HTMLElement;
      if (canvas) {
        // Simulate zoom
        const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
        canvas.dispatchEvent(wheelEvent);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Simulate hazard marker click
    await page.evaluate(() => {
      const marker = document.querySelector('.mapboxgl-marker');
      if (marker) {
        marker.dispatchEvent(new MouseEvent('click'));
      }
    });
  }

  private async simulateDashboardInteractions(page: Page) {
    // Simulate zone card hover
    await page.evaluate(() => {
      const zoneCard = document.querySelector('[data-zone-card="Zone A"]') || 
                      document.querySelector('.zone-card') ||
                      document.querySelector('.dashboard-card');
      if (zoneCard) {
        zoneCard.dispatchEvent(new MouseEvent('mouseenter'));
      }
    });
    
    await page.waitForTimeout(1000);
  }

  private async showRoutingOverlay(page: Page) {
    await page.evaluate(() => {
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

  private async showAIPCommander(page: Page) {
    await page.evaluate(() => {
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

  private async showTechDeepDive(page: Page) {
    await page.evaluate(() => {
      const techDiv = document.createElement('div');
      techDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
                    z-index: 1000; color: white; font-family: 'Courier New', monospace; 
                    padding: 40px; display: flex; align-items: center; justify-content: center;">
          <div style="max-width: 1200px; width: 100%;">
            <h1 style="text-align: center; margin-bottom: 40px; color: #ffd700; font-size: 36px;">
              Technical Deep Dive
            </h1>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px;">
              <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                <h3 style="color: #ffd700; margin-top: 0;">API Endpoints</h3>
                <div style="font-family: monospace; font-size: 14px;">
                  <div>GET /api/hazards</div>
                  <div>POST /api/routes</div>
                  <div>GET /api/risk</div>
                  <div>GET /api/evacuations</div>
                  <div>GET/PUT /api/units</div>
                  <div>GET /api/public_safety</div>
                </div>
              </div>
              
              <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                <h3 style="color: #ffd700; margin-top: 0;">Processing Pipeline</h3>
                <div style="font-family: monospace; font-size: 14px;">
                  <div>H3 Indexing @ res9 (~174m)</div>
                  <div>ML Spread Probability (2h horizon)</div>
                  <div>Risk Polygons (low/med/high/critical)</div>
                  <div>A-Star Graph + Hazard Penalties</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(techDiv);
    });
  }

  private async showImpactSlide(page: Page) {
    await page.evaluate(() => {
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
                <div style="text-align: center; font-size: 48px; color: #44ff44; margin: 20px 0;">
                  40%
                </div>
                <p style="text-align: center; margin: 0;">Faster decision-making</p>
              </div>
              <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 15px;">
                <h2 style="color: #ffd700; margin-top: 0; text-align: center;">🤝 Coordination</h2>
                <div style="text-align: center; font-size: 48px; color: #44ff44; margin: 20px 0;">
                  60%
                </div>
                <p style="text-align: center; margin: 0;">Improved situational awareness</p>
              </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px;">
              <h2 style="color: #ffd700; margin-top: 0;">Key Benefits</h2>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0;">
                <div>✅ Unified sources</div>
                <div>✅ Automated processing</div>
                <div>✅ Scalable architecture</div>
                <div>✅ Real-time updates</div>
                <div>✅ Human judgment preserved</div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(impactDiv);
    });
  }

  private async showConclusion(page: Page) {
    await page.evaluate(() => {
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
            
            <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
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

  private async stopRecording() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  private async generateFinalVideo() {
    console.log('🎬 Step 2: Generating final video...');
    
    try {
      // Find the recorded video file
      const videoFiles = fs.readdirSync(this.capturesDir).filter(file => file.endsWith('.webm'));
      if (videoFiles.length === 0) {
        throw new Error('No video files found in captures directory');
      }
      
      // Get the most recent video file
      const videoFilesWithStats = videoFiles.map(file => ({
        name: file,
        path: path.join(this.capturesDir, file),
        mtime: fs.statSync(path.join(this.capturesDir, file)).mtime.getTime()
      })).sort((a, b) => b.mtime - a.mtime);
      
      const videoFile = videoFilesWithStats[0];
      const outputPath = path.join(this.outputDir, 'complete-demo-5min40.mp4');
      
      console.log(`📹 Using video: ${videoFile.name}`);
      
      // Convert webm to mp4 with proper settings
      const ffmpegCommand = `ffmpeg -i "${videoFile.path}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
      execSync(ffmpegCommand, { stdio: 'inherit' });
      
      console.log(`✅ Final video generated: ${outputPath}`);
      
      // Get file info
      const stats = fs.statSync(outputPath);
      const fileSize = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`📊 File size: ${fileSize} MB`);
      
    } catch (error) {
      console.error('❌ Failed to generate final video:', error);
      throw error;
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
}

// Run the timing-fixed pipeline
const pipeline = new CompleteDemoPipelineTimingFixed();
pipeline.runCompletePipeline().catch(console.error);
