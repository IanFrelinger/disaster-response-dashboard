# Editor-in-the-Loop System - GPT-5 Powered Video Improvement

A complete automated video review and improvement system that uses GPT-5 to analyze videos and automatically apply fixes through Cursor integration.

## 🎯 Overview

The Editor-in-the-Loop system provides:
- **Automated Video Analysis**: GPT-5 reviews videos against professional rubrics
- **Actionable Feedback**: Specific, timecoded fixes with precise instructions
- **Automated Fix Application**: Cursor applies changes to timeline, overlays, and audio
- **Iterative Improvement**: Multiple passes until quality thresholds are met
- **Professional Standards**: Maintains broadcast-quality standards automatically

## 🏗️ Architecture

```
Video Input → Artifacts Generation → GPT-5 Analysis → Fix Application → Re-render → Repeat
     ↓              ↓                    ↓              ↓              ↓
  roughcut.mp4   frames/transcript   feedback.json   timeline.yaml   improved.mp4
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Ensure API key is configured
echo 'OPENAI_API_KEY="your-api-key-here"' >> config.env

# Install dependencies (if not already done)
npm install
```

### 2. Test the System

```bash
# Run comprehensive test suite
node scripts/test_editor_in_the_loop.js
```

### 3. Run Full Pipeline

```bash
# Run complete Editor-in-the-Loop pipeline
node scripts/editor_in_the_loop_pipeline.js
```

## 📋 System Components

### Core Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `editor_in_the_loop_pipeline.js` | Main orchestration script | `node scripts/editor_in_the_loop_pipeline.js` |
| `agent_review.js` | GPT-5 analysis engine | `node scripts/agent_review.js` |
| `generate_review_artifacts.py` | Creates analysis artifacts | `python3 scripts/generate_review_artifacts.py <video> <timeline> <tts> <output>` |
| `apply_feedback.py` | Applies GPT-5 fixes | `python3 scripts/apply_feedback.py <feedback> <output>` |
| `test_editor_in_the_loop.js` | System validation | `node scripts/test_editor_in_the_loop.js` |

### Artifacts Generated

- **Frames**: PNG screenshots every 10 seconds for visual analysis
- **Transcript**: SRT-formatted narration with timecodes
- **Scene Map**: JSON mapping of beats, timing, and expected visuals
- **Feedback**: GPT-5 analysis with scores, issues, and fixes
- **Assessment**: Pipeline completion summary and metrics

## 🎬 GPT-5 Analysis Rubric

The system evaluates videos across 6 categories (0-10 scale each):

### 📖 Story (Narrative Flow)
- Clear user path: Intro → Roles → API → Map → Zones → Route concept → AI → Tech deep dive → Impact → CTA
- Logical progression and engagement

### 🔧 Technical Accuracy
- API endpoints correctly labeled
- "A Star" pronounced correctly
- H3 ≈ 174m accuracy
- Foundry Functions I/O consistency
- Terminology consistency

### 🎨 Visual Quality
- Legible titles/callouts (≤10 words)
- Consistent color palette
- Smooth cursor pacing
- Transitions (0.8–1.0s fades)
- Professional visual hierarchy

### 🔊 Audio Quality
- Voiceover at –16 LUFS
- Music ducked by 6–9 dB
- No clipping or distortion
- No abrupt audio cuts
- Clear narration quality

### ⏱️ Timing & Pacing
- Beats within target windows
- No long static holds
- Total duration ≈ 5:40 ±15s
- Proper pacing and rhythm

### ✅ Compliance
- Required beats present in order
- Diagrams appear when referenced
- All required content shown
- Adherence to outline

## 🔧 Fix Types

GPT-5 can propose these types of fixes:

| Action | Description | Example |
|--------|-------------|---------|
| `overlay` | Add visual elements | "Add endpoint chips at 01:05-01:10" |
| `audio` | Adjust audio levels | "Increase VO +3dB at 02:15-02:28" |
| `timing` | Adjust durations | "Shorten beat B05 to 35s" |
| `retime` | Change timing | "Move transition to 01:45" |
| `insert` | Add new content | "Insert route overlay for 5s" |
| `replace` | Replace content | "Replace text with larger font" |
| `trim` | Remove content | "Trim static hold by 10s" |

## 📊 Quality Gates

### Release Criteria
- **Overall Score**: ≥ 8.0/10
- **Individual Scores**: All categories ≥ 7.5/10
- **Blocking Issues**: None
- **Maximum Iterations**: 5

### Fallback Behavior
- If GPT-5 unavailable, uses fallback analysis
- Maintains professional standards in all cases
- Graceful degradation with clear warnings

## 🛠️ Configuration

### Environment Variables (`config.env`)

```bash
# Required for GPT-5 analysis
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Other API keys for TTS, etc.
ELEVEN_API_KEY=your_elevenlabs_key
AZURE_SPEECH_KEY=your_azure_key
```

### Pipeline Settings

```javascript
// In editor_in_the_loop_pipeline.js
this.maxIterations = 5;           // Maximum improvement cycles
this.scoreThreshold = 8.0;        // Target overall score
this.minScoreThreshold = 7.5;     // Minimum individual scores
```

