import { Map as MapboxMap } from 'mapbox-gl';
// import * as THREE from 'three';

// Core Map Configuration
export interface TacMapConfig {
  style: {
    version: 8;
    sources: {
      terrain: {
        type: 'raster-dem';
        url: string;
        tileSize: number;
        maxzoom: number;
      };
      satellite: {
        type: 'raster';
        url: string;
        tileSize: number;
      };
    };
    layers: any[];
    fog: {
      color: any;
      'horizon-blend': number;
      'high-color': string;
      'space-color': string;
      'star-intensity': number;
    };
  };
  renderConfig: {
    antialias: boolean;
    preserveDrawingBuffer: boolean;
    failIfMajorPerformanceCaveat: boolean;
  };
}

// Zoom Configuration
export interface ZoomConfiguration {
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
  zoomDuration: number;
  lodBreakpoints: {
    overview: { min: number; max: number };
    regional: { min: number; max: number };
    tactical: { min: number; max: number };
    detail: { min: number; max: number };
  };
}

// Pan Constraints
export interface PanConstraints {
  bounds?: any;
  maxBounds?: any;
  padding?: number;
  elastic?: boolean;
}

// Tooltip System
export interface TooltipData {
  id: string;
  type: 'unit' | 'hazard' | 'evacuation' | 'hexagon';
  title: string;
  content: Record<string, any>;
  priority: number;
  position: { x: number; y: number };
  anchor?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

// Context Menu
export interface MenuItem {
  label?: string;
  action?: string;
  icon?: string;
  divider?: boolean;
}

export interface ContextMenu {
  items: MenuItem[];
  position: { x: number; y: number };
  target: any;
}

// Performance Metrics
export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  gpuUsage: number;
  memoryUsage: number;
  dataPoints: number;
}

export interface PerformanceTargets {
  fps: {
    target: number;
    minimum: number;
    measurement: string;
  };
  renderTime: {
    target: number;
    maximum: number;
  };
  dataPoints: {
    lowDetail: number;
    mediumDetail: number;
    highDetail: number;
  };
  memory: {
    maxHeap: number;
    maxGPU: number;
  };
}

// Map Features
export interface MapFeature {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: number[][];
  };
  properties: Record<string, any>;
  bbox?: number[];
}

// Hover State Machine
export type HoverState = 'idle' | 'hovering' | 'showing';

export interface HoverStateMachine {
  idle: {
    mouseenter: (feature: any) => HoverState;
  };
  hovering: {
    mouseleave: () => HoverState;
    timeout: (feature: any) => HoverState;
  };
  showing: {
    mouseleave: () => HoverState;
    mousemove: (event: MouseEvent) => HoverState;
  };
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: (t: number) => number;
  delay?: number;
}

// Shader Types
export interface ShaderConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, any>;
}

// Map Layer Types
export interface MapLayer {
  id: string;
  type: string;
  source: string;
  paint?: Record<string, any>;
  layout?: Record<string, any>;
  filter?: any[];
  minzoom?: number;
  maxzoom?: number;
}

// Event Types
export interface MapEvent {
  type: string;
  target: any;
  point: { x: number; y: number };
  lngLat: { lng: number; lat: number };
  features?: any[];
}

// Hexagon Grid
export interface HexagonGrid {
  resolution: number;
  bounds: number[];
  features: MapFeature[];
}

// Emergency Unit
export interface EmergencyUnit {
  id: string;
  type: 'fire' | 'police' | 'medical' | 'rescue';
  status: 'available' | 'responding' | 'on-scene' | 'returning';
  location: [number, number];
  personnel: number;
  fuel: number;
  equipment: string[];
  assignedIncident?: string;
}

// Hazard Zone
export interface HazardZone {
  id: string;
  type: 'fire' | 'flood' | 'earthquake' | 'chemical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: [number, number];
  radius: number;
  spreadRate: number;
  timeToImpact: string;
  affectedArea: number;
}

// Evacuation Route
export interface EvacuationRoute {
  id: string;
  startPoint: [number, number];
  endPoint: [number, number];
  waypoints: [number, number][];
  status: 'open' | 'closed' | 'congested';
  capacity: number;
  currentUsage: number;
  estimatedTime: number;
}

// Map Context
export interface MapContext {
  map: MapboxMap | null;
  zoomController: ZoomController | null;
  panController: PanController | null;
  tooltipManager: TooltipManager | null;
  hoverManager: HoverEffectManager | null;
  performanceOptimizer: PerformanceOptimizer | null;
}

