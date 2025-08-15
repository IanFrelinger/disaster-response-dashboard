#!/usr/bin/env tsx

import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

interface DemoBeat {
  name: string;
  description: string;
  duration: number;
  actions: () => Promise<void>;
  screenshot?: string;
}

class ComprehensiveDemoRecorder {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private demoName: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.demoName = 'comprehensive-disaster-response-demo';
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async start() {
    console.log('🚀 Starting Comprehensive Disaster Response Demo Recording...');
    
    try {
      this.browser = await chromium.launch({
        headless: false,
        slowMo: 1000
      });

      this.page = await this.browser.newPage();
      
      // Set viewport for optimal recording
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navigate to the frontend
      await this.page.goto('http://localhost:5173');
      await this.page.waitForLoadState('networkidle');
      
      console.log('✅ Frontend loaded successfully');
      
      // Record the comprehensive demo
      await this.recordComprehensiveDemo();
      
    } catch (error) {
      console.error('❌ Error during demo recording:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async recordComprehensiveDemo() {
    const beats: DemoBeat[] = [
      {
        name: 'Dashboard Overview',
        description: 'Show the main evacuation dashboard with zones and building status',
        duration: 8,
        actions: async () => {
          await this.page!.waitForSelector('[data-testid="dashboard-overview"]', { timeout: 10000 });
          await this.page!.click('[data-testid="zones-view-button"]');
          await this.page!.waitForTimeout(2000);
          
          // Show zone selection
          const zoneButtons = await this.page!.$$('[data-testid^="zone-"]');
          if (zoneButtons.length > 0) {
            await zoneButtons[0].click();
            await this.page!.waitForTimeout(2000);
          }
        }
      },
      {
        name: 'Weather Integration',
        description: 'Demonstrate real-time weather data and fire weather index',
        duration: 6,
        actions: async () => {
          await this.page!.click('[data-testid="weather-view-button"]');
          await this.page!.waitForTimeout(2000);
          
          // Show weather alerts
          const alertElements = await this.page!.$$('[data-testid^="weather-alert-"]');
          if (alertElements.length > 0) {
            await alertElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
        }
      },
      {
        name: 'Building-Level Evacuation',
        description: 'Drill down to individual building evacuation status',
        duration: 8,
        actions: async () => {
          await this.page!.click('[data-testid="building-overview-button"]');
          await this.page!.waitForTimeout(2000);
          
          // Show building details
          const buildingElements = await this.page!.$$('[data-testid^="building-"]');
          if (buildingElements.length > 0) {
            await buildingElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Show evacuation progress
          await this.page!.waitForSelector('[data-testid="evacuation-progress"]', { timeout: 5000 });
        }
      },
      {
        name: 'AI Decision Support',
        description: 'Demonstrate AIP Commander with intelligent recommendations',
        duration: 10,
        actions: async () => {
          await this.page!.click('[data-testid="aip-view-button"]');
          await this.page!.waitForTimeout(2000);
          
          // Type a query
          const queryInput = await this.page!.waitForSelector('[data-testid="aip-query-input"]', { timeout: 5000 });
          await queryInput!.fill('What is the evacuation status for Zone B and what are the recommended actions?');
          await this.page!.waitForTimeout(1000);
          
          // Submit query
          const submitButton = await this.page!.waitForSelector('[data-testid="aip-submit-button"]', { timeout: 5000 });
          await submitButton!.click();
          
          // Wait for response
          await this.page!.waitForTimeout(3000);
          
          // Show confidence scoring
          await this.page!.waitForSelector('[data-testid="confidence-score"]', { timeout: 10000 });
        }
      },
      {
        name: 'Role-Based Route Planning',
        description: 'Show different route profiles for civilian evacuation, EMS, fire, and police',
        duration: 12,
        actions: async () => {
          await this.page!.click('[data-testid="routing-view-button"]');
          await this.page!.waitForTimeout(2000);
          
          // Switch between route profiles
          const profileButtons = await this.page!.$$('[data-testid^="route-profile-"]');
          for (let i = 0; i < Math.min(profileButtons.length, 4); i++) {
            await profileButtons[i].click();
            await this.page!.waitForTimeout(1500);
          }
          
          // Show route deconfliction
          await this.page!.waitForSelector('[data-testid="deconfliction-toggle"]', { timeout: 5000 });
          const deconflictToggle = await this.page!.$('[data-testid="deconfliction-toggle"]');
          if (deconflictToggle) {
            await deconflictToggle.click();
            await this.page!.waitForTimeout(2000);
          }
        }
      },
      {
        name: 'Unit Management & Assignment',
        description: 'Demonstrate drag-and-drop unit assignment and status tracking',
        duration: 10,
        actions: async () => {
          await this.page!.click('[data-testid="units-view-button"]');
          await this.page!.waitForTimeout(2000);
          
          // Switch to assignments view
          const viewModeButtons = await this.page!.$$('[data-testid^="view-mode-"]');
          if (viewModeButtons.length > 0) {
            await viewModeButtons[1].click(); // assignments view
            await this.page!.waitForTimeout(2000);
          }
          
          // Show unit capabilities
          const unitElements = await this.page!.$$('[data-testid^="unit-"]');
          if (unitElements.length > 0) {
            await unitElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Switch to status view
          if (viewModeButtons.length > 2) {
            await viewModeButtons[2].click(); // status view
            await this.page!.waitForTimeout(2000);
          }
        }
      },
      {
        name: 'Technical Architecture',
        description: 'Show system architecture, data flow, and Foundry integration',
        duration: 8,
        actions: async () => {
          await this.page!.click('[data-testid="architecture-view-button"]');
          await this.page!.waitForTimeout(2000);
          
          // Switch between architecture views
          const archViewButtons = await this.page!.$$('[data-testid^="arch-view-"]');
          for (let i = 0; i < Math.min(archViewButtons.length, 3); i++) {
            await archViewButtons[i].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Show component details
          const componentElements = await this.page!.$$('[data-testid^="component-"]');
          if (componentElements.length > 0) {
            await componentElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
        }
      },
      {
        name: 'Real-Time Updates',
        description: 'Demonstrate live data updates and system responsiveness',
        duration: 6,
        actions: async () => {
          // Go back to main dashboard
          await this.page!.click('[data-testid="zones-view-button"]');
          await this.page!.waitForTimeout(2000);
          
          // Show real-time updates
          await this.page!.waitForSelector('[data-testid="real-time-updates"]', { timeout: 5000 });
          
          // Simulate some interactions
          const zoneButtons = await this.page!.$$('[data-testid^="zone-"]');
          if (zoneButtons.length > 1) {
            await zoneButtons[1].click();
            await this.page!.waitForTimeout(2000);
          }
        }
      }
    ];

    console.log(`📹 Recording ${beats.length} demo beats...`);
    
    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      console.log(`\n🎬 Beat ${i + 1}/${beats.length}: ${beat.name}`);
      console.log(`   ${beat.description}`);
      
      try {
        await beat.actions();
        
        // Take screenshot
        const screenshotPath = path.join(this.outputDir, `${this.demoName}-beat-${i + 1}-${beat.name.toLowerCase().replace(/\s+/g, '-')}.png`);
        await this.page!.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`   📸 Screenshot saved: ${screenshotPath}`);
        
        // Wait for beat duration
        await this.page!.waitForTimeout(beat.duration * 1000);
        
      } catch (error) {
        console.error(`   ❌ Error in beat ${beat.name}:`, error);
      }
    }
    
    console.log('\n✅ Comprehensive demo recording completed!');
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

// Run the demo recorder
async function main() {
  const recorder = new ComprehensiveDemoRecorder();
  await recorder.start();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ComprehensiveDemoRecorder };
