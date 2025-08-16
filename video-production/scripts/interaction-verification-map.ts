import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ElementVerification {
  name: string;
  selector: string;
  type: 'button' | 'text' | 'canvas' | 'container' | 'input' | 'scroll';
  expectedAction: string;
  required: boolean;
  found: boolean;
  interactive: boolean;
  notes: string;
}

interface InteractionVerification {
  beatId: string;
  beatTitle: string;
  interactions: ElementVerification[];
  overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
  issues: string[];
}

class InteractionVerificationMap {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private results: InteractionVerification[] = [];
  private outputDir: string = 'verification-results';

  constructor() {
    this.ensureOutputDir();
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private createVerificationMap(): InteractionVerification[] {
    return [
      {
        beatId: "intro-context",
        beatTitle: "Introduction - Dual Context Setup",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Commander Dashboard Button",
            selector: 'button:has-text("Commander Dashboard")',
            type: 'button',
            expectedAction: "Navigate to dashboard view",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          },
          {
            name: "Live Map Button", 
            selector: 'button:has-text("Live Map")',
            type: 'button',
            expectedAction: "Navigate to map view",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      },
      {
        beatId: "hazard-detection-triage",
        beatTitle: "Hazard Detection & Triage",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Map Canvas",
            selector: '.mapboxgl-canvas',
            type: 'canvas',
            expectedAction: "Interactive map for hazard markers",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          },
          {
            name: "Map Markers",
            selector: '.mapboxgl-marker',
            type: 'container',
            expectedAction: "Hazard markers to click on",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      },
      {
        beatId: "risk-scoring-decision",
        beatTitle: "Risk Scoring & Decision Making",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Dashboard Scroll Area",
            selector: 'body',
            type: 'scroll',
            expectedAction: "Scroll to show risk assessment data",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      },
      {
        beatId: "zone-definition-drilldown",
        beatTitle: "Zone Definition & Drill-Down",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Map Canvas for Navigation",
            selector: '.mapboxgl-canvas',
            type: 'canvas',
            expectedAction: "Pan and zoom map for zone definition",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      },
      {
        beatId: "building-evacuation-tracking",
        beatTitle: "Building Evacuation Tracking",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Dashboard Scroll Area",
            selector: 'body',
            type: 'scroll',
            expectedAction: "Scroll to show building status panel",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      },
      {
        beatId: "route-planning-profiles",
        beatTitle: "Route Planning with Role-Based Profiles",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Map Canvas for Routes",
            selector: '.mapboxgl-canvas',
            type: 'canvas',
            expectedAction: "Display route visualization",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      },
      {
        beatId: "unit-assignment-tracking",
        beatTitle: "Unit Assignment & Status Tracking",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Map Canvas for Units",
            selector: '.mapboxgl-canvas',
            type: 'canvas',
            expectedAction: "Click on emergency units",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          },
          {
            name: "Dashboard Scroll Area",
            selector: 'body',
            type: 'scroll',
            expectedAction: "Scroll to show unit assignment panel",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      },
      {
        beatId: "ai-decision-support",
        beatTitle: "AI Decision Support & Replanning",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Dashboard Scroll Area",
            selector: 'body',
            type: 'scroll',
            expectedAction: "Scroll to show AIP Commander tab",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      },
      {
        beatId: "foundry-integration-value",
        beatTitle: "Foundry Integration & Value Proposition",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Map Canvas for Data Flow",
            selector: '.mapboxgl-canvas',
            type: 'canvas',
            expectedAction: "Show real-time data flow",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          },
          {
            name: "Dashboard Scroll Area",
            selector: 'body',
            type: 'scroll',
            expectedAction: "Scroll to show impact metrics",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      },
      {
        beatId: "conclusion-call-action",
        beatTitle: "Conclusion & Call to Action",
        overallStatus: 'PASS',
        issues: [],
        interactions: [
          {
            name: "Dashboard Scroll Area",
            selector: 'body',
            type: 'scroll',
            expectedAction: "Scroll to show conclusion area",
            required: true,
            found: false,
            interactive: false,
            notes: ""
          }
        ]
      }
    ];
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Playwright browser for interaction verification...');
      this.browser = await chromium.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });
      
      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(30000);
      