// Controller Classes (will be implemented)
export class ZoomController {
  private map: MapboxMap;
  private targetZoom: number;
  private isZooming: boolean = false;
  private lastPinchDistance: number | null = null;
  
  constructor(map: MapboxMap) {
    this.map = map;
    this.targetZoom = map.getZoom();
  }
  
  smoothZoom(delta: number, center?: [number, number]): void {
    if (this.isZooming) return;
    
    this.isZooming = true;
    const currentZoom = this.map.getZoom();
    this.targetZoom = Math.max(3, Math.min(20, currentZoom + delta));
    
    this.map.easeTo({
      zoom: this.targetZoom,
      center: center || (this.map.getCenter().toArray() as [number, number]),
      duration: 300,
      easing: (t) => t * (2 - t), // Ease-out quad
      animate: true
    });
    
    this.updateLOD(this.targetZoom);
    
    setTimeout(() => {
      this.isZooming = false;
    }, 300);
  }
  
  handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = -event.deltaY * 0.001;
    const mousePos = this.map.project([event.clientX, event.clientY]);
    
    this.smoothZoom(delta, [mousePos.x, mousePos.y]);
  }
  
  handleKeyboard(event: KeyboardEvent): void {
    switch(event.key) {
      case '+':
      case '=':
        this.smoothZoom(1);
        break;
      case '-':
      case '_':
        this.smoothZoom(-1);
        break;
      case '0':
        this.resetZoom();
        break;
    }
  }
  
  handlePinch(event: TouchEvent): void {
    if (event.touches.length !== 2) return;
    
    const distance = Math.hypot(
      (event.touches[0]?.clientX || 0) - (event.touches[1]?.clientX || 0),
      (event.touches[0]?.clientY || 0) - (event.touches[1]?.clientY || 0)
    );
    
    if (this.lastPinchDistance) {
      const delta = (distance - this.lastPinchDistance) * 0.01;
      this.smoothZoom(delta);
    }
    
    this.lastPinchDistance = distance;
  }
  
  resetZoom(): void {
    this.smoothZoom(12 - this.map.getZoom());
  }
  
  private updateLOD(zoom: number): void {
    // Update Level of Detail based on zoom
    const lodLevel = this.getLODLevel(zoom);
    
    // Update layer visibility based on zoom level
    const layers = ['emergency-units', 'evacuation-routes', 'hexagon-grid'];
    layers.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, 
          'visibility', 
          lodLevel >= 2 ? 'visible' : 'none'
        );
      }
    });
    
    // Update data decimation
    if (lodLevel < 2) {
      this.decimateData(0.5); // Show 50% of points
    } else if (lodLevel < 3) {
      this.decimateData(0.75); // Show 75% of points
    } else {
      this.decimateData(1.0); // Show all points
    }
  }
  
  private getLODLevel(zoom: number): number {
    if (zoom < 8) return 1; // Overview
    if (zoom < 12) return 2; // Regional
    if (zoom < 16) return 3; // Tactical
    return 4; // Detail
  }
  
  private decimateData(ratio: number): void {
    // Implementation for data decimation would go here
    // This would involve updating the data sources with fewer points
    console.log(`Decimating data to ${ratio * 100}%`);
  }
}

export class PanController {
  private map: MapboxMap;
  private isPanning: boolean = false;
  private panStart: { x: number; y: number } | null = null;
  private velocity: { x: number; y: number } = { x: 0, y: 0 };
  private friction: number = 0.92;
  private edgePanThreshold: number = 50;
  private animationFrame: number | null = null;
  
  constructor(map: MapboxMap) {
    this.map = map;
  }
  
  handleMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // Left click only
    
    this.isPanning = true;
    this.panStart = { x: event.clientX, y: event.clientY };
    this.map.getCanvas().style.cursor = 'grabbing';
    
