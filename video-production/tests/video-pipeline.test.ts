import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock child_process.execSync
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  copyFileSync: jest.fn(),
  unlinkSync: jest.fn(),
  renameSync: jest.fn(),
  rmSync: jest.fn()
}));

// Import the classes we want to test
import { SimpleTimelineVideoCreator } from '../scripts/create-simple-timeline-video';

describe('Video Processing Pipeline - Unit Tests', () => {
  let testOutputDir: string;
  let mockFs: any;
  let mockExecSync: any;

  beforeEach(() => {
    // Setup test output directory
    testOutputDir = path.join(__dirname, 'test-output');
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Get mocked modules
    mockFs = require('fs');
    mockExecSync = require('child_process').execSync;
    
    // Setup default mock implementations
    mockFs.existsSync.mockReturnValue(false);
    mockFs.mkdirSync.mockImplementation(() => {});
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.copyFileSync.mockImplementation(() => {});
    mockFs.unlinkSync.mockImplementation(() => {});
    mockFs.renameSync.mockImplementation(() => {});
    mockFs.rmSync.mockImplementation(() => {});
    
    mockExecSync.mockImplementation(() => Buffer.from('mock output'));
  });

  afterEach(() => {
    // Cleanup test files
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('SimpleTimelineVideoCreator', () => {
    let creator: SimpleTimelineVideoCreator;

    beforeEach(() => {
      creator = new SimpleTimelineVideoCreator();
    });

    describe('Constructor', () => {
      it('should initialize with correct properties', () => {
        expect(creator).toBeDefined();
        expect(creator['outputDir']).toContain('output');
        expect(creator['videoName']).toBe('disaster-response-timeline-video');
      });

      it('should create output directory if it does not exist', () => {
        mockFs.existsSync.mockReturnValue(false);
        
        new SimpleTimelineVideoCreator();
        
        expect(mockFs.mkdirSync).toHaveBeenCalledWith(
          expect.stringContaining('output'),
          { recursive: true }
        );
      });

      it('should not create output directory if it already exists', () => {
        mockFs.existsSync.mockReturnValue(true);
        
        new SimpleTimelineVideoCreator();
        
        expect(mockFs.mkdirSync).not.toHaveBeenCalled();
      });
    });

    describe('defineTimelineSegments', () => {
      it('should return exactly 13 segments', () => {
        const segments = creator['defineTimelineSegments']();
        expect(segments).toHaveLength(13);
      });

      it('should have correct total duration of 240 seconds', () => {
        const segments = creator['defineTimelineSegments']();
        const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
        expect(totalDuration).toBe(240);
      });

      it('should have correct segment timing', () => {
        const segments = creator['defineTimelineSegments']();
        
        // Test first segment
        expect(segments[0]).toEqual({
          name: 'intro',
          start: 0,
          duration: 15,
          description: 'Introduction to Disaster Response Platform',
          lowerThird: 'Disaster Response Platform',
          businessValue: 'Immediate situational awareness for emergency commanders'
        });

        // Test middle segment
        expect(segments[6]).toEqual({
          name: 'zones',
          start: 115,
          duration: 10,
          description: 'Evacuation Zone Definition',
          lowerThird: 'Evacuation Zone Definition',
          businessValue: 'Dynamic zone management for optimal evacuation planning'
        });

        // Test last segment
        expect(segments[12]).toEqual({
          name: 'conclusion',
          start: 225,
          duration: 15,
          description: 'Conclusion and Next Steps',
          lowerThird: 'Conclusion & Next Steps',
          businessValue: 'Ready for pilot deployment and stakeholder engagement'
        });
      });

      it('should have sequential timing without gaps', () => {
        const segments = creator['defineTimelineSegments']();
        
        for (let i = 0; i < segments.length - 1; i++) {
          const currentEnd = segments[i].start + segments[i].duration;
          const nextStart = segments[i + 1].start;
          expect(currentEnd).toBe(nextStart);
        }
      });
    });

    describe('generateTimelineVideo', () => {
      it('should create timeline_frames directory', async () => {
        mockFs.existsSync.mockReturnValue(false);
        
        await creator['generateTimelineVideo']([]);
        
        expect(mockFs.mkdirSync).toHaveBeenCalledWith(
          expect.stringContaining('timeline_frames'),
          { recursive: true }
        );
      });

      it('should call generateTimelineFrames with segments', async () => {
        const segments = creator['defineTimelineSegments']();
        const generateFramesSpy = jest.spyOn(creator, 'generateTimelineFrames' as any);
        
        await creator['generateTimelineVideo'](segments);
        
        expect(generateFramesSpy).toHaveBeenCalledWith(
          segments,
          expect.stringContaining('timeline_frames')
        );
      });

      it('should call createVideoFromTimelineFrames', async () => {
        const createVideoSpy = jest.spyOn(creator, 'createVideoFromTimelineFrames' as any);
        
        await creator['generateTimelineVideo']([]);
        
        expect(createVideoSpy).toHaveBeenCalledWith(
          expect.stringContaining('timeline_frames'),
          expect.stringContaining('disaster-response-timeline-video.mp4')
        );
      });

      it('should cleanup temporary files on success', async () => {
        await creator['generateTimelineVideo']([]);
        
        expect(mockFs.rmSync).toHaveBeenCalledWith(
          expect.stringContaining('timeline_frames'),
          { recursive: true, force: true }
        );
      });

      it('should cleanup temporary files on error', async () => {
        const createVideoSpy = jest.spyOn(creator, 'createVideoFromTimelineFrames' as any);
        createVideoSpy.mockRejectedValue(new Error('Test error'));
        
        await creator['generateTimelineVideo']([]);
        
        expect(mockFs.rmSync).toHaveBeenCalledWith(
          expect.stringContaining('timeline_frames'),
          { recursive: true, force: true }
        );
      });
    });

    describe('generateTimelineFrames', () => {
      it('should process each segment', async () => {
        const segments = [
          { name: 'test1', start: 0, duration: 10, description: 'Test 1', lowerThird: 'Test 1', businessValue: 'Test value 1' },
          { name: 'test2', start: 10, duration: 15, description: 'Test 2', lowerThird: 'Test 2', businessValue: 'Test value 2' }
        ];
        
        const createFramesSpy = jest.spyOn(creator, 'createTimelineSegmentFrames' as any);
        
        await creator['generateTimelineFrames'](segments, testOutputDir);
        
        expect(createFramesSpy).toHaveBeenCalledTimes(2);
        expect(createFramesSpy).toHaveBeenCalledWith(segments[0], testOutputDir);
        expect(createFramesSpy).toHaveBeenCalledWith(segments[1], testOutputDir);
      });
    });

    describe('createTimelineSegmentFrames', () => {
      it('should create correct number of frames for segment duration', async () => {
        const segment = {
          name: 'test',
          start: 0,
          duration: 10,
          description: 'Test',
          lowerThird: 'Test',
          businessValue: 'Test value'
        };
        
        const createFrameSpy = jest.spyOn(creator, 'createSimpleTextFrame' as any);
        
        await creator['createTimelineSegmentFrames'](segment, testOutputDir);
        
        // 10 seconds * 30 fps = 300 frames
        expect(createFrameSpy).toHaveBeenCalledTimes(300);
      });

      it('should generate correct frame numbers', async () => {
        const segment = {
          name: 'test',
          start: 15, // Start at 15 seconds
          duration: 5, // 5 seconds duration
          description: 'Test',
          lowerThird: 'Test',
          businessValue: 'Test value'
        };
        
        const createFrameSpy = jest.spyOn(creator, 'createSimpleTextFrame' as any);
        
        await creator['createTimelineSegmentFrames'](segment, testOutputDir);
        
        // First frame should be frame_000450 (15s * 30fps = 450)
        expect(createFrameSpy).toHaveBeenNthCalledWith(1, segment, 0, 150, expect.stringContaining('frame_000450.png'));
        
        // Last frame should be frame_000599 (19s * 30fps - 1 = 599)
        expect(createFrameSpy).toHaveBeenNthCalledWith(150, segment, 149, 150, expect.stringContaining('frame_000599.png'));
      });
    });

    describe('createSimpleTextFrame', () => {
      it('should create SVG content with correct segment information', async () => {
        const segment = {
          name: 'test_segment',
          start: 30,
          duration: 20,
          description: 'Test Description',
          lowerThird: 'Test Lower Third',
          businessValue: 'Test Business Value'
        };
        
        const frameIndex = 10;
        const totalFrames = 600; // 20s * 30fps
        const outputPath = path.join(testOutputDir, 'test.png');
        
        await creator['createSimpleTextFrame'](segment, frameIndex, totalFrames, outputPath);
        
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining('.svg'),
          expect.stringContaining('test_segment')
        );
        
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining('.svg'),
          expect.stringContaining('Test Description')
        );
        
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining('.svg'),
          expect.stringContaining('Test Lower Third')
        );
        
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining('.svg'),
          expect.stringContaining('Test Business Value')
        );
      });

      it('should calculate correct progress percentage', async () => {
        const segment = {
          name: 'test',
          start: 0,
          duration: 100,
          description: 'Test',
          lowerThird: 'Test',
          businessValue: 'Test value'
        };
        
        const frameIndex = 50;
        const totalFrames = 100;
        const outputPath = path.join(testOutputDir, 'test.png');
        
        await creator['createSimpleTextFrame'](segment, frameIndex, totalFrames, outputPath);
        
        // 50/100 = 50% progress
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining('.svg'),
          expect.stringContaining('width="300"') // 600 * 0.5 = 300
        );
      });

      it('should calculate correct time display', async () => {
        const segment = {
          name: 'test',
          start: 65, // 1 minute 5 seconds
          duration: 30,
          description: 'Test',
          lowerThird: 'Test',
          businessValue: 'Test value'
        };
        
        const frameIndex = 15; // Halfway through segment
        const totalFrames = 900; // 30s * 30fps
        const outputPath = path.join(testOutputDir, 'test.png');
        
        await creator['createSimpleTextFrame'](segment, frameIndex, totalFrames, outputPath);
        
        // Current time should be 65 + (15/900 * 30) = 65 + 0.5 = 65.5 seconds
        // Displayed as 1:05.5
        expect(mockFs.writeFileSync).toHaveBeenCalledWith(
          expect.stringContaining('.svg'),
          expect.stringContaining('1:05.5')
        );
      });

      it('should handle ImageMagick conversion when available', async () => {
        const segment = {
          name: 'test',
          start: 0,
          duration: 10,
          description: 'Test',
          lowerThird: 'Test',
          businessValue: 'Test value'
        };
        
        mockExecSync.mockImplementation(() => Buffer.from('success'));
        
        const outputPath = path.join(testOutputDir, 'test.png');
        
        await creator['createSimpleTextFrame'](segment, 0, 300, outputPath);
        
        expect(mockExecSync).toHaveBeenCalledWith(
          expect.stringContaining('convert'),
          expect.objectContaining({ stdio: 'pipe' })
        );
        
        expect(mockFs.unlinkSync).toHaveBeenCalledWith(
          expect.stringContaining('.svg')
        );
      });

      it('should fallback to SVG when ImageMagick is not available', async () => {
        const segment = {
          name: 'test',
          start: 0,
          duration: 10,
          description: 'Test',
          lowerThird: 'Test',
          businessValue: 'Test value'
        };
        
        mockExecSync.mockImplementation(() => {
          throw new Error('convert: command not found');
        });
        
        const outputPath = path.join(testOutputDir, 'test.png');
        
        await creator['createSimpleTextFrame'](segment, 0, 300, outputPath);
        
        expect(mockFs.renameSync).toHaveBeenCalledWith(
          expect.stringContaining('.svg'),
          expect.stringContaining('.png')
        );
      });
    });

    describe('createVideoFromTimelineFrames', () => {
      it('should call FFmpeg with correct parameters', async () => {
        const framesDir = path.join(testOutputDir, 'frames');
        const outputPath = path.join(testOutputDir, 'output.mp4');
        
        await creator['createVideoFromTimelineFrames'](framesDir, outputPath);
        
        expect(mockExecSync).toHaveBeenCalledWith(
          expect.stringContaining('ffmpeg -y -framerate 30'),
          expect.objectContaining({ stdio: 'inherit' })
        );
        
        expect(mockExecSync).toHaveBeenCalledWith(
          expect.stringContaining('frame_%06d.png'),
          expect.objectContaining({ stdio: 'inherit' })
        );
        
        expect(mockExecSync).toHaveBeenCalledWith(
          expect.stringContaining('libx264'),
          expect.objectContaining({ stdio: 'inherit' })
        );
      });

      it('should call fallback method when FFmpeg fails', async () => {
        const framesDir = path.join(testOutputDir, 'frames');
        const outputPath = path.join(testOutputDir, 'output.mp4');
        
        mockExecSync.mockImplementation(() => {
          throw new Error('FFmpeg error');
        });
        
        const fallbackSpy = jest.spyOn(creator, 'createFallbackTimelineVideo' as any);
        
        await creator['createVideoFromTimelineFrames'](framesDir, outputPath);
        
        expect(fallbackSpy).toHaveBeenCalledWith(framesDir, outputPath);
      });
    });

    describe('createFallbackTimelineVideo', () => {
      it('should call ImageMagick convert when available', async () => {
        const framesDir = path.join(testOutputDir, 'frames');
        const outputPath = path.join(testOutputDir, 'output.mp4');
        
        mockExecSync.mockImplementation(() => Buffer.from('success'));
        
        await creator['createFallbackTimelineVideo'](framesDir, outputPath);
        
        expect(mockExecSync).toHaveBeenCalledWith(
          expect.stringContaining('convert -delay 33 -loop 0'),
          expect.objectContaining({ stdio: 'inherit' })
        );
        
        expect(mockExecSync).toHaveBeenCalledWith(
          expect.stringContaining('.gif'),
          expect.objectContaining({ stdio: 'inherit' })
        );
      });

      it('should handle ImageMagick failure gracefully', async () => {
        const framesDir = path.join(testOutputDir, 'frames');
        const outputPath = path.join(testOutputDir, 'output.mp4');
        
        mockExecSync.mockImplementation(() => {
          throw new Error('convert: command not found');
        });
        
        // Should not throw error
        await expect(
          creator['createFallbackTimelineVideo'](framesDir, outputPath)
        ).resolves.not.toThrow();
      });
    });

    describe('cleanupTempFiles', () => {
      it('should remove directory when it exists', () => {
        mockFs.existsSync.mockReturnValue(true);
        
        creator['cleanupTempFiles'](testOutputDir);
        
        expect(mockFs.rmSync).toHaveBeenCalledWith(
          testOutputDir,
          { recursive: true, force: true }
        );
      });

      it('should not remove directory when it does not exist', () => {
        mockFs.existsSync.mockReturnValue(false);
        
        creator['cleanupTempFiles'](testOutputDir);
        
        expect(mockFs.rmSync).not.toHaveBeenCalled();
      });

      it('should handle cleanup errors gracefully', () => {
        mockFs.existsSync.mockReturnValue(true);
        mockFs.rmSync.mockImplementation(() => {
          throw new Error('Permission denied');
        });
        
        // Should not throw error
        expect(() => {
          creator['cleanupTempFiles'](testOutputDir);
        }).not.toThrow();
      });
    });

    describe('Integration Tests', () => {
      it('should create complete video pipeline successfully', async () => {
        // Mock successful execution
        mockFs.existsSync.mockReturnValue(false);
        mockExecSync.mockImplementation(() => Buffer.from('success'));
        
        const createVideoSpy = jest.spyOn(creator, 'createTimelineVideo');
        
        await creator.createTimelineVideo();
        
        expect(createVideoSpy).toHaveBeenCalled();
      });

      it('should handle errors gracefully throughout pipeline', async () => {
        // Mock failures at different stages
        mockFs.existsSync.mockReturnValue(false);
        mockFs.mkdirSync.mockImplementation(() => {
          throw new Error('Directory creation failed');
        });
        
        // Should not throw error
        await expect(
          creator.createTimelineVideo()
        ).resolves.not.toThrow();
      });
    });
  });
});
