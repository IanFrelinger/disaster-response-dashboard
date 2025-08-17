#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface Scene {
  id: string;
  title: string;
  duration: number;
  narration: string;
  emphasis: string[];
}

class BasicHTMLCaptureGenerator {
  private capturesDir: string;
  private scenes: Scene[];

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.capturesDir = path.join(__dirname, '..', 'captures');
    this.ensureCapturesDirectory();
    
    this.scenes = [
      {
        id: "intro",
        title: "Dashboard Overview",
        duration: 8,
        narration: "When disasters hit, emergency managers are stuck dealing with a mess of disconnected systems and slow responses. Every minute wasted puts lives at risk. The old way takes hours to get organized - but we don't have hours to spare.",
        emphasis: ["disasters", "mess", "slow", "lives", "hours"]
      },
      {
        id: "map",
        title: "Multi-Hazard Map",
        duration: 10,
        narration: "We've built one dashboard that brings everyone together - emergency commanders, first responders, and agencies all working from the same page. You can see every threat as it happens. Our map pulls together wildfire, flood, earthquake, and weather data in real-time.",
        emphasis: ["one", "together", "same", "threat", "pulls"]
      },
      {
        id: "route",
        title: "Evacuation Routes",
        duration: 12,
        narration: "Get safe evacuation routes with just one click. Our AI looks at the terrain, checks for hazards, and monitors traffic to find the safest way out. The routes keep updating as things change - what was safe ten minutes ago might be dangerous now.",
        emphasis: ["safe", "AI", "looks", "updating", "dangerous"]
      },
      {
        id: "3d-terrain",
        title: "3D Terrain View",
        duration: 10,
        narration: "3D terrain view shows you the lay of the land like never before. You can see elevation changes, flood zones, and escape routes that flat maps just can't show. Navigate tricky landscapes with confidence, knowing every hill and obstacle.",
        emphasis: ["3D", "lay", "never", "tricky", "confidence"]
      },
      {
        id: "evacuation",
        title: "Evacuation Management",
        duration: 12,
        narration: "Managing mass evacuations doesn't have to be chaos. Our dashboard keeps track of every vehicle, person, and resource as it moves. Coordinate thousands of people through safe zones while keeping your finger on the pulse of the situation.",
        emphasis: ["chaos", "keeps", "thousands", "safe", "pulse"]
      },
      {
        id: "ai",
        title: "AI Decision Support",
        duration: 15,
        narration: "AI spots patterns and gives you real-time advice when you need it most. Make smart decisions even under pressure. Our system learns from every incident, constantly getting better at response strategies and figuring out where to put resources.",
        emphasis: ["spots", "advice", "smart", "learns", "better"]
      },
      {
        id: "weather",
        title: "Weather Integration",
        duration: 10,
        narration: "Real-time weather data from NOAA shows you what's coming, so you can stay ahead of the storm. We connect forecasts with evacuation planning and hazard assessment, so you're not just reacting - you're planning ahead.",
        emphasis: ["shows", "coming", "ahead", "connecting", "planning"]
      },
      {
        id: "tech",
        title: "Technical Deep Dive",
        duration: 10,
        narration: "Our platform leverages cutting-edge technology including real-time data streaming, machine learning algorithms, and advanced visualization. Built on Palantir Foundry, it provides enterprise-grade security and scalability for mission-critical operations.",
        emphasis: ["cutting-edge", "machine learning", "visualization", "Foundry", "enterprise"]
      },
      {
        id: "commander",
        title: "Commander View",
        duration: 8,
        narration: "Commanders get the big picture with key metrics and resource allocation at a glance. Monitor multiple incidents at once while keeping control of the whole operation. It's like having eyes everywhere without getting overwhelmed.",
        emphasis: ["big", "key", "once", "control", "everywhere"]
      },
      {
        id: "responder",
        title: "First Responder View",
        duration: 8,
        narration: "First responders get the details they need for immediate action - turn-by-turn directions, hazard alerts, and team status. Get what you need when every second counts, without drowning in unnecessary information.",
        emphasis: ["details", "immediate", "second", "drowning", "unnecessary"]
      },
      {
        id: "public",
        title: "Public Information",
        duration: 8,
        narration: "Keep people in the loop with real-time updates. Clear communication saves lives and keeps panic at bay. Give folks accurate, timely information through multiple channels so everyone stays safe and informed.",
        emphasis: ["loop", "saves", "panic", "accurate", "informed"]
      },
      {
        id: "conclusion",
        title: "Call to Action",
        duration: 6,
        narration: "Our system dramatically increases response throughput and allows for greater effectiveness of emergency responses. Transform your emergency management today. When minutes matter, every second you save could mean the difference between life and death.",
        emphasis: ["dramatically", "increases", "effectiveness", "transform", "difference"]
      }
    ];
  }

  private ensureCapturesDirectory(): void {
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
  }

  private generateHTMLForScene(scene: Scene): string {
    const emphasizedWords = scene.emphasis.map(word => `<span class="emphasis">${word}</span>`);
    let narrationWithEmphasis = scene.narration;
    
    // Replace emphasis words with highlighted versions
    scene.emphasis.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      narrationWithEmphasis = narrationWithEmphasis.replace(regex, `<span class="emphasis">${word}</span>`);
    });

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
            margin-bottom: 40px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            color: #ffd700;
        }
        .scene-narration {
            font-size: 1.8rem;
            line-height: 1.6;
            opacity: 0.95;
            max-width: 1000px;
            margin: 0 auto;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }
        .emphasis {
            color: #ffd700;
            font-weight: 600;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
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
    </style>
</head>
<body>
    <div class="scene-duration">${scene.duration}s</div>
    <div class="scene-id">${scene.id}</div>
    <div class="scene-container">
        <h1 class="scene-title">${scene.title}</h1>
        <p class="scene-narration">${narrationWithEmphasis}</p>
    </div>
</body>
</html>`;
  }

  async generateAllCaptures(): Promise<void> {
    console.log('🎬 Starting basic HTML capture generation...');
    
    for (const scene of this.scenes) {
      console.log(`📹 Generating ${scene.title} capture...`);
      
      const htmlContent = this.generateHTMLForScene(scene);
      const filePath = path.join(this.capturesDir, `${scene.id}.html`);
      
      fs.writeFileSync(filePath, htmlContent);
      console.log(`✅ ${scene.title} capture completed: ${filePath}`);
    }
    
    console.log('🎉 All basic HTML captures generated successfully!');
    console.log(`📁 Captures saved to: ${this.capturesDir}`);
  }
}

// Main execution
async function main() {
  const generator = new BasicHTMLCaptureGenerator();
  await generator.generateAllCaptures();
}

main().catch(console.error);
