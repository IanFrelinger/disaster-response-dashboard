import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

interface ValidationResult {
  file: string;
  isValid: boolean;
  issues: string[];
  size: number;
  duration?: number;
  resolution?: { width: number; height: number };
}

class RecordingValidator {
  private capturesDir: string;
  private outputDir: string;

  constructor() {
    this.capturesDir = path.join(process.cwd(), 'captures');
    this.outputDir = path.join(process.cwd(), 'out');
  }

  async validateAllRecordings(): Promise<ValidationResult[]> {
    console.log('🔍 Validating all recording files...');
    
    const videoFiles = this.getVideoFiles();
    const results: ValidationResult[] = [];
    
    for (const file of videoFiles) {
      console.log(`\n📹 Validating: ${file}`);
      const result = await this.validateVideoFile(file);
      results.push(result);
      
      if (result.isValid) {
        console.log(`✅ ${file} - Valid`);
      } else {
        console.log(`❌ ${file} - Issues: ${result.issues.join(', ')}`);
      }
    }
    
    return results;
  }

  private getVideoFiles(): string[] {
    if (!fs.existsSync(this.capturesDir)) {
      throw new Error(`Captures directory not found: ${this.capturesDir}`);
    }
    
    return fs.readdirSync(this.capturesDir)
      .filter(file => file.endsWith('.webm') || file.endsWith('.mp4'))
      .map(file => path.join(this.capturesDir, file));
  }

  async validateVideoFile(filePath: string): Promise<ValidationResult> {
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);
    const result: ValidationResult = {
      file: fileName,
      isValid: true,
      issues: [],
      size: stats.size
    };

    // Check file size
    if (stats.size < 100000) { // Less than 100KB
      result.isValid = false;
      result.issues.push('File too small (likely corrupted or colored bars)');
    }

    // Extract video information using ffprobe
    try {
      const videoInfo = await this.getVideoInfo(filePath);
      result.duration = videoInfo.duration;
      result.resolution = videoInfo.resolution;
      
      // Check duration
      if (videoInfo.duration < 5) { // Less than 5 seconds
        result.isValid = false;
        result.issues.push('Video too short (likely recording failed)');
      }
      
      // Check resolution
      if (videoInfo.resolution.width < 800 || videoInfo.resolution.height < 600) {
        result.isValid = false;
        result.issues.push('Resolution too low (likely colored bars)');
      }
      
    } catch (error) {
      result.isValid = false;
      result.issues.push(`Failed to analyze video: ${error}`);
    }

    // Extract frames for visual analysis
    try {
      const frameAnalysis = await this.analyzeVideoFrames(filePath);
      if (frameAnalysis.hasColoredBars) {
        result.isValid = false;
        result.issues.push('Colored bars detected in video frames');
      }
      if (frameAnalysis.isBlackScreen) {
        result.isValid = false;
        result.issues.push('Black screen detected (recording may have failed)');
      }
    } catch (error) {
      result.issues.push(`Frame analysis failed: ${error}`);
    }

