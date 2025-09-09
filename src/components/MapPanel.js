// components/MapPanel.js - Map Selection & Settings System
import React, { useState } from 'react';
import { 
  Upload, 
  Grid, 
  Sun, 
  Eye, 
  Settings,
  Download,
  Trash2,
  Plus,
  Search,
  MapPin,
  Layers,
  Image,
  Ruler,
  Mountain,
  Trees,
  Ship
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MapPanel = () => {
  const { showGrid, setShowGrid, isDMMode } = useAppContext();
  
  const [activeMap, setActiveMap] = useState('tavern');
  const [gridSize, setGridSize] = useState(40);
  const [gridColor, setGridColor] = useState('#3498db');
  const [dynamicLighting, setDynamicLighting] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [mapOpacity, setMapOpacity] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const defaultMaps = [
    {
      id: 'tavern',
      name: 'The Prancing Pony',
      description: 'A cozy tavern with warm lighting',
      category: 'urban',
      gridSize: 5,
      icon: '🍺',
      backgroundColor: '#8b4513'
    },
    {
      id: 'dungeon',
      name: 'Ancient Catacombs',
      description: 'Dark stone corridors and chambers',
      category: 'dungeon',
      gridSize: 5,
      icon: '🏛️',
      backgroundColor: '#2c3e50'
    },
    {
      id: 'forest',
      name: 'Whispering Woods',
      description: 'Dense forest with winding paths',
      category: 'wilderness',
      gridSize: 10,
      icon: '🌲',
      backgroundColor: '#27ae60'
    },
    {
      id: 'castle',
      name: 'Thornwall Keep',
      description: 'Imposing fortress with high walls',
      category: 'urban',
      gridSize: 5,
      icon: '🏰',
      backgroundColor: '#7f8c8d'
    },
    {
      id: 'cave',
      name: 'Crystal Caverns',
      description: 'Shimmering underground caves',
      category: 'dungeon',
      gridSize: 5,
      icon: '💎',
      backgroundColor: '#34495e'
    },
    {
      id: 'ship',
      name: 'The Sea Serpent',
      description: 'Merchant vessel on the high seas',
      category: 'vehicle',
      gridSize: 5,
      icon: '🚢',
      backgroundColor: '#3498db'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Maps', icon: Layers },
    { id: 'urban', label: 'Urban', icon: MapPin },
    { id: 'dungeon', label: 'Dungeons', icon: Mountain },
    { id: 'wilderness', label: 'Wilderness', icon: Trees },
    { id: 'vehicle', label: 'Vehicles', icon: Ship }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredMaps = defaultMaps.filter(map => {
    const matchesSearch = map.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         map.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || map.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentMap = defaultMaps.find(m => m.id === activeMap) || defaultMaps[0];

  const handleMapSelect = (mapId) => {
    setActiveMap(mapId);
    const map = defaultMaps.find(m => m.id === mapId);
    if (map) {
      setGridSize(map.gridSize * 8); // Convert feet to pixels (rough conversion)
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In a real implementation, this would upload the file
      alert(`Map upload functionality coming soon! Selected: ${file.name}`);
    }
  };

  const exportMapSettings = () => {
    const settings = {
      activeMap,
      gridSize,
      gridColor,
      dynamicLighting,
      showGrid,
      showMeasurements,
      mapOpacity,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `map-settings-${activeMap}.json`;
    link.click();
  };

  return (
    <div className="panel-content">
      <div className="panel-header">
        <h3>Map Library</h3>
        <div className="header-actions">
          {isDMMode && (
            <>
              <button 
                className="btn-sm" 
                onClick={() => document.getElementById('map-upload').click()}
                title="Upload custom map"
              >
                <Upload size={14} />
              </button>
              <button 
                className="btn-sm" 
                onClick={exportMapSettings}
                title="Export map settings"
              >
                <Download size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        id="map-upload"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Search */}
      <div className="search-box">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search maps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="map-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Current Map Display */}
      <div className="current-map">
        <h4>Current Map</h4>
        <div className="map-card active">
          <div 
            className="map-preview large" 
            style={{ backgroundColor: currentMap.backgroundColor }}
          >
            <span className="map-icon">{currentMap.icon}</span>
            {showGrid && (
              <div 
                className="grid-preview"
                style={{
                  backgroundImage: `
                    linear-gradient(${gridColor}33 1px, transparent 1px),
                    linear-gradient(90deg, ${gridColor}33 1px, transparent 1px)
                  `,
                  backgroundSize: `${gridSize}px ${gridSize}px`
                }}
              />
            )}
          </div>
          <div className="map-info">
            <h5>{currentMap.name}</h5>
            <p>{currentMap.description}</p>
            <div className="map-stats">
              <span>Grid: {currentMap.gridSize}ft</span>
              <span>Type: {currentMap.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Library */}
      <div className="map-library">
        <h4>Available Maps</h4>
        <div className="map-grid">
          {filteredMaps.map(map => (
            <div
              key={map.id}
              className={`map-card ${activeMap === map.id ? 'active' : ''}`}
              onClick={() => handleMapSelect(map.id)}
            >
              <div 
                className="map-preview" 
                style={{ backgroundColor: map.backgroundColor }}
              >
                <span className="map-icon">{map.icon}</span>
              </div>
              <div className="map-info">
                <h5>{map.name}</h5>
                <p>{map.description}</p>
                <div className="map-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMapSelect(map.id);
                    }}
                    title="Load this map"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Settings */}
      <div className="map-settings">
        <h4>
          <Settings size={16} />
          Map Settings
        </h4>
        
        {/* Grid Settings */}
        <div className="settings-group">
          <h5>Grid Settings</h5>
          
          <label className="setting-item">
            <div className="setting-label">
              <Grid size={14} />
              Show Grid
            </div>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
          </label>
          
          <label className="setting-item">
            <div className="setting-label">
              <Ruler size={14} />
              Grid Size
            </div>
            <div className="input-group">
              <input
                type="number"
                value={Math.round(gridSize / 8)}
                onChange={(e) => setGridSize(parseInt(e.target.value) * 8 || 40)}
                min="1"
                max="20"
              />
              <span>ft</span>
            </div>
          </label>
          
          <label className="setting-item">
            <div className="setting-label">
              Grid Color
            </div>
            <input
              type="color"
              value={gridColor}
              onChange={(e) => setGridColor(e.target.value)}
            />
          </label>
        </div>

        {/* Lighting Settings */}
        <div className="settings-group">
          <h5>Lighting & Vision</h5>
          
          <label className="setting-item">
            <div className="setting-label">
              <Sun size={14} />
              Dynamic Lighting
            </div>
            <input
              type="checkbox"
              checked={dynamicLighting}
              onChange={(e) => setDynamicLighting(e.target.checked)}
            />
          </label>
          
          <label className="setting-item">
            <div className="setting-label">
              <Eye size={14} />
              Show Measurements
            </div>
            <input
              type="checkbox"
              checked={showMeasurements}
              onChange={(e) => setShowMeasurements(e.target.checked)}
            />
          </label>
        </div>

        {/* Display Settings */}
        <div className="settings-group">
          <h5>Display</h5>
          
          <label className="setting-item">
            <div className="setting-label">
              <Image size={14} />
              Map Opacity
            </div>
            <div className="input-group">
              <input
                type="range"
                min="10"
                max="100"
                value={mapOpacity}
                onChange={(e) => setMapOpacity(parseInt(e.target.value))}
              />
              <span>{mapOpacity}%</span>
            </div>
          </label>
        </div>

        {/* Quick Actions */}
        <div className="settings-group">
          <h5>Quick Actions</h5>
          <div className="quick-actions">
            <button 
              className="action-btn"
              onClick={() => {
                setGridSize(40);
                setGridColor('#3498db');
                setMapOpacity(100);
                setShowGrid(true);
              }}
              title="Reset to defaults"
            >
              Reset Settings
            </button>
            
            <button 
              className="action-btn"
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle grid"
            >
              {showGrid ? 'Hide Grid' : 'Show Grid'}
            </button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h5>💡 Map Tips:</h5>
        <ul>
          <li>Upload custom battle maps and dungeon layouts</li>
          <li>Adjust grid size to match your map scale</li>
          <li>Use dynamic lighting for fog of war effects</li>
          <li>Toggle measurements to show distances</li>
        </ul>
      </div>
    </div>
  );
};

export default MapPanel;