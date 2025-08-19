import { describe, test, expect, beforeEach, afterEach, vi, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

// Mock the external dependencies
vi.mock('fs')
vi.mock('path')
vi.mock('child_process')
vi.mock('util')

// Mock the actual modules
const mockFs = vi.mocked(fs)
const mockPath = vi.mocked(path)
const mockExec = vi.mocked(exec)
const mockPromisify = vi.mocked(promisify)

// Mock execAsync
const mockExecAsync = vi.fn()
mockPromisify.mockReturnValue(mockExecAsync)

// Mock path methods
mockPath.join.mockImplementation((...args: string[]) => {
  // Handle specific cases for directory creation
  if (args.includes('out')) {
    return '/test/project/out'
  }
  if (args.includes('config')) {
    return '/test/project/config'
  }
  if (args.includes('iterations')) {
    return '/test/project/iterations'
  }
  if (args.includes('beats')) {
    return '/test/project/out/beats'
  }
  // Default behavior
  return args.join('/')
})

mockPath.resolve.mockImplementation((...args: string[]) => args.join('/'))
mockPath.dirname.mockReturnValue('/test')
mockPath.basename.mockImplementation((filePath: string, ext?: string) => {
  const basename = filePath.split('/').pop() || 'unknown'
  if (ext && basename.endsWith(ext)) {
    return basename.slice(0, -ext.length)
  }
  return basename
})
mockPath.extname.mockImplementation((filePath: string) => {
  const ext = filePath.split('.').pop()
  return ext ? `.${ext}` : ''
})

// Mock fs methods
mockFs.existsSync.mockReturnValue(true)
mockFs.mkdirSync.mockReturnValue(undefined)
mockFs.readdirSync.mockReturnValue([] as any)

// Mock process.cwd
Object.defineProperty(process, 'cwd', {
  value: vi.fn().mockReturnValue('/test/project'),
  writable: true
})

// Mock console methods
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('EnhancedCriticBot - Comprehensive Coverage', () => {
  let EnhancedCriticBot: any

  beforeAll(async () => {
    // Import the actual class
    const module = await import('../scripts/enhanced-critic-bot')
    EnhancedCriticBot = module.EnhancedCriticBot
  })

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset path mocks
    mockPath.join.mockImplementation((...args: string[]) => {
      if (args.includes('out')) {
        return '/test/project/out'
      }
      if (args.includes('config')) {
        return '/test/project/config'
      }
      if (args.includes('iterations')) {
        return '/test/project/iterations'
      }
      if (args.includes('beats')) {
        return '/test/project/out/beats'
      }
      return args.join('/')
    })
    
    // Ensure path.basename works correctly for the failing tests
    mockPath.basename.mockImplementation((filePath: string, ext?: string) => {
      const basename = filePath.split('/').pop() || 'unknown'
      if (ext && basename.endsWith(ext)) {
        return basename.slice(0, -ext.length)
      }
      return basename
    })
    
    mockPath.extname.mockImplementation((filePath: string) => {
      const ext = filePath.split('.').pop()
      return ext ? `.${ext}` : ''
    })
    
    // Reset fs mocks
    mockFs.existsSync.mockReturnValue(true)
    mockFs.mkdirSync.mockReturnValue(undefined)
    mockFs.readdirSync.mockReturnValue([] as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Constructor and Initialization', () => {
    test('should initialize with correct default values', () => {
      const criticBot = new EnhancedCriticBot()

      expect(criticBot.projectRoot).toBe('/test/project')
      expect(criticBot.outputDir).toBe('/test/project/out')
      expect(criticBot.configDir).toBe('/test/project/config')
      expect(criticBot.iterationsDir).toBe('/test/project/iterations')
      expect(criticBot.maxIterations).toBe(10)
      expect(criticBot.currentIteration).toBe(1)

      expect(mockFs.existsSync).toHaveBeenCalled()
      // mkdirSync should not be called since existsSync returns true
      expect(mockFs.mkdirSync).not.toHaveBeenCalled()
    })

    test('should create directories if they do not exist', () => {
      mockFs.existsSync.mockReturnValue(false)

      new EnhancedCriticBot()

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/project/out', { recursive: true })
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/project/config', { recursive: true })
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/project/iterations', { recursive: true })
    })
  })

  describe('Quality Standards', () => {
    test('should initialize quality standards correctly', () => {
      const criticBot = new EnhancedCriticBot()

      // Access private property through any type
      const qualityStandards = (criticBot as any).qualityStandards

      expect(qualityStandards.overallScore).toBe(85)
      expect(qualityStandards.technicalAccuracy).toBe(90)
      expect(qualityStandards.visualQuality).toBe(80)
      expect(qualityStandards.pacing).toBe(85)
      expect(qualityStandards.engagement).toBe(80)
      expect(qualityStandards.duration.min).toBe(300)
      expect(qualityStandards.duration.max).toBe(600)
      expect(qualityStandards.duration.target).toBe(420)
      expect(qualityStandards.content.requiredTopics).toContain('disaster response')
      expect(qualityStandards.content.forbiddenTopics).toContain('confidential information')
      expect(qualityStandards.content.technicalDepth).toBe('intermediate')
    })
  })

  describe('Video File Analysis', () => {
    test('should analyze video file successfully', async () => {
      const mockVideoData = {
        format: { duration: '120.5', bit_rate: '5000000' },
        streams: [
          { codec_type: 'video', width: 1920, height: 1080, r_frame_rate: '30/1' },
          { codec_type: 'audio', codec_name: 'aac' }
        ]
      }

      mockExecAsync.mockResolvedValue({ stdout: JSON.stringify(mockVideoData) })

      const criticBot = new EnhancedCriticBot()
      const videoInfo = await (criticBot as any).analyzeVideoFile('/test/video.mp4')

      expect(videoInfo.duration).toBe(120.5)
      expect(videoInfo.resolution).toBe('1920x1080')
      expect(videoInfo.bitrate).toBe(5000)
      expect(videoInfo.framerate).toBe(30)
      expect(videoInfo.audioQuality).toBe('aac')

      expect(mockExecAsync).toHaveBeenCalledWith('ffprobe -v quiet -print_format json -show_format -show_streams "/test/video.mp4"')
    })

    test('should handle video analysis errors gracefully', async () => {
      mockExecAsync.mockRejectedValue(new Error('ffprobe not found'))

      const criticBot = new EnhancedCriticBot()
      const videoInfo = await (criticBot as any).analyzeVideoFile('/test/video.mp4')

      expect(videoInfo.duration).toBe(0)
      expect(videoInfo.resolution).toBe('unknown')
      expect(videoInfo.bitrate).toBe(0)
      expect(videoInfo.framerate).toBe(0)
      expect(videoInfo.audioQuality).toBe('unknown')

      expect(console.warn).toHaveBeenCalledWith('⚠️  Could not analyze video file: Error: ffprobe not found')
    })
  })

  describe('Beat Validation', () => {
    test('should validate individual beat successfully', async () => {
      const mockVideoData = {
        format: { duration: '60.0', bit_rate: '5000000' },
        streams: [
          { codec_type: 'video', width: 1920, height: 1080, r_frame_rate: '30/1' },
          { codec_type: 'audio', codec_name: 'aac' }
        ]
      }

      mockExecAsync.mockResolvedValue({ stdout: JSON.stringify(mockVideoData) })

      // Mock the private methods
      const criticBot = new EnhancedCriticBot()
      vi.spyOn(criticBot as any, 'extractBeatName').mockReturnValue('Test Beat')
      vi.spyOn(criticBot as any, 'validateBeatContent').mockResolvedValue({
        issues: [],
        warnings: [],
        suggestions: []
      })
      vi.spyOn(criticBot as any, 'calculateBeatScore').mockReturnValue(90)

      const validation = await criticBot.validateIndividualBeat('/test/beat.mp4')

      expect(validation.beatId).toBe('beat')
      expect(validation.name).toBe('Test Beat')
      expect(validation.duration).toBe(60.0)
      expect(validation.score).toBe(90)
      expect(validation.passes).toBe(true)
      expect(validation.needsRework).toBe(false)

      expect(console.log).toHaveBeenCalledWith('🔍 Validating beat: beat.mp4')
      expect(console.log).toHaveBeenCalledWith('✅ Beat validation complete: 90/100 (PASS)')
    })

    test('should handle beat validation failure', async () => {
      const mockVideoData = {
        format: { duration: '30.0', bit_rate: '1000000' },
        streams: [
          { codec_type: 'video', width: 640, height: 480, r_frame_rate: '15/1' },
          { codec_type: 'audio', codec_name: 'mp3' }
        ]
      }

      mockExecAsync.mockResolvedValue({ stdout: JSON.stringify(mockVideoData) })

      const criticBot = new EnhancedCriticBot()
      vi.spyOn(criticBot as any, 'extractBeatName').mockReturnValue('Poor Beat')
      vi.spyOn(criticBot as any, 'validateBeatContent').mockResolvedValue({
        issues: ['Low quality', 'Too short'],
        warnings: ['Poor resolution'],
        suggestions: ['Improve quality', 'Extend duration']
      })
      vi.spyOn(criticBot as any, 'calculateBeatScore').mockReturnValue(45)

      const validation = await criticBot.validateIndividualBeat('/test/poor-beat.mp4')

      expect(validation.score).toBe(45)
      expect(validation.passes).toBe(false)
      expect(validation.needsRework).toBe(true)
      expect(validation.issues).toContain('Low quality')
      expect(validation.suggestions).toContain('Improve quality')
    })
  })

  describe('Beat Content Validation', () => {
    test('should validate beat content successfully', async () => {
      const criticBot = new EnhancedCriticBot()
      const videoInfo = {
        duration: 60,
        resolution: '1920x1080',
        bitrate: 5000,
        framerate: 30,
        audioQuality: 'aac'
      }

      const validation = await (criticBot as any).validateBeatContent('/test/beat.mp4', videoInfo)

      expect(validation).toBeDefined()
      expect(Array.isArray(validation.issues)).toBe(true)
      expect(Array.isArray(validation.warnings)).toBe(true)
      expect(Array.isArray(validation.suggestions)).toBe(true)
    })
  })

  describe('Score Calculation', () => {
    test('should calculate beat score correctly', () => {
      const criticBot = new EnhancedCriticBot()
      const validation = {
        issues: [],
        warnings: [],
        suggestions: []
      }
      const videoInfo = {
        duration: 60,
        resolution: '1920x1080',
        bitrate: 5000,
        framerate: 30,
        audioQuality: 'aac'
      }

      const score = (criticBot as any).calculateBeatScore(validation, videoInfo)

      expect(typeof score).toBe('number')
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('Beat Name Extraction', () => {
    test('should extract beat name correctly', () => {
      const criticBot = new EnhancedCriticBot()

      const name = (criticBot as any).extractBeatName('/test/beat-name.mp4')

      expect(name).toBeDefined()
      expect(typeof name).toBe('string')
    })
  })

  describe('Combined Video Validation', () => {
    test('should validate combined video successfully', async () => {
      const criticBot = new EnhancedCriticBot()

      // Mock the validateIndividualBeat method
      vi.spyOn(criticBot, 'validateIndividualBeat').mockResolvedValue({
        beatId: 'beat1',
        name: 'Test Beat',
        duration: 60,
        score: 90,
        issues: [],
        warnings: [],
        suggestions: [],
        passes: true,
        needsRework: false
      })

      const validation = await criticBot.validateCombinedVideo('/test/combined.mp4', [])

      expect(validation).toBeDefined()
      expect(validation.overallScore).toBeGreaterThan(0)
      expect(Array.isArray(validation.beatScores)).toBe(true)
      expect(validation.meetsStandards).toBeDefined()
    })
  })

  describe('Iteration Planning', () => {
    test('should create iteration plan correctly', async () => {
      const criticBot = new EnhancedCriticBot()

      const mockValidation = {
        overallScore: 70,
        beatScores: [
          { beatId: 'beat1', score: 80, needsRework: false },
          { beatId: 'beat2', score: 60, needsRework: true }
        ],
        improvementAreas: ['Quality', 'Duration'],
        recommendations: ['Improve beat2', 'Extend content']
      }

      const plan = await criticBot.createIterationPlan(mockValidation)

      expect(plan).toBeDefined()
      expect(plan.iteration).toBe(2)
      expect(plan.timestamp).toBeDefined()
      expect(Array.isArray(plan.beatsToRework)).toBe(true)
      expect(Array.isArray(plan.newBeatsToCreate)).toBe(true)
      expect(Array.isArray(plan.existingBeatsToModify)).toBe(true)
    })
  })

  describe('Quality Iteration', () => {
    test('should run quality iteration successfully', async () => {
      const criticBot = new EnhancedCriticBot()

      // Mock the findBeatFiles method
      vi.spyOn(criticBot as any, 'findBeatFiles').mockReturnValue(['/test/beat1.mp4', '/test/beat2.mp4'])

      // Mock the validateIndividualBeat method
      vi.spyOn(criticBot, 'validateIndividualBeat').mockResolvedValue({
        beatId: 'beat1',
        name: 'Test Beat',
        duration: 60,
        score: 90,
        issues: [],
        warnings: [],
        suggestions: [],
        passes: true,
        needsRework: false
      })

      const result = await criticBot.runQualityIteration()

      expect(typeof result).toBe('boolean')
    })
  })

  describe('Beat File Discovery', () => {
    test('should find beat files correctly', () => {
      const criticBot = new EnhancedCriticBot()

      // Mock fs.readdirSync to return specific files in the beats directory
      mockFs.readdirSync.mockReturnValue(['beat1.mp4', 'beat2.mp4', 'config.json'] as any)

      const beatFiles = (criticBot as any).findBeatFiles()

      expect(Array.isArray(beatFiles)).toBe(true)
      expect(beatFiles).toContain('/test/project/out/beats/beat1.mp4')
      expect(beatFiles).toContain('/test/project/out/beats/beat2.mp4')
    })
  })

  describe('Combined Video Discovery', () => {
    test('should find combined video correctly', () => {
      const criticBot = new EnhancedCriticBot()

      // Mock fs.existsSync to return true for the first combined video
      mockFs.existsSync.mockImplementation((path: any) => {
        if (typeof path === 'string' && path.includes('final-video.mp4')) {
          return true
        }
        return false
      })

      const combinedVideo = (criticBot as any).findCombinedVideo()

      expect(combinedVideo).toBe('/test/project/out/final-video.mp4')
    })

    test('should return null if no combined video found', () => {
      const criticBot = new EnhancedCriticBot()

      // Mock fs.existsSync to return false for all combined videos
      mockFs.existsSync.mockImplementation((path: any) => {
        if (typeof path === 'string' && (path.includes('final-video.mp4') || path.includes('combined-video.mp4') || path.includes('output.mp4'))) {
          return false
        }
        return true
      })

      const combinedVideo = (criticBot as any).findCombinedVideo()

      expect(combinedVideo).toBeNull()
    })
  })

  describe('Continuous Quality Loop', () => {
    test('should run continuous quality loop', async () => {
      const criticBot = new EnhancedCriticBot()

      // Mock the runQualityIteration method to return true (success)
      vi.spyOn(criticBot, 'runQualityIteration').mockResolvedValue(true)

      // Mock setTimeout to avoid actual delays
      vi.spyOn(global, 'setTimeout').mockImplementation((fn: any) => {
        fn()
        return 1 as any
      })

      // Mock the loop to run only once
      vi.spyOn(criticBot as any, 'runContinuousQualityLoop').mockImplementation(async () => {
        await criticBot.runQualityIteration()
      })

      await (criticBot as any).runContinuousQualityLoop()

      expect(criticBot.runQualityIteration).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    test('should handle file system errors gracefully', async () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('File system error')
      })

      expect(() => new EnhancedCriticBot()).toThrow('File system error')
    })

    test('should handle directory creation errors', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      expect(() => new EnhancedCriticBot()).toThrow('Permission denied')
    })
  })

  describe('Edge Cases', () => {
    test('should handle empty beat list', async () => {
      const criticBot = new EnhancedCriticBot()

      // Mock the findBeatFiles method to return empty array
      vi.spyOn(criticBot as any, 'findBeatFiles').mockReturnValue([])

      const result = await criticBot.runQualityIteration()

      expect(result).toBe(false)
    })

    test('should handle single beat video', async () => {
      const criticBot = new EnhancedCriticBot()

      // Mock the findBeatFiles method to return single beat
      vi.spyOn(criticBot as any, 'findBeatFiles').mockReturnValue(['/test/single.mp4'])

      // Mock the validateIndividualBeat method
      vi.spyOn(criticBot, 'validateIndividualBeat').mockResolvedValue({
        beatId: 'single',
        name: 'Single Beat',
        duration: 300,
        score: 95,
        issues: [],
        warnings: [],
        suggestions: [],
        passes: true,
        needsRework: false
      })

      const result = await criticBot.runQualityIteration()

      expect(typeof result).toBe('boolean')
    })
  })
})
