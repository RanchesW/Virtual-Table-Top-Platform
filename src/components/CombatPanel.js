// components/CombatPanel.js - Initiative Management System
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Dice6, 
  Plus, 
  Minus, 
  Trash2, 
  RotateCw,
  UserPlus,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CombatPanel = () => {
  const {
    tokens,
    combatOrder,
    setCombatOrder,
    isInCombat,
    toggleCombat,
    nextTurn,
    currentTurn,
    round,
    setRound,
    setCurrentTurn,
    rollInitiative,
    updateToken,
    addToCombat,
    removeFromCombat,
    addChatMessage
  } = useAppContext();

  const [editingInitiative, setEditingInitiative] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showAddCombatant, setShowAddCombatant] = useState(false);

  const startEditingInitiative = (combatantId, currentInit) => {
    setEditingInitiative(combatantId);
    setEditValue(currentInit.toString());
  };

  const saveInitiative = (combatantId) => {
    const newInit = parseInt(editValue) || 10;
    
    // Update token
    updateToken(combatantId, { initiative: newInit });
    
    // Update combat order and re-sort
    setCombatOrder(prev => {
      const updated = prev.map(combatant =>
        combatant.id === combatantId 
          ? { ...combatant, initiative: newInit }
          : combatant
      );
      return updated.sort((a, b) => b.initiative - a.initiative);
    });
    
    setEditingInitiative(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingInitiative(null);
    setEditValue('');
  };

  const rollAllInitiatives = () => {
    combatOrder.forEach(combatant => {
      rollInitiative(combatant.id);
    });
    addChatMessage({
      type: 'system',
      content: 'Rolled initiative for all combatants!',
      timestamp: Date.now()
    });
  };

  const clearCombat = () => {
    if (window.confirm('Clear all combatants from initiative? This will not delete tokens.')) {
      setCombatOrder([]);
      setCurrentTurn(0);
      setRound(1);
      addChatMessage({
        type: 'system',
        content: 'Combat tracker cleared.',
        timestamp: Date.now()
      });
    }
  };

  const updateHP = (combatantId, newHP) => {
    const combatant = combatOrder.find(c => c.id === combatantId);
    if (combatant) {
      const clampedHP = Math.max(0, Math.min(newHP, combatant.maxHp));
      updateToken(combatantId, { hp: clampedHP });
      
      setCombatOrder(prev => prev.map(c =>
        c.id === combatantId ? { ...c, hp: clampedHP } : c
      ));
    }
  };

  const AddCombatantForm = () => {
    const [name, setName] = useState('');
    const [initiative, setInitiative] = useState(10);
    const [hp, setHP] = useState(30);
    const [ac, setAC] = useState(15);

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name.trim()) return;

      // Create new token and add to combat
      const newTokenId = Date.now().toString();
      updateToken(newTokenId, {
        id: newTokenId,
        name: name.trim(),
        hp: parseInt(hp) || 30,
        maxHp: parseInt(hp) || 30,
        ac: parseInt(ac) || 15,
        initiative: parseInt(initiative) || 10,
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 400,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        type: 'npc'
      });

      const newCombatant = {
        id: newTokenId,
        name: name.trim(),
        initiative: parseInt(initiative) || 10,
        hp: parseInt(hp) || 30,
        maxHp: parseInt(hp) || 30,
        ac: parseInt(ac) || 15
      };

      setCombatOrder(prev => [...prev, newCombatant].sort((a, b) => b.initiative - a.initiative));
      
      // Reset form
      setName('');
      setInitiative(10);
      setHP(30);
      setAC(15);
      setShowAddCombatant(false);
    };

    return (
      <form onSubmit={handleSubmit} className="add-combatant-form">
        <h4>Add Combatant</h4>
        <div className="form-row">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <input
            type="number"
            placeholder="Initiative"
            value={initiative}
            onChange={(e) => setInitiative(e.target.value)}
            min="1"
            max="30"
          />
          <input
            type="number"
            placeholder="HP"
            value={hp}
            onChange={(e) => setHP(e.target.value)}
            min="1"
          />
          <input
            type="number"
            placeholder="AC"
            value={ac}
            onChange={(e) => setAC(e.target.value)}
            min="1"
            max="30"
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">Add</button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowAddCombatant(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="panel-content">
      {/* Combat Controls */}
      <div className="combat-controls">
        <button 
          className={`btn-primary ${isInCombat ? 'combat-active' : ''}`}
          onClick={toggleCombat}
        >
          {isInCombat ? <Pause size={16} /> : <Play size={16} />}
          {isInCombat ? 'End Combat' : 'Start Combat'}
        </button>
        
        {isInCombat && (
          <div className="turn-controls">
            <div className="turn-info">
              <span className="round">Round {round}</span>
              <span className="current-turn">
                {combatOrder[currentTurn]?.name || 'No one'}'s Turn
              </span>
            </div>
            <button className="next-turn" onClick={nextTurn}>
              <SkipForward size={14} />
              Next Turn
            </button>
          </div>
        )}
      </div>

      {/* Initiative Management */}
      <div className="initiative-section">
        <div className="section-header">
          <h4>Initiative Tracker</h4>
          <div className="initiative-actions">
            <button 
              className="btn-sm"
              onClick={rollAllInitiatives}
              title="Roll all initiatives"
            >
              <Dice6 size={14} />
            </button>
            <button 
              className="btn-sm"
              onClick={() => setShowAddCombatant(!showAddCombatant)}
              title="Add combatant"
            >
              <UserPlus size={14} />
            </button>
            <button 
              className="btn-sm btn-danger"
              onClick={clearCombat}
              title="Clear combat tracker"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Add Combatant Form */}
        {showAddCombatant && <AddCombatantForm />}

        {/* Available Tokens to Add */}
        <div className="available-tokens">
          <h5>Add to Combat:</h5>
          <div className="token-chips">
            {tokens
              .filter(token => !combatOrder.find(c => c.id === token.id))
              .map(token => (
                <button
                  key={token.id}
                  className="token-chip"
                  onClick={() => addToCombat(token.id)}
                  style={{ borderColor: token.color }}
                >
                  <span className="token-avatar" style={{ backgroundColor: token.color }}>
                    {token.name[0]}
                  </span>
                  {token.name}
                </button>
              ))
            }
          </div>
        </div>

        {/* Combat Order */}
        <div className="combat-order">
          {combatOrder.length === 0 ? (
            <div className="empty-combat">
              <p>No combatants added yet.</p>
              <p>Add tokens from the canvas or create new ones.</p>
            </div>
          ) : (
            combatOrder.map((combatant, index) => (
              <div 
                key={combatant.id} 
                className={`combatant ${index === currentTurn && isInCombat ? 'active-turn' : ''}`}
              >
                <div className="combatant-header">
                  <div className="combatant-info">
                    <span className="combatant-name">{combatant.name}</span>
                    <span className="combatant-ac">AC {combatant.ac}</span>
                  </div>
                  
                  <div className="initiative-display">
                    {editingInitiative === combatant.id ? (
                      <div className="initiative-edit">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveInitiative(combatant.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                          min="1"
                          max="30"
                        />
                        <button onClick={() => saveInitiative(combatant.id)}>
                          <Check size={12} />
                        </button>
                        <button onClick={cancelEdit}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="initiative-score">
                        <span 
                          onClick={() => startEditingInitiative(combatant.id, combatant.initiative)}
                          className="clickable"
                        >
                          {combatant.initiative}
                        </span>
                        <button 
                          onClick={() => rollInitiative(combatant.id)}
                          className="roll-init"
                          title="Roll initiative"
                        >
                          <Dice6 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <button 
                    className="remove-combatant"
                    onClick={() => removeFromCombat(combatant.id)}
                    title="Remove from combat"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* HP Management */}
                <div className="hp-management">
                  <div className="hp-controls">
                    <button 
                      className="hp-btn damage"
                      onClick={() => updateHP(combatant.id, combatant.hp - 1)}
                    >
                      -1
                    </button>
                    <button 
                      className="hp-btn damage"
                      onClick={() => updateHP(combatant.id, combatant.hp - 5)}
                    >
                      -5
                    </button>
                    
                    <div className="hp-display">
                      <span className="current-hp">{combatant.hp}</span>
                      <span className="hp-separator">/</span>
                      <span className="max-hp">{combatant.maxHp}</span>
                    </div>
                    
                    <button 
                      className="hp-btn heal"
                      onClick={() => updateHP(combatant.id, combatant.hp + 1)}
                    >
                      +1
                    </button>
                    <button 
                      className="hp-btn heal"
                      onClick={() => updateHP(combatant.id, combatant.hp + 5)}
                    >
                      +5
                    </button>
                  </div>
                  
                  <div className="hp-bar">
                    <div 
                      className="hp-fill" 
                      style={{ width: `${Math.max(0, (combatant.hp / combatant.maxHp) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CombatPanel;