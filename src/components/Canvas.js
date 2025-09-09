// components/Canvas.js - Interactive Token Canvas with Dragging
import React, { useRef, useEffect, useState } from 'react';
import { Dice6 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Canvas = ({ activeTool, showGrid, zoom, selectedToken, setSelectedToken }) => {
  const {
    tokens,
    updateToken,
    isDMMode,
    draggedToken,
    setDraggedToken,
    diceRoll
  } = useAppContext();

  const canvasRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showWelcome, setShowWelcome] = useState(true);

  // Hide welcome message after any interaction
  useEffect(() => {
    if (tokens.length > 0 || selectedToken) {
      const timer = setTimeout(() => setShowWelcome(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [tokens.length, selectedToken]);

  const handleTokenMouseDown = (e, tokenId) => {
    if (activeTool !== 'move' && activeTool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - token.x - 25; // 25 = half token width
    const offsetY = e.clientY - rect.top - token.y - 25;
    
    setSelectedToken(tokenId);
    setDragOffset({ x: offsetX, y: offsetY });
    
    if (activeTool === 'move') {
      setDraggedToken(tokenId);
    }
  };

  const handleMouseMove = (e) => {
    if (!draggedToken || activeTool !== 'move') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left - dragOffset.x - 25;
    let y = e.clientY - rect.top - dragOffset.y - 25;
    
    // Snap to grid if enabled
    if (showGrid) {
      const gridSize = 40;
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    
    // Keep tokens within canvas bounds
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    x = Math.max(0, Math.min(x, canvasWidth - 50));
    y = Math.max(0, Math.min(y, canvasHeight - 50));
    
    updateToken(draggedToken, { x, y });
  };

  const handleMouseUp = () => {
    if (draggedToken) {
      setDraggedToken(null);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleCanvasClick = (e) => {
    // Only deselect if clicking empty space
    if (e.target === e.currentTarget) {
      setSelectedToken(null);
    }
  };

  // Add event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();
    
    if (draggedToken) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggedToken, activeTool, showGrid, dragOffset]);

  const getCursor = () => {
    if (draggedToken) return 'grabbing';
    if (activeTool === 'move') return 'grab';
    if (activeTool === 'select') return 'pointer';
    return 'default';
  };

  const TokenComponent = ({ token }) => {
    const isSelected = selectedToken === token.id;
    const isDragging = draggedToken === token.id;
    
    return (
      <div
        className={`token ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          left: token.x,
          top: token.y,
          backgroundColor: token.color,
          opacity: token.hidden && !isDMMode ? 0.3 : 1,
          transform: isDragging ? 'scale(1.1)' : isSelected ? 'scale(1.05)' : 'scale(1)',
          zIndex: isDragging ? 1000 : isSelected ? 200 : 100
        }}
        onMouseDown={(e) => handleTokenMouseDown(e, token.id)}
        title={`${token.name} (HP: ${token.hp}/${token.maxHp}, AC: ${token.ac})`}
      >
        <div className="token-avatar">
          {token.name[0]?.toUpperCase()}
        </div>
        
        {/* Token Info (DM Mode) */}
        {isDMMode && !isDragging && (
          <div className="token-info">
            <div className="hp-display">
              {token.hp}/{token.maxHp}
            </div>
            <div className="ac-display">
              AC {token.ac}
            </div>
          </div>
        )}
        
        {/* Conditions */}
        {token.conditions && token.conditions.length > 0 && (
          <div className="conditions">
            {token.conditions.slice(0, 2).map((condition, index) => (
              <span key={index} className="condition-badge">
                {condition.length > 6 ? condition.slice(0, 6) + '...' : condition}
              </span>
            ))}
          </div>
        )}
        
        {/* Initiative Indicator */}
        {token.initiative && (
          <div className="initiative-indicator">
            {token.initiative}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="canvas-container">
      <div 
        ref={canvasRef}
        className="game-canvas"
        style={{ cursor: getCursor() }}
        onClick={handleCanvasClick}
      >
        {/* Grid Overlay */}
        {showGrid && <div className="grid-overlay" />}
        
        {/* Tokens */}
        {tokens.map(token => (
          <TokenComponent key={token.id} token={token} />
        ))}
        
        {/* Welcome Overlay */}
        {showWelcome && tokens.length === 0 && (
          <div className="welcome-overlay">
            <h2>🎲 Virtual Tabletop Ready!</h2>
            <p><strong>Get Started:</strong></p>
            <ul>
              <li>🎭 <strong>Add tokens</strong> from the Tokens panel</li>
              <li>⚔️ <strong>Start combat</strong> in the Combat panel</li>
              <li>🖱️ <strong>Switch to Move tool</strong> to drag tokens</li>
              <li>🎲 <strong>Roll dice</strong> with "/roll 1d20" in chat</li>
              <li>📝 <strong>Take notes</strong> in the Notes panel</li>
            </ul>
            <p><em>Click anywhere to dismiss this message</em></p>
          </div>
        )}
        
        {/* Tool-specific overlays */}
        {activeTool === 'measure' && (
          <div className="tool-overlay">
            <p>🏗️ Measurement tool - Click and drag to measure distances</p>
          </div>
        )}
        
        {activeTool === 'light' && (
          <div className="tool-overlay">
            <p>💡 Lighting tool - Click tokens to toggle light sources</p>
          </div>
        )}
      </div>
      
      {/* Dice Roll Overlay */}
      {diceRoll && (
        <div className="dice-overlay">
          <div className="dice-result">
            <Dice6 size={24} />
            <span>d{diceRoll.sides}: {diceRoll.result}</span>
          </div>
        </div>
      )}
      
      {/* Canvas Info */}
      <div className="canvas-info">
        <div className="info-item">
          <span>Tokens: {tokens.length}</span>
        </div>
        <div className="info-item">
          <span>Selected: {selectedToken ? tokens.find(t => t.id === selectedToken)?.name : 'None'}</span>
        </div>
        <div className="info-item">
          <span>Tool: {activeTool}</span>
        </div>
        {showGrid && (
          <div className="info-item">
            <span>Grid: 40px</span>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="quick-action"
          onClick={() => setSelectedToken(null)}
          disabled={!selectedToken}
          title="Deselect all"
        >
          Clear Selection
        </button>
        
        {isDMMode && (
          <button 
            className="quick-action"
            onClick={() => {
              const hiddenTokens = tokens.filter(t => t.hidden);
              hiddenTokens.forEach(token => {
                updateToken(token.id, { hidden: false });
              });
            }}
            disabled={!tokens.some(t => t.hidden)}
            title="Reveal all hidden tokens"
          >
            Reveal All
          </button>
        )}
      </div>
    </div>
  );
};

// Additional CSS for Canvas (add to App.css)
const additionalStyles = `
.token.dragging {
  cursor: grabbing !important;
  box-shadow: 0 8px 32px rgba(52, 152, 219, 0.8) !important;
  transform: scale(1.1) !important;
}

.initiative-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f39c12;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 2px solid #ecf0f1;
}

.tool-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(44, 62, 80, 0.9);
  color: #ecf0f1;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 14px;
  border: 1px solid #3498db;
  z-index: 500;
}

.canvas-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 16px;
  pointer-events: none;
}

.info-item {
  background: rgba(44, 62, 80, 0.8);
  color: #ecf0f1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.quick-actions {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
}

.quick-action {
  background: rgba(52, 152, 219, 0.9);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.quick-action:hover:not(:disabled) {
  background: #3498db;
  transform: translateY(-1px);
}

.quick-action:disabled {
  background: rgba(127, 140, 141, 0.5);
  cursor: not-allowed;
}
`;

export default Canvas;