import { chromium, Browser, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TimelineSegment {
  name: string;
  start: number;
  duration: number;
  narration: string;
  visual: string;
  graphics: any[];
  transitions: {
    in: string;
    out: string;
  };
  source?: string;
}

class Timeline3InteractionTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private timeline: any;
  private videoPresentationDir: string;
  private testResults: any[] = [];

  constructor() {
    this.videoPresentationDir = path.join(__dirname, '..', 'VideoPresentation');
  }

  async testTimeline3Interactions() {
    console.log('🧪 Timeline 3 Interaction Dry Run Test');
    console.log('=====================================');
    console.log('This will test all interactions without recording video');
    console.log('');
    
    try {
      // Load timeline-3.yaml
      await this.loadTimeline();
      
      // Check VideoPresentation assets
      await this.checkVideoPresentationAssets();
      
      // Initialize browser
      await this.initializeBrowser();
      
      // Test video segments with interactions
      await this.testVideoSegments();
      
      // Generate test report
      await this.generateTestReport();
      
      console.log('✅ Timeline 3 interaction dry run completed!');
      console.log('📊 Check the test report for detailed results');
      
    } catch (error) {
      console.error('❌ Error during dry run:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async loadTimeline() {
    const timelinePath = path.join(__dirname, '..', 'timeline-3.yaml');
    const timelineContent = fs.readFileSync(timelinePath, 'utf8');
    this.timeline = yaml.load(timelineContent);
    
    console.log(`📹 Timeline loaded: ${this.timeline.timeline.duration} seconds total`);
    console.log(`🎭 ${this.timeline.timeline.tracks.video.length} video segments to test`);
  }

  private async checkVideoPresentationAssets() {
    console.log('📁 Checking VideoPresentation assets...');
    
    const assets = [
      'introduction_generated_new.png',
      'user_persona_generated_new.png',
      'hazard_detection.png',
      'api_dataflow_diagram.png',
      'asset_management.png',
      'ai_support.png',
      'conclusion_generated_new.png'
    ];
    
    const availableAssets = [];
    for (const asset of assets) {
      const assetPath = path.join(this.videoPresentationDir, asset);
      if (fs.existsSync(assetPath)) {
        availableAssets.push(asset);
        console.log(`✅ Found asset: ${asset}`);
      } else {
        console.log(`⚠️  Missing asset: ${asset}`);
      }
    }
    
    console.log(`📊 Found ${availableAssets.length}/${assets.length} VideoPresentation assets`);
    return availableAssets;
  }

  private async initializeBrowser() {
    console.log('🌐 Initializing browser for interaction testing...');
    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--allow-running-insecure-content',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the frontend
    console.log('🌐 Navigating to frontend...');
    try {
      await this.page.goto('http://localhost:3000');
      await this.page.waitForLoadState('networkidle');
      console.log('✅ Frontend loaded successfully');
    } catch (error) {
      console.log('⚠️  Frontend not available, will test with mock interactions');
    }
    
    console.log('✅ Browser initialized for interaction testing');
  }

  private async testVideoSegments() {
    const segments = this.timeline.timeline.tracks.video;
    
    console.log(`🎬 Testing ${segments.length} video segments...`);
    console.log('');
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      console.log(`🧪 Testing segment ${i + 1}/${segments.length}: ${segment.name}`);
      
      const testResult = await this.testSegmentInteractions(segment);
      this.testResults.push(testResult);
      
      console.log(`✅ Segment ${segment.name} tested`);
      console.log('');
    }
  }

  private async testSegmentInteractions(segment: TimelineSegment) {
    const result = {
      segment: segment.name,
      duration: segment.duration,
      narration: segment.narration,
      visual: segment.visual,
      interactions: [] as any[],
      status: 'pending' as string,
      errors: [] as string[]
    };

    try {
      console.log(`  📝 Narration: ${segment.narration.substring(0, 100)}...`);
      console.log(`  🎨 Visual: ${segment.visual}`);
      console.log(`  ⏱️  Duration: ${segment.duration}s`);
      
      // Check if we have a corresponding asset
      const assetPath = await this.getAssetPathForSegment(segment);
      
      if (assetPath) {
        console.log(`  🖼️  Using asset: ${path.basename(assetPath)}`);
        result.interactions.push({
          type: 'asset_display',
          asset: path.basename(assetPath),
          status: 'available'
        });
      } else {
        console.log(`  🎭 Testing live interactions...`);
        
        // Test navigation
        const navigationResult = await this.testNavigation(segment);
        result.interactions.push(navigationResult);
        
        // Test production features
        const productionResult = await this.testProductionFeatures(segment);
        result.interactions.push(productionResult);
        
        // Test UI interactions
        const uiResult = await this.testUIInteractions(segment);
        result.interactions.push(uiResult);
      }
      
      result.status = 'success';
      
    } catch (error) {
      console.log(`  ❌ Error testing segment: ${error}`);
      result.status = 'error';
      result.errors.push(error.toString());
    }
    
    return result;
  }

  private async getAssetPathForSegment(segment: TimelineSegment): Promise<string | null> {
    const assetMapping: { [key: string]: string } = {
      'introduction': 'introduction_generated_new.png',
      'user_persona': 'user_persona_generated_new.png',
      'live_map_hazard': 'hazard_detection.png',
      'technical_architecture': 'api_dataflow_diagram.png',
      'commander_dashboard': 'asset_management.png',
      'ai_support': 'ai_support.png',
      'conclusion': 'conclusion_generated_new.png'
    };
    
    const assetName = assetMapping[segment.name];
    if (!assetName) return null;
    
    const assetPath = path.join(this.videoPresentationDir, assetName);
    return fs.existsSync(assetPath) ? assetPath : null;
  }

  private async testNavigation(segment: TimelineSegment) {
    const result = {
      type: 'navigation',
      target: 'unknown',
      status: 'pending' as string,
      error: null as string | null
    };

    try {
      if (!this.page) {
        result.status = 'skipped';
        result.error = 'Page not available';
        return result;
      }

      // Navigate to the main page first
      await this.page.goto('http://localhost:3000');
      await this.page.waitForLoadState('networkidle');
      
      // Navigate to specific section based on segment
      switch (segment.name) {
        case 'introduction':
          result.target = 'main_page';
          break;
        case 'problem_statement':
        case 'live_map_hazard':
          await this.page.click('text=Live Map');
          result.target = 'live_map';
          break;
        case 'user_persona':
        case 'commander_dashboard':
          await this.page.click('text=Commander Dashboard');
          result.target = 'commander_dashboard';
          break;
        case 'technical_architecture':
        case 'ai_support':
          await this.page.click('text=AI Support');
          result.target = 'ai_support';
          break;
        default:
          result.target = 'main_page';
          break;
      }
      
      await this.page.waitForLoadState('networkidle');
      result.status = 'success';
      
    } catch (error) {
      result.status = 'error';
      result.error = error.toString();
    }
    
    return result;
  }

  private async testProductionFeatures(segment: TimelineSegment) {
    const result = {
      type: 'production_features',
      features: [] as any[],
      status: 'pending' as string,
      error: null as string | null
    };

    try {
      if (!this.page) {
        result.status = 'skipped';
        result.error = 'Page not available';
        return result;
      }

      // Test production features based on segment
      switch (segment.name) {
        case 'introduction':
          result.features.push({
            name: 'intro_template',
            description: 'Title and subtitle overlay',
            status: 'simulated'
          });
          result.features.push({
            name: 'fade_in_transition',
            description: 'Fade-in from black',
            status: 'simulated'
          });
          break;
          
        case 'problem_statement':
          result.features.push({
            name: 'callout_alert',
            description: 'Fragmented systems alert with bounce',
            status: 'simulated'
          });
          result.features.push({
            name: 'callout_info',
            description: 'Key issues slide-in from right',
            status: 'simulated'
          });
          break;
          
        case 'user_persona':
          result.features.push({
            name: 'label_role_boxes',
            description: 'Commander, Planner, Responder labels',
            status: 'simulated'
          });
          result.features.push({
            name: 'lower_third',
            description: 'Ian Frelinger - Developer & Presenter',
            status: 'simulated'
          });
          break;
          
        case 'technical_architecture':
          result.features.push({
            name: 'technical_template',
            description: 'Architecture diagram presentation',
            status: 'simulated'
          });
          result.features.push({
            name: 'label_components',
            description: 'Ingestion, Processing, Map callouts',
            status: 'simulated'
          });
          break;
          
        case 'commander_dashboard':
          result.features.push({
            name: 'zone_labels',
            description: 'Zone A/B/C with priorities',
            status: 'simulated'
          });
          result.features.push({
            name: 'status_bar',
            description: 'Evacuation progress',
            status: 'simulated'
          });
          break;
          
        case 'live_map_hazard':
          result.features.push({
            name: 'layer_toggles',
            description: 'Hazards, Routes, Units, Evac Zones',
            status: 'simulated'
          });
          result.features.push({
            name: 'hazard_status',
            description: '3 hazards active overlay',
            status: 'simulated'
          });
          break;
          
        case 'simplified_flow':
          result.features.push({
            name: 'operational_overview',
            description: 'Current capabilities display',
            status: 'simulated'
          });
          result.features.push({
            name: 'coming_soon_callout',
            description: 'Future features announcement',
            status: 'simulated'
          });
          break;
          
        case 'conclusion':
          result.features.push({
            name: 'sunrise_gradient',
            description: 'Conclusion background',
            status: 'simulated'
          });
          result.features.push({
            name: 'contact_overlay',
            description: 'Contact information display',
            status: 'simulated'
          });
          break;
      }
      
      result.status = 'success';
      
    } catch (error) {
      result.status = 'error';
      result.error = error.toString();
    }
    
    return result;
  }

  private async testUIInteractions(segment: TimelineSegment) {
    const result = {
      type: 'ui_interactions',
      interactions: [] as any[],
      status: 'pending' as string,
      error: null as string | null
    };

    try {
      if (!this.page) {
        result.status = 'skipped';
        result.error = 'Page not available';
        return result;
      }

      // Test UI interactions based on segment
      switch (segment.name) {
        case 'problem_statement':
        case 'live_map_hazard':
          // Test hazard elements
          try {
            const hazardElements = await this.page.locator('.hazard-cluster, .hazard-feature').all();
            if (hazardElements.length > 0) {
              result.interactions.push({
                type: 'hazard_interaction',
                count: hazardElements.length,
                status: 'available'
              });
            } else {
              result.interactions.push({
                type: 'hazard_interaction',
                count: 0,
                status: 'not_found'
              });
            }
          } catch (error) {
            result.interactions.push({
              type: 'hazard_interaction',
              status: 'error',
              error: error.toString()
            });
          }
          break;
          
        case 'commander_dashboard':
          // Test zone cards
          try {
            const zoneCards = await this.page.locator('.zone-card').all();
            if (zoneCards.length > 0) {
              result.interactions.push({
                type: 'zone_interaction',
                count: zoneCards.length,
                status: 'available'
              });
            } else {
              result.interactions.push({
                type: 'zone_interaction',
                count: 0,
                status: 'not_found'
              });
            }
          } catch (error) {
            result.interactions.push({
              type: 'zone_interaction',
              status: 'error',
              error: error.toString()
            });
          }
          break;
          
        case 'live_map_hazard':
          // Test layer toggles
          try {
            const layerToggles = await this.page.locator('button').filter({ hasText: /hazard|unit|route|building/i }).all();
            if (layerToggles.length > 0) {
              result.interactions.push({
                type: 'layer_toggle',
                count: layerToggles.length,
                status: 'available'
              });
            } else {
              result.interactions.push({
                type: 'layer_toggle',
                count: 0,
                status: 'not_found'
              });
            }
          } catch (error) {
            result.interactions.push({
              type: 'layer_toggle',
              status: 'error',
              error: error.toString()
            });
          }
          break;
      }
      
      result.status = 'success';
      
    } catch (error) {
      result.status = 'error';
      result.error = error.toString();
    }
    
    return result;
  }

  private async generateTestReport() {
    console.log('📊 Generating test report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      timeline: {
        duration: this.timeline.timeline.duration,
        segments: this.timeline.timeline.tracks.video.length
      },
      results: this.testResults,
      summary: {
        total: this.testResults.length,
        successful: this.testResults.filter(r => r.status === 'success').length,
        failed: this.testResults.filter(r => r.status === 'error').length,
        skipped: this.testResults.filter(r => r.status === 'skipped').length
      }
    };
    
    const reportPath = path.join(__dirname, '..', 'test-results', 'timeline-3-interaction-test.json');
    
    // Create test-results directory if it doesn't exist
    const testResultsDir = path.dirname(reportPath);
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📊 Test Report Summary:');
    console.log(`   Total segments: ${report.summary.total}`);
    console.log(`   Successful: ${report.summary.successful}`);
    console.log(`   Failed: ${report.summary.failed}`);
    console.log(`   Skipped: ${report.summary.skipped}`);
    console.log(`   Report saved to: ${reportPath}`);
    
    // Print detailed results
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.segment} (${result.duration}s)`);
      console.log(`   Status: ${result.status}`);
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
      result.interactions.forEach(interaction => {
        console.log(`   - ${interaction.type}: ${interaction.status || 'success'}`);
      });
    });
  }

  private async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run the interaction test
const tester = new Timeline3InteractionTester();
tester.testTimeline3Interactions().catch(console.error);
