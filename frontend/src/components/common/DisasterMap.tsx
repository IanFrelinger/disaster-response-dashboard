import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DisasterMapProps {
  center?: [number, number];
  zoom?: number;
  showHazards?: boolean;
  showRoutes?: boolean;
  showResources?: boolean;
  showBoundaries?: boolean;
  onMapLoad?: () => void;
  className?: string;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  center = [-122.4194, 37.7749], // San Francisco
  zoom = 10,
  showHazards: _showHazards = true,
  showRoutes: _showRoutes = true,
  showResources: _showResources = true,
  showBoundaries: _showBoundaries = true,
  onMapLoad,
  className = "h-full w-full"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, _setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapCenter, setMapCenter] = useState(center);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [tileLayer, setTileLayer] = useState<'satellite' | 'street' | 'terrain'>('street');

  useEffect(() => {
    if (!mapContainer.current) return;

    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      onMapLoad?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onMapLoad]);

  // Handle mouse/touch interactions for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart([e.clientX, e.clientY]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const [startX, startY] = dragStart;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    const panAmount = 0.001 / Math.pow(2, currentZoom - 10);
    setMapCenter(prev => {
      const [lng, lat] = prev;
      return [lng - deltaX * panAmount, lat + deltaY * panAmount];
    });
    
    setDragStart([e.clientX, e.clientY]);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -1 : 1;
    setCurrentZoom(prev => Math.max(1, Math.min(18, prev + zoomDelta)));
  };

  // Get tile layer background
  const getTileLayerBackground = () => {
    switch (tileLayer) {
      case 'satellite':
        return 'bg-gradient-to-br from-green-900 via-green-800 to-green-700';
      case 'terrain':
        return 'bg-gradient-to-br from-yellow-100 via-green-200 to-blue-200';
      case 'street':
      default:
        return 'bg-gradient-to-br from-blue-50 to-green-50';
    }
  };

  return (
    <Card className={className}>
      <CardHeader 
        title="Disaster Response Map" 
        subtitle={`Zoom: ${currentZoom} | Center: [${mapCenter[1].toFixed(3)}, ${mapCenter[0].toFixed(3)}]`}
      />
      <CardContent className="p-0 relative flex-1">
        {/* Map Controls */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-border-light">
          {/* Tile Layer Controls */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={tileLayer === 'street' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTileLayer('street')}
            >
              🏙️ Street
            </Button>
            <Button
              variant={tileLayer === 'satellite' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTileLayer('satellite')}
            >
              🛰️ Satellite
            </Button>
            <Button
              variant={tileLayer === 'terrain' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTileLayer('terrain')}
            >
              🏔️ Terrain
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative flex-1">
          <div 
            ref={mapContainer} 
            className={`w-full h-full relative overflow-hidden cursor-grab ${getTileLayerBackground()}`}
            style={{ minHeight: '400px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-black bg-opacity-10 z-10" />
            )}

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${20 * Math.pow(2, currentZoom - 10)}px ${20 * Math.pow(2, currentZoom - 10)}px`
              }} />
            </div>

            {/* Map Content - Empty for now */}
            <div className="relative z-10 p-4">
              {/* All map elements removed - ready for re-adding */}
            </div>
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-30">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
          
          {_error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-30">
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2">{_error}</p>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