    // Add drag feedback
    this.addDragFeedback();
  }
  
  handleMouseMove(event: MouseEvent): void {
    // Edge panning
    this.checkEdgePan(event.clientX, event.clientY);
    
    if (!this.isPanning || !this.panStart) return;
    
    const deltaX = event.clientX - this.panStart.x;
    const deltaY = event.clientY - this.panStart.y;
    
    // Calculate velocity for momentum
    this.velocity = {
      x: deltaX * 0.5,
      y: deltaY * 0.5
    };
    
    // Apply pan with current map bearing
    this.map.panBy([deltaX, deltaY], {
      animate: false
    });
    
    this.panStart = { x: event.clientX, y: event.clientY };
  }
  
  handleMouseUp(): void {
    this.isPanning = false;
    this.panStart = null;
    this.map.getCanvas().style.cursor = '';
    
    // Apply momentum
    this.applyMomentum();
    this.removeDragFeedback();
  }
  
  handleKeyboardPan(direction: 'up' | 'down' | 'left' | 'right'): void {
    const panDistance = 100; // pixels
    const animations = {
      up: [0, -panDistance] as [number, number],
      down: [0, panDistance] as [number, number],
      left: [-panDistance, 0] as [number, number],
      right: [panDistance, 0] as [number, number]
    };
    
    this.map.panBy(animations[direction], {
      duration: 200,
      easing: (t) => t * (2 - t)
    });
    
    // Visual feedback
    this.showPanIndicator(direction);
  }
  
  handleTouchPan(event: TouchEvent): void {
    if (event.touches.length !== 1) return;
    
    const touch = event.touches[0];
    
    if (event.type === 'touchstart') {
      this.panStart = { x: touch?.clientX || 0, y: touch?.clientY || 0 };
    } else if (event.type === 'touchmove' && this.panStart) {
      const deltaX = (touch?.clientX || 0) - this.panStart.x;
      const deltaY = (touch?.clientY || 0) - this.panStart.y;
      
      this.map.panBy([deltaX, deltaY], { animate: false });
      this.panStart = { x: touch?.clientX || 0, y: touch?.clientY || 0 };
    } else if (event.type === 'touchend') {
      this.panStart = null;
    }
  }
  
  // Edge panning (mouse near viewport edge)
  private checkEdgePan(x: number, y: number): void {
    const viewport = this.map.getCanvas().getBoundingClientRect();
    const panSpeed = 5;
    
    let panX = 0;
    let panY = 0;
    
    if (x < this.edgePanThreshold) {
      panX = -panSpeed * (1 - x / this.edgePanThreshold);
    } else if (x > viewport.width - this.edgePanThreshold) {
      panX = panSpeed * (1 - (viewport.width - x) / this.edgePanThreshold);
    }
    
    if (y < this.edgePanThreshold) {
      panY = -panSpeed * (1 - y / this.edgePanThreshold);
    } else if (y > viewport.height - this.edgePanThreshold) {
      panY = panSpeed * (1 - (viewport.height - y) / this.edgePanThreshold);
    }
    
    if (panX !== 0 || panY !== 0) {
      this.map.panBy([panX, panY], { animate: false });
      this.showEdgePanIndicator(panX, panY);
    }
  }
  
  // Momentum/inertia after pan
  private applyMomentum(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    const animate = () => {
      if (Math.abs(this.velocity.x) < 0.1 && Math.abs(this.velocity.y) < 0.1) {
        return;
      }
      
      this.map.panBy([this.velocity.x, this.velocity.y], {
        animate: false
      });
      
      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  private addDragFeedback(): void {
    // Add visual feedback during dragging
    const canvas = this.map.getCanvas();
    canvas.style.filter = 'brightness(1.1)';
  }
  
  private removeDragFeedback(): void {
    // Remove visual feedback
    const canvas = this.map.getCanvas();
    canvas.style.filter = '';
  }
  
  private showPanIndicator(direction: string): void {
    // Show directional indicator
    console.log(`Panning ${direction}`);
  }
  
  private showEdgePanIndicator(panX: number, panY: number): void {
    // Show edge pan indicator
    if (Math.abs(panX) > 0 || Math.abs(panY) > 0) {
      console.log(`Edge panning: ${panX}, ${panY}`);
    }
  }
}

export class TooltipManager {
  private activeTooltip: TooltipData | null = null;
  private hoverTimeout: any = null;
  private tooltipElement: HTMLElement | null = null;
  private showDelay: number = 200;
  private hideDelay: number = 100;
  
  init(container: HTMLElement): void {
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'tacmap-tooltip';
    this.tooltipElement.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    `;
    container.appendChild(this.tooltipElement);
  }
  
  show(data: TooltipData): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    this.hoverTimeout = setTimeout(() => {
      this.activeTooltip = data;
      this.render();
      this.position();
      
      // Animate in
      requestAnimationFrame(() => {
        if (this.tooltipElement) {
          this.tooltipElement.style.opacity = '1';
          this.tooltipElement.classList.add('active');
        }
      });
    }, this.showDelay);
  }
  
  hide(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    this.hoverTimeout = setTimeout(() => {
      if (this.tooltipElement) {
        this.tooltipElement.style.opacity = '0';
        this.tooltipElement.classList.remove('active');
      }
      this.activeTooltip = null;
    }, this.hideDelay);
  }
  
  private render(): void {
    if (!this.tooltipElement || !this.activeTooltip) return;
    
    const { type, title, content } = this.activeTooltip;
    
    // Type-specific rendering
    let html = '';
    
    switch (type) {
      case 'unit':
        html = this.renderUnitTooltip(title, content);
        break;
      case 'hazard':
        html = this.renderHazardTooltip(title, content);
        break;
      case 'evacuation':
        html = this.renderEvacuationTooltip(title, content);
        break;
      case 'hexagon':
        html = this.renderHexagonTooltip(title, content);
        break;
      default:
        html = this.renderDefaultTooltip(title, content);
    }
    
    this.tooltipElement.innerHTML = html;
  }
  
  private position(): void {
    if (!this.tooltipElement || !this.activeTooltip) return;
    
    const { position, anchor } = this.activeTooltip;
    const rect = this.tooltipElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    let x = position.x;
    let y = position.y;
    
    // Smart positioning to keep tooltip in viewport
    if (anchor === 'auto' || !anchor) {
      // Determine best position
      if (x + rect.width > viewport.width - 20) {
        x = position.x - rect.width - 10;
      } else {
        x = position.x + 10;
      }
      
      if (y + rect.height > viewport.height - 20) {
        y = position.y - rect.height - 10;
      } else {
        y = position.y + 10;
      }
    } else {
      // Fixed anchor positioning
      switch (anchor) {
        case 'top':
          x = position.x - rect.width / 2;
          y = position.y - rect.height - 10;
          break;
        case 'bottom':
          x = position.x - rect.width / 2;
          y = position.y + 10;
          break;
        case 'left':
          x = position.x - rect.width - 10;
          y = position.y - rect.height / 2;
          break;
        case 'right':
          x = position.x + 10;
          y = position.y - rect.height / 2;
          break;
      }
    }
    
    this.tooltipElement.style.left = `${x}px`;
    this.tooltipElement.style.top = `${y}px`;
  }
  
  private renderUnitTooltip(title: string, content: any): string {
    return `
      <div class="tooltip-header">
        <span class="tooltip-icon unit-icon"></span>
        <span class="tooltip-title">${title}</span>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-row">
          <span class="label">STATUS:</span>
          <span class="value status-${content.status}">${content.status}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">PERSONNEL:</span>
          <span class="value">${content.personnel}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">FUEL:</span>
          <span class="value">${content.fuel}%</span>
        </div>
        <div class="tooltip-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${content.fuel}%"></div>
          </div>
          <span class="progress-label">FUEL: ${content.fuel}%</span>
        </div>
      </div>
    `;
  }
  
  private renderHazardTooltip(title: string, content: any): string {
    const severity = content.severity || 'medium';
    const timeToImpact = content.timeToImpact || 'Unknown';
    
    return `
      <div class="tooltip-header hazard-${severity}">
        <span class="tooltip-icon hazard-icon pulse"></span>
        <span class="tooltip-title">${title}</span>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-alert">
          <span class="alert-icon">Alert</span>
          <span class="alert-text">DANGER ZONE</span>
        </div>
        <div class="tooltip-row">
          <span class="label">SEVERITY:</span>
          <span class="value severity-${severity}">${severity.toUpperCase()}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">TIME TO IMPACT:</span>
          <span class="value countdown">${timeToImpact}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">SPREAD RATE:</span>
          <span class="value">${content.spreadRate} km/h</span>
        </div>
      </div>
    `;
  }
  
  private renderEvacuationTooltip(title: string, content: any): string {
    return `
      <div class="tooltip-header">
        <span class="tooltip-icon evacuation-icon"></span>
        <span class="tooltip-title">${title}</span>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-row">
          <span class="label">STATUS:</span>
          <span class="value status-${content.status}">${content.status}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">CAPACITY:</span>
          <span class="value">${content.capacity}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">CURRENT USAGE:</span>
          <span class="value">${content.currentUsage}</span>
        </div>
      </div>
    `;
  }
  
  private renderHexagonTooltip(title: string, content: any): string {
    return `
      <div class="tooltip-header">
        <span class="tooltip-icon hexagon-icon"></span>
        <span class="tooltip-title">${title}</span>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-row">
          <span class="label">GRID ID:</span>
          <span class="value">${content.h3Index}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">UNITS:</span>
          <span class="value">${content.units || 0}</span>
        </div>
        <div class="tooltip-row">
          <span class="label">HAZARDS:</span>
          <span class="value">${content.hazards || 0}</span>
        </div>
      </div>
    `;
  }
  
  private renderDefaultTooltip(title: string, content: any): string {
    return `
      <div class="tooltip-header">
        <span class="tooltip-icon"></span>
        <span class="tooltip-title">${title}</span>
      </div>
      <div class="tooltip-body">
        ${Object.entries(content).map(([key, value]) => `
          <div class="tooltip-row">
            <span class="label">${key.toUpperCase()}:</span>
            <span class="value">${String(value)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

export class HoverEffectManager {
  private map: MapboxMap;
  private hoveredFeatures: Map<string, any> = new Map();
  // private _glowEffect?: THREE.ShaderMaterial;
  // private _pulseAnimation?: any;
  
  constructor(map: MapboxMap) {
    this.map = map;
  }
  
  initHoverEffects(): void {
    // Hexagon hover
    this.map.on('mouseenter', 'hexagon-layer', (e) => {
      if (e.features && e.features[0]) {
        this.handleHexagonHover(e.features[0]);
      }
    });
    
    // Unit hover
    this.map.on('mouseenter', 'unit-markers', (e) => {
      if (e.features && e.features[0]) {
        this.handleUnitHover(e.features[0]);
      }
    });
    
    // Global mouse leave
    this.map.on('mouseleave', () => {
      this.clearHoverEffects();
    });
  }
  
  private handleHexagonHover(feature: any): void {
    const hexId = feature.properties.h3Index;
    
    // Apply glow effect
    this.map.setPaintProperty('hexagon-layer', 'fill-color', [
      'case',
      ['==', ['get', 'h3Index'], hexId],
      '#00FFFF',
      '#00CED1'
    ]);
    
    // Add outline pulse
    this.map.setPaintProperty('hexagon-layer', 'fill-outline-color', [
      'case',
      ['==', ['get', 'h3Index'], hexId],
      '#FFFFFF',
      '#00FFFF'
    ]);
    
    // Animate opacity pulse
    this.animatePulse(hexId, 'hexagon-layer');
    
    // Show stats overlay
    this.showHexagonStats(feature);
  }
  
  private handleUnitHover(feature: any): void {
    const unitId = feature.properties.id;
    
    // Scale up icon
    this.map.setLayoutProperty('unit-markers', 'icon-size', [
      'case',
      ['==', ['get', 'id'], unitId],
      1.3,
      1.0
    ]);
    
    // Add halo effect
    this.map.setPaintProperty('unit-markers', 'icon-halo-width', [
      'case',
      ['==', ['get', 'id'], unitId],
      3,
      0
    ]);
    
    this.map.setPaintProperty('unit-markers', 'icon-halo-color', [
      'case',
      ['==', ['get', 'id'], unitId],
      '#00FFFF',
      'transparent'
    ]);
    
    // Draw connection lines to related units
    this.drawUnitConnections(unitId);
  }
  
  private animatePulse(featureId: string, layerId: string): void {
    let opacity = 0.6;
    const animate = () => {
      opacity = opacity === 0.6 ? 0.9 : 0.6;
      
      this.map.setPaintProperty(layerId, 'fill-opacity', [
        'case',
        ['==', ['get', 'id'], featureId],
        opacity,
        0.6
      ]);
      
      if (this.hoveredFeatures.has(featureId)) {
        requestAnimationFrame(animate);
      }
    };
    
    this.hoveredFeatures.set(featureId, true);
    animate();
  }
  
  private clearHoverEffects(): void {
    this.hoveredFeatures.clear();
    
    // Reset hexagon styles
    this.map.setPaintProperty('hexagon-layer', 'fill-color', '#00CED1');
    this.map.setPaintProperty('hexagon-layer', 'fill-outline-color', '#00FFFF');
    this.map.setPaintProperty('hexagon-layer', 'fill-opacity', 0.6);
    
    // Reset unit styles
    this.map.setLayoutProperty('unit-markers', 'icon-size', 1.0);
    this.map.setPaintProperty('unit-markers', 'icon-halo-width', 0);
    
    // Clear connection lines
    this.clearUnitConnections();
  }
  
  private showHexagonStats(feature: any): void {
    // Implementation for showing hexagon statistics
    console.log('Hexagon stats:', feature.properties);
  }
  
  private drawUnitConnections(unitId: string): void {
    // Implementation for drawing connection lines between units
    console.log('Drawing connections for unit:', unitId);
  }
  
  private clearUnitConnections(): void {
    // Implementation for clearing connection lines
    console.log('Clearing unit connections');
  }
  
  /*
  private _create3DGlowEffect(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x00ffff) },
        glowIntensity: { value: 1.0 },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float glowIntensity;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPositionNormal;
        
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vPositionNormal), 2.0);
          vec3 glow = glowColor * intensity * glowIntensity;
          glow *= 1.0 + sin(time * 2.0) * 0.1; // Pulse effect
          gl_FragColor = vec4(glow, intensity);
        }
      `,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
  }
  */
}

export class PerformanceOptimizer {
  private currentQuality: 'low' | 'medium' | 'high' = 'medium';
  private clusteringEnabled: boolean = false;
  // private _lastMetrics: PerformanceMetrics | null = null;
  
  adjustQuality(metrics: PerformanceMetrics): void {
    // this._lastMetrics = metrics;
    
    if (metrics.fps < 30) {
      this.reduceQuality();
    } else if (metrics.fps > 55 && metrics.gpuUsage < 50) {
      this.increaseQuality();
    }
  }
  
  clusterData(zoom: number): void {
    if (zoom < 10) {
      // Use Supercluster for point clustering
      this.enableClustering(50, 10);
    } else {
      this.disableClustering();
    }
  }
  
  cullOccludedFeatures(_viewport: any): MapFeature[] {
    // Simple viewport culling - in a real implementation, this would use
    // more sophisticated spatial indexing
    return []; // Placeholder
  }
  
  getPerformanceMetrics(): PerformanceMetrics {
    // Calculate current performance metrics
    const fps = this.calculateFPS();
    const renderTime = this.calculateRenderTime();
    const gpuUsage = this.estimateGPUUsage();
    const memoryUsage = this.getMemoryUsage();
    const dataPoints = this.getDataPointCount();
    
    return {
      fps,
      renderTime,
      gpuUsage,
      memoryUsage,
      dataPoints
    };
  }
  
  private reduceQuality(): void {
    if (this.currentQuality === 'high') {
      this.currentQuality = 'medium';
      console.log('Reducing quality to medium');
    } else if (this.currentQuality === 'medium') {
      this.currentQuality = 'low';
      console.log('Reducing quality to low');
    }
    
    this.applyQualitySettings();
  }
  
  private increaseQuality(): void {
    if (this.currentQuality === 'low') {
      this.currentQuality = 'medium';
      console.log('Increasing quality to medium');
    } else if (this.currentQuality === 'medium') {
      this.currentQuality = 'high';
      console.log('Increasing quality to high');
    }
    
    this.applyQualitySettings();
  }
  
  private applyQualitySettings(): void {
    const settings = {
      low: {
        antialias: false,
        preserveDrawingBuffer: false,
        maxDataPoints: 1000,
        clusteringRadius: 100
      },
      medium: {
        antialias: true,
        preserveDrawingBuffer: false,
        maxDataPoints: 5000,
        clusteringRadius: 50
      },
      high: {
        antialias: true,
        preserveDrawingBuffer: true,
        maxDataPoints: 10000,
        clusteringRadius: 25
      }
    };
    
    const currentSettings = settings[this.currentQuality];
    console.log('Applying quality settings:', currentSettings);
  }
  
  private enableClustering(radius: number, maxZoom: number): void {
    if (!this.clusteringEnabled) {
      this.clusteringEnabled = true;
      console.log(`Enabling clustering with radius ${radius} and max zoom ${maxZoom}`);
    }
  }
  
  private disableClustering(): void {
    if (this.clusteringEnabled) {
      this.clusteringEnabled = false;
      console.log('Disabling clustering');
    }
  }
  
  private calculateFPS(): number {
    // Simple FPS calculation - in a real implementation, this would track
    // frame times over a rolling window
    return 60; // Placeholder
  }
  
  private calculateRenderTime(): number {
    // Calculate render time - in a real implementation, this would measure
    // actual render loop timing
    return 16; // Placeholder for 60fps
  }
  
  private estimateGPUUsage(): number {
    // Estimate GPU usage - in a real implementation, this would use
    // WebGL extensions or other methods to measure GPU load
    return 30; // Placeholder
  }
  
  private getMemoryUsage(): number {
    // Get memory usage in MB
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return 0;
  }
  
  private getDataPointCount(): number {
    // Get current data point count
    return 1000; // Placeholder
  }
}
