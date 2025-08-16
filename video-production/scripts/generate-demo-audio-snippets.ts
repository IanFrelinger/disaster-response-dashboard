import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DemoSegment {
  name: string;
  duration: number;
  description: string;
  narration: string;
}

class DemoAudioGenerator {
  private outputDir: string;
  private audioDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    this.audioDir = path.join(__dirname, '..', 'audio', 'vo');
    
    // Ensure directories exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async generateDemoAudioSnippets() {
    console.log('🎤 Generating Demo Audio Snippets...');
    console.log('📹 Creating audio for the 5-minute demo video segments');
    
    const segments: DemoSegment[] = [
      {
        name: 'introduction',
        duration: 20,
        description: 'Introduction and problem context',
        narration: "Hi, I'm Ian Frelinger. Today I'll show you how our Disaster Response Dashboard unifies fragmented tools to save lives during emergencies."
      },
      {
        name: 'user_roles',
        duration: 20,
        description: 'User roles and needs',
        narration: "This dashboard serves Incident Commanders, planners, and dispatchers who need quick access to critical information to make life-saving decisions. Each role has different information needs but shares the same real-time situational awareness."
      },
      {
        name: 'technical_overview',
        duration: 30,
        description: 'Technical architecture overview',
        narration: "Our system ingests satellite data, 911 feeds, weather information, and population data. This flows through Foundry for data fusion, gets processed by our hazard detection algorithms, and is delivered through a real-time API to create the live hazard layer you see on the map."
      },
      {
        name: 'commander_dashboard',
        duration: 50,
        description: 'Commander Dashboard walkthrough',
        narration: "Let's start with the dashboard. Here we see our zones, their population, and evacuation status. Zone A is immediate response, Zone B is warning, and Zone C is standby. We can quickly see building counts, evacuation progress, and special needs residents."
      },
      {
        name: 'live_map_hazards',
        duration: 60,
        description: 'Live Map and hazard detection',
        narration: "Switching to the Live Map, we see real-time hazard clusters. We can toggle layers like Hazards, Routes, Units, and Evacuation Zones. Risk scoring combines intensity, population density, and weather conditions. Our A-Star routing algorithm chooses paths around hazards to ensure safe evacuation routes."
      },
      {
        name: 'ai_future_features',
        duration: 40,
        description: 'AI and future features',
        narration: "Our vision includes natural-language AI support. The AIP Commander will let you ask questions like 'What happens if we lose Highway 30?' and get instant recommendations. This AI analyzes real-time data, historical patterns, and operational constraints to provide intelligent suggestions while keeping the Incident Commander in control."
      },
      {
        name: 'impact_value',
        duration: 40,
        description: 'Impact and value proposition',
        narration: "This system delivers measurable benefits: faster decision-making reduces response time by 40%, shared situational awareness improves coordination by 60%, and automated data fusion saves 2-3 hours per incident. Most importantly, it keeps the Incident Commander in control while providing the tools needed to save lives."
      },
      {
        name: 'conclusion',
        duration: 20,
        description: 'Conclusion and call to action',
        narration: "In summary, this Disaster Response Dashboard addresses the critical need for unified emergency coordination. By combining real-time data fusion with an intuitive interface, we keep Incident Commanders in control while providing the tools they need to save lives. I'm excited to discuss pilot projects and explore how this technology can make a difference in your emergency response operations."
      }
    ];

    console.log(`🎤 Generating audio for ${segments.length} demo segments...`);
    
