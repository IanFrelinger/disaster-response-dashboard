import { vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import childProcess from 'child_process'
import jsYaml from 'js-yaml'

// Create comprehensive mock implementations
const mockFs = {
  promises: {
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue('mock content'),
    mkdir: vi.fn().mockResolvedValue(undefined),
    access: vi.fn().mockResolvedValue(undefined),
    stat: vi.fn().mockResolvedValue({ isFile: () => true, isDirectory: () => false }),
    readdir: vi.fn().mockResolvedValue(['mock-file.txt']),
    unlink: vi.fn().mockResolvedValue(undefined),
    rmdir: vi.fn().mockResolvedValue(undefined)
  },
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn().mockReturnValue(undefined),
  writeFileSync: vi.fn().mockReturnValue(undefined),
  readFileSync: vi.fn().mockReturnValue('mock content'),
  statSync: vi.fn().mockReturnValue({ isFile: () => true, isDirectory: () => false }),
  readdirSync: vi.fn().mockReturnValue(['mock-file.txt']),
  unlinkSync: vi.fn().mockReturnValue(undefined),
  rmdirSync: vi.fn().mockReturnValue(undefined)
}

const mockPath = {
  join: vi.fn().mockImplementation((...args: string[]) => {
    const result = args.join('/')
    // Handle specific path patterns for testing
    if (args.includes('output')) return '/test/output'
    if (args.includes('temp')) return '/test/temp'
    if (args.includes('captures')) return '/test/captures'
    if (args.includes('audio')) return '/test/audio'
    if (args.includes('config')) return '/test/config'
    if (args.includes('narration.yaml')) return '/test/config/narration.yaml'
    if (args.includes('package.json')) return '/test/package.json'
    if (args.includes('..')) return '/test'
    return result
  }),
  resolve: vi.fn().mockImplementation((...args: string[]) => args.join('/')),
  dirname: vi.fn().mockReturnValue('/test/scripts'),
  basename: vi.fn().mockImplementation((filePath: string) => filePath.split('/').pop() || ''),
  extname: vi.fn().mockImplementation((filePath: string) => {
    const ext = filePath.split('.').pop()
    return ext && ext !== filePath ? `.${ext}` : ''
  })
}

const mockChildProcess = {
  execSync: vi.fn().mockReturnValue(Buffer.from('mock output')),
  spawn: vi.fn().mockReturnValue({
    stdout: { on: vi.fn(), pipe: vi.fn() },
    stderr: { on: vi.fn(), pipe: vi.fn() },
    on: vi.fn()
  }),
  exec: vi.fn().mockImplementation((command: string, callback?: (error: any, stdout: string, stderr: string) => void) => {
    if (callback) {
      callback(null, 'mock output', '')
    }
    return { stdout: { on: vi.fn() }, stderr: { on: vi.fn() } }
  })
}

const mockJsYaml = {
  load: vi.fn().mockReturnValue({
    metadata: { title: 'Test' },
    scenes: [{ name: 'Scene 1' }],
    voice_providers: { default: 'test' }
  }),
  dump: vi.fn().mockReturnValue('mock yaml content'),
  safeLoad: vi.fn().mockReturnValue({
    metadata: { title: 'Test' },
    scenes: [{ name: 'Scene 1' }],
    voice_providers: { default: 'test' }
  }),
  safeDump: vi.fn().mockReturnValue('mock yaml content')
}

// Mock URL operations
const mockUrl = {
  fileURLToPath: vi.fn().mockReturnValue('/test/scripts/test-file.ts'),
  pathToFileURL: vi.fn().mockReturnValue('file:///test/scripts/test-file.ts')
}

// Mock elevenlabs modules
const mockElevenlabs = {
  textToSpeech: vi.fn().mockResolvedValue('mock audio data'),
  generateSpeech: vi.fn().mockResolvedValue('mock audio data')
}

// Mock process object
const mockProcess = {
  ...process,
  version: 'v18.0.0',
  env: {
    ...process.env,
    NODE_ENV: 'test',
    API_URL: 'http://localhost:3000',
    ELEVENLABS_API_KEY: 'test-api-key'
  }
}

// Use vi.stubGlobal to ensure these mocks are used everywhere
vi.stubGlobal('fs', mockFs)
vi.stubGlobal('path', mockPath)
vi.stubGlobal('child_process', mockChildProcess)
vi.stubGlobal('js-yaml', mockJsYaml)
vi.stubGlobal('url', mockUrl)
vi.stubGlobal('process', mockProcess)

// Mock the modules using vi.mock
vi.mock('fs', () => mockFs)
vi.mock('path', () => mockPath)
vi.mock('child_process', () => mockChildProcess)
vi.mock('js-yaml', () => mockJsYaml)
vi.mock('url', () => mockUrl)
vi.mock('elevenlabs', () => mockElevenlabs)
vi.mock('elevenlabs-node', () => mockElevenlabs)

// Mock Playwright types
global.Browser = {} as any
global.BrowserContext = {} as any
global.Page = {} as any

// Global test utilities
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn()
}

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Export mocks for use in individual tests
export { mockFs, mockPath, mockChildProcess, mockJsYaml, mockUrl, mockElevenlabs, mockProcess }
