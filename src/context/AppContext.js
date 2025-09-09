// context/AppContext.js - Global State Management with Persistence
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

// Utility functions for localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Could not save to localStorage:', error);
  }
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Could not load from localStorage:', error);
    return defaultValue;
  }
};

export const AppProvider = ({ children }) => {
  // UI State
  const [activeTab, setActiveTab] = useState('tokens');
  const [isDMMode, setIsDMMode] = useState(true);
  const [activeTool, setActiveTool] = useState('select');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [selectedToken, setSelectedToken] = useState(null);
  const [draggedToken, setDraggedToken] = useState(null);

  // Game State - Load from localStorage
  const [tokens, setTokens] = useState(() => 
    loadFromStorage('vtt-tokens', [])
  );
  const [combatOrder, setCombatOrder] = useState(() => 
    loadFromStorage('vtt-combat-order', [])
  );
  const [isInCombat, setIsInCombat] = useState(() => 
    loadFromStorage('vtt-in-combat', false)
  );
  const [currentTurn, setCurrentTurn] = useState(() => 
    loadFromStorage('vtt-current-turn', 0)
  );
  const [round, setRound] = useState(() => 
    loadFromStorage('vtt-round', 1)
  );
  const [chatMessages, setChatMessages] = useState(() => 
    loadFromStorage('vtt-chat-messages', [
      { id: Date.now(), type: 'system', content: 'Welcome to Virtual Tabletop!', timestamp: Date.now() }
    ])
  );
  const [notes, setNotes] = useState(() => 
    loadFromStorage('vtt-notes', [])
  );
  const [diceRoll, setDiceRoll] = useState(null);

  // Auto-save to localStorage when state changes
  useEffect(() => saveToStorage('vtt-tokens', tokens), [tokens]);
  useEffect(() => saveToStorage('vtt-combat-order', combatOrder), [combatOrder]);
  useEffect(() => saveToStorage('vtt-in-combat', isInCombat), [isInCombat]);
  useEffect(() => saveToStorage('vtt-current-turn', currentTurn), [currentTurn]);
  useEffect(() => saveToStorage('vtt-round', round), [round]);
  useEffect(() => saveToStorage('vtt-chat-messages', chatMessages), [chatMessages]);
  useEffect(() => saveToStorage('vtt-notes', notes), [notes]);

  // Token Management
  const addToken = (tokenData) => {
    const newToken = {
      id: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: tokenData.name || 'New Token',
      x: tokenData.x || 100 + Math.random() * 300,
      y: tokenData.y || 100 + Math.random() * 300,
      hp: tokenData.hp || 30,
      maxHp: tokenData.maxHp || 30,
      ac: tokenData.ac || 15,
      initiative: tokenData.initiative || null,
      conditions: tokenData.conditions || [],
      color: tokenData.color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      type: tokenData.type || 'npc',
      ...tokenData
    };
    setTokens(prev => [...prev, newToken]);
    return newToken.id;
  };

  const updateToken = (tokenId, updates) => {
    setTokens(prev => prev.map(token => 
      token.id === tokenId ? { ...token, ...updates } : token
    ));
    
    // Update combat order if token is in combat
    if (combatOrder.find(c => c.id === tokenId)) {
      setCombatOrder(prev => prev.map(combatant =>
        combatant.id === tokenId ? { ...combatant, ...updates } : combatant
      ));
    }
  };

  const deleteToken = (tokenId) => {
    setTokens(prev => prev.filter(token => token.id !== tokenId));
    setCombatOrder(prev => prev.filter(combatant => combatant.id !== tokenId));
    if (selectedToken === tokenId) {
      setSelectedToken(null);
    }
  };

  // Combat Management
  const addToCombat = (tokenId) => {
    const token = tokens.find(t => t.id === tokenId);
    if (token && !combatOrder.find(c => c.id === tokenId)) {
      const newCombatant = {
        id: token.id,
        name: token.name,
        initiative: token.initiative || 10,
        hp: token.hp,
        maxHp: token.maxHp,
        ac: token.ac
      };
      setCombatOrder(prev => [...prev, newCombatant].sort((a, b) => b.initiative - a.initiative));
    }
  };

  const removeFromCombat = (tokenId) => {
    setCombatOrder(prev => prev.filter(combatant => combatant.id !== tokenId));
  };

  const rollInitiative = (tokenId) => {
    const initiative = Math.floor(Math.random() * 20) + 1;
    updateToken(tokenId, { initiative });
    
    // Update combat order and sort
    setCombatOrder(prev => {
      const updated = prev.map(combatant =>
        combatant.id === tokenId ? { ...combatant, initiative } : combatant
      );
      return updated.sort((a, b) => b.initiative - a.initiative);
    });
    
    // Add to chat
    const token = tokens.find(t => t.id === tokenId);
    addChatMessage({
      type: 'dice',
      content: `${token?.name} rolled initiative: ${initiative}`,
      timestamp: Date.now()
    });
    
    return initiative;
  };

  const toggleCombat = () => {
    setIsInCombat(!isInCombat);
    if (!isInCombat) {
      // Starting combat
      addChatMessage({
        type: 'system',
        content: 'Combat started! Roll for initiative.',
        timestamp: Date.now()
      });
    } else {
      // Ending combat
      addChatMessage({
        type: 'system',
        content: 'Combat ended.',
        timestamp: Date.now()
      });
      setCurrentTurn(0);
      setRound(1);
    }
  };

  const nextTurn = () => {
    const newTurn = (currentTurn + 1) % combatOrder.length;
    setCurrentTurn(newTurn);
    
    if (newTurn === 0) {
      setRound(prev => prev + 1);
    }
    
    addChatMessage({
      type: 'system',
      content: `${combatOrder[newTurn]?.name}'s turn! (Round ${newTurn === 0 ? round + 1 : round})`,
      timestamp: Date.now()
    });
  };

  // Dice Rolling
  const rollDice = (sides, modifier = 0, description = '') => {
    const result = Math.floor(Math.random() * sides) + 1;
    const total = result + modifier;
    
    setDiceRoll({ sides, result: total, timestamp: Date.now() });
    setTimeout(() => setDiceRoll(null), 3000);
    
    addChatMessage({
      type: 'dice',
      content: `${description || `d${sides}`}${modifier ? ` + ${modifier}` : ''}: [${result}]${modifier ? ` + ${modifier} = ${total}` : ''}`,
      timestamp: Date.now()
    });
    
    return total;
  };

  // Chat Management
  const addChatMessage = (message) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      ...message
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  // Notes Management
  const addNote = (noteText) => {
    const newNote = {
      id: Date.now(),
      text: noteText,
      timestamp: Date.now(),
      author: isDMMode ? 'DM' : 'Player'
    };
    setNotes(prev => [...prev, newNote]);
  };

  const deleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const updateNote = (noteId, newText) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, text: newText, edited: Date.now() } : note
    ));
  };

  // Clear All Data
  const clearAllData = () => {
    setTokens([]);
    setCombatOrder([]);
    setIsInCombat(false);
    setCurrentTurn(0);
    setRound(1);
    setChatMessages([]);
    setNotes([]);
    setSelectedToken(null);
    
    // Clear localStorage
    ['vtt-tokens', 'vtt-combat-order', 'vtt-in-combat', 'vtt-current-turn', 
     'vtt-round', 'vtt-chat-messages', 'vtt-notes'].forEach(key => {
      localStorage.removeItem(key);
    });
  };

  const contextValue = {
    // UI State
    activeTab, setActiveTab,
    isDMMode, setIsDMMode,
    activeTool, setActiveTool,
    showGrid, setShowGrid,
    zoom, setZoom,
    selectedToken, setSelectedToken,
    draggedToken, setDraggedToken,
    diceRoll, setDiceRoll,

    // Game State
    tokens, setTokens,
    combatOrder, setCombatOrder,
    isInCombat, setIsInCombat,
    currentTurn, setCurrentTurn,
    round, setRound,
    chatMessages, setChatMessages,
    notes, setNotes,

    // Actions
    addToken,
    updateToken,
    deleteToken,
    addToCombat,
    removeFromCombat,
    rollInitiative,
    toggleCombat,
    nextTurn,
    rollDice,
    addChatMessage,
    clearChat,
    addNote,
    deleteNote,
    updateNote,
    clearAllData
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};