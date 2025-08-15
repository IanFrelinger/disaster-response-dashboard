import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DemoSegment {
  title: string;
  duration: number;
  description: string;
  actions: () => Promise<void>;
  narration: string;
  visualElements: string[];
}

class WorkingDemo {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private demoName: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.demoName = 'working-disaster-response-demo';
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async start() {
    console.log('🚀 Starting Working Disaster Response Demo...');
    console.log('This demo focuses on the features that are actually visible and working');
    
    try {
      this.browser = await chromium.launch({
        headless: false,
        slowMo: 2000
      });

      this.page = await this.browser.newPage();
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navigate to the frontend
      await this.page.goto('http://localhost:3000');
      await this.page.waitForLoadState('networkidle');
      
      console.log('✅ Frontend loaded successfully');
      
      // Record the working demo
      await this.recordWorkingDemo();
      
    } catch (error) {
      console.error('❌ Error during demo recording:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async recordWorkingDemo() {
    const segments: DemoSegment[] = [
      {
        title: "Dashboard Overview",
        duration: 20,
        description: "Show the main commander dashboard with navigation",
        narration: "Welcome to the Commander Dashboard. This is our central command center for emergency response operations with real-time situational awareness.",
        visualElements: ["Dashboard header", "Navigation buttons", "Command center"],
        actions: async () => {
          // Wait for the page to fully load
          await this.page!.waitForTimeout(3000);
          
          // Show the dashboard header
          const header = await this.page!.waitForSelector('text=Commander Dashboard', { timeout: 10000 });
          if (header) {
            console.log('✅ Found Commander Dashboard header');
          }
          
          // Show all visible navigation buttons
          const buttons = await this.page!.$$('button');
          console.log(`Found ${buttons.length} navigation buttons`);
          
          for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            const text = await button.textContent();
            console.log(`Button ${i + 1}: "${text?.trim()}"`);
          }
        }
      },
      {
        title: "Operations View",
        duration: 25,
        description: "Demonstrate evacuation zones and building status",
        narration: "Let me show you the Operations view where we monitor evacuation zones and track building status in real-time.",
        visualElements: ["Evacuation zones", "Building status", "Progress tracking"],
        actions: async () => {
          // Click on Operations button
          await this.page!.click('text=Operations');
          await this.page!.waitForTimeout(3000);
          
          // Look for zone information
          const zoneElements = await this.page!.$$('text=Zone, text=Building, text=Evacuation');
          if (zoneElements.length > 0) {
            console.log(`Found ${zoneElements.length} zone/building elements`);
            await zoneElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Show evacuation progress
          const progressElements = await this.page!.$$('text=Progress, text=Evacuated, text=In Progress');
          if (progressElements.length > 0) {
            console.log(`Found ${progressElements.length} progress elements`);
          }
        }
      },
      {
        title: "Weather Conditions",
        duration: 20,
        description: "Show weather integration and risk assessment",
        narration: "Now let me demonstrate our weather integration system that provides real-time conditions and risk assessment for emergency operations.",
        visualElements: ["Weather data", "Risk assessment", "Flight status"],
        actions: async () => {
          // Click on Conditions button
          await this.page!.click('text=Conditions');
          await this.page!.waitForTimeout(3000);
          
          // Look for weather information
          const weatherElements = await this.page!.$$('text=Weather, text=Temperature, text=Wind, text=Visibility');
          if (weatherElements.length > 0) {
            console.log(`Found ${weatherElements.length} weather elements`);
          }
          
          // Show flight status
          const flightElements = await this.page!.$$('text=GROUNDED, text=RESTRICTED, text=CLEAR');
          if (flightElements.length > 0) {
            console.log(`Found ${flightElements.length} flight status elements`);
          }
        }
      },
      {
        title: "Asset Management",
        duration: 20,
        description: "Demonstrate building and asset tracking",
        narration: "The Assets view gives us detailed information about buildings, their evacuation status, and special needs requirements.",
        visualElements: ["Building details", "Evacuation status", "Special needs"],
        actions: async () => {
          // Click on Assets button
          await this.page!.click('text=Assets');
          await this.page!.waitForTimeout(3000);
          
          // Look for building information
          const buildingElements = await this.page!.$$('text=Building, text=Address, text=Population');
          if (buildingElements.length > 0) {
            console.log(`Found ${buildingElements.length} building elements`);
          }
          
          // Show evacuation details
          const evacuationElements = await this.page!.$$('text=Evacuated, text=Special Needs, text=Last Contact');
          if (evacuationElements.length > 0) {
            console.log(`Found ${evacuationElements.length} evacuation elements`);
          }
        }
      },
      {
        title: "AI Decision Support",
        duration: 25,
        description: "Show AIP Commander with intelligent recommendations",
        narration: "Now let me demonstrate our AI-powered decision support system. The AIP Commander provides intelligent recommendations for emergency response operations.",
        visualElements: ["AI interface", "Query input", "Recommendations"],
        actions: async () => {
          // Click on AIP Commander button
          await this.page!.click('text=AIP Commander');
          await this.page!.waitForTimeout(3000);
          
          // Look for AI interface elements
          const aiElements = await this.page!.$$('text=AI, text=Commander, text=Decision');
          if (aiElements.length > 0) {
            console.log(`Found ${aiElements.length} AI interface elements`);
          }
          
          // Try to find input fields
          const inputElements = await this.page!.$$('input, textarea');
          if (inputElements.length > 0) {
            console.log(`Found ${inputElements.length} input elements`);
            
            // Try to type a query
            const firstInput = inputElements[0];
            await firstInput.fill('What is the current evacuation status?');
            await this.page!.waitForTimeout(2000);
            
            // Look for submit button
            const submitButton = await this.page!.$$('button:has-text("Submit"), button:has-text("Send"), button:has-text("Ask")');
            if (submitButton.length > 0) {
              console.log('Found submit button');
              await submitButton[0].click();
              await this.page!.waitForTimeout(3000);
            }
          }
        }
      },
      {
        title: "Live Map Integration",
        duration: 15,
        description: "Show the live map with real-time data",
        narration: "Finally, let me show you our Live Map integration that provides real-time situational awareness and geographic visualization.",
        visualElements: ["Live map", "Real-time data", "Geographic visualization"],
        actions: async () => {
          // Click on Live Map button
          await this.page!.click('text=Live Map');
          await this.page!.waitForTimeout(3000);
          
          // Look for map elements
          const mapElements = await this.page!.$$('text=Map, text=Live, text=Geographic');
          if (mapElements.length > 0) {
            console.log(`Found ${mapElements.length} map elements`);
          }
          
          // Show real-time features
          const realtimeElements = await this.page!.$$('text=Real-time, text=Live, text=Current');
          if (realtimeElements.length > 0) {
            console.log(`Found ${realtimeElements.length} real-time elements`);
          }
        }
      }
    ];

    console.log(`📹 Recording ${segments.length} working demo segments...`);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`\n🎬 Segment ${i + 1}/${segments.length}: ${segment.title}`);
      console.log(`   Duration: ${segment.duration}s`);
      console.log(`   Description: ${segment.description}`);
      console.log(`   Narration: ${segment.narration}`);
      console.log(`   Visual Elements: ${segment.visualElements.join(', ')}`);
      
      try {
        // Take screenshot before segment
        const beforeScreenshot = path.join(this.outputDir, `${this.demoName}-segment-${i + 1}-${segment.title.toLowerCase().replace(/\s+/g, '-')}-before.png`);
        await this.page!.screenshot({ path: beforeScreenshot, fullPage: true });
        
        // Execute segment actions
        await segment.actions();
        
        // Take screenshot after segment
        const afterScreenshot = path.join(this.outputDir, `${this.demoName}-segment-${i + 1}-${segment.title.toLowerCase().replace(/\s+/g, '-')}-after.png`);
        await this.page!.screenshot({ path: afterScreenshot, fullPage: true });
        
        console.log(`   📸 Screenshots saved: ${beforeScreenshot}, ${afterScreenshot}`);
        
        // Wait for segment duration
        await this.page!.waitForTimeout(segment.duration * 1000);
        
      } catch (error) {
        console.error(`   ❌ Error in segment ${segment.title}:`, error);
      }
    }
    
    console.log('\n✅ Working demo recording completed!');
    console.log('🎥 This demo showcases the features that are actually visible and functional');
  }

  private async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the working demo
async function main() {
  const recorder = new WorkingDemo();
  await recorder.start();
}

main().catch(console.error);
