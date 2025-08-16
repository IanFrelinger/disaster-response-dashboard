import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ExportConfig {
  projectName: string;
  outputDir: string;
  videoFile: string;
  audioDir: string;
  assetsDir: string;
  configDir: string;
}

class ResolveExporter {
  private config: ExportConfig;

  constructor() {
    this.config = {
      projectName: 'disaster-response-demo',
      outputDir: path.join(__dirname, '..', 'resolve-export'),
      videoFile: path.join(__dirname, '..', 'output', 'proper-demo-video-final.mp4'),
      audioDir: path.join(__dirname, '..', 'audio'),
      assetsDir: path.join(__dirname, '..', 'assets'),
      configDir: path.join(__dirname, '..')
    };
  }

  async exportForResolve() {
    console.log('🎬 Exporting project for DaVinci Resolve...');
    
    // Create export directory
    this.ensureExportDir();
    
    // Export video
    await this.exportVideo();
    
    // Export audio
    await this.exportAudio();
    
    // Export graphics
    await this.exportGraphics();
    
    // Export project files
    await this.exportProjectFiles();
    
    // Create import guide
    await this.createImportGuide();
    
    console.log('✅ Export completed successfully!');
    console.log(`📁 Export location: ${this.config.outputDir}`);
  }

  private ensureExportDir() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
    
