#!/bin/bash

# Frontend Setup Script for Disaster Response Dashboard
# This script initializes a TypeScript React frontend with all necessary tooling

set -e

echo "🚀 Setting up TypeScript Frontend for Disaster Response Dashboard"
echo "================================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm found"

# Create frontend directory
FRONTEND_DIR="frontend"
if [ -d "$FRONTEND_DIR" ]; then
    echo "⚠️  Frontend directory already exists. Removing..."
    rm -rf "$FRONTEND_DIR"
fi

echo "📁 Creating frontend directory..."
mkdir -p "$FRONTEND_DIR"
cd "$FRONTEND_DIR"

# Initialize Vite + React + TypeScript project
echo "🔧 Initializing Vite + React + TypeScript project..."
npm create vite@latest . -- --template react-ts --yes

# Install core dependencies
echo "📦 Installing core dependencies..."
npm install

# Install additional dependencies
echo "📦 Installing additional dependencies..."

# UI and Styling
npm install tailwindcss postcss autoprefixer @headlessui/react @heroicons/react

# State Management
npm install zustand

# HTTP Client
npm install axios

# Routing
npm install react-router-dom

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# E2E Testing
npm install -D @playwright/test

# API Mocking
npm install -D msw

# Development Tools
npm install -D @types/node @vitejs/plugin-react eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Performance and Monitoring
npm install -D @vitejs/plugin-legacy compression-webpack-plugin

echo "✅ Dependencies installed successfully"

# Initialize Tailwind CSS
echo "🎨 Setting up Tailwind CSS..."
npx tailwindcss init -p

# Create project structure
echo "📂 Creating project structure..."
mkdir -p src/{components/{common,public,field,command},pages,hooks,services,stores,types,utils,styles}
mkdir -p tests/{unit,integration,e2e,mocks}
mkdir -p public docs

# Create basic configuration files
echo "⚙️  Creating configuration files..."

# Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#4488ff',
          600: '#5599ff',
          700: '#3377ee',
        },
        danger: {
          50: '#fef2f2',
          500: '#ff4444',
          600: '#ff5555',
          700: '#ee3333',
        },
        warning: {
          50: '#fffbeb',
          500: '#ff8800',
          600: '#ff9900',
          700: '#ee7700',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#33d56e',
          700: '#11b44e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'attention': 'attention 2s ease-in-out infinite',
      },
      keyframes: {
        attention: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
EOF

# Vite config
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
EOF

# TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# ESLint config
cat > .eslintrc.cjs << 'EOF'
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
EOF

# Prettier config
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# Playwright config
cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF

# Update package.json scripts
echo "📝 Updating package.json scripts..."
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.test="vitest"
npm pkg set scripts.test:ui="vitest --ui"
npm pkg set scripts.test:coverage="vitest --coverage"
npm pkg set scripts.test:e2e="playwright test"
npm pkg set scripts.lint="eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
npm pkg set scripts.lint:fix="eslint . --ext ts,tsx --fix"
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.type-check="tsc --noEmit"

# Create basic source files
echo "📄 Creating basic source files..."

# Test setup
mkdir -p src/test
cat > src/test/setup.ts << 'EOF'
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
EOF

# API types
cat > src/types/api.ts << 'EOF'
export interface HazardZone {
  id: string
  geometry: {
    type: string
    coordinates: number[][][]
  }
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  lastUpdated: string
  dataSource: string
  riskScore: number
  h3Index?: string
  brightness?: number
  confidence?: number
  acqDate?: string
}

export interface SafeRoute {
  id: string
  origin: [number, number]
  destination: [number, number]
  route: {
    type: string
    coordinates: number[][]
  }
  hazardAvoided: boolean
  distance: number
  estimatedTime: number
}

export interface RiskAssessment {
  totalNearbyHazards: number
  riskLevels: Record<string, number>
  avgRiskScore: number
  maxRiskScore: number
  closestHazardDistanceKm?: number
  assessmentRadiusKm: number
  location: {
    latitude: number
    longitude: number
  }
  assessmentTimestamp: string
}

export interface DashboardData {
  hazards: HazardZone[]
  routes: SafeRoute[]
  summary: {
    totalHazards: number
    riskDistribution: Record<string, number>
    dataSources: Record<string, number>
    lastUpdated: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: number
  error?: string
}
EOF

# API service
cat > src/services/api.ts << 'EOF'
import axios from 'axios'
import type { DashboardData, HazardZone, SafeRoute, RiskAssessment, ApiResponse } from '@/types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const apiService = {
  // Health check
  health: () => api.get<ApiResponse<{ status: string; service: string }>>('/api/health'),

  // Dashboard data
  getDashboard: () => api.get<ApiResponse<DashboardData>>('/api/dashboard'),

  // Hazard zones
  getHazards: (count?: number) => 
    api.get<ApiResponse<HazardZone[]>>('/api/hazards', {
      params: { count }
    }),

  // Safe routes
  getRoutes: (count?: number) => 
    api.get<ApiResponse<SafeRoute[]>>('/api/routes', {
      params: { count }
    }),

  // Risk assessment
  getRiskAssessment: (lat: number, lng: number) => 
    api.get<ApiResponse<RiskAssessment>>('/api/risk-assessment', {
      params: { lat, lng }
    }),

  // Scenario data
  getScenario: (scenarioId: string) => 
    api.get<ApiResponse<any>>(`/api/scenario/${scenarioId}`),

  // Refresh data
  refreshData: () => api.post<ApiResponse<DashboardData>>('/api/refresh'),

  // API info
  getApiInfo: () => api.get<ApiResponse<any>>('/api/info'),
}

export default api
EOF

# Zustand store
cat > src/stores/useAppStore.ts << 'EOF'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { DashboardData, HazardZone, SafeRoute } from '@/types/api'

interface AppState {
  // Data
  dashboardData: DashboardData | null
  hazards: HazardZone[]
  routes: SafeRoute[]
  
  // UI State
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  
  // Actions
  setDashboardData: (data: DashboardData) => void
  setHazards: (hazards: HazardZone[]) => void
  setRoutes: (routes: SafeRoute[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      dashboardData: null,
      hazards: [],
      routes: [],
      loading: false,
      error: null,
      lastUpdated: null,

      // Actions
      setDashboardData: (data) => 
        set({ dashboardData: data, lastUpdated: new Date() }),
      
      setHazards: (hazards) => set({ hazards }),
      
      setRoutes: (routes) => set({ routes }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-store',
    }
  )
)
EOF

# Basic component
cat > src/components/common/Button.tsx << 'EOF'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500',
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={twMerge(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
EOF

# Update main CSS
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
  
  .status-safe {
    @apply bg-success-500 text-white;
  }
  
  .status-warning {
    @apply bg-warning-500 text-white;
  }
  
  .status-danger {
    @apply bg-danger-500 text-white animate-attention;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
EOF

# Update main App component
cat > src/App.tsx << 'EOF'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

// Pages (to be implemented)
const PublicView = () => <div className="p-4">Public View - Coming Soon</div>
const FieldView = () => <div className="p-4">Field View - Coming Soon</div>
const CommandView = () => <div className="p-4">Command View - Coming Soon</div>

// Error Fallback
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Reload Page
      </button>
    </div>
  </div>
)

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<PublicView />} />
            <Route path="/public" element={<PublicView />} />
            <Route path="/field" element={<FieldView />} />
            <Route path="/command" element={<CommandView />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
EOF

# Create README
cat > README.md << 'EOF'
# Disaster Response Dashboard - Frontend

TypeScript React frontend for the Disaster Response Dashboard system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## 📁 Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Main page components
- `src/hooks/` - Custom React hooks
- `src/services/` - API integration
- `src/stores/` - State management
- `src/types/` - TypeScript type definitions
- `tests/` - Test files

## 🧪 Testing

- **Unit Tests**: `npm run test`
- **Coverage**: `npm run test:coverage`
- **E2E Tests**: `npm run test:e2e`

## 🎨 Design System

Built with Tailwind CSS and custom design tokens for:
- Colors (primary, danger, warning, success)
- Typography
- Spacing
- Animations

## 🔗 API Integration

Connects to the backend API at `http://localhost:5001` with:
- Real-time data updates
- Error handling
- Loading states
- Type-safe API calls

## 📱 Responsive Design

- Mobile-first approach
- Touch-optimized for field operations
- Accessibility compliant
- Cross-browser compatible
EOF

echo "✅ Frontend setup completed successfully!"
echo ""
echo "🎉 Next steps:"
echo "1. cd frontend"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo "📚 Documentation:"
echo "- Development Plan: ../FRONTEND_DEVELOPMENT_PLAN.md"
echo "- README: README.md"
echo ""
echo "🧪 Testing:"
echo "- Unit tests: npm run test"
echo "- E2E tests: npm run test:e2e"
echo "- Coverage: npm run test:coverage"