    return result;
  }

  private async getVideoInfo(filePath: string): Promise<{ duration: number; resolution: { width: number; height: number } }> {
    try {
      const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`);
      const info = JSON.parse(stdout);
      
      const videoStream = info.streams.find((stream: any) => stream.codec_type === 'video');
      if (!videoStream) {
        throw new Error('No video stream found');
      }
      
      return {
        duration: parseFloat(info.format.duration) || 0,
        resolution: {
          width: parseInt(videoStream.width) || 0,
          height: parseInt(videoStream.height) || 0
        }
      };
    } catch (error) {
      throw new Error(`FFprobe failed: ${error}`);
    }
  }

  private async analyzeVideoFrames(filePath: string): Promise<{ hasColoredBars: boolean; isBlackScreen: boolean }> {
    const framesDir = path.join(this.outputDir, 'frames');
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    const fileName = path.basename(filePath, path.extname(filePath));
    const framePattern = path.join(framesDir, `${fileName}_frame_%03d.png`);

    try {
      // Extract frames at regular intervals
      await execAsync(`ffmpeg -i "${filePath}" -vf "fps=1/5" -q:v 2 "${framePattern}"`);
      
      // Analyze extracted frames
      const frameFiles = fs.readdirSync(framesDir)
        .filter(file => file.startsWith(fileName) && file.endsWith('.png'))
        .map(file => path.join(framesDir, file));

      let hasColoredBars = false;
      let isBlackScreen = false;
      let analyzedFrames = 0;

      for (const frameFile of frameFiles.slice(0, 5)) { // Analyze first 5 frames
        const frameAnalysis = await this.analyzeFrame(frameFile);
        if (frameAnalysis.hasColoredBars) hasColoredBars = true;
        if (frameAnalysis.isBlackScreen) isBlackScreen = true;
        analyzedFrames++;
      }

      // Clean up frame files
      for (const frameFile of frameFiles) {
        fs.unlinkSync(frameFile);
      }

      return { hasColoredBars, isBlackScreen };
      
    } catch (error) {
      throw new Error(`Frame extraction failed: ${error}`);
    }
  }

  private async analyzeFrame(framePath: string): Promise<{ hasColoredBars: boolean; isBlackScreen: boolean }> {
    try {
      // Use ImageMagick or similar tool to analyze frame
      // For now, we'll use a simplified approach with file size and basic checks
      const stats = fs.statSync(framePath);
      
      // Very small files might indicate colored bars or errors
      const hasColoredBars = stats.size < 5000; // Less than 5KB
      
      // Check if file exists and has reasonable size
      const isBlackScreen = stats.size < 10000; // Less than 10KB might be black screen
      
      return { hasColoredBars, isBlackScreen };
      
    } catch (error) {
      return { hasColoredBars: true, isBlackScreen: true }; // Assume worst case
    }
  }

  async generateValidationReport(results: ValidationResult[]): Promise<void> {
    const reportPath = path.join(this.outputDir, 'recording-validation-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: results.length,
      validFiles: results.filter(r => r.isValid).length,
      invalidFiles: results.filter(r => !r.isValid).length,
      results: results,
      summary: {
        totalSize: results.reduce((sum, r) => sum + r.size, 0),
        averageDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length,
        commonIssues: this.getCommonIssues(results)
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📊 Validation report saved to: ${reportPath}`);
    
    // Print summary
    console.log('\n📈 Validation Summary:');
    console.log(`Total files: ${report.totalFiles}`);
    console.log(`Valid files: ${report.validFiles}`);
    console.log(`Invalid files: ${report.invalidFiles}`);
    console.log(`Success rate: ${((report.validFiles / report.totalFiles) * 100).toFixed(1)}%`);
    
    if (report.summary.commonIssues.length > 0) {
      console.log('\n⚠️ Common issues:');
      report.summary.commonIssues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
  }

  private getCommonIssues(results: ValidationResult[]): string[] {
    const issueCounts: { [key: string]: number } = {};
    
    results.forEach(result => {
      result.issues.forEach(issue => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });
    
    return Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => `${issue} (${count} files)`);
  }

  async run(): Promise<void> {
    try {
      console.log('🎬 Recording Validation Tool');
      console.log('=' .repeat(40));
      
      const results = await this.validateAllRecordings();
      await this.generateValidationReport(results);
      
      const invalidFiles = results.filter(r => !r.isValid);
      if (invalidFiles.length > 0) {
        console.log('\n❌ Invalid recordings detected:');
        invalidFiles.forEach(result => {
          console.log(`  - ${result.file}: ${result.issues.join(', ')}`);
        });
        
        throw new Error(`${invalidFiles.length} recording(s) failed validation`);
      } else {
        console.log('\n🎉 All recordings passed validation!');
      }
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const validator = new RecordingValidator();
  await validator.run();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RecordingValidator };