    // Create subdirectories
    const subdirs = ['video', 'audio', 'graphics', 'project-files'];
    subdirs.forEach(dir => {
      const dirPath = path.join(this.config.outputDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  private async exportVideo() {
    console.log('📹 Exporting video...');
    
    if (!fs.existsSync(this.config.videoFile)) {
      console.error(`❌ Video file not found: ${this.config.videoFile}`);
      return;
    }
    
    const destPath = path.join(this.config.outputDir, 'video', 'final.mp4');
    fs.copyFileSync(this.config.videoFile, destPath);
    
    const stats = fs.statSync(destPath);
    console.log(`✅ Video exported: ${destPath} (${(stats.size / 1024 / 1024).toFixed(1)}MB)`);
  }

  private async exportAudio() {
    console.log('🎵 Exporting audio files...');
    
    const audioFiles = fs.readdirSync(this.config.audioDir)
      .filter(file => file.endsWith('.wav') && file.startsWith('B'));
    
    let totalSize = 0;
    for (const file of audioFiles) {
      const srcPath = path.join(this.config.audioDir, file);
      const destPath = path.join(this.config.outputDir, 'audio', file);
      
      fs.copyFileSync(srcPath, destPath);
      const stats = fs.statSync(destPath);
      totalSize += stats.size;
      
      console.log(`✅ Audio exported: ${file} (${(stats.size / 1024).toFixed(0)}KB)`);
    }
    
    console.log(`📊 Total audio size: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
  }

  private async exportGraphics() {
    console.log('🎨 Exporting graphics...');
    
    const graphicsDirs = ['art', 'diagrams', 'slides'];
    let exportedCount = 0;
    
    for (const dir of graphicsDirs) {
      const srcDir = path.join(this.config.assetsDir, dir);
      const destDir = path.join(this.config.outputDir, 'graphics', dir);
      
      if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        const files = fs.readdirSync(srcDir);
        for (const file of files) {
          const srcPath = path.join(srcDir, file);
          const destPath = path.join(destDir, file);
          
          fs.copyFileSync(srcPath, destPath);
          exportedCount++;
        }
      }
    }
    
    console.log(`✅ Graphics exported: ${exportedCount} files`);
  }

  private async exportProjectFiles() {
    console.log('📋 Exporting project files...');
    
    const projectFiles = [
      'record.config.json',
      'timeline.yaml',
      'tts-cue-sheet.json'
    ];
    
    for (const file of projectFiles) {
      const srcPath = path.join(this.config.configDir, file);
      const destPath = path.join(this.config.outputDir, 'project-files', file);
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Project file exported: ${file}`);
      }
    }
  }

  private async createImportGuide() {
    console.log('📖 Creating import guide...');
    
    const guide = `# DaVinci Resolve Import Guide

## Project Overview
- **Project Name**: Disaster Response Demo
- **Duration**: ~5:40 (340 seconds)
- **Resolution**: 1920×1080
- **Frame Rate**: 30 FPS

## Import Steps

### 1. Create New Project
- Open DaVinci Resolve
- Create new project: "Disaster Response Demo"
- Set timeline resolution to 1920×1080, 30 FPS

### 2. Import Media
- **Video**: Import 'video/final.mp4' to Media Pool
- **Audio**: Import all files from 'audio/' folder
- **Graphics**: Import all files from 'graphics/' folder

### 3. Timeline Setup
- Create new timeline: "Disaster Response Demo"
- Drag video to timeline
- Add audio tracks for each beat (B01_intro.wav through B10_conclusion.wav)

### 4. Audio Processing (Fairlight)
- Apply Dialogue Leveler (light settings)
- Apply Voice Isolation (≤ 30%)
- Set Loudness to –16 LUFS
- Add music track with side-chain duck (–6 to –9 dB under VO)

### 5. Graphics Integration
- Place lower-thirds and callouts from graphics folder
- Animate with 200–300 ms ease
- Position according to timeline.yaml specifications

### 6. Color Grading
- Apply small S-curve
- Slight saturation bump (105–110%)
- Optional neutral LUT

### 7. Export Settings
- Format: H.264
- Bitrate: 16–24 Mbps
- Keyframe distance: 60
- Resolution: 1920×1080

## File Structure
\`\`\`
resolve-export/
├── video/
│   └── final.mp4              # Main video file
├── audio/
│   ├── B01_intro.wav          # Beat 1 audio
│   ├── B02_roles.wav          # Beat 2 audio
│   ├── B03_api.wav            # Beat 3 audio
│   ├── B04_map.wav            # Beat 4 audio
│   ├── B05_zones.wav          # Beat 5 audio
│   ├── B06_route.wav          # Beat 6 audio
│   ├── B07_ai.wav             # Beat 7 audio
│   ├── B08_tech.wav           # Beat 8 audio
│   ├── B09_impact.wav         # Beat 9 audio
│   └── B10_conclusion.wav     # Beat 10 audio
├── graphics/
│   ├── art/
│   │   ├── intro.png          # Intro graphic
│   │   └── conclusion.png     # Conclusion graphic
│   ├── diagrams/
│   │   ├── api_data_flow.png  # API diagram
│   │   ├── operational_overview.png
│   │   └── route_concept_overlay.png
│   └── slides/
│       └── impact_value.png   # Impact slide
└── project-files/
    ├── record.config.json     # Beat configuration
    ├── timeline.yaml          # Timeline specification
    └── tts-cue-sheet.json     # Narration scripts
\`\`\`

## Timeline Reference
- **B01_intro**: 0:00-0:30 (30s)
- **B02_roles**: 0:30-1:00 (30s)
- **B03_api**: 1:00-1:40 (40s)
- **B04_map**: 1:40-2:20 (40s)
- **B05_zones**: 2:20-3:00 (40s)
- **B06_route**: 3:00-3:40 (40s)
- **B07_ai**: 3:40-4:10 (30s)
- **B08_tech**: 4:10-4:50 (40s)
- **B09_impact**: 4:50-5:20 (30s)
- **B10_conclusion**: 5:20-5:40 (20s)

## Notes
- All audio files are professional TTS generated with ElevenLabs
- Graphics are placeholder files - replace with final assets
- Video contains real UI interactions, not static screenshots
- Timeline is designed for smooth transitions between beats

## Next Steps
1. Import all media into Resolve
2. Sync audio with video timeline
3. Add graphics and animations
4. Apply audio processing
5. Color grade
6. Export final video
`;

    const guidePath = path.join(this.config.outputDir, 'IMPORT_GUIDE.md');
    fs.writeFileSync(guidePath, guide);
    
    console.log(`✅ Import guide created: ${guidePath}`);
  }
}

// Run the export
const exporter = new ResolveExporter();
exporter.exportForResolve().catch(console.error);
