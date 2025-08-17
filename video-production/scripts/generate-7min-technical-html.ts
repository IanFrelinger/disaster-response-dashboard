#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface TechnicalScene {
  id: string;
  title: string;
  duration: number;
  description: string;
  technicalFocus: string;
}

class TechnicalHTMLGenerator {
  private capturesDir: string;
  private scenes: TechnicalScene[];

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.capturesDir = path.join(__dirname, '..', 'captures');
    this.ensureCapturesDirectory();
    
    this.scenes = [
      {
        id: "personal_intro",
        title: "Personal Introduction",
        duration: 20,
        description: "Personal context and mission statement for disaster response technology",
        technicalFocus: "Personal context and mission statement"
      },
      {
        id: "user_persona",
        title: "User Persona Definition",
        duration: 25,
        description: "Target users and their technical needs in emergency management",
        technicalFocus: "Target users and their technical needs"
      },
      {
        id: "foundry_architecture",
        title: "Foundry Architecture Deep Dive",
        duration: 60,
        description: "Technical architecture and data flow in Palantir Foundry",
        technicalFocus: "Technical architecture and data flow"
      },
      {
        id: "action_demonstration",
        title: "Platform Capabilities Overview",
        duration: 45,
        description: "Core platform features and capabilities demonstration",
        technicalFocus: "Core platform features and capabilities"
      },
      {
        id: "strong_cta",
        title: "AI Decision Support & Technical CTA",
        duration: 45,
        description: "Machine learning models and decision algorithms with strong call to action",
        technicalFocus: "Machine learning models and decision algorithms"
      }
    ];
  }

  private ensureCapturesDirectory(): void {
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
  }

  private generateHTMLForScene(scene: TechnicalScene): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${scene.title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            overflow: hidden;
        }
        .scene-container {
            text-align: center;
            max-width: 1200px;
            padding: 60px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .scene-title {
            font-size: 3.5rem;
            font-weight: 300;
            margin-bottom: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            color: #ffd700;
        }
        .scene-description {
            font-size: 1.6rem;
            line-height: 1.6;
            opacity: 0.95;
            max-width: 900px;
            margin: 0 auto 30px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }
        .technical-focus {
            font-size: 1.4rem;
            line-height: 1.5;
            opacity: 0.8;
            max-width: 800px;
            margin: 0 auto;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
            font-style: italic;
            color: #87ceeb;
        }
        .scene-duration {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.5);
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 1.2rem;
            color: #ffd700;
        }
        .scene-id {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.5);
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 1rem;
            color: #ccc;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .tech-badge {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 215, 0, 0.2);
            padding: 8px 16px;
            border-radius: 15px;
            font-size: 0.9rem;
            color: #ffd700;
            border: 1px solid rgba(255, 215, 0, 0.3);
        }
    </style>
</head>
<body>
    <div class="scene-duration">${scene.duration}s</div>
    <div class="scene-id">${scene.id}</div>
    <div class="scene-container">
        <h1 class="scene-title">${scene.title}</h1>
        <p class="scene-description">${scene.description}</p>
        <p class="technical-focus">${scene.technicalFocus}</p>
    </div>
    <div class="tech-badge">Technical Focus</div>
</body>
</html>`;
  }

  async generateAllTechnicalHTML(): Promise<void> {
    console.log('🎬 Starting technical HTML generation for 7-minute video...');
    
    for (const scene of this.scenes) {
      console.log(`📹 Generating ${scene.title} HTML...`);
      
      const htmlContent = this.generateHTMLForScene(scene);
      const filePath = path.join(this.capturesDir, `${scene.id}.html`);
      
      fs.writeFileSync(filePath, htmlContent);
      console.log(`✅ ${scene.title} HTML generated: ${filePath}`);
    }
    
    console.log('🎉 All technical HTML files generated successfully!');
    console.log(`📁 Files saved to: ${this.capturesDir}`);
  }
}

// Main execution
async function main() {
  const generator = new TechnicalHTMLGenerator();
  await generator.generateAllTechnicalHTML();
}

main().catch(console.error);
