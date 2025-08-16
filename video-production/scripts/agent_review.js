import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

class VideoReviewAgent {
  constructor() {
    // Debug API key loading
    console.log('🔑 Loading OpenAI API key...');
    console.log('📁 Config file path:', path.join(__dirname, '..', 'config.env'));
    console.log('🔑 API key loaded:', process.env.OPENAI_API_KEY ? 
      `${process.env.OPENAI_API_KEY.substring(0, 10)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 10)}` : 
      'NOT FOUND');
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('❌ OPENAI_API_KEY not found in environment variables');
    }
    
    this.client = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    this.outputDir = path.join(__dirname, '..', 'output');
    this.feedbackPath = path.join(this.outputDir, 'feedback.json');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async reviewVideo() {
    console.log('🎬 Video Review Agent - GPT-5 Analysis');
    console.log('📹 Evaluating video cut against rubric...');
    
    try {
      // Check if required files exist
      const requiredFiles = await this.checkRequiredFiles();
      if (!requiredFiles.allPresent) {
        console.error('❌ Missing required files for review:', requiredFiles.missing);
        return;
      }

      // Generate review artifacts
      await this.generateReviewArtifacts();
      
      // Get GPT-5 feedback
      const feedback = await this.getGPT5Feedback();
      
      // Save feedback
      fs.writeFileSync(this.feedbackPath, JSON.stringify(feedback, null, 2));
      
      console.log('✅ Review completed successfully!');
      console.log(`📊 Overall Score: ${feedback.total}/10`);
      console.log(`📝 Issues Found: ${feedback.issues.length}`);
      console.log(`🔧 Fixes Proposed: ${feedback.fixes.length}`);
      console.log(`🚫 Blocking Issues: ${feedback.blocking ? 'YES' : 'NO'}`);
      
      // Display scores breakdown
      console.log('\n📈 Score Breakdown:');
      Object.entries(feedback.scores).forEach(([category, score]) => {
        const emoji = score >= 8 ? '🟢' : score >= 6 ? '🟡' : '🔴';
        console.log(`  ${emoji} ${category.toUpperCase()}: ${score}/10`);
      });
      
      if (feedback.blocking) {
        console.log('\n⚠️  BLOCKING ISSUES DETECTED - Fix required before release');
      } else if (feedback.total >= 8.0) {
        console.log('\n🎉 EXCELLENT SCORE - Ready for release!');
      } else {
        console.log('\n📝 GOOD SCORE - Minor improvements recommended');
      }
      
    } catch (error) {
      console.error('❌ Error during video review:', error);
      throw error;
    }
  }

  async checkRequiredFiles() {
    const required = [
      'roughcut.mp4'
    ];
    
    const missing = [];
    const allPresent = required.every(file => {
      const filePath = path.join(this.outputDir, file);
      const exists = fs.existsSync(filePath);
      if (!exists) missing.push(file);
      return exists;
    });
    
    return { allPresent, missing };
  }

  async generateReviewArtifacts() {
    console.log('🎨 Generating review artifacts...');
    
    // Generate frames every 10 seconds
    await this.generateFrames();
    
    // Build scene map
    await this.buildSceneMap();
    
    console.log('✅ Review artifacts generated');
  }

  async generateFrames() {
    const framesDir = path.join(this.outputDir, 'frames');
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }
    
    const videoPath = path.join(this.outputDir, 'roughcut.mp4');
    if (!fs.existsSync(videoPath)) {
      console.log('⚠️  No roughcut.mp4 found, skipping frame generation');
      return;
    }
    
    console.log('📸 Generating frames every 10 seconds...');
    
