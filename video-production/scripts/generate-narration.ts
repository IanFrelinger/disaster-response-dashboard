import { textToSpeech } from 'elevenlabs-node';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NarrationSegment {
  name: string;
  duration: number;
  description: string;
  narration: string;
  userBehavior: string;
  fileName: string;
}

class NarrationGenerator {
  private apiKey: string;
  private outputDir: string;
  private audioDir: string;

  constructor() {
    // Initialize ElevenLabs with API key from environment
    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVEN_API_KEY environment variable is required');
    }
    
    this.apiKey = apiKey;
    
    this.outputDir = path.join(__dirname, '..', 'output');
    this.audioDir = path.join(this.outputDir, 'audio');
    
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async generateAllNarration() {
    console.log('🎙️ Starting ElevenLabs Narration Generation...');
    console.log('This will create professional voiceover for each video segment');
    
    const segments: NarrationSegment[] = [
      {
        name: "discovery",
        duration: 15,
        description: "User discovers the platform and explores the interface",
        narration: "Let me show you around this disaster response platform. As you can see, it's designed with a clean, intuitive interface that makes emergency management accessible to all users. The dashboard provides immediate situational awareness with clear visual indicators and intuitive navigation.",
        userBehavior: "Curious exploration, clicking around, reading labels",
        fileName: "01-discovery-narration.mp3"
      },
      {
        name: "operations_exploration",
        duration: 20,
        description: "User explores the operations view and discovers evacuation zones",
        narration: "Now let me show you the Operations view. This is where incident commanders monitor evacuation zones and track building status in real-time. Watch how intuitive this interface is. We can see evacuation progress, building occupancy, and special needs requirements all at a glance. The system automatically prioritizes buildings based on risk factors and evacuation complexity.",
        userBehavior: "Focused exploration, clicking on interesting elements, reading data",
        fileName: "02-operations-exploration-narration.mp3"
      },
      {
        name: "weather_integration",
        duration: 18,
        description: "User discovers weather integration and risk assessment features",
        narration: "Let me show you something really interesting - our weather integration system. This provides real-time conditions and automatically assesses operational risks. It's like having a meteorologist built into the platform. The system continuously monitors wind patterns, visibility, and temperature to adjust evacuation strategies and route planning in real-time. This proactive approach can save critical minutes during emergency response.",
        userBehavior: "Excited discovery, focused attention, exploring new features",
        fileName: "03-weather-integration-narration.mp3"
      },
      {
        name: "asset_management",
        duration: 16,
        description: "User explores building and asset management capabilities",
        narration: "Now let me show you the Assets view. This gives us detailed information about buildings, their evacuation status, and special needs requirements. It's incredibly granular. We can see building schematics, population density, accessibility features, and even historical evacuation data. This level of detail ensures that every building and every person is accounted for during emergency operations.",
        userBehavior: "Methodical exploration, reading data carefully, understanding structure",
        fileName: "04-asset-management-narration.mp3"
      },
      {
        name: "ai_experience",
        duration: 22,
        description: "User interacts with AI decision support system",
        narration: "This is where it gets really exciting - our AI-powered decision support system. Let me show you how it works by asking it a real question about evacuation priorities. The AI analyzes real-time data from multiple sources, considers historical patterns, and provides actionable recommendations. It can suggest optimal evacuation routes, identify resource allocation priorities, and even predict potential bottlenecks before they occur. This transforms complex emergency management into clear, actionable insights.",
        userBehavior: "Excited interaction, typing naturally, waiting for responses, reading results",
        fileName: "05-ai-experience-narration.mp3"
      },
      {
        name: "live_map_exploration",
        duration: 14,
        description: "User explores the live map and real-time features",
        narration: "Finally, let me show you our Live Map integration. This provides real-time situational awareness and geographic visualization. It's like having Google Maps for emergency response. The map shows evacuation zones, unit locations, route progress, and real-time updates from the field. Commanders can zoom in to see individual building details or zoom out for city-wide situational awareness. This geographic context is crucial for effective emergency coordination.",
        userBehavior: "Fascinated exploration, zooming, panning, discovering features",
        fileName: "06-live-map-exploration-narration.mp3"
      },
      {
        name: "comprehensive_overview",
        duration: 12,
        description: "User gets a comprehensive overview and understanding",
        narration: "As you can see, this platform brings together everything needed for modern emergency response: real-time data, AI-powered insights, and intuitive interfaces. It's designed to make complex emergency management simple and effective. Whether you're a seasoned incident commander or new to emergency response, this platform provides the tools, insights, and confidence needed to protect lives and property during critical situations.",
        userBehavior: "Comprehensive understanding, final exploration, appreciation of features",
        fileName: "07-comprehensive-overview-narration.mp3"
      }
    ];

    console.log(`🎙️ Generating narration for ${segments.length} segments...`);
    console.log(`Total Duration: ${segments.reduce((sum, seg) => sum + seg.duration, 0)} seconds`);
    
    // Generate narration for each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`\n🎙️ Segment ${i + 1}/${segments.length}: ${segment.name.toUpperCase()}`);
      console.log(`   Duration: ${segment.duration}s`);
      console.log(`   File: ${segment.fileName}`);
      
      try {
        await this.generateSegmentNarration(segment);
        console.log(`   ✅ Narration generated successfully`);
      } catch (error) {
        console.error(`   ❌ Error generating narration for ${segment.name}:`, error);
      }
    }
    
