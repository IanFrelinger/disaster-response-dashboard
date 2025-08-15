#!/usr/bin/env tsx

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface UIComponent {
  tag: string;
  id?: string;
  className?: string;
  text?: string;
  role?: string;
  type?: string;
  value?: string;
  href?: string;
  src?: string;
  alt?: string;
  ariaLabel?: string;
  dataAttributes: { [key: string]: string };
  interactions: string[];
  children: UIComponent[];
  selector: string;
  xpath: string;
}

interface PageMap {
  name: string;
  url: string;
  components: UIComponent[];
  summary: {
    totalComponents: number;
    clickableElements: number;
    formElements: number;
    navigationElements: number;
    interactiveElements: number;
  };
}

class UIComponentMapper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private outputDir: string = 'captures';

  constructor() {
    this.ensureOutputDirs();
  }

  private ensureOutputDirs(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async initialize(): Promise<boolean> {
    console.log('🚀 Initializing Playwright browser for UI component mapping...');
    
    try {
      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 }
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(30000);
      
      console.log('✅ Browser initialized successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      return false;
    }
  }

  async navigateToApp(): Promise<boolean> {
    if (!this.page) {
      console.error('❌ Page not initialized');
      return false;
    }
    
    const url = process.env.HOST_FRONTEND_URL || "http://localhost:3000";
    console.log(`🌐 Navigating to: ${url}`);
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForSelector("#root");
      await this.page.waitForTimeout(2000);
      
      console.log('✅ App loaded successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to navigate to app:', error);
      return false;
    }
  }

  private async mapElement(element: any, depth: number = 0): Promise<UIComponent> {
    if (!element) return {} as UIComponent;

    const tag = element.tagName?.toLowerCase() || 'unknown';
    const id = element.id || undefined;
    const className = element.className || undefined;
    const text = element.textContent?.trim().substring(0, 100) || undefined;
    const role = element.getAttribute('role') || undefined;
    const type = element.getAttribute('type') || undefined;
    const value = element.getAttribute('value') || undefined;
    const href = element.getAttribute('href') || undefined;
    const src = element.getAttribute('src') || undefined;
    const alt = element.getAttribute('alt') || undefined;
    const ariaLabel = element.getAttribute('aria-label') || undefined;

    // Get data attributes
    const dataAttributes: { [key: string]: string } = {};
    const attributes = element.attributes;
    if (attributes) {
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name.startsWith('data-')) {
          dataAttributes[attr.name] = attr.value;
        }
      }
    }

    // Determine available interactions
    const interactions: string[] = [];
    if (tag === 'button' || element.onclick || element.getAttribute('onclick')) {
      interactions.push('click');
    }
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      interactions.push('type', 'focus', 'blur');
      if (type === 'checkbox' || type === 'radio') {
        interactions.push('check', 'uncheck');
      }
      if (type === 'file') {
        interactions.push('upload');
      }
    }
    if (tag === 'a' && href) {
      interactions.push('click', 'navigate');
    }
    if (tag === 'img') {
      interactions.push('click', 'hover');
    }
    if (element.onmouseenter || element.onmouseleave) {
      interactions.push('hover');
    }
    if (element.ondragstart || element.ondrop) {
      interactions.push('drag', 'drop');
    }
    if (element.onscroll || element.scrollTop !== undefined) {
      interactions.push('scroll');
    }

    // Generate selector
    let selector = tag;
    if (id) {
      selector = `#${id}`;
    } else if (className) {
      const classes = className.split(' ').filter(c => c.trim()).map(c => `.${c.trim()}`).join('');
      selector = `${tag}${classes}`;
    }

    // Generate XPath
    let xpath = `//${tag}`;
    if (id) {
      xpath = `//*[@id="${id}"]`;
    } else if (className) {
      const classes = className.split(' ').filter(c => c.trim()).map(c => `contains(@class, "${c.trim()}")`).join(' and ');
      xpath = `//${tag}[${classes}]`;
    }

    // Map children (limit depth to avoid infinite recursion)
    const children: UIComponent[] = [];
    if (depth < 3 && element.children) {
      for (let i = 0; i < Math.min(element.children.length, 10); i++) {
        try {
          const child = await this.mapElement(element.children[i], depth + 1);
          if (child.tag) {
            children.push(child);
          }
        } catch (error) {
          // Skip problematic children
        }
      }
    }

    return {
      tag,
      id,
      className,
      text,
      role,
      type,
      value,
      href,
      src,
      alt,
      ariaLabel,
      dataAttributes,
      interactions,
      children,
      selector,
      xpath
    };
  }

  private async mapPageComponents(): Promise<UIComponent[]> {
    if (!this.page) return [];

    console.log('  🔍 Mapping page components...');
    
    try {
      // Get all elements
      const elements = await this.page.$$('*');
      console.log(`  📊 Found ${elements.length} total elements`);
      
      const components: UIComponent[] = [];
      const processedElements = new Set<string>();
      
      // Process elements by type to get a representative sample
      const elementTypes = ['button', 'input', 'a', 'div', 'span', 'img', 'canvas', 'svg', 'form', 'select', 'textarea'];
      
      for (const elementType of elementTypes) {
        try {
          const typeElements = await this.page.$$(elementType);
          console.log(`  🔍 Processing ${elementType} elements: ${typeElements.length} found`);
          
          for (let i = 0; i < Math.min(typeElements.length, 20); i++) {
            try {
              const element = typeElements[i];
              const elementId = await element.evaluate(el => el.id || el.className || el.tagName);
              const elementKey = `${elementType}-${elementId}`;
              
              if (!processedElements.has(elementKey)) {
                processedElements.add(elementKey);
                const component = await this.mapElement(element);
                if (component.tag) {
                  components.push(component);
                }
              }
            } catch (error) {
              // Skip problematic elements
            }
          }
        } catch (error) {
          console.log(`  ⚠️ Could not process ${elementType} elements:`, error);
        }
      }
      
      console.log(`  ✅ Mapped ${components.length} components`);
      return components;
      
    } catch (error) {
      console.error('  ❌ Error mapping page components:', error);
      return [];
    }
  }

  private async mapCommanderDashboard(): Promise<PageMap> {
    console.log('\n📊 Mapping Commander Dashboard...');
    
    try {
      // Ensure we're on the dashboard
      await this.page!.click('button:has-text("Commander Dashboard")');
      await this.page!.waitForTimeout(2000);
      
      const components = await this.mapPageComponents();
      
      const summary = {
        totalComponents: components.length,
        clickableElements: components.filter(c => c.interactions.includes('click')).length,
        formElements: components.filter(c => ['input', 'textarea', 'select'].includes(c.tag)).length,
        navigationElements: components.filter(c => c.tag === 'a' || c.role === 'navigation').length,
        interactiveElements: components.filter(c => c.interactions.length > 0).length
      };
      
      await this.page!.screenshot({ 
        path: path.join(this.outputDir, 'commander-dashboard-map.png'),
        fullPage: true 
      });
      
      return {
        name: 'Commander Dashboard',
        url: this.page!.url(),
        components,
        summary
      };
      
    } catch (error) {
      console.error('❌ Error mapping Commander Dashboard:', error);
      return {
        name: 'Commander Dashboard',
        url: '',
        components: [],
        summary: { totalComponents: 0, clickableElements: 0, formElements: 0, navigationElements: 0, interactiveElements: 0 }
      };
    }
  }

  private async mapLiveMap(): Promise<PageMap> {
    console.log('\n🗺️ Mapping Live Map...');
    
    try {
      // Switch to map view
      await this.page!.click('button:has-text("Live Map")');
      await this.page!.waitForTimeout(3000);
      
      const components = await this.mapPageComponents();
      
      const summary = {
        totalComponents: components.length,
        clickableElements: components.filter(c => c.interactions.includes('click')).length,
        formElements: components.filter(c => ['input', 'textarea', 'select'].includes(c.tag)).length,
        navigationElements: components.filter(c => c.tag === 'a' || c.role === 'navigation').length,
        interactiveElements: components.filter(c => c.interactions.length > 0).length
      };
      
      await this.page!.screenshot({ 
        path: path.join(this.outputDir, 'live-map-map.png'),
        fullPage: true 
      });
      
      return {
        name: 'Live Map',
        url: this.page!.url(),
        components,
        summary
      };
      
    } catch (error) {
      console.error('❌ Error mapping Live Map:', error);
      return {
        name: 'Live Map',
        url: '',
        components: [],
        summary: { totalComponents: 0, clickableElements: 0, formElements: 0, navigationElements: 0, interactiveElements: 0 }
      };
    }
  }

  private async generateComponentReport(pageMaps: PageMap[]): Promise<void> {
    console.log('\n📊 Generating UI Component Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      pages: pageMaps,
      overallSummary: {
        totalPages: pageMaps.length,
        totalComponents: pageMaps.reduce((sum, page) => sum + page.summary.totalComponents, 0),
        totalClickableElements: pageMaps.reduce((sum, page) => sum + page.summary.clickableElements, 0),
        totalFormElements: pageMaps.reduce((sum, page) => sum + page.summary.formElements, 0),
        totalInteractiveElements: pageMaps.reduce((sum, page) => sum + page.summary.interactiveElements, 0)
      }
    };
    
    const reportPath = path.join(this.outputDir, 'ui-component-map.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    
    // Generate human-readable summary
    const summaryPath = path.join(this.outputDir, 'ui-component-summary.md');
    let summary = `# UI Component Map Summary\n\n`;
    summary += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    pageMaps.forEach(page => {
      summary += `## ${page.name}\n\n`;
      summary += `- **Total Components**: ${page.summary.totalComponents}\n`;
      summary += `- **Clickable Elements**: ${page.summary.clickableElements}\n`;
      summary += `- **Form Elements**: ${page.summary.formElements}\n`;
      summary += `- **Navigation Elements**: ${page.summary.navigationElements}\n`;
      summary += `- **Interactive Elements**: ${page.summary.interactiveElements}\n\n`;
      
      // List key components
      const keyComponents = page.components.filter(c => 
        c.id || 
        c.className?.includes('button') || 
        c.className?.includes('card') || 
        c.className?.includes('nav') ||
        c.role === 'button' ||
        c.role === 'navigation'
      ).slice(0, 20);
      
      if (keyComponents.length > 0) {
        summary += `### Key Components\n\n`;
        keyComponents.forEach(comp => {
          summary += `- **${comp.tag}**`;
          if (comp.id) summary += ` (ID: ${comp.id})`;
          if (comp.className) summary += ` (Class: ${comp.className})`;
          if (comp.text) summary += ` - "${comp.text}"`;
          if (comp.interactions.length > 0) summary += ` [${comp.interactions.join(', ')}]`;
          summary += `\n`;
        });
        summary += `\n`;
      }
    });
    
    summary += `## Overall Summary\n\n`;
    summary += `- **Total Pages**: ${report.overallSummary.totalPages}\n`;
    summary += `- **Total Components**: ${report.overallSummary.totalComponents}\n`;
    summary += `- **Total Clickable Elements**: ${report.overallSummary.totalClickableElements}\n`;
    summary += `- **Total Form Elements**: ${report.overallSummary.totalFormElements}\n`;
    summary += `- **Total Interactive Elements**: ${report.overallSummary.totalInteractiveElements}\n\n`;
    
    summary += `## Usage Notes\n\n`;
    summary += `This map shows all available UI components and their interactions.\n`;
    summary += `Use the selectors and interactions to create realistic demo recordings.\n`;
    summary += `Focus on elements with multiple interactions for the most engaging demos.\n`;
    
    fs.writeFileSync(summaryPath, summary);
    console.log(`📝 Human-readable summary saved to: ${summaryPath}`);
  }

  async runComponentMapping(): Promise<void> {
    console.log('🎬 Starting UI Component Mapping');
    console.log('=' .repeat(50));
    console.log('This will map all UI components on each page with their available interactions.');

    try {
      if (!(await this.initialize())) {
        throw new Error('Failed to initialize browser');
      }

      if (!(await this.navigateToApp())) {
        throw new Error('Failed to navigate to app');
      }

      const pageMaps: PageMap[] = [];
      
      // Map Commander Dashboard
      const dashboardMap = await this.mapCommanderDashboard();
      pageMaps.push(dashboardMap);
      
      // Map Live Map
      const mapMap = await this.mapLiveMap();
      pageMaps.push(mapMap);
      
      // Generate comprehensive report
      await this.generateComponentReport(pageMaps);
      
      console.log('\n✅ UI Component Mapping completed successfully!');
      console.log('📁 Check the captures directory for the component map and screenshots');
      
    } catch (error) {
      console.error('❌ UI Component Mapping failed:', error);
    } finally {
      if (this.page) {
        await this.page.close();
      }
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Main execution
async function main() {
  const mapper = new UIComponentMapper();
  await mapper.runComponentMapping();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { UIComponentMapper };
