import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Use process.cwd() instead of import.meta.url for compatibility
const projectRoot = process.cwd();

// GraphicsBot interfaces
interface OverlayDescriptor {
  overlay: string;
  text?: string;
  file?: string;
  position: string;
  padding?: number;
  width?: number;
  height?: number;
  background?: string;
  borderLeft?: string;
  animation?: {
    type: string;
    duration: number;
    from?: string;
  };
}

interface BrandPalette {
  emergency: string;
  info: string;
  success: string;
  neutral: string;
  warning: string;
}

interface ChartConfig {
  title: string;
  xLabel?: string;
  yLabel?: string;
  data: any[];
  chartType: 'line' | 'bar' | 'pie' | 'scatter';
  filename: string;
}

interface DalleConfig {
  prompt: string;
  filename: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
}

class GraphicsBot {
  private brandPalette: BrandPalette;
  private viewport: { width: number; height: number };
  private safeMargins: { top: number; right: number; bottom: number; left: number };
  private gridColumns: number;

  constructor(viewport = { width: 1920, height: 1080 }) {
    this.viewport = viewport;
    this.safeMargins = { top: 60, right: 60, bottom: 60, left: 60 };
    this.gridColumns = 12;
    
    // Disaster response brand palette
    this.brandPalette = {
      emergency: '#DC2626',    // Red for high risk
      info: '#3B82F6',        // Blue for information
      success: '#22C55E',      // Green for success
      neutral: '#6B7280',      // Gray for neutral
      warning: '#F59E0B'       // Orange for warnings
    };
  }

  /**
   * Generate beautiful, user-friendly overlays that never obscure page content
   */
  generateOverlays(overlayInstructions: string[]): OverlayDescriptor[] {
    const overlays: OverlayDescriptor[] = [];
    
    for (const instruction of overlayInstructions) {
      const overlay = this.parseOverlayInstruction(instruction);
      if (overlay) {
        overlays.push(overlay);
      }
    }
    
    return overlays;
  }

  /**
   * Parse overlay instructions and convert to structured descriptors
   */
  private parseOverlayInstruction(instruction: string): OverlayDescriptor | null {
    // Parse different overlay types
    if (instruction.includes('overlay(')) {
      const match = instruction.match(/overlay\(([^)]+)\)/);
      if (match) {
        const params = match[1].split(',');
        return this.createOverlayFromParams(params);
      }
    }
    
