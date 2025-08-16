# Editor-in-the-Loop Quick Reference

## 🚀 One-Command Execution
```bash
cd video-production
./scripts/review_pipeline.sh
```

## 📋 Pipeline Steps

### 1. **Generate Artifacts** ✅
- [ ] Extract frames every 10s from video
- [ ] Build scene map from timeline + TTS
- [ ] Prepare review materials

### 2. **GPT-5 Agent Review** ✅
- [ ] Analyze video frames + transcript
- [ ] Score against rubric (0-10)
- [ ] Generate actionable fixes
- [ ] Output structured JSON feedback

### 3. **Apply Feedback** ✅
- [ ] Parse fix instructions
- [ ] Update configurations automatically
- [ ] Generate improvement summary
- [ ] Ready for re-render

### 4. **Quality Gates** ✅
- [ ] Target: ≥ 8.0/10 overall
- [ ] Minimum: All categories ≥ 7.5/10
- [ ] No blocking issues
- [ ] Ready for release

## 🎛️ Key Commands

### **Full Pipeline**
```bash
./scripts/review_pipeline.sh
```

### **Individual Components**
```bash
# Scene map builder
python3 scripts/build_scene_map.py timeline.yaml tts-cue-sheet.json output/scene_map.json

# GPT-5 agent review
npx tsx scripts/agent_review.js

# Feedback application
python3 scripts/apply_feedback.py output/feedback.json output/
```

### **Environment Setup**
```bash
export OPENAI_API_KEY="your-api-key"
export REVIEW_TARGET_SCORE="8.0"
```

## 📊 Scoring Categories

### **Rubric (0-10 each)**
- **STORY**: User path clarity, narrative flow
- **TECH_ACCURACY**: API correctness, terminology
- **VISUALS**: Design consistency, transitions
- **AUDIO**: VO levels (–16 LUFS), music ducking
- **TIMING**: Beat pacing, duration targets
- **COMPLIANCE**: Required content, outline adherence

### **Quality Thresholds**
```
🟢 EXCELLENT: ≥ 8.0/10 (Ready for release)
🟡 GOOD: 7.0-7.9/10 (Minor improvements)
🔴 NEEDS WORK: < 7.0/10 (Significant fixes)
```

## 🔧 Fix Action Types

### **Overlay Fixes**
- `add chips`: Endpoint callouts
- `add callout`: Information overlays
- `add label`: Text annotations
- `font size`: Typography adjustments
- `opacity`: Background transparency

### **Audio Fixes**
- `gain`: Volume adjustments
- `ducking`: Music under VO levels
- `fade`: Transition smoothness

### **Timing Fixes**
- `shorten`: Reduce beat duration
- `extend`: Increase beat duration
- `move`: Reposition content
- `retime`: Adjust time ranges

### **Content Fixes**
- `insert`: Add transitions, crossfades
- `replace`: Swap text, images
- `overlay`: Visual enhancements

## 📁 Output Files

### **Review Artifacts**
```
output/
├── feedback.json                    # GPT-5 feedback
├── scene_map.json                   # Scene mapping
├── frames/                          # Video frames
└── review_pipeline_summary.md       # Complete summary
```

### **Configuration Updates**
```
output/
├── overlay_config.json              # Visual overlays
├── audio_config.json                # Audio settings
├── timeline_updates.json            # Beat timing
├── font_config.json                 # Typography
├── opacity_config.json              # Transparency
├── timing_updates.json              # Time ranges
├── transition_updates.json          # Transitions
├── text_updates.json                # Content changes
└── feedback_application_summary.json # Update summary
```

## 🚦 Quality Gates

### **Release Criteria**
- ✅ **Overall Score**: ≥ 8.0/10
- ✅ **All Categories**: ≥ 7.5/10
- ✅ **No Blocking Issues**
- ✅ **Technical Accuracy**: ≥ 8.5/10

### **Iteration Process**
```
Baseline: 7.0/10
Iteration 1: Apply fixes → 7.8/10
Iteration 2: Apply fixes → 8.5/10 ✅
```

## 🔄 Continuous Improvement

### **Workflow Loop**
1. **Generate Video** (current pipeline)
2. **Run Agent Review** (GPT-5 analysis)
3. **Apply Fixes** (automatic via Cursor)
4. **Re-render Video** (with improvements)
5. **Re-run Review** (verify progress)
6. **Repeat** until target achieved

### **Benefits**
- 🎯 **Professional Quality**: Broadcast standards
- ⚡ **Automated Review**: No manual checking
- 🔄 **Continuous Learning**: Each iteration improves
- 🚀 **Release Confidence**: Quality gates ensure readiness

## 🚨 Troubleshooting

### **Common Issues**
- **GPT-5 Unavailable**: Falls back to manual review
- **Missing Files**: Creates fallback configurations
- **Frame Generation Fails**: Continues with transcript
- **Feedback Application Errors**: Generates manual instructions

### **Debug Mode**
```bash
export REVIEW_DEBUG="true"
./scripts/review_pipeline.sh
```

### **Performance Tips**
- Use 5-8 representative frames
- Optimize token usage
- Cache scene maps
- Parallel processing for large videos

## 📞 Support

### **Documentation**
- **Full Guide**: `EDITOR_IN_THE_LOOP_GUIDE.md`
- **Resolve Pipeline**: `RESOLVE_FINISHING_GUIDE.md`
- **Quick Reference**: This file

### **Scripts Location**
- **Main Pipeline**: `scripts/review_pipeline.sh`
- **Agent Review**: `scripts/agent_review.js`
- **Scene Builder**: `scripts/build_scene_map.py`
- **Feedback Applier**: `scripts/apply_feedback.py`

---

**Transform your video production with AI-driven continuous improvement!** 🎬✨
