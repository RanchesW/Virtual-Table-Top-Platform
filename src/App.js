// App.js - Main Component
import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import LeftPanel from './components/LeftPanel';
import Canvas from './components/Canvas';
import RightPanel from './components/RightPanel';
import StatusBar from './components/StatusBar';
import { AppProvider, useAppContext } from './context/AppContext';
import './App.css';

const AppContent = () => {
  const {
    activeTab,
    setActiveTab,
    isDMMode,
    setIsDMMode,
    activeTool,
    setActiveTool,
    showGrid,
    setShowGrid,
    zoom,
    setZoom,
    isInCombat,
    setIsInCombat,
    selectedToken,
    setSelectedToken
  } = useAppContext();

  return (
    <div className="vtt-app">
      <Toolbar 
        tools={[
          { id: 'select', icon: 'Mouse', label: 'Select' },
          { id: 'move', icon: 'Move', label: 'Move' },
          { id: 'measure', icon: 'Ruler', label: 'Measure' },
          { id: 'light', icon: 'Sun', label: 'Light' }
        ]}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        isDMMode={isDMMode}
        setIsDMMode={setIsDMMode}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        zoom={zoom}
        setZoom={setZoom}
      />
      
      <div className="main-content">
        <LeftPanel 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabPanels={[
            { id: 'tokens', icon: 'Users', label: 'Tokens' },
            { id: 'maps', icon: 'Layers', label: 'Maps' },
            { id: 'combat', icon: 'Sword', label: 'Combat' },
            { id: 'notes', icon: 'Book', label: 'Notes' },
            { id: 'chat', icon: 'MessageSquare', label: 'Chat' }
          ]}
        />
        
        <Canvas 
          activeTool={activeTool}
          showGrid={showGrid}
          zoom={zoom}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
        
        <RightPanel 
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
      </div>
      
      <StatusBar 
        showGrid={showGrid}
        zoom={zoom}
        activeTool={activeTool}
        isInCombat={isInCombat}
      />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;