    return null;
  }

  /**
   * Create overlay descriptor from parsed parameters
   */
  private createOverlayFromParams(params: string[]): OverlayDescriptor {
    let type = params[0];
    
    // Handle content that may contain commas by looking for the last two parameters
    let overlayContent = '';
    let animation = 'in';
    let timing = 0;
    
    if (params.length >= 3) {
      // Last two params are animation and timing
      animation = params[params.length - 2] || 'in';
      timing = parseInt(params[params.length - 1] || '0');
      // Everything in between is content
      overlayContent = params.slice(1, params.length - 2).join(',');
    } else if (params.length === 2) {
      overlayContent = params[1];
    }
    
    // Extract text content from type:content format
    if (type.includes(':')) {
      const colonIndex = type.indexOf(':');
      const actualType = type.substring(0, colonIndex);
      const content = type.substring(colonIndex + 1);
      
      // Update type and content
      type = actualType;
      overlayContent = content;
    }

    // Determine overlay type and create appropriate descriptor
    if (type.includes('title')) {
      return this.createTitleOverlay(overlayContent, animation, timing);
    } else if (type.includes('callout')) {
      return this.createCalloutOverlay(overlayContent, animation, timing);
    } else if (type.includes('badge')) {
      return this.createBadgeOverlay(overlayContent, animation, timing);
    } else if (type.includes('chip')) {
      return this.createChipOverlay(overlayContent, animation, timing);
    } else if (type.includes('diagram') || type.includes('image')) {
      return this.createImageOverlay(overlayContent, animation, timing);
    } else if (type.includes('status')) {
      return this.createStatusOverlay(overlayContent, animation, timing);
    } else {
      return this.createGenericOverlay(type, overlayContent, animation, timing);
    }
  }

  /**
   * Create title overlay with proper positioning
   */
  private createTitleOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'title',
      text: text,
      position: 'center',
      padding: 40,
      width: Math.min(800, this.viewport.width - 120),
      height: 120,
      background: 'rgba(0,0,0,0.8)',
      borderLeft: `4px solid ${this.brandPalette.info}`,
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: 800
      }
    };
  }

  /**
   * Create callout overlay positioned to avoid content
   */
  private createCalloutOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    // Limit text to 10 words as per requirements
    const limitedText = text.split(' ').slice(0, 10).join(' ');
    
    return {
      overlay: 'callout',
      text: limitedText,
      position: 'top-right',
      padding: 20,
      width: Math.min(300, this.viewport.width / 4),
      height: 80,
      background: 'rgba(0,0,0,0.7)',
      borderLeft: `4px solid ${this.brandPalette.warning}`,
      animation: {
        type: animation === 'in' ? 'slide_in' : 'slide_out',
        from: 'right',
        duration: 1000
      }
    };
  }

  /**
   * Create badge overlay for status indicators
   */
  private createBadgeOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'badge',
      text: text,
      position: 'bottom-left',
      padding: 16,
      width: 280,
      height: 60,
      background: 'rgba(0,0,0,0.8)',
      borderLeft: `4px solid ${this.brandPalette.success}`,
      animation: {
        type: animation === 'in' ? 'scale_in' : 'scale_out',
        duration: 600
      }
    };
  }

  /**
   * Create chip overlay for API endpoints
   */
  private createChipOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'chip',
      text: text,
      position: 'bottom-right',
      padding: 12,
      width: 200,
      height: 40,
      background: 'rgba(59,130,246,0.9)',
      borderLeft: `3px solid ${this.brandPalette.info}`,
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: 500
      }
    };
  }

  /**
   * Create image/diagram overlay
   */
  private createImageOverlay(filePath: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: 'image',
      file: filePath,
      position: 'center',
      width: Math.min(800, this.viewport.width - 120),
      height: Math.min(450, this.viewport.height - 120),
      background: 'transparent',
      animation: {
        type: animation === 'in' ? 'slide_in' : 'slide_out',
        from: 'bottom',
        duration: 1000
      }
    };
  }

  /**
   * Create status overlay for risk indicators
   */
  private createStatusOverlay(text: string, animation: string, timing: number): OverlayDescriptor {
    // Determine color based on risk level
    const riskColor = text.toLowerCase().includes('high') ? this.brandPalette.emergency :
                     text.toLowerCase().includes('medium') ? this.brandPalette.warning :
                     this.brandPalette.success;

    return {
      overlay: 'status',
      text: text,
      position: 'top-left',
      padding: 20,
      width: 250,
      height: 70,
      background: 'rgba(0,0,0,0.8)',
      borderLeft: `4px solid ${riskColor}`,
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: 800
      }
    };
  }

  /**
   * Create generic overlay for unknown types
   */
  private createGenericOverlay(type: string, text: string, animation: string, timing: number): OverlayDescriptor {
    return {
      overlay: type,
      text: text,
      position: 'center',
      padding: 20,
      width: 300,
      height: 100,
      background: 'rgba(0,0,0,0.7)',
      borderLeft: `4px solid ${this.brandPalette.neutral}`,
      animation: {
        type: animation === 'in' ? 'fade_in' : 'fade_out',
        duration: 800
      }
    };
  }

  /**
   * Generate Matplotlib chart
   */
  async generateChart(config: ChartConfig): Promise<string> {
    const pythonScript = this.createMatplotlibScript(config);
    const scriptPath = path.join(__dirname, '..', 'output', 'temp_chart.py');
    const outputPath = path.join(__dirname, '..', 'output', config.filename);
    
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write Python script
      fs.writeFileSync(scriptPath, pythonScript);
      
      // Execute Python script
      execSync(`python3 "${scriptPath}"`, { stdio: 'inherit' });
      
      // Clean up temporary script
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }
      
      return outputPath;
    } catch (error) {
      console.error('Error generating chart:', error);
      throw error;
    }
  }

  /**
   * Create Matplotlib Python script
   */
  private createMatplotlibScript(config: ChartConfig): string {
    const { title, xLabel, yLabel, data, chartType, filename } = config;
    
    let plotCode = '';
    switch (chartType) {
      case 'line':
        plotCode = `plt.plot([${data.map((d, i) => i).join(', ')}], [${data.join(', ')}], 'o-', linewidth=2, markersize=6)`;
        break;
      case 'bar':
        plotCode = `plt.bar([${data.map((d, i) => i).join(', ')}], [${data.join(', ')}], color='#3B82F6', alpha=0.8)`;
        break;
      case 'pie':
        plotCode = `plt.pie([${data.join(', ')}], labels=[${data.map((d, i) => `'Value ${i+1}'`).join(', ')}], autopct='%1.1f%%')`;
        break;
      case 'scatter':
        plotCode = `plt.scatter([${data.map((d, i) => i).join(', ')}], [${data.join(', ')}], c='#DC2626', alpha=0.7, s=100)`;
        break;
    }

    return `
import matplotlib.pyplot as plt
import numpy as np

# Set style for clean, professional look
plt.style.use('default')
plt.rcParams['font.size'] = 12
plt.rcParams['font.family'] = 'sans-serif'

# Create figure with proper sizing
fig, ax = plt.subplots(figsize=(10, 6))

# Generate the plot
${plotCode}

# Customize the chart
plt.title('${title}', fontsize=16, fontweight='bold', pad=20)
${xLabel ? `plt.xlabel('${xLabel}', fontsize=12)` : ''}
${yLabel ? `plt.ylabel('${yLabel}', fontsize=12)` : ''}

# Remove top and right spines for cleaner look
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

# Add grid for better readability
plt.grid(True, alpha=0.3)

# Adjust layout and save
plt.tight_layout()
plt.savefig('${filename}', dpi=300, bbox_inches='tight', facecolor='white')
plt.close()
`;
  }

  /**
   * Generate DALL-E image
   */
  async generateDalleImage(config: DalleConfig): Promise<string> {
    // Note: This is a placeholder for DALL-E API integration
    // In a real implementation, you would call the OpenAI API
    console.log(`🎨 DALL-E image generation requested: ${config.prompt}`);
    console.log(`📁 Would save to: ${config.filename}`);
    
    // For now, return a placeholder path
    return path.join(__dirname, '..', 'output', config.filename);
  }

  /**
   * Calculate safe position for overlay
   */
  calculateSafePosition(position: string, overlaySize: { width: number; height: number }): { x: number; y: number } {
    const { width, height } = overlaySize;
    
    switch (position) {
      case 'top-left':
        return { x: this.safeMargins.left, y: this.safeMargins.top };
      case 'top-right':
        return { x: this.viewport.width - width - this.safeMargins.right, y: this.safeMargins.top };
      case 'bottom-left':
        return { x: this.safeMargins.left, y: this.viewport.height - height - this.safeMargins.bottom };
      case 'bottom-right':
        return { x: this.viewport.width - width - this.safeMargins.right, y: this.viewport.height - height - this.safeMargins.bottom };
      case 'center':
        return { 
          x: (this.viewport.width - width) / 2, 
          y: (this.viewport.height - height) / 2 
        };
      default:
        return { x: this.safeMargins.left, y: this.safeMargins.top };
    }
  }

  /**
   * Update viewport dimensions
   */
  updateViewport(width: number, height: number): void {
    this.viewport = { width, height };
    // Recalculate safe margins based on new dimensions
    this.safeMargins = {
      top: Math.max(60, height * 0.05),
      right: Math.max(60, width * 0.05),
      bottom: Math.max(60, height * 0.05),
      left: Math.max(60, width * 0.05)
    };
  }

  /**
   * Get brand palette
   */
  getBrandPalette(): BrandPalette {
    return { ...this.brandPalette };
  }

  /**
   * Set custom brand palette
   */
  setBrandPalette(palette: Partial<BrandPalette>): void {
    this.brandPalette = { ...this.brandPalette, ...palette };
  }
}

// Export the GraphicsBot class
export { GraphicsBot };