## 📈 Output Files

### Generated Files

| File | Location | Purpose |
|------|----------|---------|
| `roughcut.mp4` | `output/` | Current video version |
| `feedback.json` | `output/` | Latest GPT-5 analysis |
| `scene_map.json` | `output/artifacts/` | Beat timing and visuals |
| `transcript.json` | `output/artifacts/` | Narration with timecodes |
| `frame_*.png` | `output/frames/` | Video screenshots |
| `pipeline_assessment.json` | `output/` | Final pipeline summary |

### Feedback Structure

```json
{
  "scores": {
    "story": 8.5,
    "tech_accuracy": 9.0,
    "visuals": 7.5,
    "audio": 8.0,
    "timing": 8.5,
    "compliance": 9.0
  },
  "total": 8.4,
  "issues": [
    {
      "timecode": "01:10",
      "beat": "api_overview",
      "type": "tech",
      "note": "Missing endpoint labels",
      "evidence": "API diagram shows no labels"
    }
  ],
  "fixes": [
    {
      "timecode": "01:10",
      "beat": "api_overview",
      "action": "overlay",
      "detail": "Add endpoint labels for 10 seconds"
    }
  ],
  "blocking": false,
  "metadata": {
    "iteration": 2,
    "generated_at": "2024-01-15T10:30:00Z",
    "model_used": "gpt-4o",
    "tokens_used": 2500
  }
}
```

## 🔄 Workflow Integration

### With Cursor

1. **Analysis Phase**: GPT-5 reviews video and generates feedback
2. **Fix Application**: Cursor reads `feedback.json` and applies changes
3. **Re-render**: Video is re-rendered with fixes
4. **Iteration**: Process repeats until quality thresholds met

### Manual Override

```bash
# Run individual components
node scripts/agent_review.js                    # Just analysis
python3 scripts/apply_feedback.py feedback.json # Just fix application
```

## 🧪 Testing

### Run Test Suite

```bash
node scripts/test_editor_in_the_loop.js
```

### Test Individual Components

```bash
# Test GPT-5 integration
node scripts/agent_review.js

# Test artifacts generation
python3 scripts/generate_review_artifacts.py video.mp4 timeline.yaml tts.json output/

# Test fix application
python3 scripts/apply_feedback.py feedback.json output/
```

## 🚨 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| API key not found | Check `config.env` file exists and has correct key |
| Video not found | Ensure `output/roughcut.mp4` exists |
| GPT-5 connection failed | Verify API key and internet connection |
| Artifacts generation failed | Check FFmpeg installation and video format |
| Fix application failed | Verify timeline and TTS files exist |

### Debug Mode

```bash
# Enable verbose logging
DEBUG=1 node scripts/editor_in_the_loop_pipeline.js

# Check individual component logs
node scripts/agent_review.js 2>&1 | tee agent_review.log
```

## 📚 Advanced Usage

### Custom Rubrics

Modify the rubric in `agent_review.js`:

```javascript
const rubric = `
Score 0–10 each: STORY, TECH_ACCURACY, VISUALS, AUDIO, TIMING, COMPLIANCE.

- STORY: Your custom story criteria
- TECH_ACCURACY: Your technical requirements
- VISUALS: Your visual standards
- AUDIO: Your audio requirements
- TIMING: Your timing constraints
- COMPLIANCE: Your compliance needs
`;
```

### Custom Fix Types

Extend `apply_feedback.py` with new fix types:

```python
def apply_custom_fix(self, fix):
    """Apply custom fix type"""
    if fix.get('action') == 'custom_action':
        # Implement custom fix logic
        return True
    return False
```

### Integration with Other Tools

```bash
# Export for DaVinci Resolve
python3 scripts/export-for-resolve.py output/roughcut.mp4

# Upload to YouTube
python3 scripts/yt_upload.py output/roughcut.mp4 --privacy unlisted
```

## 🎯 Best Practices

### For Optimal Results

1. **Quality Input**: Start with good quality video and audio
2. **Clear Timeline**: Ensure timeline.yaml is well-structured
3. **Consistent TTS**: Use high-quality TTS with proper timing
4. **Iterative Approach**: Let the system run multiple iterations
5. **Review Feedback**: Check feedback.json for insights

### Performance Optimization

- Use representative frames (not every frame)
- Limit iterations to 5 maximum
- Monitor token usage for cost control
- Cache artifacts between iterations

## 📞 Support

### Getting Help

1. **Run Test Suite**: `node scripts/test_editor_in_the_loop.js`
2. **Check Logs**: Review console output for errors
3. **Verify Files**: Ensure all required files exist
4. **API Status**: Check OpenAI API status

### Contributing

To extend the system:
1. Add new fix types to `apply_feedback.py`
2. Extend rubric in `agent_review.js`
3. Add new artifact types in `generate_review_artifacts.py`
4. Update test suite in `test_editor_in_the_loop.js`

---

**🎬 Ready to create professional videos with GPT-5-powered automation!**
