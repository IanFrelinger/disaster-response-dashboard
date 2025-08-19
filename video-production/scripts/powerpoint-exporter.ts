#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Import PptxGenJS for PowerPoint generation
import PptxGenJS from 'pptxgenjs';

// Palantir-style slide content
const SLIDE_CONTENT = {
  'Title & Persona': {
    title: 'Disaster Response Platform',
    subtitle: 'Technical Deep Dive',
    content: [
      "Hi, I'm Ian Frelinger, Disaster Response Platform Architect.",
      "I'm building this system through the lens of an Incident Commander and Operations Manager.",
      "This briefing covers how we transform disconnected data into coordinated emergency response."
    ]
  },
  'Problem & Outcomes': {
    title: 'Problem & Outcomes',
    content: [
      "Emergency managers face disconnected systems that slow response times.",
      "Our platform provides hazards + exposure + conditions in one unified view.",
      "This turns insight into clear assignments for faster decisions, safer access, and reliable status tracking."
    ]
  },
  'Data & Architecture': {
    title: 'Data & Architecture',
    content: [
      "Foundry ingests data from FIRMS, NOAA, 911, population, and traffic feeds.",
      "Backend: Python/Flask + Celery + WebSockets",
      "Frontend: React + Mapbox",
      "APIs: /api/hazards /api/risk /api/routes /api/units /api/evacuations /api/public_safety"
    ]
  },
  'Live Hazard Map': {
    title: 'Live Hazard Map',
    content: [
      "The Live Hazard Map serves as our operational canvas.",
      "Hazard cells are visible with real-time updates from satellite and ground sensors.",
      "Commanders can focus on specific areas and track changes as conditions evolve."
    ]
  },
  'Exposure & Conditions': {
    title: 'Exposure & Conditions',
    content: [
      "Buildings ON shows population exposure as a proxy for risk assessment.",
      "Weather ON displays current conditions that shape access and operations.",
      "This reveals who's affected and what shapes access in real-time."
    ]
  },
  'Incident Triage': {
    title: 'Incident Triage',
    content: [
      "Select an incident cell to begin the operational workflow.",
      "Confirm quick details: confidence, start time, and nearby population.",
      "This anchors the workflow and sets the context for all subsequent decisions."
    ]
  },
  'Resource Roster': {
    title: 'Resource Roster',
    content: [
      "Open Units to access the resource roster.",
      "Select Engine 21 from available units.",
      "Match capability to assignment based on incident requirements and unit status."
    ]
  },
  'Route Planning': {
    title: 'Route Planning',
    content: [
      "Switch to routing view for path planning.",
      "Set Start: Staging Area and End near incident.",
      "Configure Profile: FIRE_TACTICAL for emergency response routing."
    ]
  },
  'Route Result': {
    title: 'Route Result',
    content: [
      "Generate Route using the A-star algorithm with real-time constraints.",
      "View polyline, ETA, and distance for the optimal path.",
      "Ensure safe, predictable access that respects current conditions."
    ]
  },
  'Tasking': {
    title: 'Tasking',
    content: [
      "Assign to Route to create the operational tasking.",
      "This provides a defined task plus access plan for the unit.",
      "Now shift to the broader picture to monitor overall operations."
    ]
  },
  'AIP Guidance': {
    title: 'AIP Guidance',
    content: [
      "Access AIP Decision Support for AI-powered recommendations.",
      "Review recommendations + confidence levels for each decision point.",
      "Use this as a quick cross-check against operational experience."
    ]
  },
  'Ops Status & CTA': {
    title: 'Operations Status & Call to Action',
    content: [
      "Monitor Building Evacuation Tracker for real-time progress.",
      "Track evacuation status, unit positions, and emerging risks.",
      "Ready to invite personalized scenario for your specific use case."
    ]
  }
};

class PowerPointExporter {
  private pptx: PptxGenJS;
  private outputDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    // Load environment variables
    const configPath = path.join(__dirname, '..', 'config.env');
    if (fs.existsSync(configPath)) {
      dotenv.config({ path: configPath });
    }
    
    this.outputDir = path.join(__dirname, '..', 'output');
    this.ensureOutputDirectory();
    
    this.pptx = new PptxGenJS();
    this.setupPresentation();
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private setupPresentation(): void {
    // Set presentation properties
    this.pptx.author = 'Ian Frelinger';
    this.pptx.company = 'Disaster Response Platform';
    this.pptx.title = 'Disaster Response Dashboard - Technical Deep Dive';
    this.pptx.subject = 'Palantir Building Challenge Submission';
    
    // Set slide size to 16:9 aspect ratio
    this.pptx.layout = 'LAYOUT_16x9';
  }

  private createPalantirStyleSlide(slideData: any, slideNumber: number): void {
    const slide = this.pptx.addSlide();
    
    // Set background to dark theme
    slide.background = { color: '1E1E1E' };
    
    // Add title
    if (slideData.title) {
      slide.addText(slideData.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1.5,
        fontSize: 36,
        color: 'FFFFFF',
        bold: true,
        fontFace: 'Arial',
        align: 'center',
        valign: 'middle'
      });
    }
    
    // Add subtitle if exists
    if (slideData.subtitle) {
      slide.addText(slideData.subtitle, {
        x: 0.5,
        y: 2,
        w: 9,
        h: 0.8,
        fontSize: 24,
        color: '58A6FF',
        fontFace: 'Arial',
        align: 'center',
        valign: 'middle'
      });
    }
    
    // Add content
    if (slideData.content) {
      const contentY = slideData.subtitle ? 3 : 2.5;
      slideData.content.forEach((line: string, index: number) => {
        slide.addText(line, {
          x: 0.5,
          y: contentY + (index * 0.8),
          w: 9,
          h: 0.6,
          fontSize: 18,
          color: 'E6EDF3',
          fontFace: 'Arial',
          align: 'left',
          valign: 'middle',
          bullet: { type: 'number' }
        });
      });
    }
    
    // Add slide number
    slide.addText(`Slide ${slideNumber}`, {
      x: 8.5,
      y: 6.5,
      w: 1,
      h: 0.3,
      fontSize: 12,
      color: '666666',
      fontFace: 'Arial',
      align: 'right'
    });
  }

  public async generatePowerPoint(): Promise<void> {
    console.log('🎬 Generating Palantir-style PowerPoint presentation...');
    
    // Create slides
    Object.entries(SLIDE_CONTENT).forEach(([key, slideData], index) => {
      console.log(`📊 Creating slide: ${key}`);
      this.createPalantirStyleSlide(slideData, index + 1);
    });
    
    // Save the presentation
    const outputPath = path.join(this.outputDir, 'disaster-response-platform-deep-dive.pptx');
    await this.pptx.writeFile({ fileName: outputPath });
    
    console.log(`✅ PowerPoint presentation saved: ${outputPath}`);
    console.log(`📊 Total slides generated: ${Object.keys(SLIDE_CONTENT).length}`);
  }
}

// Main execution
async function main() {
  try {
    const exporter = new PowerPointExporter();
    await exporter.generatePowerPoint();
  } catch (error) {
    console.error('❌ Error generating PowerPoint:', error);
    process.exit(1);
  }
}

main();
