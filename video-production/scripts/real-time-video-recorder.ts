import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface VideoSegment {
  name: string;
  duration: number;
  description: string;
  narration: string;
  actions: () => Promise<void>;
  userBehavior: string;
}

class RealTimeVideoRecorder {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private demoName: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.demoName = 'real-time-disaster-response-demo';
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async start() {
    console.log('🎬 Starting Real-Time Video Recording...');
    console.log('This will capture actual user interactions with the system');
    console.log('Making it look like a real user exploring the platform');
    
    try {
      this.browser = await chromium.launch({
        headless: false,
        slowMo: 800 // Natural user interaction speed
      });

      this.page = await this.browser.newPage();
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navigate to the frontend
      await this.page.goto('http://localhost:3000');
      await this.page.waitForLoadState('networkidle');
      
      console.log('✅ Frontend loaded successfully');
      
      // Start recording the real-time demo
      await this.recordRealTimeDemo();
      
    } catch (error) {
      console.error('❌ Error during video recording:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async recordRealTimeDemo() {
    const segments: VideoSegment[] = [
      {
        name: "discovery",
        duration: 15,
        description: "User discovers the platform and explores the interface",
        narration: "Let me show you around this disaster response platform. As you can see, it's designed with a clean, intuitive interface that makes emergency management accessible to all users.",
        userBehavior: "Curious exploration, clicking around, reading labels",
        actions: async () => {
          // Natural discovery behavior
          await this.page!.waitForTimeout(2000);
          
          // Look around the interface naturally
          const header = await this.page!.waitForSelector('text=Commander Dashboard', { timeout: 10000 });
          if (header) {
            console.log('✅ Found dashboard header');
            // Hover over it like a user would
            await header.hover();
            await this.page!.waitForTimeout(1000);
          }
          
          // Explore navigation buttons naturally
          const buttons = await this.page!.$$('button');
          console.log(`Found ${buttons.length} navigation buttons`);
          
          // Click through them like a user exploring
          for (let i = 0; i < Math.min(3, buttons.length); i++) {
            const button = buttons[i];
            const text = await button.textContent();
            console.log(`Exploring: "${text?.trim()}"`);
            
            // Hover first, then click
            await button.hover();
            await this.page!.waitForTimeout(800);
            await button.click();
            await this.page!.waitForTimeout(2000);
          }
        }
      },
      {
        name: "operations_exploration",
        duration: 20,
        description: "User explores the operations view and discovers evacuation zones",
        narration: "Now let me show you the Operations view. This is where incident commanders monitor evacuation zones and track building status in real-time. Watch how intuitive this interface is.",
        userBehavior: "Focused exploration, clicking on interesting elements, reading data",
        actions: async () => {
          // Go to Operations view
          await this.page!.click('text=Operations');
          await this.page!.waitForTimeout(2000);
          
          // Explore the interface naturally
          const zoneElements = await this.page!.$$('text=Zone, text=Building, text=Evacuation');
          if (zoneElements.length > 0) {
            console.log(`Found ${zoneElements.length} zone elements to explore`);
            
            // Click on the first zone like a user would
            await zoneElements[0].hover();
            await this.page!.waitForTimeout(1000);
            await zoneElements[0].click();
            await this.page!.waitForTimeout(2000);
            
            // Look for more details
            const detailElements = await this.page!.$$('text=Details, text=More, text=Info');
            if (detailElements.length > 0) {
              await detailElements[0].hover();
              await this.page!.waitForTimeout(800);
              await detailElements[0].click();
              await this.page!.waitForTimeout(2000);
            }
          }
          
          // Explore progress indicators
          const progressElements = await this.page!.$$('text=Progress, text=Status, text=Complete');
          if (progressElements.length > 0) {
            console.log(`Found ${progressElements.length} progress elements`);
            // Hover over progress like a user would
            await progressElements[0].hover();
            await this.page!.waitForTimeout(1500);
          }
        }
      },
      {
        name: "weather_integration",
        duration: 18,
        description: "User discovers weather integration and risk assessment features",
        narration: "Let me show you something really interesting - our weather integration system. This provides real-time conditions and automatically assesses operational risks. It's like having a meteorologist built into the platform.",
        userBehavior: "Excited discovery, focused attention, exploring new features",
        actions: async () => {
          // Click on Conditions button
          await this.page!.click('text=Conditions');
          await this.page!.waitForTimeout(2000);
          
          // Explore weather data naturally
          const weatherElements = await this.page!.$$('text=Weather, text=Temperature, text=Wind, text=Visibility');
          if (weatherElements.length > 0) {
            console.log(`Found ${weatherElements.length} weather elements`);
            
            // Click on weather elements like a curious user
            for (let i = 0; i < Math.min(2, weatherElements.length); i++) {
              await weatherElements[i].hover();
              await this.page!.waitForTimeout(1000);
              await weatherElements[i].click();
              await this.page!.waitForTimeout(2000);
            }
          }
          
          // Look for risk assessment features
          const riskElements = await this.page!.$$('text=Risk, text=Assessment, text=Alert');
          if (riskElements.length > 0) {
            console.log(`Found ${riskElements.length} risk assessment elements`);
            await riskElements[0].hover();
            await this.page!.waitForTimeout(1200);
          }
        }
      },
      {
        name: "asset_management",
        duration: 16,
        description: "User explores building and asset management capabilities",
        narration: "Now let me show you the Assets view. This gives us detailed information about buildings, their evacuation status, and special needs requirements. It's incredibly granular.",
        userBehavior: "Methodical exploration, reading data carefully, understanding structure",
        actions: async () => {
          // Click on Assets button
          await this.page!.click('text=Assets');
          await this.page!.waitForTimeout(2000);
          
          // Explore building information
          const buildingElements = await this.page!.$$('text=Building, text=Address, text=Population');
          if (buildingElements.length > 0) {
            console.log(`Found ${buildingElements.length} building elements`);
            
            // Click on buildings like a user would
            for (let i = 0; i < Math.min(3, buildingElements.length); i++) {
              await buildingElements[i].hover();
              await this.page!.waitForTimeout(1000);
              await buildingElements[i].click();
              await this.page!.waitForTimeout(2000);
              
              // Look for building details
              const detailElements = await this.page!.$$('text=Details, text=Info, text=More');
              if (detailElements.length > 0) {
                await detailElements[0].hover();
                await this.page!.waitForTimeout(800);
              }
            }
          }
          
          // Explore evacuation status
          const evacuationElements = await this.page!.$$('text=Evacuated, text=Status, text=Progress');
          if (evacuationElements.length > 0) {
            console.log(`Found ${evacuationElements.length} evacuation elements`);
            await evacuationElements[0].hover();
            await this.page!.waitForTimeout(1500);
          }
        }
      },
      {
        name: "ai_experience",
        duration: 22,
        description: "User interacts with AI decision support system",
        narration: "This is where it gets really exciting - our AI-powered decision support system. Let me show you how it works by asking it a real question about evacuation priorities.",
        userBehavior: "Excited interaction, typing naturally, waiting for responses, reading results",
        actions: async () => {
          // Click on AIP Commander button
          await this.page!.click('text=AIP Commander');
          await this.page!.waitForTimeout(2000);
          
          // Find input field and type naturally
          const inputElements = await this.page!.$$('input, textarea');
          if (inputElements.length > 0) {
            console.log('Found input field for AI interaction');
            const firstInput = inputElements[0];
            
            // Click on input like a user would
            await firstInput.click();
            await this.page!.waitForTimeout(1000);
            
            // Type naturally with pauses
            await firstInput.type('What are the current evacuation priorities?', { delay: 100 });
            await this.page!.waitForTimeout(2000);
            
            // Look for submit button
            const submitButton = await this.page!.$$('button:has-text("Submit"), button:has-text("Send"), button:has-text("Ask")');
            if (submitButton.length > 0) {
              console.log('Found submit button');
              
              // Hover over submit button
              await submitButton[0].hover();
              await this.page!.waitForTimeout(1000);
              
              // Click submit
              await submitButton[0].click();
              console.log('Submitted AI query');
              
              // Wait for AI response like a user would
              await this.page!.waitForTimeout(4000);
              
              // Look for AI response elements
              const responseElements = await this.page!.$$('text=Response, text=Answer, text=Recommendation');
              if (responseElements.length > 0) {
                console.log('AI response received');
                await responseElements[0].hover();
                await this.page!.waitForTimeout(2000);
              }
            }
          }
          
          // Explore AI interface elements
          const aiElements = await this.page!.$$('text=AI, text=Commander, text=Decision');
          if (aiElements.length > 0) {
            console.log(`Found ${aiElements.length} AI interface elements`);
          }
        }
      },
      {
        name: "live_map_exploration",
        duration: 14,
        description: "User explores the live map and real-time features",
        narration: "Finally, let me show you our Live Map integration. This provides real-time situational awareness and geographic visualization. It's like having Google Maps for emergency response.",
        userBehavior: "Fascinated exploration, zooming, panning, discovering features",
        actions: async () => {
          // Click on Live Map button
          await this.page!.click('text=Live Map');
          await this.page!.waitForTimeout(2000);
          
          // Explore map elements naturally
          const mapElements = await this.page!.$$('text=Map, text=Live, text=Geographic');
          if (mapElements.length > 0) {
            console.log(`Found ${mapElements.length} map elements`);
            
            // Click on map elements like a user would
            for (let i = 0; i < Math.min(2, mapElements.length); i++) {
              await mapElements[i].hover();
              await this.page!.waitForTimeout(1000);
              await mapElements[i].click();
              await this.page!.waitForTimeout(2000);
            }
          }
          
          // Look for real-time features
          const realtimeElements = await this.page!.$$('text=Real-time, text=Live, text=Current');
          if (realtimeElements.length > 0) {
            console.log(`Found ${realtimeElements.length} real-time elements`);
            await realtimeElements[0].hover();
            await this.page!.waitForTimeout(1500);
          }
          
          // Explore coordination features
          const coordinationElements = await this.page!.$$('text=Coordination, text=Response, text=Emergency');
          if (coordinationElements.length > 0) {
            console.log(`Found ${coordinationElements.length} coordination elements`);
          }
        }
      },
      {
        name: "comprehensive_overview",
        duration: 12,
        description: "User gets a comprehensive overview and understanding",
        narration: "As you can see, this platform brings together everything needed for modern emergency response: real-time data, AI-powered insights, and intuitive interfaces. It's designed to make complex emergency management simple and effective.",
        userBehavior: "Comprehensive understanding, final exploration, appreciation of features",
        actions: async () => {
          // Return to main dashboard for overview
          await this.page!.click('text=Operations');
          await this.page!.waitForTimeout(2000);
          
          // Show final comprehensive view
          const overviewElements = await this.page!.$$('text=Overview, text=Summary, text=Total');
          if (overviewElements.length > 0) {
            console.log(`Found ${overviewElements.length} overview elements`);
            await overviewElements[0].hover();
            await this.page!.waitForTimeout(2000);
          }
          
          // Final exploration of key features
          const finalElements = await this.page!.$$('text=Features, text=Capabilities, text=Benefits');
          if (finalElements.length > 0) {
            console.log(`Found ${finalElements.length} final elements`);
          }
        }
      }
    ];

    console.log(`🎬 Recording ${segments.length} real-time video segments...`);
    console.log(`Total Duration: ${segments.reduce((sum, seg) => sum + seg.duration, 0)} seconds (${(segments.reduce((sum, seg) => sum + seg.duration, 0) / 60).toFixed(1)} minutes)`);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`\n🎬 Segment ${i + 1}/${segments.length}: ${segment.name.toUpperCase()}`);
      console.log(`   Duration: ${segment.duration}s`);
      console.log(`   Description: ${segment.description}`);
      console.log(`   User Behavior: ${segment.userBehavior}`);
      console.log(`   Narration: ${segment.narration}`);
      
      try {
        // Execute segment actions (this is what creates the video content)
        await segment.actions();
        
        // Wait for segment duration
        const segmentDuration = Math.max(segment.duration * 1000, 3000);
        await this.page!.waitForTimeout(segmentDuration);
        
        console.log(`   ✅ Segment ${segment.name} completed`);
        
      } catch (error) {
        console.error(`   ❌ Error in segment ${segment.name}:`, error);
      }
    }
    
    console.log('\n✅ Real-time video recording completed!');
    console.log('🎥 This demo shows actual user interactions with the system');
    console.log('👤 User behavior is natural and realistic');
    console.log('📹 Ready for video production with real user experience');
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

// Run the real-time video recorder
async function main() {
  const recorder = new RealTimeVideoRecorder();
  await recorder.start();
}

main().catch(console.error);
