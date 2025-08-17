#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as yaml from 'js-yaml';

interface NarrationSegment {
  id: string;
  title: string;
  duration: number;
  narration: string;
  voice: string;
  emphasis: string;
}

interface NarrationConfig {
  voice_provider: string;
  voice_providers: {
    elevenlabs?: any;
    openai?: any;
    azure?: any;
    piper?: any;
  };
  segments: NarrationSegment[];
}

class MockNarrationGenerator {
  private outputDir: string;
  private audioDir: string;
  private config!: NarrationConfig;
  private configPath: string;

  constructor(configPath?: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    this.outputDir = path.join(__dirname, '..', 'output');
    this.audioDir = path.join(this.outputDir, 'audio');
    
    // Use provided config path or default to narration.yaml
    this.configPath = configPath || path.join(__dirname, '..', 'config', 'narration.yaml');
    
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
        voice_provider: rawConfig.metadata?.voice_provider || 'mock',
        voice_providers: rawConfig.voice_providers || {},
        segments: rawConfig.scenes || []
      };

      console.log(`📁 Configuration loaded from: ${this.configPath}`);
      console.log(`🎙️ Voice provider: ${this.config.voice_provider} (mock mode)`);
      console.log(`📊 Found ${this.config.segments.length} narration segments`);
      
    } catch (error) {
      console.error('❌ Error loading configuration:', error);
      throw error;
    }
  }

  private createMockAudioFile(segmentId: string, duration: number): string {
    const filename = `${segmentId}_narration.wav`;
    const filepath = path.join(this.audioDir, filename);
    
    // Create a mock WAV file header (minimal valid WAV)
    const sampleRate = 44100;
    const channels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = channels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = Math.floor(duration * sampleRate * blockAlign);
    const fileSize = 36 + dataSize;
    
    // WAV file header
    const header = Buffer.alloc(44);
    
    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(fileSize, 4);
    header.write('WAVE', 8);
    
    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // fmt chunk size
    header.writeUInt16LE(1, 20); // audio format (PCM)
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    
    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);
    
    // Create mock audio data (silence)
    const audioData = Buffer.alloc(dataSize);
    
    // Combine header and audio data
    const wavFile = Buffer.concat([header, audioData]);
    
    // Write the file
    fs.writeFileSync(filepath, wavFile);
    
    return filepath;
  }

  async generateMockNarration(): Promise<void> {
    console.log('🎙️ Starting mock narration generation...');
    
    try {
      this.loadConfiguration();
      
      if (this.config.segments.length === 0) {
        console.log('⚠️ No narration segments found in configuration');
        return;
      }
      
      console.log(`🎬 Generating mock audio for ${this.config.segments.length} segments...`);
      
      for (const segment of this.config.segments) {
        console.log(`  📝 Processing: ${segment.title} (${segment.duration}s)`);
        
        // Create mock audio file
        const audioFile = this.createMockAudioFile(segment.id, segment.duration);
        console.log(`    ✅ Created: ${path.basename(audioFile)}`);
        
        // Create a transcript file for reference
        const transcriptFile = path.join(this.audioDir, `${segment.id}_transcript.txt`);
        const transcriptContent = `Title: ${segment.title}\nDuration: ${segment.duration}s\nNarration: ${segment.narration}\nEmphasis: ${segment.emphasis}`;
        fs.writeFileSync(transcriptFile, transcriptContent);
      }
      
      console.log('🎉 Mock narration generation completed successfully!');
      console.log(`📁 Audio files saved to: ${this.audioDir}`);
      console.log('💡 Note: These are placeholder audio files. For real audio, set ELEVEN_API_KEY and use the full narration generator.');
      
    } catch (error) {
      console.error('❌ Error during mock narration generation:', error);
      throw error;
    }
  }

  async generateNarrationSummary(): Promise<void> {
    const summaryFile = path.join(this.outputDir, 'mock_narration_summary.json');
    const summary = {
      generated_at: new Date().toISOString(),
      voice_provider: 'mock',
      total_segments: this.config.segments.length,
      segments: this.config.segments.map(segment => ({
        id: segment.id,
        title: segment.title,
        duration: segment.duration,
        audio_file: `${segment.id}_narration.wav`,
        transcript_file: `${segment.id}_transcript.txt`
      })),
      note: 'Mock audio files generated. Set ELEVEN_API_KEY for real TTS audio.'
    };
    
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`📋 Narration summary saved to: ${summaryFile}`);
  }
}

// Main execution
async function main() {
  try {
    const generator = new MockNarrationGenerator();
    await generator.generateMockNarration();
    await generator.generateNarrationSummary();
  } catch (error) {
    console.error('❌ Mock narration generation failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { MockNarrationGenerator };
