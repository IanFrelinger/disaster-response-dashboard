import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StorySegment {
  name: string;
  duration: number;
  description: string;
  actions: (page: Page) => Promise<void>;
  narration: string;
}

class InteractiveStoryVideoCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createInteractiveStoryVideo() {
    console.log('🎬 Creating Interactive Story Video...');
    console.log('📹 This will show real interface interactions telling a compelling story');
    
    try {
      await this.initializeBrowser();
      await this.recordStorySegments();
      await this.generateFinalVideo();
      
      console.log('✅ Interactive story video creation completed!');
      console.log('🎬 Real interface interactions with compelling narrative ready');
      
    } catch (error) {
      console.error('❌ Error during video creation:', error);
    } finally {
      await this.cleanup();
    }
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
        dir: this.outputDir,
        size: { width: 1920, height: 1080 }
      }
    });
    
    console.log('✅ Browser initialized');
  }

  private async recordStorySegments() {
    const segments: StorySegment[] = [
      {
        name: 'emergency_alert',
        duration: 25,
        description: 'Emergency alert received - setting the scene',
        narration: "It's 2:30 PM on a Tuesday when the emergency alert comes in. A wildfire has been detected in the North Ridge area, and we need to coordinate an immediate evacuation. Let me show you how our system handles this crisis.",
        actions: async (page: Page) => {
          await page.goto('http://localhost:3000');
          await page.waitForLoadState('networkidle');
          
          // Add emergency alert overlay
          await page.evaluate(() => {
            const alertDiv = document.createElement('div');
            alertDiv.innerHTML = `
              <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                          background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%); 
                          z-index: 1000; display: flex; align-items: center; justify-content: center; 
                          color: white; font-family: Arial, sans-serif;">
                <div style="text-align: center; max-width: 600px; padding: 40px;">
                  <div style="font-size: 72px; margin-bottom: 20px;">🚨</div>
                  <h1 style="font-size: 36px; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    EMERGENCY ALERT
                  </h1>
                  <h2 style="font-size: 24px; margin-bottom: 20px; color: #ffd700;">
                    Wildfire Detected - North Ridge Area
                  </h2>
                  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <div style="font-size: 18px; margin: 5px 0;">📍 Location: North Ridge Area</div>
                    <div style="font-size: 18px; margin: 5px 0;">🔥 Severity: High</div>
                    <div style="font-size: 18px; margin: 5px 0;">⏰ Time: 2:30 PM</div>
                    <div style="font-size: 18px; margin: 5px 0;">👥 Population at Risk: 1,200</div>
                  </div>
                  <div style="font-size: 16px; color: #ffd700; margin-top: 20px;">
                    Initiating emergency response protocol...
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(alertDiv);
          });
          
          await page.waitForTimeout(15000);
          
          // Fade out alert and show dashboard
          await page.evaluate(() => {
            const alertDiv = document.querySelector('div[style*="position: fixed"]') as HTMLElement;
            if (alertDiv) {
              alertDiv.style.transition = 'opacity 3s ease-out';
              alertDiv.style.opacity = '0';
            }
          });
          
          await page.waitForTimeout(5000);
          
          // Remove alert overlay
          await page.evaluate(() => {
            const alertDiv = document.querySelector('div[style*="position: fixed"]');
            if (alertDiv) alertDiv.remove();
          });
        }
      },
      {
        name: 'dashboard_overview',
        duration: 30,
        description: 'Quick dashboard overview and zone assessment',
        narration: "The dashboard immediately shows us the situation. We can see our three evacuation zones - Zone A is the immediate danger area, Zone B is the warning zone, and Zone C is our safe staging area. Let me check the current status of each zone.",
        actions: async (page: Page) => {
          // Wait for dashboard to be visible
          await page.waitForTimeout(2000);
          
          // Add zone status callout
          await page.evaluate(() => {
            const statusDiv = document.createElement('div');
            statusDiv.innerHTML = `
              <div style="position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.9); 
                          color: white; padding: 20px; border-radius: 10px; z-index: 1000; 
                          border-left: 4px solid #ffd700; max-width: 300px;">
                <h3 style="margin-top: 0; color: #ffd700;">🚨 Emergency Status</h3>
                <div style="margin: 10px 0;">
                  <div style="margin: 8px 0; padding: 8px; background: rgba(255,68,68,0.2); border-radius: 5px;">
                    <strong>🔴 Zone A</strong><br>
                    <small>Immediate Danger - 450 residents</small>
                  </div>
                  <div style="margin: 8px 0; padding: 8px; background: rgba(255,170,0,0.2); border-radius: 5px;">
                    <strong>🟡 Zone B</strong><br>
                    <small>Warning Area - 380 residents</small>
                  </div>
                  <div style="margin: 8px 0; padding: 8px; background: rgba(68,255,68,0.2); border-radius: 5px;">
                    <strong>🟢 Zone C</strong><br>
                    <small>Safe Staging - 370 residents</small>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(statusDiv);
          });
          
          await page.waitForTimeout(15000);
          
          // Show building counts
          await page.evaluate(() => {
            const buildingDiv = document.createElement('div');
            buildingDiv.innerHTML = `
              <div style="position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.9); 
                          color: white; padding: 20px; border-radius: 10px; z-index: 1000; 
                          border-left: 4px solid #44ff44;">
                <h3 style="margin-top: 0; color: #44ff44;">🏢 Building Status</h3>
                <div style="margin: 10px 0;">
                  <div>🔴 High Risk: 8 buildings</div>
                  <div>🟡 Medium Risk: 15 buildings</div>
                  <div>🟢 Low Risk: 12 buildings</div>
                  <div style="margin-top: 10px; color: #ffd700;">
                    🚨 Special Needs: 23 residents
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(buildingDiv);
          });
          
          await page.waitForTimeout(15000);
        }
      },
      {
        name: 'live_map_navigation',
        duration: 45,
        description: 'Navigate to live map and explore hazard details',
        narration: "Now let me switch to the Live Map to see the actual fire location and assess the situation. I'll toggle the hazard layers to get a clear view of the threat and then examine the affected area.",
        actions: async (page: Page) => {
          // Remove previous overlays
          await page.evaluate(() => {
            document.querySelectorAll('div[style*="position: fixed"]').forEach(el => el.remove());
          });
          
          // Click on Live Map tab
          await page.click('text=Live Map');
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          // Add map layer callout
          await page.evaluate(() => {
            const layerDiv = document.createElement('div');
            layerDiv.innerHTML = `
              <div style="position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.9); 
                          color: white; padding: 15px; border-radius: 8px; z-index: 1000;">
                <h4 style="margin-top: 0; color: #ffd700;">🗺️ Map Layers</h4>
                <div style="margin: 5px 0;">🔥 Hazards</div>
                <div style="margin: 5px 0;">🛣️ Routes</div>
                <div style="margin: 5px 0;">🚑 Units</div>
                <div style="margin: 5px 0;">🚨 Evac Zones</div>
              </div>
            `;
            document.body.appendChild(layerDiv);
          });
          
          await page.waitForTimeout(10000);
          
          // Simulate clicking on a hazard
          await page.evaluate(() => {
            const hazardDiv = document.createElement('div');
            hazardDiv.innerHTML = `
              <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                          background: rgba(255,68,68,0.95); color: white; padding: 25px; 
                          border-radius: 15px; z-index: 1000; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <h3 style="margin-top: 0; text-align: center;">🔥 Active Wildfire</h3>
                <div style="margin: 15px 0; line-height: 1.6;">
                  <div><strong>📍 Location:</strong> North Ridge Area</div>
                  <div><strong>🔥 Intensity:</strong> High (8.7/10)</div>
                  <div><strong>📏 Size:</strong> 2.3 square miles</div>
                  <div><strong>💨 Wind:</strong> 15 mph NE</div>
                  <div><strong>🌡️ Temperature:</strong> 89°F</div>
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 15px;">
                  <div style="color: #ffd700; font-weight: bold;">🚨 Immediate Impact</div>
                  <div>🏢 8 buildings at risk</div>
                  <div>👥 156 residents affected</div>
                  <div>🛣️ 2 roads blocked</div>
                </div>
              </div>
            `;
            document.body.appendChild(hazardDiv);
          });
          
          await page.waitForTimeout(15000);
          
          // Show route planning
          await page.evaluate(() => {
            const routeDiv = document.createElement('div');
            routeDiv.innerHTML = `
              <div style="position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.9); 
                          color: white; padding: 20px; border-radius: 10px; z-index: 1000; 
                          border-left: 4px solid #4444ff;">
                <h3 style="margin-top: 0; color: #4444ff;">🛣️ Route Planning</h3>
                <div style="margin: 10px 0;">
                  <div>🛣️ Primary Route: 12 min (A-Star optimized)</div>
                  <div>🛣️ Secondary Route: 18 min</div>
                  <div>🚧 Road Closures: 2 detected</div>
                  <div>🚑 Units Available: 8</div>
                </div>
              </div>
            `;
            document.body.appendChild(routeDiv);
          });
          
          await page.waitForTimeout(15000);
        }
      },
      {
        name: 'ai_decision_support',
        duration: 35,
        description: 'Use AI to get recommendations for the emergency',
        narration: "Let me consult our AI Commander for recommendations. I'll ask what the best evacuation strategy is given the current conditions and what resources we need to deploy.",
        actions: async (page: Page) => {
          // Remove previous overlays
          await page.evaluate(() => {
            document.querySelectorAll('div[style*="position: fixed"]').forEach(el => el.remove());
          });
          
          // Navigate to AI Commander (assuming there's a tab or button)
          // For now, we'll simulate the AI interface
          await page.waitForTimeout(2000);
          
          // Create AI interface overlay
          await page.evaluate(() => {
            const aiDiv = document.createElement('div');
            aiDiv.innerHTML = `
              <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
                          z-index: 1000; color: white; font-family: 'Courier New', monospace; 
                          padding: 40px; display: flex; align-items: center; justify-content: center;">
                <div style="max-width: 800px; width: 100%;">
                  <h1 style="text-align: center; margin-bottom: 30px; color: #00ff00; font-size: 32px;">
                    🤖 AI Commander
                  </h1>
                  
                  <div style="background: rgba(0,255,0,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #00ff00;">
                    <h3 style="color: #00ff00; margin-top: 0;">💬 Your Question:</h3>
                    <div style="font-size: 18px; margin: 10px 0; color: #ffd700;">
                      "What's the best evacuation strategy for the North Ridge wildfire?"
                    </div>
                  </div>
                  
                  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="color: #00ff00; margin-top: 0;">🤖 AI Analysis:</h3>
                    <div style="line-height: 1.6; margin: 10px 0;">
                      <div>📊 Analyzing current conditions...</div>
                      <div>🔥 Fire spread prediction: 2.3 miles/hour</div>
                      <div>🌪️ Wind direction: Northeast</div>
                      <div>👥 Population density: High in Zone A</div>
                    </div>
                  </div>
                  
                  <div style="background: rgba(0,255,0,0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #00ff00;">
                    <h3 style="color: #00ff00; margin-top: 0;">🎯 Recommended Actions:</h3>
                    <div style="line-height: 1.6; margin: 10px 0;">
                      <div>1. 🚨 Immediate evacuation of Zone A (within 30 minutes)</div>
                      <div>2. 🚑 Deploy 6 EMS units to North Ridge</div>
                      <div>3. 🛣️ Use Route 3 (A-Star optimized path)</div>
                      <div>4. 🏫 Staging area: Oak Ridge Elementary</div>
                      <div>5. 📞 Alert all residents via emergency broadcast</div>
                    </div>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(aiDiv);
          });
          
          await page.waitForTimeout(20000);
          
          // Show confidence score
          await page.evaluate(() => {
            const confidenceDiv = document.createElement('div');
            confidenceDiv.innerHTML = `
              <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,255,0,0.9); 
                          color: white; padding: 15px; border-radius: 10px; z-index: 1000;">
                <h4 style="margin-top: 0;">🎯 AI Confidence</h4>
                <div style="font-size: 24px; font-weight: bold;">94%</div>
                <div style="font-size: 12px;">Based on 1,247 similar incidents</div>
              </div>
            `;
            document.body.appendChild(confidenceDiv);
          });
          
          await page.waitForTimeout(15000);
        }
      },
      {
        name: 'evacuation_execution',
        duration: 40,
        description: 'Execute the evacuation plan and monitor progress',
        narration: "Based on the AI recommendations, I'm now executing the evacuation plan. Let me monitor the progress in real-time and coordinate with our response teams. I can see evacuation percentages, unit locations, and any issues that arise.",
        actions: async (page: Page) => {
          // Remove previous overlays
          await page.evaluate(() => {
            document.querySelectorAll('div[style*="position: fixed"]').forEach(el => el.remove());
          });
          
          // Navigate back to dashboard to show evacuation progress
          await page.click('text=Commander Dashboard');
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          // Show evacuation progress
          await page.evaluate(() => {
            const progressDiv = document.createElement('div');
            progressDiv.innerHTML = `
              <div style="position: fixed; top: 20px; left: 20px; background: rgba(0,0,0,0.9); 
                          color: white; padding: 20px; border-radius: 10px; z-index: 1000; 
                          border-left: 4px solid #44ff44;">
                <h3 style="margin-top: 0; color: #44ff44;">📊 Evacuation Progress</h3>
                <div style="margin: 15px 0;">
                  <div style="margin: 10px 0;">
                    <div>🔴 Zone A: 65% evacuated</div>
                    <div style="background: rgba(255,68,68,0.2); height: 8px; border-radius: 4px; margin: 5px 0;">
                      <div style="background: #ff4444; height: 100%; width: 65%; border-radius: 4px;"></div>
                    </div>
                  </div>
                  <div style="margin: 10px 0;">
                    <div>🟡 Zone B: 40% evacuated</div>
                    <div style="background: rgba(255,170,0,0.2); height: 8px; border-radius: 4px; margin: 5px 0;">
                      <div style="background: #ffaa00; height: 100%; width: 40%; border-radius: 4px;"></div>
                    </div>
                  </div>
                  <div style="margin: 10px 0;">
                    <div>🟢 Zone C: 15% evacuated</div>
                    <div style="background: rgba(68,255,68,0.2); height: 8px; border-radius: 4px; margin: 5px 0;">
                      <div style="background: #44ff44; height: 100%; width: 15%; border-radius: 4px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(progressDiv);
          });
          
          await page.waitForTimeout(15000);
          
          // Show unit coordination
          await page.evaluate(() => {
            const unitDiv = document.createElement('div');
            unitDiv.innerHTML = `
              <div style="position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.9); 
                          color: white; padding: 20px; border-radius: 10px; z-index: 1000; 
                          border-left: 4px solid #ffd700;">
                <h3 style="margin-top: 0; color: #ffd700;">🚑 Unit Coordination</h3>
                <div style="margin: 10px 0;">
                  <div>🚑 EMS-01: En route to North Ridge</div>
                  <div>🚑 EMS-02: At Oak Ridge Elementary</div>
                  <div>🚑 EMS-03: Evacuating Building 7</div>
                  <div>🚑 EMS-04: Traffic control at Route 3</div>
                  <div>🚑 EMS-05: Medical assistance needed</div>
                  <div>🚑 EMS-06: Standby at staging area</div>
                </div>
                <div style="margin-top: 15px; color: #ffd700;">
                  ⏰ Last Update: 2:45 PM
                </div>
              </div>
            `;
            document.body.appendChild(unitDiv);
          });
          
          await page.waitForTimeout(15000);
          
          // Show real-time alerts
          await page.evaluate(() => {
            const alertDiv = document.createElement('div');
            alertDiv.innerHTML = `
              <div style="position: fixed; top: 50%; right: 20px; background: rgba(255,68,68,0.9); 
                          color: white; padding: 15px; border-radius: 10px; z-index: 1000; 
                          max-width: 300px;">
                <h4 style="margin-top: 0;">🚨 Real-time Alert</h4>
                <div style="margin: 10px 0;">
                  <div>⚠️ Road closure detected</div>
                  <div>📍 Route 3 at Oak Street</div>
                  <div>🚧 Traffic accident</div>
                  <div>🔄 Rerouting units...</div>
                </div>
                <div style="font-size: 12px; margin-top: 10px;">
                  ⏰ 2:47 PM
                </div>
              </div>
            `;
            document.body.appendChild(alertDiv);
          });
          
          await page.waitForTimeout(10000);
        }
      },
      {
        name: 'resolution_success',
        duration: 25,
        description: 'Show successful resolution and impact metrics',
        narration: "Thanks to our coordinated response, we successfully evacuated 98% of the affected population within 45 minutes. Let me show you the impact metrics and how this system saved valuable time and potentially lives.",
        actions: async (page: Page) => {
          // Remove previous overlays
          await page.evaluate(() => {
            document.querySelectorAll('div[style*="position: fixed"]').forEach(el => el.remove());
          });
          
          // Show success overlay
          await page.evaluate(() => {
            const successDiv = document.createElement('div');
            successDiv.innerHTML = `
              <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                          background: linear-gradient(135deg, #44ff44 0%, #00cc00 100%); 
                          z-index: 1000; display: flex; align-items: center; justify-content: center; 
                          color: white; font-family: Arial, sans-serif;">
                <div style="text-align: center; max-width: 800px; padding: 40px;">
                  <div style="font-size: 72px; margin-bottom: 20px;">✅</div>
                  <h1 style="font-size: 36px; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                    EVACUATION SUCCESSFUL
                  </h1>
                  <h2 style="font-size: 24px; margin-bottom: 30px; color: #ffd700;">
                    North Ridge Wildfire Response Complete
                  </h2>
                  
                  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0;">
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                      <div style="font-size: 36px; color: #ffd700;">98%</div>
                      <div>Population Evacuated</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                      <div style="font-size: 36px; color: #ffd700;">45 min</div>
                      <div>Total Response Time</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                      <div style="font-size: 36px; color: #ffd700;">0</div>
                      <div>Casualties</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px;">
                      <div style="font-size: 36px; color: #ffd700;">6</div>
                      <div>Units Coordinated</div>
                    </div>
                  </div>
                  
                  <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-top: 20px;">
                    <h3 style="color: #ffd700; margin-top: 0;">🎯 System Impact</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
                      <div>⚡ 40% faster decision-making</div>
                      <div>🤝 60% improved coordination</div>
                      <div>⏰ 2-3 hours saved per incident</div>
                      <div>💡 AI-powered recommendations</div>
                    </div>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(successDiv);
          });
          
          await page.waitForTimeout(20000);
          
          // Fade to conclusion
          await page.evaluate(() => {
            const successDiv = document.querySelector('div[style*="position: fixed"]') as HTMLElement;
            if (successDiv) {
              successDiv.style.transition = 'opacity 3s ease-out';
              successDiv.style.opacity = '0';
            }
          });
          
          await page.waitForTimeout(5000);
        }
      }
    ];

    console.log(`📹 Recording ${segments.length} story segments...`);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`🎬 Recording segment ${i + 1}/${segments.length}: ${segment.name} (${segment.duration}s)`);
      
      try {
        await segment.actions(this.page!);
        console.log(`✅ Segment ${segment.name} recorded successfully`);
      } catch (error) {
        console.error(`❌ Error recording segment ${segment.name}:`, error);
      }
    }
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
    const outputPath = path.join(this.outputDir, 'interactive-story-video-final.mp4');
    
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
}

// Run the video creation
const creator = new InteractiveStoryVideoCreator();
creator.createInteractiveStoryVideo().catch(console.error);
