// components/ChatPanel.js - Chat System with Dice Rolling
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Dice6, 
  Trash2, 
  Settings,
  Volume2,
  VolumeX,
  User,
  Crown,
  MessageSquare
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ChatPanel = () => {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    rollDice,
    isDMMode,
    tokens
  } = useAppContext();

  const [message, setMessage] = useState('');
  const [showDiceHelper, setShowDiceHelper] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Focus input when panel is active
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    const trimmedMessage = message.trim();

    // Check for dice roll commands
    const dicePatterns = [
      /^\/roll (\d+)d(\d+)(?:\+(\d+))?(?:\s+(.+))?$/i,  // /roll 2d6+3 damage
      /^\/r (\d+)d(\d+)(?:\+(\d+))?(?:\s+(.+))?$/i,     // /r 1d20+5 attack
      /^(\d+)d(\d+)(?:\+(\d+))?(?:\s+(.+))?$/i          // 1d20 initiative
    ];

    let diceMatch = null;
    for (const pattern of dicePatterns) {
      diceMatch = trimmedMessage.match(pattern);
      if (diceMatch) break;
    }

    if (diceMatch) {
      const count = parseInt(diceMatch[1]) || 1;
      const sides = parseInt(diceMatch[2]) || 6;
      const modifier = parseInt(diceMatch[3]) || 0;
      const description = diceMatch[4] || '';

      // Validate dice roll
      if (count > 20) {
        addChatMessage({
          type: 'system',
          content: 'Maximum 20 dice per roll.',
          timestamp: Date.now()
        });
        return;
      }

      if (sides < 2 || sides > 100) {
        addChatMessage({
          type: 'system',
          content: 'Dice sides must be between 2 and 100.',
          timestamp: Date.now()
        });
        return;
      }

      // Roll multiple dice
      let results = [];
      let total = 0;
      for (let i = 0; i < count; i++) {
        const result = Math.floor(Math.random() * sides) + 1;
        results.push(result);
        total += result;
      }

      const finalTotal = total + modifier;
      const rollDescription = description ? ` (${description})` : '';
      
      let resultText;
      if (count === 1) {
        resultText = `d${sides}${modifier ? `+${modifier}` : ''}: [${results[0]}]${modifier ? `+${modifier} = ${finalTotal}` : ''}${rollDescription}`;
      } else {
        resultText = `${count}d${sides}${modifier ? `+${modifier}` : ''}: [${results.join(', ')}] = ${total}${modifier ? `+${modifier} = ${finalTotal}` : ''}${rollDescription}`;
      }

      addChatMessage({
        type: 'dice',
        sender: isDMMode ? 'DM' : 'Player',
        content: resultText,
        roll: {
          count,
          sides,
          modifier,
          results,
          total: finalTotal,
          description
        },
        timestamp: Date.now()
      });

      // Play sound effect if enabled
      if (soundEnabled) {
        playDiceSound();
      }
    } else {
      // Regular message
      addChatMessage({
        type: isDMMode ? 'dm' : 'player',
        sender: isDMMode ? 'DM' : 'Player',
        content: trimmedMessage,
        timestamp: Date.now()
      });
    }

    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const playDiceSound = () => {
    // Create a simple dice roll sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Sound failed, ignore silently
    }
  };

  const quickRoll = (diceType, modifier = 0, description = '') => {
    const sides = parseInt(diceType.replace('d', ''));
    rollDice(sides, modifier, description);
    
    if (soundEnabled) {
      playDiceSound();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const MessageComponent = ({ msg }) => {
    const getMessageIcon = () => {
      switch (msg.type) {
        case 'dm':
          return <Crown size={14} className="message-icon dm-icon" />;
        case 'player':
          return <User size={14} className="message-icon player-icon" />;
        case 'dice':
          return <Dice6 size={14} className="message-icon dice-icon" />;
        case 'system':
          return <MessageSquare size={14} className="message-icon system-icon" />;
        default:
          return null;
      }
    };

    return (
      <div className={`message ${msg.type}`}>
        <div className="message-header">
          {getMessageIcon()}
          {msg.sender && <span className="sender">{msg.sender}</span>}
          <span className="timestamp">{formatTimestamp(msg.timestamp)}</span>
        </div>
        <div className="message-content">
          {msg.content}
          {msg.roll && msg.roll.total >= msg.roll.sides * msg.roll.count + msg.roll.modifier && (
            <span className="crit-success"> 🎉</span>
          )}
        </div>
      </div>
    );
  };

  const DiceHelper = () => (
    <div className="dice-helper">
      <h4>🎲 Dice Commands</h4>
      <div className="dice-examples">
        <div className="example-group">
          <h5>Basic Rolls:</h5>
          <ul>
            <li><code>/roll 1d20</code> - Roll a d20</li>
            <li><code>/roll 2d6+3</code> - Roll 2d6 with +3 modifier</li>
            <li><code>1d8+2</code> - Shorthand (no /roll needed)</li>
          </ul>
        </div>
        <div className="example-group">
          <h5>With Description:</h5>
          <ul>
            <li><code>/roll 1d20+5 attack</code></li>
            <li><code>2d6+3 damage</code></li>
            <li><code>/r 1d20 initiative</code></li>
          </ul>
        </div>
      </div>
      <div className="quick-dice">
        <h5>Quick Rolls:</h5>
        <div className="dice-buttons">
          {['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'].map(dice => (
            <button
              key={dice}
              className="dice-btn"
              onClick={() => quickRoll(dice)}
              title={`Roll a ${dice}`}
            >
              {dice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="panel-content chat-panel">
      <div className="panel-header">
        <h3>Chat</h3>
        <div className="chat-controls">
          <button
            className={`control-btn ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Disable dice sounds' : 'Enable dice sounds'}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button
            className={`control-btn ${showDiceHelper ? 'active' : ''}`}
            onClick={() => setShowDiceHelper(!showDiceHelper)}
            title="Show dice helper"
          >
            <Dice6 size={14} />
          </button>
          <button
            className="control-btn danger"
            onClick={() => {
              if (window.confirm('Clear all chat messages?')) {
                clearChat();
              }
            }}
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Dice Helper Panel */}
      {showDiceHelper && <DiceHelper />}

      {/* Messages */}
      <div className="chat-messages">
        {chatMessages.length === 0 ? (
          <div className="empty-chat">
            <div className="welcome-message">
              <Dice6 size={32} />
              <h4>Welcome to Chat!</h4>
              <p>Send messages to your party or roll dice with commands like:</p>
              <ul>
                <li><code>/roll 1d20+5</code></li>
                <li><code>2d6+3 damage</code></li>
                <li><code>/r 1d4</code></li>
              </ul>
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <MessageComponent key={msg.id || msg.timestamp} msg={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message or dice command (/roll 1d20)..."
            rows="1"
            maxLength="500"
          />
          <button 
            onClick={sendMessage}
            disabled={!message.trim()}
            className="send-btn"
            title="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        
        {/* Character Counter */}
        <div className="input-footer">
          <span className={`char-counter ${message.length > 400 ? 'warning' : ''}`}>
            {message.length}/500
          </span>
          <span className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="connection-status">
        <div className="status-indicator online" title="Connected to local session">
          <div className="status-dot"></div>
          <span>Local Session</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;