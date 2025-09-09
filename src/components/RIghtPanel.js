// components/RightPanel.js - Closeable Token Details Panel
import React, { useState } from 'react';
import { Heart, Shield, Dice6, X, Edit2, Plus, Trash2, Sword, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const RightPanel = ({ selectedToken, setSelectedToken }) => {
  const { 
    tokens, 
    updateToken, 
    deleteToken, 
    rollDice, 
    rollInitiative,
    addToCombat,
    removeFromCombat,
    combatOrder,
    isDMMode 
  } = useAppContext();
  
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const selectedTokenData = tokens.find(t => t.id === selectedToken);

  if (!selectedToken || !selectedTokenData) {
    return (
      <div className="side-panel right-panel">
        <div className="panel-header">
          <h3>Token Details</h3>
        </div>
        <div className="empty-state">
          <p>Select a token to view details</p>
        </div>
      </div>
    );
  }

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue.toString());
  };

  const saveEdit = () => {
    if (editingField && editValue.trim()) {
      const numericFields = ['hp', 'maxHp', 'ac', 'initiative'];
      const value = numericFields.includes(editingField) 
        ? parseInt(editValue) || 0 
        : editValue.trim();
      
      updateToken(selectedToken, { [editingField]: value });
    }
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const isInCombat = combatOrder.some(c => c.id === selectedToken);

  return (
    <div className="side-panel right-panel">
      <div className="panel-header">
        <h3>Token Details</h3>
        <button 
          className="close-btn" 
          onClick={() => setSelectedToken(null)}
          title="Close panel"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="token-details">
        {/* Character Portrait */}
        <div className="character-portrait">
          <div 
            className="portrait-frame" 
            style={{ backgroundColor: selectedTokenData.color }}
            onClick={() => startEditing('color', selectedTokenData.color)}
          >
            {selectedTokenData.name[0]?.toUpperCase()}
          </div>
          
          {editingField === 'name' ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={saveEdit}
              autoFocus
              className="edit-input name-edit"
            />
          ) : (
            <h4 onClick={() => startEditing('name', selectedTokenData.name)}>
              {selectedTokenData.name}
              <Edit2 size={12} className="edit-icon" />
            </h4>
          )}
          
          <div className="token-type">
            <span className={`type-badge ${selectedTokenData.type}`}>
              {selectedTokenData.type || 'npc'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {/* HP */}
          <div className="stat-block">
            <Heart size={16} />
            <div className="stat-content">
              {editingField === 'hp' ? (
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={saveEdit}
                  autoFocus
                  className="edit-input"
                  min="0"
                  max={selectedTokenData.maxHp}
                />
              ) : (
                <span onClick={() => startEditing('hp', selectedTokenData.hp)}>
                  HP: {selectedTokenData.hp}
                </span>
              )}
              
              <span>/</span>
              
              {editingField === 'maxHp' ? (
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={saveEdit}
                  autoFocus
                  className="edit-input"
                  min="1"
                />
              ) : (
                <span onClick={() => startEditing('maxHp', selectedTokenData.maxHp)}>
                  {selectedTokenData.maxHp}
                </span>
              )}
            </div>
            
            <div className="hp-controls">
              <button 
                className="hp-btn damage"
                onClick={() => updateToken(selectedToken, { 
                  hp: Math.max(0, selectedTokenData.hp - 1) 
                })}
                title="Take 1 damage"
              >-</button>
              <button 
                className="hp-btn heal"
                onClick={() => updateToken(selectedToken, { 
                  hp: Math.min(selectedTokenData.maxHp, selectedTokenData.hp + 1) 
                })}
                title="Heal 1 HP"
              >+</button>
            </div>
          </div>

          {/* AC */}
          <div className="stat-block">
            <Shield size={16} />
            {editingField === 'ac' ? (
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={saveEdit}
                autoFocus
                className="edit-input"
                min="1"
                max="30"
              />
            ) : (
              <span onClick={() => startEditing('ac', selectedTokenData.ac)}>
                AC: {selectedTokenData.ac}
                <Edit2 size={10} className="edit-icon" />
              </span>
            )}
          </div>

          {/* Initiative */}
          <div className="stat-block">
            <Sword size={16} />
            <div className="initiative-content">
              {editingField === 'initiative' ? (
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={saveEdit}
                  autoFocus
                  className="edit-input"
                  min="1"
                  max="30"
                />
              ) : (
                <span onClick={() => startEditing('initiative', selectedTokenData.initiative || 10)}>
                  Init: {selectedTokenData.initiative || '--'}
                </span>
              )}
              
              <button 
                className="initiative-roll"
                onClick={() => rollInitiative(selectedToken)}
                title="Roll initiative"
              >
                <Dice6 size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Combat Controls */}
        <div className="combat-controls">
          {isInCombat ? (
            <button 
              className="btn-danger" 
              onClick={() => removeFromCombat(selectedToken)}
            >
              Remove from Combat
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={() => addToCombat(selectedToken)}
            >
              Add to Combat
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => rollDice(20, 0, `${selectedTokenData.name} d20`)}>
            <Dice6 size={16} />
            <span>d20</span>
          </button>
          <button onClick={() => rollDice(12, 0, `${selectedTokenData.name} d12`)}>
            <Dice6 size={16} />
            <span>d12</span>
          </button>
          <button onClick={() => rollDice(10, 0, `${selectedTokenData.name} d10`)}>
            <Dice6 size={16} />
            <span>d10</span>
          </button>
          <button onClick={() => rollDice(8, 0, `${selectedTokenData.name} d8`)}>
            <Dice6 size={16} />
            <span>d8</span>
          </button>
          <button onClick={() => rollDice(6, 0, `${selectedTokenData.name} d6`)}>
            <Dice6 size={16} />
            <span>d6</span>
          </button>
          <button onClick={() => rollDice(4, 0, `${selectedTokenData.name} d4`)}>
            <Dice6 size={16} />
            <span>d4</span>
          </button>
        </div>

        {/* Conditions */}
        <div className="conditions-section">
          <h5>Conditions</h5>
          <div className="conditions-list">
            {selectedTokenData.conditions?.map((condition, index) => (
              <div key={index} className="condition-tag">
                <span>{condition}</span>
                <button 
                  className="condition-remove"
                  onClick={() => {
                    const newConditions = selectedTokenData.conditions.filter((_, i) => i !== index);
                    updateToken(selectedToken, { conditions: newConditions });
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            className="add-condition"
            onClick={() => {
              const condition = prompt('Add condition:');
              if (condition?.trim()) {
                const newConditions = [...(selectedTokenData.conditions || []), condition.trim()];
                updateToken(selectedToken, { conditions: newConditions });
              }
            }}
          >
            <Plus size={12} /> Add Condition
          </button>
        </div>

        {/* Visibility Toggle */}
        <div className="visibility-section">
          <button 
            className={`visibility-toggle ${selectedTokenData.hidden ? 'hidden' : 'visible'}`}
            onClick={() => updateToken(selectedToken, { hidden: !selectedTokenData.hidden })}
          >
            {selectedTokenData.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
            {selectedTokenData.hidden ? 'Hidden' : 'Visible'}
          </button>
        </div>

        {/* DM Only - Delete Token */}
        {isDMMode && (
          <div className="danger-zone">
            <button 
              className="btn-danger delete-token"
              onClick={() => {
                if (window.confirm(`Delete ${selectedTokenData.name}? This cannot be undone.`)) {
                  deleteToken(selectedToken);
                  setSelectedToken(null);
                }
              }}
            >
              <Trash2 size={16} />
              Delete Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;