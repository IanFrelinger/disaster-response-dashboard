import React, { useCallback, useRef } from 'react';
import { useLayerToggles } from '../../features/layers/useLayerToggles';
import { iconMap } from '../icons/IconMap';
import './LayerTogglePanel.css';

interface LayerTogglePanelProps {
  title?: string;
  className?: string;
}

export const LayerTogglePanel: React.FC<LayerTogglePanelProps> = ({ 
  title, 
  className = '' 
}) => {
  const { toggleDescriptors, setToggle } = useLayerToggles();
  const checkboxRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleToggle = useCallback((key: string, checked: boolean) => {
    setToggle(key as any, checked);
  }, [setToggle]);

  const handleLabelClick = useCallback((key: string, isChecked: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    const newValue = !isChecked;
    setToggle(key as any, newValue);
    
    // Update the checkbox ref
    const index = toggleDescriptors.findIndex(toggle => toggle.key === key);
    if (index !== -1 && checkboxRefs.current[index]) {
      checkboxRefs.current[index]!.checked = newValue;
    }
  }, [setToggle, toggleDescriptors]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const toggle = toggleDescriptors[index];
      if (toggle) {
        const newValue = !toggle.checked;
        setToggle(toggle.key, newValue);
        
        if (checkboxRefs.current[index]) {
          checkboxRefs.current[index]!.checked = newValue;
        }
      }
    }
  }, [toggleDescriptors, setToggle]);

  return (
    <div
      className={`layer-toggle-panel ios-card ${className}`}
      role="region"
      aria-label={title}
      data-testid="layer-toggle-panel"
    >
      {title && (
        <div className="ios-container" style={{ padding: 'var(--ios-spacing-md)' }}>
          <h4 className="ios-heading">{title}</h4>
        </div>
      )}
      <div className="ios-container" style={{ padding: title ? '0 var(--ios-spacing-md) var(--ios-spacing-md)' : 'var(--ios-spacing-md)' }}>
        <div className="layer-controls">
          {toggleDescriptors.map((toggle, index) => {
            const IconComponent = toggle.key === 'buildings' ? iconMap.Building2 : iconMap.Mountain;
            const isChecked = toggle.checked;
            const inputId = `layer-toggle-${toggle.key}`;

            return (
              <label
                key={toggle.key}
                className="layer-toggle"
                htmlFor={inputId}
                data-testid="layer-toggle"
                onClick={(e) => handleLabelClick(toggle.key, isChecked, e)}
                style={{
                  cursor: 'pointer',
                  '--layer-color': toggle.key === 'buildings' ? 'var(--ios-purple)' : 'var(--ios-green)'
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
