// components/LeftPanel.js - Left Panel with Tab Navigation
import React from 'react';
import { Users, Layers, Sword, Book, MessageSquare } from 'lucide-react';
import TokenPanel from './TokenPanel';
import MapPanel from './MapPanel';
import CombatPanel from './CombatPanel';
import NotesPanel from './NotesPanel';
import ChatPanel from './ChatPanel';

const LeftPanel = ({ activeTab, setActiveTab, tabPanels }) => {
  const iconMap = {
    Users,
    Layers,
    Sword,
    Book,
    MessageSquare
  };

  const renderPanelContent = () => {
    switch (activeTab) {
      case 'tokens':
        return <TokenPanel />;
      case 'maps':
        return <MapPanel />;
      case 'combat':
        return <CombatPanel />;
      case 'notes':
        return <NotesPanel />;
      case 'chat':
        return <ChatPanel />;
      default:
        return <TokenPanel />;
    }
  };

  return (
    <div className="side-panel left-panel">
      {/* Tab Navigation */}
      <div className="panel-tabs">
        {tabPanels.map(tab => {
          const IconComponent = iconMap[tab.icon];
          return (
            <button
              key={tab.id}
              className={`panel-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
            >
              <IconComponent size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Panel Content */}
      <div className="panel-container">
        {renderPanelContent()}
      </div>
    </div>
  );
};

export default LeftPanel;