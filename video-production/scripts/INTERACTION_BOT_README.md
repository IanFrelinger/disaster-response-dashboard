# InteractionBot - Humanized Browser Automation

The InteractionBot transforms robotic browser automation scripts into human-like recording instructions, making your demo videos feel natural and engaging.

## Overview

The InteractionBot takes raw UI action sequences (clicks, moves, waits, etc.) and enhances them with:
- **Natural timing**: Realistic pauses and delays
- **Human-like mouse movements**: Smooth, curved paths instead of direct teleportation
- **Contextual emphasis**: Hover effects before clicks
- **Realistic pacing**: Varied timing to avoid robotic regularity

## How It Works

### 1. Action Parsing
The bot parses your original action strings and converts them into structured `HumanizedAction` objects:

```typescript
// Original action
"click(text=Commander Dashboard)"

// Becomes
{
  action: 'click',
  selector: 'text=Commander Dashboard',
  comment: undefined
}
```

### 2. Enhancement Process
For each action, the bot adds:
- **Pre-action hover** (for clickable elements)
- **Natural delays** before and after actions
- **Smooth mouse movements** between coordinate-based actions
- **Contextual pauses** for information display

### 3. Output Generation
The enhanced actions maintain the original intent while adding human-like behavior patterns.

## Usage

### Basic Integration

```typescript
import { InteractionBot } from './create-proper-demo-video';

const interactionBot = new InteractionBot();
const humanizedActions = interactionBot.humanizeActions(originalActions);
```

### Action Types Supported

| Original Action | Humanized Result | Enhancement |
|----------------|------------------|-------------|
| `click(selector)` | Hover → Wait → Click → Wait | Adds emphasis and natural pacing |
| `mouseMove(x,y)` | Smooth path movement | Creates curved, realistic mouse paths |
| `wait(ms)` | Randomized timing | Adds ±50ms variance for natural feel |
| `wheel(delta)` | Scroll → Wait | Adds pause after scrolling |
| `mouseDrag(start,end)` | Move → Drag → Wait | Enhanced with smooth movement |

### Example Transformation

**Input (Robotic):**
```json
[
  {"action":"click","selector":"button:has-text('Commander Dashboard')"},
  {"action":"click","selector":"button:has-text('Live Map')"},
  {"action":"click","coordinates":[740,580]}
]
```

**Output (Humanized):**
```json
[
  {"action":"hover","selector":"button:has-text('Commander Dashboard')","duration":500},
  {"action":"wait","milliseconds":300},
  {"action":"click","selector":"button:has-text('Commander Dashboard')"},
  {"action":"wait","milliseconds":500},
  {"action":"mouseMove","path":[[150,700],[800,700],[900,600]],"duration":800},
  {"action":"wait","milliseconds":300},
  {"action":"click","selector":"button:has-text('Live Map')"},
  {"action":"wait","milliseconds":600},
  {"action":"mouseMove","path":[[900,500],[850,550],[740,580]],"duration":600},
  {"action":"wait","milliseconds":400},
  {"action":"click","coordinates":[740,580]},
  {"action":"wait","milliseconds":800}
]
```

## Configuration

### Timing Parameters

- **Pre-click hover**: 500ms (configurable)
- **Post-action waits**: 200-600ms based on action type
- **Mouse movement duration**: 300-1000ms based on distance
- **Timing variance**: ±50ms randomization

### Mouse Movement

- **Short distances** (<100px): 3-point curved path
- **Long distances** (>100px): Multiple intermediate points
- **Natural curves**: Slight randomness for human-like feel

## Integration with Demo Video Creator

The InteractionBot is fully integrated into the `ProperDemoVideoCreator` class:

```typescript
class ProperDemoVideoCreator {
  private interactionBot: InteractionBot;
  
  constructor() {
    this.interactionBot = new InteractionBot();
  }
  
  private async executeBeat(beat: Beat, page: Page) {
    // Humanize the actions using InteractionBot
    const humanizedActions = this.interactionBot.humanizeActions(beat.actions);
    
    // Execute each humanized action
    for (const action of humanizedActions) {
      await this.executeHumanizedAction(action, page);
    }
  }
}
```

## Testing

Run the test script to see the bot in action:

```bash
cd video-production/scripts
npx tsx test-interaction-bot.ts
```

This will:
1. Process sample actions from your `record.config.json`
2. Display the transformation process
3. Save results to `output/humanized-actions.json`
4. Show enhancement statistics

## Customization

### Modifying Timing

Adjust the timing parameters in the `InteractionBot` class:

```typescript
private getPostActionWait(actionType: string): number {
  switch (actionType) {
    case 'click':
      return 800; // Increase from 500ms
    case 'wheel':
      return 600; // Increase from 400ms
    // ... other cases
  }
}
```

### Adjusting Mouse Movement

Modify the path generation algorithm:

```typescript
private generateHumanizedPath(from: [number, number], to: [number, number]): [number, number][] {
  // Customize curve generation
  const curveIntensity = 0.3; // Adjust for more/less curved paths
  // ... implementation
}
```

## Best Practices

1. **Preserve Intent**: The bot maintains your original UI flow
2. **Natural Pacing**: Don't rush through multiple actions
3. **Context Awareness**: Longer pauses for information display
4. **Smooth Transitions**: Mouse movements should feel deliberate

## Troubleshooting

### Common Issues

- **Actions not recognized**: Check action string format in `parseAction()`
- **Timing too fast/slow**: Adjust `getPostActionWait()` values
- **Mouse movement jerky**: Modify `executeSmoothMouseMove()` step timing

### Debug Mode

Enable detailed logging by modifying the console output in `executeHumanizedAction()`.

## Performance Considerations

- **Action count increase**: Humanized actions are typically 2-3x the original count
- **Execution time**: Natural timing adds realistic duration to your demos
- **Memory usage**: Minimal overhead for action transformation

## Future Enhancements

Potential improvements for the InteractionBot:
- **Learning algorithms** for user-specific patterns
- **Context-aware timing** based on UI element types
- **Gesture recognition** for more complex interactions
- **Performance profiling** to optimize timing parameters

---

The InteractionBot transforms your technical demonstrations into engaging, professional presentations that feel natural and human-like. Use it to create compelling demo videos that showcase your platform's capabilities while maintaining viewer engagement.
