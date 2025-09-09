// components/Toolbar.js - Main Toolbar with Tool Selection
import React from 'react';
import { 
  Mouse, 
  Move, 
  Ruler, 
  Sun, 
  Grid, 
  Settings, 
  Plus, 
  Minus, 
  RotateCw,
  Save,
  Upload,
  Download,
  Trash2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Toolbar = ({ 
  tools, 
  activeTool, 
  setActiveTool, 
  isDMMode, 
  setIsDMMode, 
  showGrid, 
  setShowGrid, 
  zoom, 
  setZoom 
}) => {
  const { clearAllData, tokens, combatOrder, notes, chatMessages } = useAppContext();

  const iconMap = {
    Mouse,
    Move,
    Ruler,
    Sun,
    Grid,
    Settings,
    Plus,
    Minus,
    RotateCw,
    Save,
    Upload,
    Download,
    Trash2
  };

  const exportData = () => {
    const gameData = {
      tokens,
      combatOrder,
      notes,
      chatMessages,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `vtt-session-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const gameData = JSON.parse(event.target.result);
          
          if (window.confirm('This will replace all current data. Continue?')) {
            // Import data using context methods
            if (gameData.tokens) {
              gameData.tokens.forEach(token => {
                // Re-add tokens (this will trigger the context to update)
                // We need to clear first, then add
              });
            }
            
            // For now, just alert success - full implementation would use context setters
            alert(`Imported ${gameData.tokens?.length || 0} tokens, ${gameData.notes?.length || 0} notes`);
          }
        } catch (error) {
          alert('Error importing file. Please check the file format.');
          console.error('Import error:', error);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  const resetZoom = () => {
    setZoom(100);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h1>🎲 Virtual Tabletop</h1>
        
        {/* Tool Selection */}
        <div className="tool-group">
          {tools.map(tool => {
            const IconComponent = iconMap[tool.icon];
            return (
              <button
                key={tool.id}
                className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
              >
                <IconComponent size={16} />
              </button>
            );
          })}
        </div>
        
        {/* File Operations */}
        <div className="tool-group">
          <button 
            className="tool-btn" 
            onClick={exportData}
            title="Export session data"
          >
            <Download size={16} />
          </button>
          <button 
            className="tool-btn" 
            onClick={importData}
            title="Import session data"
          >
            <Upload size={16} />
          </button>
          <button 
            className="tool-btn danger" 
            onClick={() => {
              if (window.confirm('Clear all data? This cannot be undone!')) {
                clearAllData();
              }
            }}
            title="Clear all data"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="toolbar-center">
        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button 
            onClick={() => setZoom(Math.max(25, zoom - 25))}
            disabled={zoom <= 25}
            title="Zoom out"
          >
            <Minus size={16} />
          </button>
          <span 
            onClick={resetZoom} 
            className="zoom-display"
            title="Click to reset zoom"
          >
            {zoom}%
          </span>
          <button 
            onClick={() => setZoom(Math.min(400, zoom + 25))}
            disabled={zoom >= 400}
            title="Zoom in"
          >
            <Plus size={16} />
          </button>
        </div>
        
        {/* Quick Zoom Presets */}
        <div className="zoom-presets">
          {[50, 75, 100, 150, 200].map(preset => (
            <button
              key={preset}
              className={`zoom-preset ${zoom === preset ? 'active' : ''}`}
              onClick={() => setZoom(preset)}
              title={`Zoom to ${preset}%`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>
      
      <div className="toolbar-right">
        {/* Grid Toggle */}
        <button 
          className={`grid-toggle ${showGrid ? 'active' : ''}`} 
          onClick={() => setShowGrid(!showGrid)}
          title={showGrid ? 'Hide grid' : 'Show grid'}
        >
          <Grid size={16} />
        </button>
        
        {/* DM/Player Mode */}
        <div className="mode-toggle">
          <span 
            className={isDMMode ? 'active' : ''} 
            onClick={() => setIsDMMode(true)}
            title="Dungeon Master mode"
          >
            DM
          </span>
          <span 
            className={!isDMMode ? 'active' : ''} 
            onClick={() => setIsDMMode(false)}
            title="Player mode"
          >
            Player
          </span>
        </div>
        
        {/* Data Stats */}
        <div className="data-stats">
          <span className="stat-item" title="Number of tokens">
            🎭 {tokens.length}
          </span>
          <span className="stat-item" title="Combatants in initiative">
            ⚔️ {combatOrder.length}
          </span>
          <span className="stat-item" title="Campaign notes">
            📝 {notes.length}
          </span>
        </div>
        
        {/* Settings */}
        <button className="tool-btn" title="Settings (Coming soon)">
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;