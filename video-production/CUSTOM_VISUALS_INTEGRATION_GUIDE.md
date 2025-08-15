# Custom Visuals Integration Guide

This guide explains how to integrate your custom graphics, diagrams, and visual elements into the disaster response dashboard video.

## 🎨 Overview

The video production pipeline now supports multiple types of custom visuals:

1. **Text Graphics** - Titles, callouts, labels, and annotations
2. **Image Overlays** - Diagrams, charts, logos, and custom graphics
3. **Transition Effects** - Smooth scene transitions and animations
4. **Callout Boxes** - Highlighted information and key points

## 📁 File Structure

```
video-production/
├── assets/                    # Your custom visual assets
│   ├── architecture-diagram.png
│   ├── api-flow-diagram.png
│   ├── user-roles-chart.png
│   ├── logo.png
│   └── watermark.png
├── graphics-config.yaml       # Text graphics configuration
├── custom-visuals-config.yaml # Image overlays configuration
└── scripts/
    ├── graphics-integration-pipeline.js
    └── integrate-custom-visuals.js
```

## 🚀 Quick Start

### Step 1: Add Your Visual Assets

Place your custom graphics in the `video-production/assets/` directory:

```bash
# Supported formats: PNG, JPG, JPEG, GIF, SVG, MP4, MOV, AVI
cp your-diagram.png video-production/assets/
cp your-logo.png video-production/assets/
cp your-chart.png video-production/assets/
```

### Step 2: Run the Integration Script

```bash
cd video-production
node scripts/integrate-custom-visuals.js output/disaster-response-demo.mp4 --create-placeholders
```

### Step 3: Customize the Configuration

Edit `video-production/custom-visuals-config.yaml` to match your specific visuals:

```yaml
visuals:
  your_diagram:
    filename: "your-diagram.png"
    start: 60    # Start time in seconds
    end: 90      # End time in seconds
    x: 100       # X position on screen
    y: 200       # Y position on screen
    scale: 0.8   # Scale factor (0.1 to 2.0)
    opacity: 0.9 # Opacity (0.0 to 1.0)
```

### Step 4: Re-run with Your Configuration

```bash
node scripts/integrate-custom-visuals.js output/disaster-response-demo.mp4 --config=custom-visuals-config.yaml
```

## 📋 Configuration Options

### Text Graphics (`graphics-config.yaml`)

Configure text overlays for each scene:

```yaml
scenes:
  intro:
    duration: 15
    graphics:
      - type: "title"
        text: "Your Custom Title"
        start: 0
        end: 15
        position: "center"
        fontsize: 72
        fontcolor: "white"
        boxcolor: "black@0.7"
        boxborderw: 10
        x: "(w-text_w)/2"
        y: 50
```

**Available Text Types:**
- `title` - Main scene titles
- `subtitle` - Secondary titles
- `callout` - Highlighted information
- `role` - User role labels
- `component` - Technical component names
- `alert` - Warning/alert messages
- `decision` - Decision points
- `tool` - Tool indicators
- `zone` - Zone definitions
- `profile` - Route profiles
- `unit` - Unit assignments
- `status` - Status indicators
- `query` - AI queries
- `response` - AI responses
- `benefit` - Value propositions
- `feature` - Feature highlights
- `highlight` - Key highlights
- `cta` - Call to action

### Image Overlays (`custom-visuals-config.yaml`)

Configure image overlays with precise timing and positioning:

```yaml
visuals:
  architecture_diagram:
    filename: "architecture-diagram.png"
    start: 60      # Start time in seconds
    end: 90        # End time in seconds
    x: 100         # X position (pixels or "w-150" for right-aligned)
    y: 200         # Y position (pixels or "h-100" for bottom-aligned)
    scale: 0.8     # Scale factor
    opacity: 0.9   # Opacity (0.0 to 1.0)

overlays:
  logo:
    filename: "logo.png"
    start: 0
    end: 240       # Entire video duration
    x: "w-150"     # Right side, 150px from edge
    y: 50
    scale: 0.3
    opacity: 0.8

callouts:
  highlight_1:
    text: "Key Feature"
    start: 30
    end: 45
    x: 100
    y: 200
    color: "yellow"
    animation: "fade_in"
```

## 🎬 Scene Timing Reference

Based on your narration script, here are the scene timings:

