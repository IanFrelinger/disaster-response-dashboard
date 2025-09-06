import React from 'react';

interface SimpleMapProps {
  showHazards?: boolean;
  showUnits?: boolean;
  showRoutes?: boolean;
}

export const SimpleMap: React.FC<SimpleMapProps> = ({
  showHazards = true,
  showUnits = true,
  showRoutes = true
}) => {
  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed #ccc',
        borderRadius: '8px'
      }}
    >
      <div style={{ textAlign: 'center', color: '#666' }}>
        <h3>Map View</h3>
        <p>Terrain functionality has been disabled</p>
        <div style={{ marginTop: '20px', fontSize: '14px' }}>
          <p>Hazards: {showHazards ? 'Enabled' : 'Disabled'}</p>
          <p>Units: {showUnits ? 'Enabled' : 'Disabled'}</p>
          <p>Routes: {showRoutes ? 'Enabled' : 'Disabled'}</p>
        </div>
      </div>
    </div>
  );
};