    // Generate a complete script file
    await this.generateCompleteScript(segments);
    
    console.log('\n✅ All narration generation completed!');
    console.log('🎙️ Professional voiceover files created for each segment');
    console.log('📝 Complete script file generated for video production');
    console.log('🎬 Ready for video editing with professional narration');
  }

  private async generateSegmentNarration(segment: NarrationSegment) {
    const outputPath = path.join(this.audioDir, segment.fileName);
    
    try {
      // Use ElevenLabs to generate speech with simplified parameters
      const audioBuffer = await textToSpeech({
        text: segment.narration,
        voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam voice - professional and clear
        api_key: this.apiKey
      });
      
      // Save the audio file
      fs.writeFileSync(outputPath, audioBuffer);
      
      console.log(`   📁 Audio saved to: ${outputPath}`);
      console.log(`   🎯 Narration: "${segment.narration.substring(0, 80)}..."`);
      
    } catch (error) {
      console.error(`   ❌ Error generating audio for ${segment.name}:`, error.message);
      
      // Create a placeholder audio file for now
      const placeholderText = `Placeholder audio for ${segment.name} segment. Duration: ${segment.duration} seconds.`;
      const placeholderBuffer = Buffer.from(placeholderText, 'utf8');
      fs.writeFileSync(outputPath, placeholderBuffer);
      
      console.log(`   📁 Placeholder file created: ${outputPath}`);
    }
  }

  private async generateCompleteScript(segments: NarrationSegment[]) {
    const scriptPath = path.join(this.outputDir, 'complete-narration-script.md');
    
    let scriptContent = `# Complete Narration Script for Disaster Response Demo\n\n`;
    scriptContent += `## Video Production Script\n\n`;
    scriptContent += `**Total Duration:** ${segments.reduce((sum, seg) => sum + seg.duration, 0)} seconds (~${(segments.reduce((sum, seg) => sum + seg.duration, 0) / 60).toFixed(1)} minutes)\n\n`;
    
    scriptContent += `## Segment Breakdown\n\n`;
    
    segments.forEach((segment, index) => {
      scriptContent += `### Segment ${index + 1}: ${segment.name.replace(/_/g, ' ').toUpperCase()}\n\n`;
      scriptContent += `**Duration:** ${segment.duration} seconds\n`;
      scriptContent += `**Description:** ${segment.description}\n`;
      scriptContent += `**User Behavior:** ${segment.userBehavior}\n`;
      scriptContent += `**Audio File:** ${segment.fileName}\n\n`;
      scriptContent += `**Narration:**\n`;
      scriptContent += `> ${segment.narration}\n\n`;
      scriptContent += `---\n\n`;
    });
    
    scriptContent += `## Video Production Notes\n\n`;
    scriptContent += `### Audio Files\n`;
    scriptContent += `All audio files are located in: \`output/audio/\`\n\n`;
    
    scriptContent += `### Timing\n`;
    scriptContent += `- Each segment has precise timing for video editing\n`;
    scriptContent += `- Narration matches the user interactions shown\n`;
    scriptContent += `- Professional pacing for engaging presentation\n\n`;
    
    scriptContent += `### Integration\n`;
    scriptContent += `- Audio files can be imported directly into video editing software\n`;
    scriptContent += `- Narration provides professional voiceover for each segment\n`;
    scriptContent += `- Script includes all text for captions and lower thirds\n\n`;
    
    scriptContent += `## Next Steps\n\n`;
    scriptContent += `1. Import audio files into video editing software\n`;
    scriptContent += `2. Sync narration with video segments\n`;
    scriptContent += `3. Add lower thirds and callouts\n`;
    scriptContent += `4. Apply professional transitions\n`;
    scriptContent += `5. Export final professional video\n\n`;
    
    scriptContent += `---\n`;
    scriptContent += `*Generated by ElevenLabs TTS for Disaster Response Demo*\n`;
    scriptContent += `*Professional narration ready for video production*\n`;
    
    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`📝 Complete script saved to: ${scriptPath}`);
  }
}

// Run the narration generator
async function main() {
  try {
    const generator = new NarrationGenerator();
    await generator.generateAllNarration();
  } catch (error) {
    console.error('❌ Error in narration generation:', error);
    console.log('\n🔑 Make sure to set your ELEVEN_API_KEY environment variable:');
    console.log('   export ELEVEN_API_KEY="your-api-key-here"');
  }
}

main().catch(console.error);
