// Shared types for video production pipeline
// This file eliminates hardcoded values and provides consistent interfaces

export interface VideoSegment {
  id: string;
  name: string;
  source: string;
  duration: number;
  start: number;
  outputFile: string;
  transitions?: {
    in?: string;
    out?: string;
  };
  technicalFocus?: string;
}

export interface AudioSegment {
  id: string;
  source: string;
  start: number;
  duration: number;
  volume: number;
  ducking?: boolean;
  fade?: {
    in: number;
    out: number;
  };
}

export interface GraphicsElement {
  id: string;
  text: string;
  start: number;
  duration: number;
  position: string;
  style: string;
}

export interface TimelineConfig {
  duration: number;
  fps: number;
  resolution: [number, number];
  tracks: {
    video: VideoSegment[];
    audio: {
      voiceover: AudioSegment;
      music: AudioSegment;
      effects: AudioSegment[];
    };
    graphics: {
      lower_thirds: GraphicsElement[];
    };
  };
}

export interface NarrationSegment {
  id: string;
  title: string;
  duration: number;
  narration: string;
  voice: string;
  emphasis: string;
}

export interface VoiceProvider {
  voice_id?: string;
  stability?: number;
  similarity_boost?: number;
  api_key_env?: string;
}

export interface NarrationConfig {
  voice_provider: string;
  voice_providers: {
    elevenlabs?: VoiceProvider;
    openai?: any;
    azure?: any;
    piper?: any;
  };
  segments: NarrationSegment[];
}

export interface CaptureConfig {
  id: string;
  name: string;
  duration: number;
  description: string;
  actions: string[];
  outputFile: string;
}

export interface ProductionConfig {
  timelineFile: string;
  narrationFile: string;
  outputDir: string;
  tempDir: string;
}

// Default configuration values
export const DEFAULT_CONFIG = {
  outputDir: './output',
  tempDir: './temp',
  capturesDir: './captures',
  audioDir: './audio',
  timelineFile: './config/timeline-fixed.yaml',
  narrationFile: './config/narration-fixed.yaml'
};

// File naming conventions
export const FILE_PATTERNS = {
  video: {
    extension: '.webm',
    prefix: '',
    suffix: ''
  },
  audio: {
    extension: '.mp3',
    prefix: '',
    suffix: '-narration'
  },
  captures: {
    extension: '.webm',
    prefix: '',
    suffix: ''
  }
};

// Validation functions
export function validateSegment(segment: VideoSegment): boolean {
  return !!(segment.id && segment.name && segment.source && segment.duration > 0);
}

export function validateTimeline(timeline: TimelineConfig): boolean {
  return !!(timeline.duration > 0 && timeline.fps > 0 && timeline.resolution.length === 2);
}

export function validateNarration(narration: NarrationConfig): boolean {
  return !!(narration.voice_provider && narration.segments.length > 0);
}