      console.log('✅ Browser initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Browser initialization failed:', error);
      return false;
    }
  }

  async navigateToApp(): Promise<boolean> {
    try {
      const url = process.env.HOST_FRONTEND_URL || "http://localhost:3000";
      console.log(`🌐 Navigating to: ${url}`);
      await this.page!.goto(url);
      
      console.log('⏳ Waiting for app to load...');
      await this.page!.waitForSelector("#root");
      await this.page!.waitForTimeout(3000);
      
      console.log('✅ App loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Navigation failed:', error);
      return false;
    }
  }

  async switchToMapView(): Promise<boolean> {
    try {
      console.log('🗺️ Switching to Live Map view...');
      
      // Click the Live Map button
      await this.page!.click('button:has-text("Live Map")');
      await this.page!.waitForTimeout(3000);
      
      console.log('✅ Switched to Live Map view');
      return true;
    } catch (error) {
      console.error('❌ Failed to switch to map view:', error);
      return false;
    }
  }

  async verifyElement(element: ElementVerification): Promise<void> {
    try {
      console.log(`  🔍 Verifying: ${element.name}`);
      
      // Check if element exists
      const foundElement = await this.page!.$(element.selector);
      element.found = !!foundElement;
      
      if (!element.found) {
        element.notes = "Element not found";
        console.log(`    ❌ Not found: ${element.selector}`);
        return;
      }
      
      console.log(`    ✅ Found: ${element.selector}`);
      
      // Check if element is interactive based on type
      switch (element.type) {
        case 'button':
          element.interactive = await this.verifyButtonInteraction(foundElement!);
          break;
        case 'canvas':
          element.interactive = await this.verifyCanvasInteraction(foundElement!);
          break;
        case 'scroll':
          element.interactive = await this.verifyScrollInteraction();
          break;
        case 'text':
        case 'container':
          element.interactive = true; // Assume these are interactive if found
          break;
        default:
          element.interactive = false;
      }
      
      if (element.interactive) {
        console.log(`    ✅ Interactive: ${element.expectedAction}`);
      } else {
        console.log(`    ⚠️ Not interactive: ${element.expectedAction}`);
        element.notes = "Element found but not interactive";
      }
      
    } catch (error) {
      element.notes = `Verification error: ${error}`;
      console.log(`    ❌ Error: ${error}`);
    }
  }

  private async verifyButtonInteraction(element: any): Promise<boolean> {
    try {
      // Check if button is visible and enabled
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      
      if (!isVisible || !isEnabled) {
        return false;
      }
      
      // Try to get button text to verify it's the right button
      const buttonText = await element.textContent();
      console.log(`      Button text: "${buttonText?.trim()}"`);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  private async verifyCanvasInteraction(element: any): Promise<boolean> {
    try {
      // Check if canvas is visible
      const isVisible = await element.isVisible();
      
      if (!isVisible) {
        return false;
      }
      
      // Check if canvas has proper dimensions
      const boundingBox = await element.boundingBox();
      if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
        console.log(`      Canvas dimensions: ${boundingBox.width}x${boundingBox.height}`);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  private async verifyScrollInteraction(): Promise<boolean> {
    try {
      // Check if page has scrollable content
      const pageHeight = await this.page!.evaluate(() => document.body.scrollHeight);
      const viewportHeight = await this.page!.evaluate(() => window.innerHeight);
      
      const isScrollable = pageHeight > viewportHeight;
      console.log(`      Page scrollable: ${isScrollable} (${pageHeight} > ${viewportHeight})`);
      
      return isScrollable;
    } catch (error) {
      return false;
    }
  }

  async verifyBeat(beat: InteractionVerification): Promise<void> {
    console.log(`\n🎬 Verifying Beat: ${beat.beatTitle}`);
    console.log(`📋 Interactions to verify: ${beat.interactions.length}`);
    
    const issues: string[] = [];
    
    for (const interaction of beat.interactions) {
      await this.verifyElement(interaction);
      
      if (!interaction.found && interaction.required) {
        issues.push(`Missing required element: ${interaction.name}`);
      } else if (!interaction.interactive && interaction.required) {
        issues.push(`Non-interactive required element: ${interaction.name}`);
      }
    }
    
    // Determine overall status
    const requiredElements = beat.interactions.filter(i => i.required);
    const foundElements = requiredElements.filter(i => i.found);
    const interactiveElements = foundElements.filter(i => i.interactive);
    
    if (issues.length === 0 && foundElements.length === requiredElements.length && interactiveElements.length === foundElements.length) {
      beat.overallStatus = 'PASS';
    } else if (foundElements.length === requiredElements.length && interactiveElements.length > 0) {
      beat.overallStatus = 'PARTIAL';
    } else {
      beat.overallStatus = 'FAIL';
    }
    
    beat.issues = issues;
    
    const statusIcon = beat.overallStatus === 'PASS' ? '✅' : beat.overallStatus === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${statusIcon} Beat Status: ${beat.overallStatus}`);
    
    if (issues.length > 0) {
      console.log(`   Issues found:`);
      issues.forEach(issue => console.log(`   • ${issue}`));
    }
  }

  async generateVerificationReport(): Promise<void> {
    const totalBeats = this.results.length;
    const passedBeats = this.results.filter(r => r.overallStatus === 'PASS').length;
    const partialBeats = this.results.filter(r => r.overallStatus === 'PARTIAL').length;
    const failedBeats = this.results.filter(r => r.overallStatus === 'FAIL').length;
    
    const totalElements = this.results.reduce((sum, beat) => sum + beat.interactions.length, 0);
    const foundElements = this.results.reduce((sum, beat) => 
      sum + beat.interactions.filter(i => i.found).length, 0);
    const interactiveElements = this.results.reduce((sum, beat) => 
      sum + beat.interactions.filter(i => i.interactive).length, 0);
    
    console.log('\n📊 Interaction Verification Report');
    console.log('=' .repeat(60));
    console.log(`Total beats: ${totalBeats}`);
    console.log(`✅ Passed: ${passedBeats}`);
    console.log(`⚠️ Partial: ${partialBeats}`);
    console.log(`❌ Failed: ${failedBeats}`);
    console.log('');
    console.log(`Total elements: ${totalElements}`);
    console.log(`Found elements: ${foundElements}/${totalElements} (${((foundElements/totalElements)*100).toFixed(1)}%)`);
    console.log(`Interactive elements: ${interactiveElements}/${totalElements} (${((interactiveElements/totalElements)*100).toFixed(1)}%)`);
    
    const report = {
      summary: {
        totalBeats,
        passed: passedBeats,
        partial: partialBeats,
        failed: failedBeats,
        totalElements,
        foundElements,
        interactiveElements,
        successRate: ((foundElements/totalElements)*100).toFixed(1) + '%',
        interactivityRate: ((interactiveElements/totalElements)*100).toFixed(1) + '%'
      },
      beats: this.results
    };
    
    const reportPath = path.join(this.outputDir, 'interaction-verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    console.log('\n🎬 Beat-by-Beat Summary:');
    this.results.forEach((beat, index) => {
      const statusIcon = beat.overallStatus === 'PASS' ? '✅' : beat.overallStatus === 'PARTIAL' ? '⚠️' : '❌';
      const foundCount = beat.interactions.filter(i => i.found).length;
      const totalCount = beat.interactions.length;
      console.log(`  ${index + 1}. ${beat.beatTitle} - ${foundCount}/${totalCount} elements ${statusIcon}`);
    });
    
    // Overall demo readiness assessment
    const overallSuccess = (passedBeats + partialBeats) / totalBeats;
    console.log(`\n🎯 Demo Readiness Assessment:`);
    if (overallSuccess >= 0.9) {
      console.log(`✅ EXCELLENT (${(overallSuccess*100).toFixed(1)}%) - Demo should work smoothly`);
    } else if (overallSuccess >= 0.7) {
      console.log(`⚠️ GOOD (${(overallSuccess*100).toFixed(1)}%) - Demo should work with minor issues`);
    } else if (overallSuccess >= 0.5) {
      console.log(`⚠️ MODERATE (${(overallSuccess*100).toFixed(1)}%) - Demo may have significant issues`);
    } else {
      console.log(`❌ POOR (${(overallSuccess*100).toFixed(1)}%) - Demo likely to fail`);
    }
  }

  async runVerification(): Promise<void> {
    console.log('🔍 Starting Interaction Verification Map');
    console.log('=' .repeat(60));
    console.log('This will verify that all elements and interactions');
    console.log('in the enhanced simplified narrative recorder will work.');
    console.log('');

    try {
      if (!(await this.initialize())) {
        throw new Error('Failed to initialize browser');
      }

      if (!(await this.navigateToApp())) {
        throw new Error('Failed to navigate to app');
      }

      this.results = this.createVerificationMap();
      
      // First verify dashboard elements
      console.log('\n🏠 Verifying Dashboard Elements...');
      for (const beat of this.results) {
        if (beat.beatId === 'intro-context' || beat.beatId === 'risk-scoring-decision' || 
            beat.beatId === 'building-evacuation-tracking' || beat.beatId === 'ai-decision-support' || 
            beat.beatId === 'conclusion-call-action') {
          await this.verifyBeat(beat);
        }
      }
      
      // Then switch to map view and verify map elements
      console.log('\n🗺️ Verifying Map Elements...');
      if (await this.switchToMapView()) {
        for (const beat of this.results) {
          if (beat.beatId === 'hazard-detection-triage' || beat.beatId === 'zone-definition-drilldown' || 
              beat.beatId === 'route-planning-profiles' || beat.beatId === 'unit-assignment-tracking' || 
              beat.beatId === 'foundry-integration-value') {
            await this.verifyBeat(beat);
          }
        }
      }

      await this.generateVerificationReport();

    } catch (error) {
      console.error('❌ Verification failed:', error);
    } finally {
      if (this.page) {
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Main execution
async function main() {
  const verifier = new InteractionVerificationMap();
  await verifier.runVerification();
}

// Run if called directly
main().catch(console.error);

export { InteractionVerificationMap };