| Scene | Start Time | End Time | Duration | Description |
|-------|------------|----------|----------|-------------|
| intro | 0s | 15s | 15s | Introduction |
| problem | 15s | 40s | 25s | Problem statement |
| users | 40s | 60s | 20s | Target users |
| architecture | 60s | 90s | 30s | Technical architecture |
| detect | 90s | 105s | 15s | Detection & verification |
| triage | 105s | 115s | 10s | Risk scoring |
| zones | 115s | 125s | 10s | Zone definition |
| routes | 125s | 145s | 20s | Route planning |
| units | 145s | 155s | 10s | Unit assignment |
| ai_support | 155s | 175s | 20s | AI decision support |
| value | 175s | 205s | 30s | Value proposition |
| foundry | 205s | 225s | 20s | Foundry integration |
| conclusion | 225s | 245s | 20s | Conclusion |

## 🎨 Visual Design Guidelines

### Color Scheme
- **Red** - Alerts, warnings, fire-related content
- **Blue** - Technical components, architecture
- **Green** - Success, benefits, positive outcomes
- **Orange** - Tools, utilities, intermediate states
- **Purple** - AI, machine learning, advanced features
- **Yellow** - Highlights, important notes
- **Gold** - Units, resources, assets

### Positioning Guidelines
- **Top** - Scene titles and main headings
- **Center** - Primary content, key messages
- **Left/Right** - Supporting information, callouts
- **Bottom** - Status information, navigation
- **Corners** - Logos, watermarks, secondary elements

### Typography
- **Large (72pt)** - Main titles
- **Medium (48pt)** - Subtitles and key messages
- **Small (32pt)** - Regular text and labels
- **Extra Small (28pt)** - Supporting information

## 🔧 Advanced Configuration

### Dynamic Positioning

Use FFmpeg expressions for dynamic positioning:

```yaml
x: "(w-text_w)/2"    # Center horizontally
y: "(h-text_h)/2"    # Center vertically
x: "w-text_w-50"     # Right-aligned with 50px margin
y: "h-text_h-100"    # Bottom-aligned with 100px margin
```

### Conditional Display

Graphics can be conditionally displayed based on time:

```yaml
# Show only between 30-45 seconds
start: 30
end: 45

# Show for entire scene duration
start: 0
end: 15  # Scene duration
```

### Animation Effects

Available animation types:
- `fade_in` - Fade in effect
- `slide_in` - Slide in from edge
- `scale_in` - Scale up from small size
- `bounce` - Bounce effect

## 🛠️ Troubleshooting

### Common Issues

1. **Graphics not appearing**
   - Check file paths in configuration
   - Verify image file formats (PNG, JPG, etc.)
   - Ensure timing values are correct

2. **Poor quality graphics**
   - Use high-resolution source images (1920x1080 or higher)
   - Avoid scaling up small images
   - Use PNG format for best quality

3. **Performance issues**
   - Reduce number of simultaneous overlays
   - Use smaller image files
   - Optimize image compression

### Debug Mode

Run with verbose output:

```bash
node scripts/integrate-custom-visuals.js input.mp4 --debug
```

### Validation

Validate your configuration:

```bash
node scripts/validate-graphics-config.js
```

## 📝 Example Configurations

### Architecture Diagram Integration

```yaml
visuals:
  architecture_diagram:
    filename: "architecture-diagram.png"
    start: 60    # Architecture scene
    end: 90
    x: 100
    y: 150
    scale: 0.7
    opacity: 0.9
```

### Logo Overlay

```yaml
overlays:
  company_logo:
    filename: "company-logo.png"
    start: 0
    end: 245     # Entire video
    x: "w-120"   # Top-right corner
    y: 30
    scale: 0.2
    opacity: 0.8
```

### Callout Highlight

```yaml
callouts:
  key_feature:
    text: "AI-Powered Decision Support"
    start: 155   # AI support scene
    end: 175
    x: 200
    y: 300
    color: "purple"
    animation: "fade_in"
```

## 🎯 Best Practices

1. **Keep it simple** - Don't overcrowd the video with too many graphics
2. **Maintain readability** - Ensure text is legible against the background
3. **Use consistent styling** - Stick to the color scheme and typography guidelines
4. **Time it right** - Graphics should appear when relevant to the narration
5. **Test thoroughly** - Preview the video to ensure graphics work as expected
6. **Optimize for performance** - Use appropriately sized images and efficient formats

## 📞 Support

If you encounter issues or need help customizing your visuals:

1. Check the troubleshooting section above
2. Review the example configurations
3. Validate your configuration files
4. Test with placeholder assets first

The graphics integration system is designed to be flexible and powerful while remaining easy to use. Start with simple configurations and gradually add complexity as needed.

