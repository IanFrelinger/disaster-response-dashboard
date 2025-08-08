import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, 
  Crosshair, 
  MessageSquare, 
  AlertTriangle, 
  BarChart3, 
  Shield, 
  LogOut, 
  Ruler, 
  MapPin, 
  Navigation,
  Radio
} from 'lucide-react';
import { ContextMenu as ContextMenuType, MenuItem } from '@/types/tacmap';

interface ContextMenuComponentProps {
  menu: ContextMenuType;
  onAction: (action: string) => void;
  onClose: () => void;
}

export const ContextMenuComponent: React.FC<ContextMenuComponentProps> = ({
  menu,
  onAction,
  onClose
}) => {
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'info':
        return <Info size={14} />;
      case 'crosshair':
        return <Crosshair size={14} />;
      case 'message':
        return <MessageSquare size={14} />;
      case 'alert':
        return <AlertTriangle size={14} />;
      case 'chart':
        return <BarChart3 size={14} />;
      case 'shield':
        return <Shield size={14} />;
      case 'exit':
        return <LogOut size={14} />;
      case 'ruler':
        return <Ruler size={14} />;
      case 'pin':
        return <MapPin size={14} />;
      case 'location':
        return <Navigation size={14} />;
      case 'broadcast':
        return <Radio size={14} />;
      default:
        return null;
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (!item.divider && item.action) {
      onAction(item.action);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="context-menu"
        style={{
          left: menu.position.x,
          top: menu.position.y
        }}
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {menu.items.map((item, index) => (
          <motion.div
            key={index}
            className={`context-menu-item ${item.divider ? 'divider' : ''}`}
            onClick={() => handleItemClick(item)}
            whileHover={!item.divider ? { backgroundColor: 'rgba(0, 255, 255, 0.1)' } : {}}
            transition={{ duration: 0.1 }}
          >
            {!item.divider && (
              <>
                {getIcon(item.icon)}
                <span>{item.label}</span>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
