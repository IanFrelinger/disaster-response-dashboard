#!/usr/bin/env ts-node

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';
import * as yaml from 'js-yaml';

interface VideoSegment {
  id: string;
  title: string;
  duration: number;
  narration: string;
  htmlFile: string;
  outputFile: string;
}

class TechnicalVideoGenerator {
  private browser: any = null;
  private page: any = null;
  private projectRoot: string;
  private outputDir: string;
  private tempDir: string;

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.projectRoot = path.join(__dirname, '..');
    this.outputDir = path.join(this.projectRoot, 'out');
    this.tempDir = path.join(this.projectRoot, 'temp');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.outputDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing 7-Minute Technical Video Generator...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 3840, height: 2160 });
    
    console.log('✅ Browser initialized successfully');
  }

  async generateVideoSegment(segment: VideoSegment): Promise<void> {
    console.log(`🎬 Generating ${segment.title} (${segment.duration}s)`);
    
    try {
      const htmlPath = path.join(this.projectRoot, 'captures', segment.htmlFile);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      
      // Set the HTML content
      await this.page.setContent(htmlContent);
      
      // Wait for content to render
      await this.page.waitForTimeout(1000);
      
      // Take a screenshot
      const screenshotPath = path.join(this.tempDir, `${segment.id}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Convert screenshot to video using ffmpeg
      const outputPath = path.join(this.outputDir, segment.outputFile);
      await this.convertImageToVideo(screenshotPath, outputPath, segment.duration);
      
      console.log(`✅ ${segment.title} video generated: ${outputPath}`);
      
    } catch (error) {
      console.error(`❌ Error generating ${segment.title}:`, error);
      throw error;
    }
  }

  async convertImageToVideo(imagePath: string, outputPath: string, duration: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-loop', '1',
        '-i', imagePath,
        '-vf', 'scale=3840:2160:force_original_aspect_ratio=decrease,pad=3840:2160:(ow-iw)/2:(oh-ih)/2',
        '-c:v', 'libx264',
        '-t', duration.toString(),
        '-pix_fmt', 'yuv420p',
        '-y',
        outputPath
      ];

      const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: 'pipe' });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  }

  async generateAllVideoSegments(): Promise<void> {
    const segments: VideoSegment[] = [
      {
        id: 'personal_intro',
        title: 'Meet Emergency Manager Sarah Chen',
        duration: 30,
        narration: 'Hi, I\'m EYE-uhn FREN-ling-er. I\'ll walk you through how an IN-sih-dent kuh-MAN-der or op-er-AY-shun SEK-shun chief uses our web tool to size up a live situation, pick the right resource, plan access and MON-ih-ter PROH-gres.',
        htmlFile: 'personal_intro.html',
        outputFile: '01_personal_intro_7min.mp4'
      },
      {
        id: 'problem_outcomes',
        title: 'The Challenge: Seconds Matter in Live Incidents',
        duration: 45,
        narration: 'In a live incident, SEK-undz MAT-er. The CHAL-enj is SEE-ing HAZ-erdz, ek-SPOH-zher and kuhn-DIH-shunz in one place, then TURN-ing that into KLEER uh-SYNE-mentz. Our goal is FAST-er TYME-to-deh-SIZH-uhn, SAY-fer AK-ses to the scene and kuhn-TIN-yoo-us STA-tus you can TRUST.',
        htmlFile: 'user_persona.html',
        outputFile: '02_problem_outcomes_7min.mp4'
      },
      {
        id: 'data_architecture',
        title: 'Data & Architecture: Real-time Integration',
        duration: 60,
        narration: 'Data STREEMZ in from F-I-R-M-S, N-O-A-A, nine one one, pop-yuh-LAY-shun and TRA-fik, and is FYOOZD in PAL-uhn-teer FOWN-dree. The BAK-end is PY-thon and FLASK, with SEL-er-ee and WEB-sok-its for REEL-taym up-DAYTZ. The FRONT end is REE-akt with MAP-boks. The system provides APIs for HAZ-erdz, risk assessment, ROWT planning, YOO-nit management, ih-vak-yoo-AY-shun tracking and PUB-lik SAYF-tee functions.',
        htmlFile: 'foundry_architecture.html',
        outputFile: '03_data_architecture_7min.mp4'
      },
      {
        id: 'live_hazard_map',
        title: 'Live Hazard Map: Situational Awareness',
        duration: 60,
        narration: 'We op-er-AYT from the Live Hazard Map. HAZ-erd selz give ih-MEE-dee-it sit-yoo-AY-shun-ul uh-WARE-ness—what\'s AK-tiv, where it\'s KLUS-terd and where to FOH-kus next.',
        htmlFile: 'action_demonstration.html',
        outputFile: '04_live_hazard_map_7min.mp4'
      },
      {
        id: 'exposure_conditions',
        title: 'Exposure & Conditions: Buildings & Weather',
        duration: 60,
        narration: 'I turn on the BIL-dingz and WEH-ther LAY-erz. BIL-dingz act as a PRAK-ti-kuhl PROK-see for pop-yuh-LAY-shun. WEH-ther shows the kuhn-DIH-shunz that will SHAPE AK-ses and op-er-AY-shunz.',
        htmlFile: 'action_demonstration.html',
        outputFile: '05_exposure_conditions_7min.mp4'
      },
      {
        id: 'incident_focus',
        title: 'Incident Focus: Anchoring the Workflow',
        duration: 60,
        narration: 'I SEN-ter the map on a speh-SIF-ik HAZ-erd. This ANG-kerz the WORK-flow to the right loh-KAY-shun and helps me pry-OR-ih-tyz the next move.',
        htmlFile: 'action_demonstration.html',
        outputFile: '06_incident_focus_7min.mp4'
      },
      {
        id: 'resource_roster',
        title: 'Resource Roster: Unit Management',
        duration: 60,
        narration: 'Next, I open the YOO-nits PAN-ul and seh-LEKT a FY-er EN-jin from the ROS-ter. The ROS-ter keeps STA-tus and loh-KAY-shun at a GLANS so I can MATCH the uh-SYNE-ment to the right KAY-puh-BIL-ih-tee.',
        htmlFile: 'action_demonstration.html',
        outputFile: '07_resource_roster_7min.mp4'
      },
      {
        id: 'route_planning',
        title: 'Route Planning: Tactical Profiles',
        duration: 60,
        narration: 'I open the ROW-ting PAN-ul and choose a FY-er TAK-ti-kuhl PROH-fyle. The SIS-tem shows the ROWT that MATCH-ez this PROH-fyle, in-KLOO-ding the STAY-jing and AK-ses points.',
        htmlFile: 'action_demonstration.html',
        outputFile: '08_route_planning_7min.mp4'
      },
      {
        id: 'route_result',
        title: 'Route Result: ETA & Distance Review',
        duration: 60,
        narration: 'I rih-VYOO the ROWT DEE-taylz—an ES-tih-may-ted TYME of uh-RY-vul and DIS-tens. This TELLZ me how long it will take and which PATH the YOO-nit will FOL-oh.',
        htmlFile: 'action_demonstration.html',
        outputFile: '09_route_result_7min.mp4'
      },
      {
        id: 'tasking',
        title: 'Tasking: Plan to Execution',
        duration: 60,
        narration: 'With the ROWT VAL-ih-day-ted, I kuhn-FERM the YOO-nit will FOL-oh it. The plan moves from PLAN-ing to ek-sek-YOO-shun.',
        htmlFile: 'action_demonstration.html',
        outputFile: '10_tasking_7min.mp4'
      },
      {
        id: 'aip_guidance',
        title: 'AIP Decision Support: AI Recommendations',
        duration: 60,
        narration: 'In A-I-P dih-SIZH-uhn suh-PORT, I rih-VYOO rek-uh-men-DAY-shunz and their kuhn-FIH-dens LEV-elz. It\'s a KWIK KROS-chek that our plan uh-LYNEZ with the KUR-ent risk PIK-cher.',
        htmlFile: 'action_demonstration.html',
        outputFile: '11_aip_guidance_7min.mp4'
      },
      {
        id: 'ops_status_cta',
        title: 'Operations Status & Call to Action',
        duration: 60,
        narration: 'I open the BIL-ding ih-vak-yoo-AY-shun TRAK-er to MON-ih-ter STA-tus and PROH-gres. From map to uh-SYNE-ment to TRAK-ing, EV-ree-thing stays kuh-NEK-ted. If this MATCH-ez your MIH-shun PROH-fyle, I\'d be HAP-ee to walk through a per-suh-nuh-LYZD see-NAR-ee-oh next.',
        htmlFile: 'strong_cta.html',
        outputFile: '12_ops_status_cta_7min.mp4'
      }
    ];

    try {
      await this.initialize();
      
      console.log('🎬 Starting 7-minute technical video segment generation...');
      console.log(`📊 Total segments: ${segments.length}`);
      console.log(`⏱️  Total duration: ${segments.reduce((sum, s) => sum + s.duration, 0)} seconds`);
      console.log('');
      
      for (const segment of segments) {
        await this.generateVideoSegment(segment);
      }
      
      console.log('');
      console.log('🎉 All 7-minute technical video segments generated successfully!');
      
    } catch (error) {
      console.error('❌ Error generating video segments:', error);
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }
}

// Main execution
async function main() {
  const generator = new TechnicalVideoGenerator();
  await generator.generateAllVideoSegments();
}

main().catch(console.error);