    const generatedFiles: string[] = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`🎬 Generating audio for segment ${i + 1}/${segments.length}: ${segment.name} (${segment.duration}s)`);
      
      try {
        const audioFile = await this.generateSegmentAudio(segment, i + 1);
        if (audioFile) {
          generatedFiles.push(audioFile);
          console.log(`✅ Audio generated: ${audioFile}`);
        }
      } catch (error) {
        console.error(`❌ Error generating audio for segment ${segment.name}:`, error);
      }
    }

    // Generate merged audio file
    if (generatedFiles.length > 0) {
      await this.mergeAudioFiles(generatedFiles);
    }

    // Generate narration script
    await this.generateNarrationScript(segments);
    
    console.log('✅ Demo audio snippets generation completed!');
    console.log(`🎤 Generated ${generatedFiles.length} audio files`);
    console.log('📁 Audio files saved to: audio/vo/');
    console.log('📝 Narration script saved to: output/demo-narration-script.md');
  }

  private async generateSegmentAudio(segment: DemoSegment, index: number): Promise<string | null> {
    const audioPath = path.join(this.audioDir, `demo-${segment.name}.wav`);
    const aiffPath = path.join(this.audioDir, `demo-${segment.name}.aiff`);
    
    try {
      console.log(`  🎤 Generating TTS for: ${segment.description}`);
      
      // Create temporary text file
      const tempTextFile = path.join(this.audioDir, `demo-${segment.name}.txt`);
      fs.writeFileSync(tempTextFile, segment.narration);
      
      // Use macOS say command for TTS
      const command = `say -v Daniel -r 175 -f "${tempTextFile}" -o "${aiffPath}"`;
      execSync(command, { stdio: 'pipe' });
      
      // Clean up temp file
      if (fs.existsSync(tempTextFile)) {
        fs.unlinkSync(tempTextFile);
      }
      
      if (fs.existsSync(aiffPath)) {
        console.log(`  ✅ TTS generated: ${aiffPath}`);
        
        // Convert AIFF to WAV using ffmpeg
        try {
          const convertCommand = `ffmpeg -i "${aiffPath}" -acodec pcm_s16le -ar 44100 "${audioPath}" -y`;
          execSync(convertCommand, { stdio: 'pipe' });
          
          // Clean up AIFF file
          if (fs.existsSync(aiffPath)) {
            fs.unlinkSync(aiffPath);
          }
          
          if (fs.existsSync(audioPath)) {
            console.log(`  ✅ Converted to WAV: ${audioPath}`);
            return audioPath;
          }
        } catch (convertError) {
          console.log(`  ⚠️  Could not convert to WAV, keeping AIFF: ${aiffPath}`);
          return aiffPath;
        }
        
        return aiffPath;
      } else {
        console.error(`  ❌ TTS file not created: ${aiffPath}`);
        return null;
      }
      
    } catch (error) {
      console.error(`  ❌ TTS generation failed: ${error}`);
      return null;
    }
  }

  private async mergeAudioFiles(audioFiles: string[]): Promise<void> {
    console.log('🔗 Merging audio files...');
    
    const mergedPath = path.join(this.audioDir, 'demo-voiceover-complete.wav');
    const fileListPath = path.join(this.audioDir, 'filelist.txt');
    
    try {
      // Create file list for ffmpeg
      const fileList = audioFiles.map(file => `file '${path.basename(file)}'`).join('\n');
      fs.writeFileSync(fileListPath, fileList);
      
      // Merge audio files
      const mergeCommand = `cd "${this.audioDir}" && ffmpeg -f concat -safe 0 -i "${path.basename(fileListPath)}" -c copy "${path.basename(mergedPath)}" -y`;
      execSync(mergeCommand, { stdio: 'pipe' });
      
      // Clean up file list
      if (fs.existsSync(fileListPath)) {
        fs.unlinkSync(fileListPath);
      }
      
      if (fs.existsSync(mergedPath)) {
        console.log(`✅ Merged audio created: ${mergedPath}`);
      }
      
    } catch (error) {
      console.error('❌ Error merging audio files:', error);
    }
  }

  private async generateNarrationScript(segments: DemoSegment[]): Promise<void> {
    console.log('📝 Generating narration script...');
    
    const scriptPath = path.join(this.outputDir, 'demo-narration-script.md');
    
    let script = `# Disaster Response Dashboard - Demo Narration Script

## Overview
This script contains the narration for the 5-minute demo video showcasing the Disaster Response Dashboard.

**Total Duration**: ${segments.reduce((total, seg) => total + seg.duration, 0)} seconds
**Total Segments**: ${segments.length}

---

`;

    segments.forEach((segment, index) => {
      script += `## Segment ${index + 1}: ${segment.description}

**Duration**: ${segment.duration} seconds  
**Audio File**: \`audio/vo/demo-${segment.name}.wav\`

### Narration Text
> "${segment.narration}"

### Timing
- **Start**: ${segments.slice(0, index).reduce((total, seg) => total + seg.duration, 0)}s
- **End**: ${segments.slice(0, index + 1).reduce((total, seg) => total + seg.duration, 0)}s

---

`;
    });

    script += `## Audio Files Generated

${segments.map(segment => `- \`demo-${segment.name}.wav\` (${segment.duration}s)`).join('\n')}

## Complete Audio
- \`demo-voiceover-complete.wav\` - Merged audio file

## Usage
These audio files can be used with video editing software to create the final demo video. Each segment corresponds to a specific part of the demo and should be synchronized with the visual content.

`;

    fs.writeFileSync(scriptPath, script);
    console.log(`✅ Narration script saved: ${scriptPath}`);
  }
}

// Run the audio generation
const generator = new DemoAudioGenerator();
generator.generateDemoAudioSnippets().catch(console.error);
