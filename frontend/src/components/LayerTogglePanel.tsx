import React, { useCallback, useRef, useEffect } from 'react';
import { Building2, Mountain, AlertTriangle, Users, Route } from 'lucide-react';
import { useLayerToggles } from '../features/layers/useLayerToggles';
import './LayerTogglePanel.css';

const iconMap = {
  Building2,
  Mountain,
  AlertTriangle,
  Users,
  Route,
};

export const LayerTogglePanel: React.FC<{
  title?: string;
  className?: string;
  toggleDescriptors?: Array<{
    key: string;
    label: string;
    checked: boolean;
  }>;
}> = ({
  title,
  className = '',
  toggleDescriptors: propToggleDescriptors,
}) => {
  const { toggleDescriptors: hookToggleDescriptors, setToggle } = useLayerToggles();
  
  // Use prop toggleDescriptors if provided, otherwise use hook defaults
  const finalToggleDescriptors = propToggleDescriptors || hookToggleDescriptors;
  
  // Debug logging removed for production

  // Get the appropriate icon for each layer type
  const getIconForLayer = useCallback((layerKey: string) => {
    switch (layerKey) {
      case 'buildings':
        return iconMap.Building2;
      case 'terrain':
        return iconMap.Mountain;
      case 'hazards':
        return iconMap.AlertTriangle;
      case 'units':
        return iconMap.Users;
      case 'routes':
        return iconMap.Route;
      default:
        return iconMap.Mountain;
    }
  }, []);

  // Get the appropriate color for each layer type
  const getColorForLayer = useCallback((layerKey: string) => {
    switch (layerKey) {
      case 'buildings':
        return 'var(--ios-purple)';
      case 'terrain':
        return 'var(--ios-green)';
      case 'hazards':
        return 'var(--ios-red)';
      case 'units':
        return 'var(--ios-blue)';
      case 'routes':
        return 'var(--ios-orange)';
      default:
        return 'var(--ios-gray)';
    }
  }, []);
  
  // Temporarily disable map integration to test component rendering
  // let map: any = null;
  // try {
  //   map = useMap();
  //   console.log('Map context available:', !!map);
  // } catch (error) {
  //   // Map context not available, continue without map functionality
  //   console.log('Map context not available, terrain toggle will work without map integration');
  // }
  
  const checkboxRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleToggle = useCallback((key: string, checked: boolean) => {
    setToggle(key as any, checked);
    
    // Update the checkbox ref to match the state
    const index = finalToggleDescriptors.findIndex(toggle => toggle.key === key);
    if (index !== -1 && checkboxRefs.current[index]) {
      checkboxRefs.current[index]!.checked = checked;
    }
    
    // Temporarily disable map integration
    // // Handle terrain toggle specifically if map is available
    // if (key === 'terrain' && map?.setTerrainEnabled) {
    //   map.setTerrainEnabled(checked);
    // }
  }, [setToggle, finalToggleDescriptors]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, currentIndex: number) => {
    const totalLayers = finalToggleDescriptors.length;
    
    // Debug logging
    console.log('🔍 LayerTogglePanel: Key pressed', event.key, 'on index', currentIndex);
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (finalToggleDescriptors[currentIndex]) {
          handleToggle(finalToggleDescriptors[currentIndex].key, true);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (finalToggleDescriptors[currentIndex]) {
          handleToggle(finalToggleDescriptors[currentIndex].key, false);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % totalLayers;
        checkboxRefs.current[nextIndex]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + totalLayers) % totalLayers;
        checkboxRefs.current[prevIndex]?.focus();
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (finalToggleDescriptors && finalToggleDescriptors[currentIndex]) {
          const newChecked = !finalToggleDescriptors[currentIndex].checked;
          handleToggle(finalToggleDescriptors[currentIndex].key, newChecked);
          
          // Force update the checkbox ref immediately
          if (checkboxRefs.current[currentIndex]) {
            checkboxRefs.current[currentIndex]!.checked = newChecked;
          }
        }
        break;
    }
  }, [finalToggleDescriptors, handleToggle]);

  const handleLabelClick = useCallback((key: string, currentChecked: boolean, event: React.MouseEvent) => {
    // Only handle label clicks, not input clicks (to avoid double-triggering)
    if (event.target === event.currentTarget || (event.target as HTMLElement).tagName !== 'INPUT') {
      handleToggle(key, !currentChecked);
    }
  }, [handleToggle]);

  // Update refs array when layers change
  useEffect(() => {
    checkboxRefs.current = checkboxRefs.current.slice(0, finalToggleDescriptors.length);
  }, [finalToggleDescriptors.length]);

  return (
    <div 
      className={`layer-toggle-panel ios-card ${className}`}
      role="region"
      aria-label={title}
      data-testid="layer-toggle-panel-debug"
    >
      {title && (
        <div className="ios-container" style={{ padding: 'var(--ios-spacing-md)' }}>
          <h4 className="ios-heading">{title}</h4>
        </div>
      )}
      <div className="ios-container" style={{ padding: title ? '0 var(--ios-spacing-md) var(--ios-spacing-md)' : 'var(--ios-spacing-md)' }}>
        <div className="layer-controls">
          {finalToggleDescriptors.map((toggle, index) => {
            const IconComponent = getIconForLayer(toggle.key);
            const isChecked = toggle.checked;
            const inputId = `layer-toggle-${toggle.key}`;
            
            return (
              <label
                key={toggle.key}
                className="layer-toggle"
                htmlFor={inputId}
                onClick={(e) => handleLabelClick(toggle.key, isChecked, e)}
                style={{ 
                  cursor: 'pointer',
                  '--layer-color': getColorForLayer(toggle.key)
                } as React.CSSProperties}
              >
                <input
                  ref={(el) => { checkboxRefs.current[index] = el; }}
                  id={inputId}
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleToggle(toggle.key, e.target.checked)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  data-testid={`toggle-${toggle.key}`}
                  role="switch"
                  aria-checked={isChecked}
                  className="layer-input"
                />
                <span className="layer-icon">
                  <IconComponent className="w-4 h-4" />
                </span>
                <span className="layer-label">{toggle.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