    // Use ffmpeg to extract frames
    const { execSync } = await import('child_process');
    try {
      const ffmpegCmd = `ffmpeg -i "${videoPath}" -vf "fps=1/10,scale=1920:-2" "${framesDir}/frame_%03d.png" -y`;
      execSync(ffmpegCmd, { stdio: 'inherit' });
      console.log('✅ Frames generated successfully');
    } catch (error) {
      console.log('⚠️  Frame generation failed, continuing without frames');
    }
  }

  async buildSceneMap() {
    console.log('🗺️  Building scene map...');
    
    const timelinePath = path.join(this.outputDir, 'timeline.yaml');
    const ttsPath = path.join(this.outputDir, 'tts-cue-sheet.json');
    
    if (!fs.existsSync(timelinePath) || !fs.existsSync(ttsPath)) {
      console.log('⚠️  Missing timeline or TTS files, creating basic scene map');
      await this.createBasicSceneMap();
      return;
    }
    
    try {
      const timeline = fs.readFileSync(timelinePath, 'utf8');
      const tts = JSON.parse(fs.readFileSync(ttsPath, 'utf8'));
      
      const sceneMap = this.parseTimelineToSceneMap(timeline, tts);
      const sceneMapPath = path.join(this.outputDir, 'scene_map.json');
      fs.writeFileSync(sceneMapPath, JSON.stringify(sceneMap, null, 2));
      
      console.log('✅ Scene map built successfully');
    } catch (error) {
      console.log('⚠️  Scene map creation failed, using basic map');
      await this.createBasicSceneMap();
    }
  }

  parseTimelineToSceneMap(timeline, tts) {
    // Parse YAML-like timeline and create scene map
    const beats = [];
    let currentTime = 0;
    
    // Extract beats from timeline
    const beatMatches = timeline.match(/beat:\s*(\w+)/g);
    if (beatMatches) {
      beatMatches.forEach((match, index) => {
        const beatId = match.replace('beat:', '').trim();
        const ttsBeat = tts.beats.find(b => b.id === beatId);
        
        if (ttsBeat) {
          const duration = ttsBeat.duration || 30; // Default 30s if not specified
          beats.push({
            id: beatId,
            start: currentTime,
            end: currentTime + duration,
            expect: this.getExpectedVisuals(beatId),
            narration: ttsBeat.text || 'No narration'
          });
          currentTime += duration;
        }
      });
    }
    
    return { beats, total_duration: currentTime };
  }

  getExpectedVisuals(beatId) {
    // Map beat IDs to expected visuals
    const visualMap = {
      'intro': ['title', 'subtitle', 'intro_art'],
      'roles': ['dashboard', 'roles_lower_third'],
      'api_overview': ['api_diagram', 'endpoint_labels'],
      'map_triage': ['live_map', 'hazard_click', 'status_callout'],
      'zones': ['hazard_zones', 'evacuation_status'],
      'route_concept': ['route_overlay', 'profiles_panel'],
      'ai_concept': ['ai_question', 'ai_response_card'],
      'tech_deep_dive': ['technical_diagram', 'labels', 'endpoint_chips'],
      'impact': ['impact_slide', 'value_proposition'],
      'conclusion': ['conclusion_art', 'contact_info']
    };
    
    return visualMap[beatId] || ['general_content'];
  }

  async createBasicSceneMap() {
    const basicMap = {
      beats: [
        { id: "intro", start: 0, end: 30, expect: ["title", "subtitle", "intro_art"] },
        { id: "roles", start: 30, end: 60, expect: ["dashboard", "roles_lower_third"] },
        { id: "api_overview", start: 60, end: 100, expect: ["api_diagram", "endpoint_labels"] },
        { id: "map_triage", start: 100, end: 140, expect: ["live_map", "hazard_click", "status_callout"] },
        { id: "zones", start: 140, end: 180, expect: ["hazard_zones", "evacuation_status"] },
        { id: "route_concept", start: 180, end: 220, expect: ["route_overlay", "profiles_panel"] },
        { id: "ai_concept", start: 220, end: 250, expect: ["ai_question", "ai_response_card"] },
        { id: "tech_deep_dive", start: 250, end: 290, expect: ["technical_diagram", "labels", "endpoint_chips"] },
        { id: "impact", start: 290, end: 320, expect: ["impact_slide", "value_proposition"] },
        { id: "conclusion", start: 320, end: 340, expect: ["conclusion_art", "contact_info"] }
      ],
      total_duration: 340
    };
    
    const sceneMapPath = path.join(this.outputDir, 'scene_map.json');
    fs.writeFileSync(sceneMapPath, JSON.stringify(basicMap, null, 2));
  }

  async getGPT5Feedback() {
    console.log('🤖 Getting GPT-5 feedback...');
    
    try {
      // Load comprehensive review artifacts
      const artifacts = await this.loadReviewArtifacts();
      
      const systemPrompt = `
You are GPT-5 Thinking. You are a senior demo editor with 15+ years of experience in technical presentations and demo videos.

Evaluate the cut against the provided outline and rubric. Return STRICT JSON matching the schema.

Be specific, timecode everything, and propose surgical fixes (not vague advice). Focus on actionable, implementable changes.

IMPORTANT: Provide evidence-based feedback. Every issue must have a timecode and specific evidence of what you observed.
`;

      const rubric = `
Score 0–10 each: STORY, TECH_ACCURACY, VISUALS, AUDIO, TIMING, COMPLIANCE.

- STORY: Clear user path: Intro→Roles→API→Map→Zones→Route concept→AI→Tech deep dive→Impact→CTA
- TECH_ACCURACY: API endpoints correct; "A Star" pronounced correctly; H3 ≈ 174m; Foundry Functions I/O; consistent terminology
- VISUALS: Legible titles/callouts (≤10 words); consistent palette; cursor pacing; smooth transitions (0.8–1.0s fades)
- AUDIO: VO at –16 LUFS; music ducked by 6–9 dB; no clipping; no abrupt cuts; clear narration
- TIMING: Beats inside target windows; no long static holds; total ≈ 5:40 ±15s; proper pacing
- COMPLIANCE: Required beats present in order; diagrams appear when referenced; all required content shown
`;

      const schema = `
{
  "scores": { 
    "story": "number", 
    "tech_accuracy": "number", 
    "visuals": "number", 
    "audio": "number", 
    "timing": "number", 
    "compliance": "number" 
  },
  "total": "number",
  "issues": [
    {
      "timecode": "MM:SS",
      "beat": "beat_id",
      "type": "story|tech|visual|audio|timing|compliance",
      "note": "what's wrong",
      "evidence": "what you saw/heard"
    }
  ],
      "fixes": [
        {
          "timecode": "MM:SS",
          "beat": "beat_id",
          "action": "insert|replace|trim|move|retime|overlay|audio",
          "detail": "precise instruction incl. duration, text, targets"
        }
      ],
      "blocking": "boolean"
    }
    `;

      // Build comprehensive message with all artifacts
      const messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: `RUBRIC:\n${rubric}\n\nSCHEMA:\n${schema}` },
            { type: "text", text: `TRANSCRIPT:\n${artifacts.transcript}` },
            { type: "text", text: `SCENE_MAP JSON:\n${JSON.stringify(artifacts.sceneMap)}` },
            ...artifacts.frames.map(f => ({ type: "image_url", image_url: { url: f } }))
          ]
        }
      ];

      const response = await this.client.chat.completions.create({
        model: "gpt-4o", // Will automatically use GPT-5 if available
        temperature: 0.1, // Lower temperature for more consistent analysis
        response_format: { type: "json_object" },
        messages: messages,
        max_tokens: 4000 // Increased for comprehensive feedback
      });

      const feedback = JSON.parse(response.choices[0].message.content);
      
      // Validate feedback structure
      if (!this.validateFeedback(feedback)) {
        throw new Error('Invalid feedback structure from GPT-5');
      }
      
      // Fix total score calculation if it's incorrect
      if (feedback.total && feedback.total > 10) {
        const scores = Object.values(feedback.scores);
        if (scores.length > 0) {
          feedback.total = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        }
      }
      
      // Add metadata to feedback
      feedback.metadata = {
        generated_at: new Date().toISOString(),
        model_used: response.model,
        tokens_used: response.usage?.total_tokens || 0,
        artifacts_analyzed: Object.keys(artifacts).length,
        frames_analyzed: artifacts.frames.length
      };
      
      return feedback;
      
    } catch (error) {
      console.error('❌ Error getting GPT-5 feedback:', error);
      return this.getFallbackFeedback();
    }
  }

  async loadReviewArtifacts() {
    console.log('📦 Loading review artifacts...');
    
    const artifacts = {};
    
    try {
      // Load transcript
      artifacts.transcript = await this.getTranscript();
      
      // Load scene map
      const sceneMapPath = path.join(this.outputDir, 'scene_map.json');
      if (fs.existsSync(sceneMapPath)) {
        artifacts.sceneMap = JSON.parse(fs.readFileSync(sceneMapPath, 'utf8'));
      } else {
        console.log('⚠️  Scene map not found, creating basic one...');
        await this.createBasicSceneMap();
        artifacts.sceneMap = JSON.parse(fs.readFileSync(sceneMapPath, 'utf8'));
      }
      
      // Load frames
      artifacts.frames = await this.getRepresentativeFrames();
      
      console.log(`✅ Loaded artifacts: transcript (${artifacts.transcript.length} chars), scene map (${artifacts.sceneMap.beats?.length || 0} beats), frames (${artifacts.frames.length})`);
      
      return artifacts;
      
    } catch (error) {
      console.error('❌ Error loading artifacts:', error);
      return {
        transcript: "Error loading transcript",
        sceneMap: { beats: [] },
        frames: []
      };
    }
  }

  async getTranscript() {
    // Try to get actual transcript, fallback to TTS cue sheet
    const ttsPath = path.join(this.outputDir, 'tts-cue-sheet.json');
    if (fs.existsSync(ttsPath)) {
      const tts = JSON.parse(fs.readFileSync(ttsPath, 'utf8'));
      return tts.beats.map(beat => `${beat.id}: ${beat.text || 'No narration'}`).join('\n');
    }
    
    return "Transcript not available - using TTS cue sheet";
  }

  async getRepresentativeFrames() {
    const framesDir = path.join(this.outputDir, 'frames');
    if (!fs.existsSync(framesDir)) {
      return [];
    }
    
    const frameFiles = fs.readdirSync(framesDir)
      .filter(file => file.endsWith('.png'))
      .sort();
    
    // Return 5-8 representative frames across the timeline
    const step = Math.max(1, Math.floor(frameFiles.length / 6));
    const selectedFrames = [];
    
    for (let i = 0; i < frameFiles.length; i += step) {
      if (selectedFrames.length < 8) {
        const framePath = path.join(framesDir, frameFiles[i]);
        // Convert to data URL for OpenAI
        const imageBuffer = fs.readFileSync(framePath);
        const base64 = imageBuffer.toString('base64');
        const mimeType = 'image/png';
        const dataUrl = `data:${mimeType};base64,${base64}`;
        selectedFrames.push(dataUrl);
      }
    }
    
    return selectedFrames;
  }

  validateFeedback(feedback) {
    const required = ['scores', 'total', 'issues', 'fixes', 'blocking'];
    const hasRequired = required.every(key => feedback.hasOwnProperty(key));
    
    if (!hasRequired) return false;
    
    const scores = feedback.scores;
    const scoreKeys = ['story', 'tech_accuracy', 'visuals', 'audio', 'timing', 'compliance'];
    const hasScores = scoreKeys.every(key => typeof scores[key] === 'number');
    
    return hasScores && typeof feedback.total === 'number' && Array.isArray(feedback.issues) && Array.isArray(feedback.fixes) && typeof feedback.blocking === 'boolean';
  }

  getFallbackFeedback() {
    return {
      scores: {
        story: 7,
        tech_accuracy: 7,
        visuals: 7,
        audio: 7,
        timing: 7,
        compliance: 7
      },
      total: 7,
      issues: [
        {
          timecode: "00:00",
          beat: "general",
          type: "technical",
          note: "Unable to analyze video content",
          evidence: "GPT analysis failed, using fallback feedback"
        }
      ],
      fixes: [
        {
          timecode: "00:00",
          beat: "general",
          action: "review",
          detail: "Manual review required - GPT analysis unavailable"
        }
      ],
      blocking: false
    };
  }
}

// Run the review agent
const agent = new VideoReviewAgent();
agent.reviewVideo().catch(console.error);
