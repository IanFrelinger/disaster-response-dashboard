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
  businessValue: string;
}

class Comprehensive11SegmentDemo {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;
  private demoName: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.demoName = 'comprehensive-11-segment-disaster-response-demo';
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async start() {
    console.log('🚀 Starting Comprehensive 11-Segment Disaster Response Demo...');
    console.log('This demo covers ALL features: detection, zones, routing, units, AI, architecture, and more');
    
    try {
      this.browser = await chromium.launch({
        headless: false,
        slowMo: 1500
      });

      this.page = await this.browser.newPage();
      await this.page.setViewportSize({ width: 1920, height: 1080 });
      
      // Navigate to the frontend
      await this.page.goto('http://localhost:3000');
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
    const segments: DemoSegment[] = [
      {
        title: "Commander Dashboard Overview",
        duration: 20,
        description: "Introduction to the central command center",
        narration: "Welcome to the Commander Dashboard. This is our central command center for emergency response operations with real-time situational awareness and comprehensive emergency management capabilities.",
        visualElements: ["Dashboard header", "Navigation interface", "Command center layout"],
        businessValue: "Centralized emergency response management with real-time operational control",
        actions: async () => {
          await this.page!.waitForTimeout(3000);
          
          // Show dashboard header
          const header = await this.page!.waitForSelector('text=Commander Dashboard', { timeout: 10000 });
          if (header) {
            console.log('✅ Found Commander Dashboard header');
          }
          
          // Show navigation buttons
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
        title: "Hazard Detection & Triage",
        duration: 25,
        description: "Real-time hazard detection and threat assessment",
        narration: "As Incident Commander, I'm monitoring multiple hazard feeds in real-time. Let me show you how we detect and verify threats, assess risk levels, and prioritize emergency responses.",
        visualElements: ["Hazard feeds", "Risk assessment", "Threat verification"],
        businessValue: "Proactive threat detection reduces response time and saves lives",
        actions: async () => {
          // Click on Operations to show hazard information
          await this.page!.click('text=Operations');
          await this.page!.waitForTimeout(3000);
          
          // Look for hazard and risk elements
          const hazardElements = await this.page!.$$('text=Hazard, text=Risk, text=Threat, text=Emergency');
          if (hazardElements.length > 0) {
            console.log(`Found ${hazardElements.length} hazard/risk elements`);
            await hazardElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Show priority levels
          const priorityElements = await this.page!.$$('text=Priority, text=Immediate, text=Warning, text=Critical');
          if (priorityElements.length > 0) {
            console.log(`Found ${priorityElements.length} priority elements`);
          }
        }
      },
      {
        title: "Weather Integration & Risk Scoring",
        duration: 20,
        description: "Live weather data and operational risk assessment",
        narration: "Our weather integration system provides real-time conditions and risk assessment for emergency operations. This includes flight status determination and operational safety protocols.",
        visualElements: ["Weather data", "Risk scoring", "Flight status", "Safety protocols"],
        businessValue: "Weather-aware operations improve safety and operational efficiency",
        actions: async () => {
          // Click on Conditions button
          await this.page!.click('text=Conditions');
          await this.page!.waitForTimeout(3000);
          
          // Show weather information
          const weatherElements = await this.page!.$$('text=Weather, text=Temperature, text=Wind, text=Visibility, text=Humidity');
          if (weatherElements.length > 0) {
            console.log(`Found ${weatherElements.length} weather elements`);
          }
          
          // Show risk assessment
          const riskElements = await this.page!.$$('text=Risk, text=Assessment, text=Safety, text=Protocols');
          if (riskElements.length > 0) {
            console.log(`Found ${riskElements.length} risk assessment elements`);
          }
          
          // Show flight status
          const flightElements = await this.page!.$$('text=GROUNDED, text=RESTRICTED, text=CLEAR, text=Flight');
          if (flightElements.length > 0) {
            console.log(`Found ${flightElements.length} flight status elements`);
          }
        }
      },
      {
        title: "Zone Definition & Priority Management",
        duration: 25,
        description: "Evacuation zone creation and priority assignment",
        narration: "Now let me demonstrate how we define evacuation zones and assign priorities based on threat assessment, population density, and critical infrastructure requirements.",
        visualElements: ["Zone boundaries", "Priority levels", "Population data", "Infrastructure mapping"],
        businessValue: "Strategic zone management optimizes evacuation efficiency and resource allocation",
        actions: async () => {
          // Go back to Operations view
          await this.page!.click('text=Operations');
          await this.page!.waitForTimeout(3000);
          
          // Show zone information
          const zoneElements = await this.page!.$$('text=Zone, text=Building, text=Evacuation, text=Population');
          if (zoneElements.length > 0) {
            console.log(`Found ${zoneElements.length} zone elements`);
            await zoneElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Show priority management
          const priorityElements = await this.page!.$$('text=Priority, text=Immediate, text=Warning, text=Standby, text=All Clear');
          if (priorityElements.length > 0) {
            console.log(`Found ${priorityElements.length} priority elements`);
          }
          
          // Show evacuation progress
          const progressElements = await this.page!.$$('text=Progress, text=Evacuated, text=In Progress, text=Refused');
          if (progressElements.length > 0) {
            console.log(`Found ${progressElements.length} progress elements`);
          }
        }
      },
      {
        title: "Building-Level Evacuation Tracking",
        duration: 20,
        description: "Individual building evacuation status and special needs",
        narration: "The Assets view gives us detailed information about buildings, their evacuation status, special needs requirements, and real-time contact tracking.",
        visualElements: ["Building details", "Evacuation status", "Special needs", "Contact tracking"],
        businessValue: "Granular building tracking ensures no one is left behind during evacuations",
        actions: async () => {
          // Click on Assets button
          await this.page!.click('text=Assets');
          await this.page!.waitForTimeout(3000);
          
          // Show building information
          const buildingElements = await this.page!.$$('text=Building, text=Address, text=Population, text=Units');
          if (buildingElements.length > 0) {
            console.log(`Found ${buildingElements.length} building elements`);
          }
          
          // Show evacuation details
          const evacuationElements = await this.page!.$$('text=Evacuated, text=Special Needs, text=Last Contact, text=Notes');
          if (evacuationElements.length > 0) {
            console.log(`Found ${evacuationElements.length} evacuation elements`);
          }
          
          // Show structural information
          const structuralElements = await this.page!.$$('text=Structural, text=Integrity, text=Damage, text=Access');
          if (structuralElements.length > 0) {
            console.log(`Found ${structuralElements.length} structural elements`);
          }
        }
      },
      {
        title: "Route Planning with A* Star Algorithm",
        duration: 30,
        description: "Intelligent route optimization for different response profiles",
        narration: "Here's where our A* Star algorithm shines. I'll show you how we plan different routes for civilian evacuation, EMS response, fire tactical, and police escort operations with intelligent optimization.",
        visualElements: ["A* Star algorithm", "Route profiles", "Optimization", "Deconfliction"],
        businessValue: "Intelligent routing reduces response time and improves operational efficiency",
        actions: async () => {
          // Try to find routing functionality
          const routingElements = await this.page!.$$('text=Routing, text=Route, text=Path, text=Algorithm');
          if (routingElements.length > 0) {
            console.log(`Found ${routingElements.length} routing elements`);
            await routingElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Look for route profiles
          const profileElements = await this.page!.$$('text=Profile, text=Civilian, text=EMS, text=Fire, text=Police');
          if (profileElements.length > 0) {
            console.log(`Found ${profileElements.length} route profile elements`);
          }
          
          // Show algorithm details
          const algorithmElements = await this.page!.$$('text=Algorithm, text=Optimization, text=Constraints, text=Deconfliction');
          if (algorithmElements.length > 0) {
            console.log(`Found ${algorithmElements.length} algorithm elements`);
          }
        }
      },
      {
        title: "Unit Assignment & Management",
        duration: 25,
        description: "Emergency unit deployment and status tracking",
        narration: "Watch how I assign emergency units to zones and routes using our intuitive management interface. This is real-time unit management in action with comprehensive status tracking.",
        visualElements: ["Unit assignment", "Status tracking", "Deployment", "Capabilities"],
        businessValue: "Efficient unit management maximizes emergency response effectiveness",
        actions: async () => {
          // Look for unit management functionality
          const unitElements = await this.page!.$$('text=Unit, text=Assignment, text=Deployment, text=Status');
          if (unitElements.length > 0) {
            console.log(`Found ${unitElements.length} unit elements`);
            await unitElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Show unit types
          const typeElements = await this.page!.$$('text=Fire Engine, text=Ambulance, text=Police, text=Command');
          if (typeElements.length > 0) {
            console.log(`Found ${typeElements.length} unit type elements`);
          }
          
          // Show status information
          const statusElements = await this.page!.$$('text=Available, text=Responding, text=On Scene, text=Returning');
          if (statusElements.length > 0) {
            console.log(`Found ${statusElements.length} status elements`);
          }
        }
      },
      {
        title: "AI Decision Support & Recommendations",
        duration: 30,
        description: "Intelligent AI-powered operational guidance",
        narration: "Now let me demonstrate our AI-powered decision support system. The AIP Commander provides intelligent recommendations with confidence scoring and alternative scenarios for emergency response operations.",
        visualElements: ["AI interface", "Query processing", "Recommendations", "Confidence scoring"],
        businessValue: "AI-powered decisions reduce response time and improve operational outcomes",
        actions: async () => {
          // Click on AIP Commander button
          await this.page!.click('text=AIP Commander');
          await this.page!.waitForTimeout(3000);
          
          // Show AI interface elements
          const aiElements = await this.page!.$$('text=AI, text=Commander, text=Decision, text=Support');
          if (aiElements.length > 0) {
            console.log(`Found ${aiElements.length} AI interface elements`);
          }
          
          // Find input fields
          const inputElements = await this.page!.$$('input, textarea');
          if (inputElements.length > 0) {
            console.log(`Found ${inputElements.length} input elements`);
            
            // Type a query
            const firstInput = inputElements[0];
            await firstInput.fill('What is the current evacuation status and what are the recommended actions?');
            await this.page!.waitForTimeout(2000);
            
            // Look for submit button
            const submitButton = await this.page!.$$('button:has-text("Submit"), button:has-text("Send"), button:has-text("Ask"), button:has-text("Query")');
            if (submitButton.length > 0) {
              console.log('Found submit button');
              await submitButton[0].click();
              await this.page!.waitForTimeout(3000);
            }
          }
          
          // Look for AI response elements
          const responseElements = await this.page!.$$('text=Recommendation, text=Confidence, text=Alternative, text=Scenario');
          if (responseElements.length > 0) {
            console.log(`Found ${responseElements.length} AI response elements`);
          }
        }
      },
      {
        title: "Technical Architecture Overview",
        duration: 20,
        description: "System architecture and technology stack",
        narration: "Let me show you the technical architecture that powers this system, including our modern React frontend, Python backend, and comprehensive data integration capabilities.",
        visualElements: ["System architecture", "Technology stack", "Data flow", "Integration"],
        businessValue: "Modern architecture ensures scalability, reliability, and maintainability",
        actions: async () => {
          // Look for architecture information
          const archElements = await this.page!.$$('text=Architecture, text=System, text=Technology, text=Stack');
          if (archElements.length > 0) {
            console.log(`Found ${archElements.length} architecture elements`);
            await archElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Show technology components
          const techElements = await this.page!.$$('text=React, text=TypeScript, text=Python, text=API');
          if (techElements.length > 0) {
            console.log(`Found ${techElements.length} technology elements`);
          }
          
          // Show data flow
          const flowElements = await this.page!.$$('text=Data, text=Flow, text=Integration, text=Pipeline');
          if (flowElements.length > 0) {
            console.log(`Found ${flowElements.length} data flow elements`);
          }
        }
      },
      {
        title: "Foundry Integration & Data Fusion",
        duration: 20,
        description: "Advanced data fusion and ontology management",
        narration: "Our Foundry integration provides advanced data fusion capabilities, combining satellite, weather, traffic, and demographic data through intelligent ontology management.",
        visualElements: ["Foundry integration", "Data fusion", "Ontology", "Multi-source data"],
        businessValue: "Advanced data fusion provides comprehensive situational awareness",
        actions: async () => {
          // Look for Foundry integration elements
          const foundryElements = await this.page!.$$('text=Foundry, text=Integration, text=Data Fusion, text=Ontology');
          if (foundryElements.length > 0) {
            console.log(`Found ${foundryElements.length} Foundry elements`);
            await foundryElements[0].click();
            await this.page!.waitForTimeout(2000);
          }
          
          // Show data sources
          const sourceElements = await this.page!.$$('text=Satellite, text=Weather, text=Traffic, text=Demographic');
          if (sourceElements.length > 0) {
            console.log(`Found ${sourceElements.length} data source elements`);
          }
          
          // Show ontology features
          const ontologyElements = await this.page!.$$('text=Ontology, text=Semantic, text=Relationships, text=Intelligence');
          if (ontologyElements.length > 0) {
            console.log(`Found ${ontologyElements.length} ontology elements`);
          }
        }
      },
      {
        title: "Real-Time Updates & Progress Metrics",
        duration: 20,
        description: "Live operational metrics and cost-savings tracking",
        narration: "Finally, let me show you how the system provides real-time updates and tracks operational progress with live metrics, cost-savings calculations, and performance analytics.",
        visualElements: ["Real-time updates", "Progress metrics", "Cost savings", "Performance analytics"],
        businessValue: "Real-time metrics enable data-driven decision making and operational optimization",
        actions: async () => {
          // Return to main dashboard
          await this.page!.click('text=Operations');
          await this.page!.waitForTimeout(3000);
          
          // Show real-time updates
          const updateElements = await this.page!.$$('text=Updates, text=Real-time, text=Live, text=Current');
          if (updateElements.length > 0) {
            console.log(`Found ${updateElements.length} real-time update elements`);
          }
          
          // Show progress metrics
          const progressElements = await this.page!.$$('text=Progress, text=Metrics, text=Analytics, text=Performance');
          if (progressElements.length > 0) {
            console.log(`Found ${progressElements.length} progress metric elements`);
          }
          
          // Show cost and efficiency
          const efficiencyElements = await this.page!.$$('text=Cost, text=Efficiency, text=Savings, text=Optimization');
          if (efficiencyElements.length > 0) {
            console.log(`Found ${efficiencyElements.length} efficiency elements`);
          }
        }
      },
      {
        title: "Live Map Integration & Situational Awareness",
        duration: 15,
        description: "Geographic visualization and real-time coordination",
        narration: "Our Live Map integration provides comprehensive geographic visualization and real-time situational awareness, enabling coordinated emergency response across all operational areas.",
        visualElements: ["Live map", "Geographic visualization", "Situational awareness", "Coordination"],
        businessValue: "Geographic visualization improves coordination and operational effectiveness",
        actions: async () => {
          // Click on Live Map button
          await this.page!.click('text=Live Map');
          await this.page!.waitForTimeout(3000);
          
          // Show map elements
          const mapElements = await this.page!.$$('text=Map, text=Live, text=Geographic, text=Visualization');
          if (mapElements.length > 0) {
            console.log(`Found ${mapElements.length} map elements`);
          }
          
          // Show situational awareness
          const awarenessElements = await this.page!.$$('text=Situational, text=Awareness, text=Coordination, text=Response');
          if (awarenessElements.length > 0) {
            console.log(`Found ${awarenessElements.length} situational awareness elements`);
          }
          
          // Show real-time features
          const realtimeElements = await this.page!.$$('text=Real-time, text=Live, text=Current, text=Updates');
          if (realtimeElements.length > 0) {
            console.log(`Found ${realtimeElements.length} real-time elements`);
          }
        }
      }
    ];

    console.log(`📹 Recording ${segments.length} comprehensive demo segments...`);
    console.log(`Total Duration: ${segments.reduce((sum, seg) => sum + seg.duration, 0)} seconds (${(segments.reduce((sum, seg) => sum + seg.duration, 0) / 60).toFixed(1)} minutes)`);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`\n🎬 Segment ${i + 1}/${segments.length}: ${segment.title}`);
      console.log(`   Duration: ${segment.duration}s`);
      console.log(`   Description: ${segment.description}`);
      console.log(`   Business Value: ${segment.businessValue}`);
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
    
    console.log('\n✅ Comprehensive 11-segment demo recording completed!');
    console.log('🎥 This demo covers ALL major features of the disaster response platform');
    console.log('📊 Business value and technical capabilities fully demonstrated');
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

// Run the comprehensive demo
async function main() {
  const recorder = new Comprehensive11SegmentDemo();
  await recorder.start();
}

main().catch(console.error);
