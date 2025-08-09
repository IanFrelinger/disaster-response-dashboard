import { useState, useEffect } from 'react';

interface BrowserSettings {
  colorScheme: 'light' | 'dark';
  contrast: 'normal' | 'high';
  reducedMotion: 'no-preference' | 'reduce';
  accentColor: string;
  systemFonts: boolean;
}

export function useBrowserSettings(): BrowserSettings {
  const [settings, setSettings] = useState<BrowserSettings>({
    colorScheme: 'light',
    contrast: 'normal',
    reducedMotion: 'no-preference',
    accentColor: '#007AFF',
    systemFonts: true
  });

  useEffect(() => {
    // Function to detect current browser settings
    const detectBrowserSettings = () => {
      const mediaQueries = {
        colorScheme: window.matchMedia('(prefers-color-scheme: dark)'),
        contrast: window.matchMedia('(prefers-contrast: high)'),
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
      };

      // Get computed styles to detect accent color
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const accentColor = computedStyle.getPropertyValue('--ios-blue').trim() || '#007AFF';

      setSettings({
        colorScheme: mediaQueries.colorScheme.matches ? 'dark' : 'light',
        contrast: mediaQueries.contrast.matches ? 'high' : 'normal',
        reducedMotion: mediaQueries.reducedMotion.matches ? 'reduce' : 'no-preference',
        accentColor,
        systemFonts: true
      });
    };

    // Initial detection
    detectBrowserSettings();

    // Set up event listeners for settings changes
    const mediaQueries = {
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)'),
      contrast: window.matchMedia('(prefers-contrast: high)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
    };

    const handleColorSchemeChange = () => detectBrowserSettings();
    const handleContrastChange = () => detectBrowserSettings();
    const handleReducedMotionChange = () => detectBrowserSettings();

    // Add event listeners
    mediaQueries.colorScheme.addEventListener('change', handleColorSchemeChange);
    mediaQueries.contrast.addEventListener('change', handleContrastChange);
    mediaQueries.reducedMotion.addEventListener('change', handleReducedMotionChange);

    // Cleanup event listeners
    return () => {
      mediaQueries.colorScheme.removeEventListener('change', handleColorSchemeChange);
      mediaQueries.contrast.removeEventListener('change', handleContrastChange);
      mediaQueries.reducedMotion.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return settings;
}

// Hook to apply browser settings to CSS custom properties
export function useApplyBrowserSettings() {
  const settings = useBrowserSettings();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply system color scheme
    root.style.setProperty('--system-color-scheme', settings.colorScheme);
    
    // Apply contrast preferences
    root.style.setProperty('--system-contrast', settings.contrast);
    
    // Apply motion preferences
    root.style.setProperty('--system-reduced-motion', settings.reducedMotion);
    
    // Apply accent color
    root.style.setProperty('--ios-blue', settings.accentColor);
    
    // Update document attributes for better accessibility
    document.documentElement.setAttribute('data-color-scheme', settings.colorScheme);
    document.documentElement.setAttribute('data-contrast', settings.contrast);
    document.documentElement.setAttribute('data-reduced-motion', settings.reducedMotion);
    
  }, [settings]);

  return settings;
}

// Hook to get current browser settings as a formatted string
export function useBrowserSettingsInfo() {
  const settings = useBrowserSettings();
  
  const getSettingsInfo = () => {
    const info = [];
    
    info.push(`Color Scheme: ${settings.colorScheme}`);
    info.push(`Contrast: ${settings.contrast}`);
    info.push(`Reduced Motion: ${settings.reducedMotion}`);
    info.push(`Accent Color: ${settings.accentColor}`);
    info.push(`System Fonts: ${settings.systemFonts ? 'Enabled' : 'Disabled'}`);
    
    return info.join(' | ');
  };

  return {
    settings,
    info: getSettingsInfo(),
    isDarkMode: settings.colorScheme === 'dark',
    isHighContrast: settings.contrast === 'high',
    isReducedMotion: settings.reducedMotion === 'reduce'
  };
}
