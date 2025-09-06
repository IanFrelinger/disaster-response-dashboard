// Determinism control utilities for tests
// Ensures tests are reproducible and not affected by timing or randomness

import { vi } from 'vitest';

// Time freezing utilities
export const freezeTime = (date: Date = new Date('2025-08-30T10:00:00Z')) => {
  vi.useFakeTimers();
  vi.setSystemTime(date);
};

export const unfreezeTime = () => {
  vi.useRealTimers();
};

// Seeded RNG for reproducible randomness
export class SeededRandom {
  private _seed: number;

  constructor(seed: number = 12345) {
    this._seed = seed;
  }

  // Simple but effective seeded random number generator
  next(): number {
    this._seed = (this._seed * 9301 + 49297) % 233280;
    return this._seed / 233280;
  }

  // Generate random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Generate random float between min and max
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  // Generate random boolean with given probability
  nextBoolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  // Generate random element from array
  nextChoice<T>(choices: T[]): T {
    if (choices.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    const index = this.nextInt(0, choices.length - 1);
    const result = choices[index];
    if (result === undefined) {
      throw new Error('Array access returned undefined');
    }
    return result;
  }

  // Reset seed to initial value
  reset(): void {
    this._seed = 12345;
  }

  // Getter for seed (read-only)
  get seed(): number {
    return this._seed;
  }

  // Setter for seed
  set seed(value: number) {
    this._seed = value;
  }
}

// Global seeded random instance for tests
export const testRandom = new SeededRandom();

// Animation/transition disabling utilities
export const disableAnimations = () => {
  // Disable CSS transitions and animations
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      transition: none !important;
      animation: none !important;
      animation-duration: 0s !important;
    }
  `;
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
};

// Mapbox animation disabling
export const disableMapboxAnimations = () => {
  return {
    fadeDuration: 0,
    transition: {
      duration: 0
    }
  };
};

// Performance measurement utilities with deterministic timing
export const measurePerformance = (fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

// Deterministic delay for testing async behavior
export const deterministicDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

// Test environment setup for determinism
export const setupDeterministicTest = (seed?: number) => {
  if (seed !== undefined) {
    testRandom.seed = seed;
  }
  
  freezeTime();
  const cleanupAnimations = disableAnimations();
  
  return () => {
    unfreezeTime();
    cleanupAnimations();
    testRandom.reset();
  };
};
