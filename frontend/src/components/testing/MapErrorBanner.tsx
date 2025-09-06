import React, { useState, useEffect } from 'react';

interface MapErrorBannerProps {
  error?: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const MapErrorBanner: React.FC<MapErrorBannerProps> = ({
  error,
  onRetry,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!!error);
  }, [error]);

  const handleRetry = () => {
    onRetry?.();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    onDismiss?.();
    setIsVisible(false);
  };

  if (!isVisible || !error) {
    return null;
  }

  return (
    <div 
      data-testid="map-error-banner"
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: '#ff4444',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px' }}>⚠️</span>
        <span>{error}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        {onRetry && (
          <button
            onClick={handleRetry}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Retry
          </button>
        )}
        
        {onDismiss && (
          <button
            onClick={handleDismiss}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

