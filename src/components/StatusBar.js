// components/StatusBar.js - Bottom Status Information Bar
import React from 'react';
import { 
  Map, 
  Grid, 
  ZoomIn, 
  Mouse,
  Users,
  Sword,
  Volume2,
  Wifi,
  Clock,
  Activity,
  MessageSquare
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const StatusBar = ({ showGrid, zoom, activeTool, isInCombat }) => {
  const {
    tokens,
    combatOrder,
    currentTurn,
    round,
    isDMMode,
    notes,
    chatMessages
  } = useAppContext();

  const getToolName = (tool) => {
    const toolNames = {
      select: 'Select',
      move: 'Move',
      measure: 'Measure',
      light: 'Light'
    };
    return toolNames[tool] || tool;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getConnectionStatus = () => {
    // In a real multiplayer implementation, this would show actual connection status
    return 'Local Session';
  };

  const PlayerVideoMini = ({ name, isActive }) => (
    <div className={`player-video-mini ${isActive ? 'speaking' : ''}`}>
      <div className="video-frame-mini">
        <div className="avatar-mini">{name[0]}</div>
      </div>
      <span className="player-name-mini">{name}</span>
    </div>
  );

  const CombatStatus = () => {
    if (!isInCombat || combatOrder.length === 0) return null;

    const currentCombatant = combatOrder[currentTurn];
    return (
      <div className="combat-status">
        <Sword size={14} />
        <span>Round {round}</span>
        <span className="turn-indicator">
          {currentCombatant?.name}'s Turn
        </span>
      </div>
    );
  };

  const SessionStats = () => (
    <div className="session-stats">
      <div className="stat-item" title="Active tokens on canvas">
        <Users size={14} />
        <span>{tokens.length}</span>
      </div>
      
      {combatOrder.length > 0 && (
        <div className="stat-item" title="Combatants in initiative">
          <Sword size={14} />
          <span>{combatOrder.length}</span>
        </div>
      )}
      
      <div className="stat-item" title="Campaign notes">
        <Activity size={14} />
        <span>{notes.length}</span>
      </div>
      
      <div className="stat-item" title="Chat messages">
        <MessageSquare size={14} />
        <span>{chatMessages.length}</span>
      </div>
    </div>
  );

  return (
    <div className="status-bar">
      <div className="status-left">
        {/* Map Information */}
        <div className="status-group">
          <Map size={14} />
          <span>Tavern Map</span>
        </div>
        
        {/* Grid Status */}
        <div className="status-group">
          <Grid size={14} />
          <span>Grid: {showGrid ? 'ON' : 'OFF'}</span>
        </div>
        
        {/* Zoom Level */}
        <div className="status-group">
          <ZoomIn size={14} />
          <span>{zoom}%</span>
        </div>
        
        {/* Active Tool */}
        <div className="status-group">
          <Mouse size={14} />
          <span>Tool: {getToolName(activeTool)}</span>
        </div>
      </div>
      
      <div className="status-center">
        {/* Combat Status */}
        <CombatStatus />
        
        {/* Session Statistics */}
        <SessionStats />
      </div>
      
      <div className="status-right">
        {/* Player Videos (Mock) */}
        <div className="player-videos-mini">
          <PlayerVideoMini name="Rocky" isActive={false} />
          <PlayerVideoMini name="Selena" isActive={true} />
          <PlayerVideoMini name="Danny" isActive={false} />
          <PlayerVideoMini name="Frida" isActive={false} />
          <PlayerVideoMini name="Anna" isActive={false} />
        </div>
        
        {/* Connection Status */}
        <div className="status-group">
          <Wifi size={14} />
          <span>{getConnectionStatus()}</span>
        </div>
        
        {/* Session Time */}
        <div className="status-group">
          <Clock size={14} />
          <span>{getCurrentTime()}</span>
        </div>
        
        {/* Voice Toggle */}
        <button className="voice-toggle-mini" title="Voice chat (coming soon)">
          <Volume2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default StatusBar;