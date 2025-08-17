# Video Production Pipeline Data Flow

## Overview
The Disaster Response Dashboard video production pipeline is a multi-stage, data-driven system that transforms configuration files, web captures, and audio narration into a professional video output. The pipeline follows a linear workflow with parallel processing capabilities and comprehensive validation at each stage.

## Pipeline Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CONFIGURATION │    │   EXECUTION     │    │     OUTPUT      │
│     LAYER       │───▶│     LAYER       │───▶│     LAYER       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Data Flow Stages

### 1. Configuration Input Layer

#### **Primary Configuration Files**
- **`narration.yaml`**: Defines video content structure and audio requirements
- **`timeline-fixed.yaml`**: Specifies video timing, transitions, and asset mapping
- **`package.json`**: Defines dependencies and script execution paths

#### **Configuration Data Structure**
```yaml
# narration.yaml - Content Definition
metadata:
  title: "Disaster Response Dashboard Demo"
  duration: 117
  voice_provider: "elevenlabs"
  
scenes:
  - id: "intro"
    title: "Dashboard Overview"
    duration: 8
    narration: "When disasters hit..."
    voice: "alloy"
    emphasis: "disasters, mess, slow, lives, hours"

# timeline-fixed.yaml - Timing & Asset Mapping
timeline:
  duration: 420
  fps: 30
  resolution: [1920, 1080]
  tracks:
    video:
      - name: "A01_personal_intro"
        source: "captures/personal_intro.webm"
        start: 0
        duration: 15
        transitions: { in: fade, out: fade }
```

### 2. Pipeline Execution Layer

#### **Stage 1: Configuration Validation**
```
Configuration Files → YAML/JSON Parser → Validation Engine → Validated Config
```

**Data Processing**:
- Load YAML configuration files
- Parse and validate data structures
- Check file dependencies and paths
- Generate validation reports

#### **Stage 2: Enhanced Capture Generation**
```
Timeline Config → Playwright Browser → Web Page Generation → Video Captures
```

**Data Flow**:
1. **Input**: Timeline configuration with scene definitions
2. **Processing**: 
   - Launch Chromium browser instance
   - Generate HTML content for each scene
   - Apply CSS styling and animations
   - Capture video segments using Playwright
3. **Output**: `.webm` video files in `captures/` directory

**Key Components**:
- `EnhancedCaptureGenerator` class
- Playwright browser automation
- HTML/CSS scene generation
- Video capture timing synchronization

#### **Stage 3: Narration Audio Generation**
```
Narration Config → Text Processing → TTS API → Audio Files
```

**Data Flow**:
1. **Input**: Scene narration text from `narration.yaml`
2. **Processing**:
   - Extract text segments and timing
   - Configure voice parameters (stability, similarity_boost)
   - Send to ElevenLabs TTS API
   - Process audio response
3. **Output**: `.wav` audio files in `output/audio/` directory

**Key Components**:
- `NarrationGenerator` class
- ElevenLabs API integration
- Audio file management
- Voice cloning support

#### **Stage 4: Video Assembly**
```
Video Captures + Audio + Timeline → FFmpeg → Final Video
```

**Data Flow**:
1. **Input**: 
   - Video capture files
   - Audio narration files
   - Timeline configuration
2. **Processing**:
   - Create video segment list
   - Apply transitions and effects
   - Synchronize audio with video
   - Concatenate segments using FFmpeg
3. **Output**: Final `.mp4` video in `output/` directory

**Key Components**:
- `VideoAssembler` class
- FFmpeg command generation
- Video concatenation
- Quality optimization

### 3. Data Transformation Pipeline

#### **Raw Data → Processed Assets**
```
Configuration YAML → Parsed Objects → Generated Content → Final Assets
```

**Transformation Steps**:
1. **YAML Parsing**: Convert configuration to TypeScript interfaces
2. **Content Generation**: Create HTML, CSS, and JavaScript for scenes
3. **Media Production**: Generate video captures and audio narration
4. **Asset Assembly**: Combine all media into final video

#### **Parallel Processing Capabilities**
```
┌─────────────────┐    ┌─────────────────┐
│  Video Capture │    │ Audio Narration │
│   Generation   │    │   Generation    │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌─────────────────┐
         │ Video Assembly  │
         │   & Export      │
         └─────────────────┘
```

### 4. Data Storage and Management

#### **Directory Structure**
```
video-production/
├── config/           # Configuration files (YAML, JSON)
├── captures/         # Generated video captures (.webm)
├── output/           # Final video output (.mp4)
│   └── audio/       # Generated audio files (.wav)
├── temp/             # Temporary processing files
└── scripts/          # Pipeline execution scripts
```

#### **File Naming Convention**
- **Captures**: `{scene_id}_{scene_name}.webm`
- **Audio**: `{scene_id}_narration.wav`
- **Output**: `final_enhanced_demo.mp4`

### 5. Data Validation and Quality Control

#### **Validation Checkpoints**
1. **Configuration Validation**: YAML syntax, required fields, file paths
2. **Asset Generation**: Video capture quality, audio clarity
3. **Assembly Validation**: File existence, timing synchronization
4. **Output Validation**: Final video quality, duration accuracy

#### **Error Handling**
- Graceful degradation for missing assets
- Detailed error logging and reporting
- Fallback mechanisms for failed components
- Validation summaries for quality assurance

## Data Flow Summary

### **Input → Processing → Output Flow**
```
Configuration Files → Pipeline Engine → Media Assets → Final Video
     (YAML/JSON)         (TypeScript)     (WebM/WAV)     (MP4)
```

### **Key Data Transformations**
1. **Text → Audio**: Narration text converted to speech via TTS API
2. **HTML → Video**: Web page content captured as video segments
3. **Timeline → Assembly**: Configuration-driven video concatenation
4. **Assets → Output**: Multiple media files combined into final video

### **Data Dependencies**
- **Configuration Files**: Required for all pipeline stages
- **Environment Variables**: API keys for external services
- **External APIs**: ElevenLabs for text-to-speech
- **System Tools**: FFmpeg for video processing, Playwright for captures

### **Performance Characteristics**
- **Parallel Processing**: Video and audio generation can run simultaneously
- **Incremental Processing**: Individual stages can be run independently
- **Caching**: Generated assets are preserved between runs
- **Scalability**: Modular design allows for component-level optimization

## Pipeline Execution Modes

### **Full Pipeline**
```
validate → captures → narration → assembly → output
```

### **Component-Level Execution**
- `--validate`: Configuration validation only
- `--captures`: Video capture generation only
- `--narration`: Audio narration generation only
- `--full`: Complete pipeline execution

This data flow architecture ensures reliable, scalable video production with comprehensive validation and quality control at each stage.
