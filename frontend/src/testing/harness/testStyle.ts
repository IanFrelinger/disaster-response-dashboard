/**
 * Test style configuration for visual regression testing
 */

export const TEST_STYLES = {
  // Simplified style for better visual diffs
  simplified: {
    version: 8,
    sources: {
      'mapbox': {
        type: 'raster',
        tiles: ['https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token={access_token}'],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#f8f9fa'
        }
      },
      {
        id: 'mapbox',
        type: 'raster',
        source: 'mapbox',
        paint: {
          'raster-opacity': 0.8
        }
      }
    ]
  },

  // High contrast style for accessibility testing
  highContrast: {
    version: 8,
    sources: {
      'mapbox': {
        type: 'raster',
        tiles: ['https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token={access_token}'],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#ffffff'
        }
      },
      {
        id: 'mapbox',
        type: 'raster',
        source: 'mapbox',
        paint: {
          'raster-opacity': 1.0,
          'raster-contrast': 0.5,
          'raster-brightness-min': 0.1,
          'raster-brightness-max': 0.9
        }
      }
    ]
  }
};

export const getTestStyle = (styleName: keyof typeof TEST_STYLES = 'simplified') => {
  return TEST_STYLES[styleName];
};
