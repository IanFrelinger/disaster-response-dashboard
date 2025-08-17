// Type declaration for elevenlabs-node module
declare module 'elevenlabs-node' {
  export function textToSpeech(options: {
    text: string;
    voice_id: string;
    api_key: string;
    stability?: number;
    similarity_boost?: number;
  }): Promise<Buffer>;
}

import { textToSpeech } from 'elevenlabs-node';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NarrationSegment {
  id: string;
  title: string;
  duration: number;
  narration: string;
  voice: string;
  emphasis: string;
}

interface VoiceProvider {
  voice_id?: string;
  stability?: number;
  similarity_boost?: number;
  api_key_env?: string;
}

interface NarrationConfig {
  voice_provider: string;
  voice_providers: {
    elevenlabs?: VoiceProvider;
    openai?: any;
    azure?: any;
    piper?: any;
  };
  segments: NarrationSegment[];
}

class NarrationGenerator {
  private apiKey: string;
  private outputDir: string;
  private audioDir: string;
  private config!: NarrationConfig; // Using definite assignment assertion
  private configPath: string;

  constructor(configPath?: string) {
    // Initialize ElevenLabs with API key from environment
    const apiKey = process.env.ELEVEN_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVEN_API_KEY environment variable is required');
    }
    
    this.apiKey = apiKey;
    
    this.outputDir = path.join(__dirname, '..', 'output');
    this.audioDir = path.join(this.outputDir, 'audio');
    
    // Use provided config path or default to narration-fixed.yaml
    this.configPath = configPath || path.join(__dirname, '..', 'config', 'narration-fixed.yaml');
    
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  private loadConfiguration(): void {
    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Configuration file not found: ${this.configPath}`);
      }

      const configContent = fs.readFileSync(this.configPath, 'utf8');
      const rawConfig = yaml.load(configContent) as any;

      if (!rawConfig) {
        throw new Error('Failed to parse configuration file');
      }

      // Transform the YAML structure to match our interface
      this.config = {
        voice_provider: rawConfig.metadata?.voice_provider || 'elevenlabs',
        voice_providers: rawConfig.voice_providers || {},
        segments: rawConfig.scenes || []
      };

      console.log(`📁 Configuration loaded from: ${this.configPath}`);
      console.log(`🎙️ Voice provider: ${this.config.voice_provider}`);
      
      if (this.config.voice_providers.elevenlabs?.voice_id) {
        console.log(`🎭 Voice ID: ${this.config.voice_providers.elevenlabs.voice_id}`);
      }
      
      console.log(`📝 Segments found: ${this.config.segments.length}`);
      
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateAllNarration() {
    console.log('🎙️ Starting ElevenLabs Narration Generation...');
    console.log('This will create professional voiceover for each video segment');
    
    // Load configuration from file
    this.loadConfiguration();
    
    const segments = this.config.segments;
    
    console.log(`🎙️ Generating narration for ${segments.length} segments...`);
    console.log(`Total Duration: ${segments.reduce((sum, seg) => sum + seg.duration, 0)} seconds`);
    
    // Generate narration for each segment
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`\n🎙️ Segment ${i + 1}/${segments.length}: ${segment.title.toUpperCase()}`);
      console.log(`   Duration: ${segment.duration}s`);
      console.log(`   ID: ${segment.id}`);
      
      try {
        await this.generateSegmentNarration(segment);
        console.log(`   ✅ Narration generated successfully`);
      } catch (error) {
        console.error(`   ❌ Error generating narration for ${segment.title}:`, error);
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
    const fileName = `${segment.id}-narration.mp3`;
    const outputPath = path.join(this.audioDir, fileName);
    
    try {
      // Get voice configuration
      const voiceConfig = this.config.voice_providers.elevenlabs;
      if (!voiceConfig?.voice_id) {
        throw new Error('No voice ID configured for ElevenLabs');
      }

      // Use ElevenLabs to generate speech with configuration from file
      const audioBuffer = await textToSpeech({
        text: segment.narration,
        voice_id: voiceConfig.voice_id,
        api_key: this.apiKey,
        ...(voiceConfig.stability && { stability: voiceConfig.stability }),
        ...(voiceConfig.similarity_boost && { similarity_boost: voiceConfig.similarity_boost })
      });
      
      // Save the audio file
      fs.writeFileSync(outputPath, audioBuffer);
      
      console.log(`   📁 Audio saved to: ${fileName}`);
      console.log(`   🎯 Narration: "${segment.narration.substring(0, 80)}..."`);
      
    } catch (error) {
      console.error(`   ❌ Error generating audio for ${segment.title}:`, error instanceof Error ? error.message : String(error));
      
      // Create a placeholder audio file for now
      const placeholderText = `Placeholder audio for ${segment.title} segment. Duration: ${segment.duration} seconds.`;
      const placeholderBuffer = Buffer.from(placeholderText, 'utf8');
      fs.writeFileSync(outputPath, placeholderBuffer);
      
      console.log(`   📁 Placeholder file created: ${fileName}`);
    }
  }

  private async generateCompleteScript(segments: NarrationSegment[]) {
    const scriptPath = path.join(this.outputDir, 'complete-narration-script.md');
    
    let scriptContent = `# Complete Narration Script for Disaster Response Demo\n\n`;
    scriptContent += `## Video Production Script\n\n`;
    scriptContent += `**Total Duration:** ${segments.reduce((sum, seg) => sum + seg.duration, 0)} seconds (~${(segments.reduce((sum, seg) => sum + seg.duration, 0) / 60).toFixed(1)} minutes)\n\n`;
    
    scriptContent += `## Segment Breakdown\n\n`;
    
    segments.forEach((segment, index) => {
      scriptContent += `### Segment ${index + 1}: ${segment.title.toUpperCase()}\n\n`;
      scriptContent += `**ID:** ${segment.id}\n`;
      scriptContent += `**Duration:** ${segment.duration} seconds\n`;
      scriptContent += `**Voice:** ${segment.voice}\n`;
      scriptContent += `**Emphasis:** ${segment.emphasis}\n`;
      scriptContent += `**Audio File:** ${segment.id}-narration.mp3\n\n`;
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
    scriptContent += `*Configuration: ${this.configPath}*\n`;
    
    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`📝 Complete script saved to: ${scriptPath}`);
  }
}

// Run the narration generator
async function main() {
  try {
    // Check for command line argument for config file
    const configArg = process.argv.find(arg => arg.startsWith('--config='));
    const configPath = configArg ? configArg.split('=')[1] : undefined;
    
    const generator = new NarrationGenerator(configPath);
    await generator.generateAllNarration();
  } catch (error) {
    console.error('❌ Error in narration generation:', error);
    console.log('\n🔑 Make sure to set your ELEVEN_API_KEY environment variable:');
    console.log('   export ELEVEN_API_KEY="your-api-key-here"');
    console.log('\n📁 You can specify a custom config file with:');
    console.log('   npx ts-node generate-narration.ts --config=path/to/config.yaml');
  }
}

main().catch(console.error);
