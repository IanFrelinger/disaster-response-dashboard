import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MouseStorySegment {
  name: string;
  duration: number;
  description: string;
  actions: (page: Page) => Promise<void>;
  narration: string;
}

class MouseInteractionStoryCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;

  constructor() {
    this.outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async createMouseInteractionStory() {
    console.log('🎬 Creating Mouse Interaction Story Video...');
    console.log('🖱️ This will show real mouse movements, clicks, and scrolls to tell a user story');
    
    try {
      await this.initializeBrowser();
      await this.recordMouseStorySegments();
      await this.generateFinalVideo();
      
      console.log('✅ Mouse interaction story video creation completed!');
      console.log('🎬 Real user interactions with mouse movements ready');
      
    } catch (error) {
      console.error('❌ Error during video creation:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser...');
    this.browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage({
      viewport: { width: 1920, height: 1080 },
      recordVideo: {
        dir: this.outputDir,
        size: { width: 1920, height: 1080 }
      }
    });
    
    console.log('✅ Browser initialized');
  }

  private async recordMouseStorySegments() {
    const segments: MouseStorySegment[] = [
      {
        name: 'user_arrives_at_dashboard',
        duration: 20,
        description: 'User arrives at dashboard and explores the interface',
        narration: "Sarah, an Incident Commander, arrives at her dashboard after receiving an emergency alert. She quickly scans the interface to understand the current situation.",
        actions: async (page: Page) => {
          await page.goto('http://localhost:3000');
          await page.waitForLoadState('networkidle');
          
          // Wait for dashboard to load
          await page.waitForTimeout(2000);
          
          // Move mouse to explore the dashboard
          await page.mouse.move(200, 150);
          await page.waitForTimeout(1000);
          
          // Move to zone cards
          await page.mouse.move(400, 200);
          await page.waitForTimeout(800);
          
          // Move to different areas of the dashboard
          await page.mouse.move(600, 300);
          await page.waitForTimeout(800);
          
          await page.mouse.move(800, 250);
          await page.waitForTimeout(800);
          
          // Scroll down to see more content
          await page.mouse.wheel(0, 300);
          await page.waitForTimeout(1000);
          
          // Scroll back up
          await page.mouse.wheel(0, -300);
          await page.waitForTimeout(1000);
        }
      },
      {
        name: 'clicks_on_zone_details',
        duration: 25,
        description: 'User clicks on zone cards to see detailed information',
        narration: "Sarah notices Zone A has a high alert status. She clicks on it to get more detailed information about the affected area and population.",
        actions: async (page: Page) => {
          // Look for zone cards or clickable elements
          // Try to find and click on zone-related elements
          try {
            // Move to what might be a zone card
            await page.mouse.move(300, 250);
            await page.waitForTimeout(1000);
            
            // Click on the zone card
            await page.mouse.click(300, 250);
            await page.waitForTimeout(2000);
            
            // Move mouse to explore the details that appeared
            await page.mouse.move(500, 300);
            await page.waitForTimeout(800);
            
            await page.mouse.move(700, 350);
            await page.waitForTimeout(800);
            
            // Click to close or move to another area
            await page.mouse.click(100, 100);
            await page.waitForTimeout(1000);
            
          } catch (error) {
            console.log('Zone interaction not available, continuing...');
            await page.waitForTimeout(5000);
          }
        }
      },
      {
        name: 'navigates_to_live_map',
        duration: 30,
        description: 'User navigates to the live map to see real-time data',
        narration: "Now Sarah needs to see the actual situation on the ground. She navigates to the Live Map to get a real-time view of the affected area.",
        actions: async (page: Page) => {
          // Look for navigation tabs or buttons
          try {
            // Move to navigation area
            await page.mouse.move(100, 50);
            await page.waitForTimeout(1000);
            
            // Try to find and click on "Live Map" or similar navigation
            const liveMapButton = await page.locator('text=Live Map').first();
            if (await liveMapButton.isVisible()) {
              await liveMapButton.hover();
              await page.waitForTimeout(500);
              await liveMapButton.click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(3000);
            } else {
              // If not found, try clicking in the navigation area
              await page.mouse.click(150, 50);
              await page.waitForTimeout(2000);
            }
            
            // Explore the map interface
            await page.mouse.move(400, 300);
            await page.waitForTimeout(1000);
            
            // Simulate map interaction (pan/zoom)
            await page.mouse.move(600, 400);
            await page.waitForTimeout(800);
            
            await page.mouse.move(800, 350);
            await page.waitForTimeout(800);
            
            // Try to click on map elements
            await page.mouse.click(500, 300);
            await page.waitForTimeout(2000);
            
            // Move to layer controls
            await page.mouse.move(1800, 100);
            await page.waitForTimeout(1000);
            
            // Try to toggle layers
            await page.mouse.click(1800, 100);
            await page.waitForTimeout(1000);
            
          } catch (error) {
            console.log('Map navigation not available, continuing...');
            await page.waitForTimeout(5000);
          }
        }
      },
      {
        name: 'interacts_with_hazard_data',
        duration: 25,
        description: 'User interacts with hazard data and risk assessments',
        narration: "Sarah spots a hazard cluster on the map. She clicks on it to get detailed information about the risk level and affected population.",
        actions: async (page: Page) => {
          try {
            // Look for hazard indicators on the map
            await page.mouse.move(450, 280);
            await page.waitForTimeout(1000);
            
            // Click on what might be a hazard
            await page.mouse.click(450, 280);
            await page.waitForTimeout(2000);
            
            // Move mouse to explore the hazard details
            await page.mouse.move(600, 200);
            await page.waitForTimeout(800);
            
            await page.mouse.move(700, 250);
            await page.waitForTimeout(800);
            
            // Try to close the hazard details
            await page.mouse.click(900, 150);
            await page.waitForTimeout(1000);
            
            // Look for other interactive elements
            await page.mouse.move(1200, 400);
            await page.waitForTimeout(800);
            
            await page.mouse.click(1200, 400);
            await page.waitForTimeout(2000);
            
          } catch (error) {
            console.log('Hazard interaction not available, continuing...');
            await page.waitForTimeout(5000);
          }
        }
      },
      {
        name: 'uses_ai_commander',
        duration: 30,
        description: 'User accesses AI Commander for decision support',
        narration: "Sarah needs expert advice on evacuation strategy. She opens the AI Commander to get recommendations based on current conditions.",
        actions: async (page: Page) => {
          try {
            // Navigate back to main dashboard or find AI interface
            await page.mouse.move(100, 50);
            await page.waitForTimeout(1000);
            
            // Try to find AI Commander or similar interface
            const aiButton = await page.locator('text=AI Commander').first();
            if (await aiButton.isVisible()) {
              await aiButton.hover();
              await page.waitForTimeout(500);
              await aiButton.click();
              await page.waitForTimeout(3000);
            } else {
              // Try clicking in different areas to find AI interface
              await page.mouse.click(200, 50);
              await page.waitForTimeout(2000);
            }
            
            // Simulate typing a question
            const inputField = await page.locator('input[type="text"], textarea').first();
            if (await inputField.isVisible()) {
              await inputField.click();
              await page.waitForTimeout(500);
              await inputField.fill('What is the best evacuation strategy for the current situation?');
              await page.waitForTimeout(1000);
              
              // Press Enter or click submit
              await page.keyboard.press('Enter');
              await page.waitForTimeout(3000);
            }
            
            // Explore AI response
            await page.mouse.move(400, 300);
            await page.waitForTimeout(1000);
            
            await page.mouse.move(600, 350);
            await page.waitForTimeout(800);
            
            await page.mouse.move(800, 400);
            await page.waitForTimeout(800);
            
          } catch (error) {
            console.log('AI Commander not available, continuing...');
            await page.waitForTimeout(5000);
          }
        }
      },
      {
        name: 'monitors_evacuation_progress',
        duration: 25,
        description: 'User monitors real-time evacuation progress',
        narration: "With the evacuation plan in place, Sarah monitors the progress in real-time. She checks evacuation percentages and unit status.",
        actions: async (page: Page) => {
          try {
            // Navigate back to dashboard to see progress
            await page.mouse.move(100, 50);
            await page.waitForTimeout(1000);
            
            // Try to go back to main dashboard
            const dashboardButton = await page.locator('text=Commander Dashboard').first();
            if (await dashboardButton.isVisible()) {
              await dashboardButton.hover();
              await page.waitForTimeout(500);
              await dashboardButton.click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(3000);
            }
            
            // Explore progress indicators
            await page.mouse.move(300, 200);
            await page.waitForTimeout(1000);
            
            await page.mouse.move(500, 250);
            await page.waitForTimeout(800);
            
            // Click on progress elements
            await page.mouse.click(400, 220);
            await page.waitForTimeout(2000);
            
            // Scroll to see more progress data
            await page.mouse.wheel(0, 200);
            await page.waitForTimeout(1000);
            
            await page.mouse.move(600, 400);
            await page.waitForTimeout(800);
            
            // Scroll back up
            await page.mouse.wheel(0, -200);
            await page.waitForTimeout(1000);
            
          } catch (error) {
            console.log('Progress monitoring not available, continuing...');
            await page.waitForTimeout(5000);
          }
        }
      },
      {
        name: 'final_assessment',
        duration: 20,
        description: 'User performs final assessment and closes the session',
        narration: "As the situation stabilizes, Sarah performs a final assessment of the response. She reviews the outcomes and prepares her report.",
        actions: async (page: Page) => {
          try {
            // Final exploration of the interface
            await page.mouse.move(200, 150);
            await page.waitForTimeout(800);
            
            await page.mouse.move(400, 200);
            await page.waitForTimeout(800);
            
            await page.mouse.move(600, 250);
            await page.waitForTimeout(800);
            
            // Look for summary or report section
            await page.mouse.move(800, 300);
            await page.waitForTimeout(1000);
            
            await page.mouse.click(800, 300);
            await page.waitForTimeout(2000);
            
            // Final scroll to see all information
            await page.mouse.wheel(0, 400);
            await page.waitForTimeout(1000);
            
            await page.mouse.wheel(0, -400);
            await page.waitForTimeout(1000);
            
            // Move to close or logout area
            await page.mouse.move(1800, 50);
            await page.waitForTimeout(1000);
            
          } catch (error) {
            console.log('Final assessment not available, continuing...');
            await page.waitForTimeout(5000);
          }
        }
      }
    ];

    console.log(`📹 Recording ${segments.length} mouse interaction segments...`);
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`🎬 Recording segment ${i + 1}/${segments.length}: ${segment.name} (${segment.duration}s)`);
      
      try {
        await segment.actions(this.page!);
        console.log(`✅ Segment ${segment.name} recorded successfully`);
      } catch (error) {
        console.error(`❌ Error recording segment ${segment.name}:`, error);
      }
    }
  }

  private async generateFinalVideo() {
    console.log('🎬 Generating final video...');
    
    // Get the recorded video file
    const videoFiles = fs.readdirSync(this.outputDir).filter(file => file.endsWith('.webm'));
    
    if (videoFiles.length === 0) {
      console.error('❌ No video files found to combine');
      return;
    }
    
    const inputFile = path.join(this.outputDir, videoFiles[0]);
    const outputPath = path.join(this.outputDir, 'mouse-interaction-story-final.mp4');
    
    try {
      // Convert webm to mp4 with proper settings
      const ffmpegCommand = `ffmpeg -i "${inputFile}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k "${outputPath}"`;
      execSync(ffmpegCommand, { stdio: 'inherit' });
      
      console.log(`✅ Final video generated: ${outputPath}`);
      
      // Clean up the original webm file
      if (fs.existsSync(inputFile)) {
        fs.unlinkSync(inputFile);
      }
      
    } catch (error) {
      console.error('❌ Error generating final video:', error);
    }
  }

  private async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Run the video creation
const creator = new MouseInteractionStoryCreator();
creator.createMouseInteractionStory().catch(console.error);
