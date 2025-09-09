// components/TokenPanel.js - Dynamic Token Creation System
import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Plus, 
  Users, 
  Sword, 
  Shield, 
  Star,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const TokenPanel = () => {
  const { 
    tokens, 
    addToken, 
    deleteToken, 
    updateToken, 
    isDMMode, 
    setSelectedToken 
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const fileInputRef = useRef(null);

  // Token creation form state
  const [newToken, setNewToken] = useState({
    name: '',
    type: 'pc',
    hp: 30,
    maxHp: 30,
    ac: 15,
    color: '#3498db'
  });

  const tokenCategories = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'pc', label: 'PCs', icon: Users },
    { id: 'npc', label: 'NPCs', icon: Star },
    { id: 'monster', label: 'Monsters', icon: Sword },
    { id: 'object', label: 'Objects', icon: Shield }
  ];

  const presetTokens = [
    { name: 'Human Fighter', type: 'pc', hp: 40, maxHp: 40, ac: 18, color: '#e74c3c' },
    { name: 'Elf Wizard', type: 'pc', hp: 25, maxHp: 25, ac: 12, color: '#9b59b6' },
    { name: 'Dwarf Cleric', type: 'pc', hp: 35, maxHp: 35, ac: 16, color: '#f39c12' },
    { name: 'Halfling Rogue', type: 'pc', hp: 30, maxHp: 30, ac: 14, color: '#27ae60' },
    { name: 'Dragonborn Paladin', type: 'pc', hp: 45, maxHp: 45, ac: 19, color: '#3498db' },
    { name: 'Tiefling Warlock', type: 'pc', hp: 28, maxHp: 28, ac: 13, color: '#8e44ad' },
    
    { name: 'Town Guard', type: 'npc', hp: 20, maxHp: 20, ac: 16, color: '#34495e' },
    { name: 'Merchant', type: 'npc', hp: 15, maxHp: 15, ac: 12, color: '#f39c12' },
    { name: 'Noble', type: 'npc', hp: 18, maxHp: 18, ac: 15, color: '#9b59b6' },
    { name: 'Innkeeper', type: 'npc', hp: 22, maxHp: 22, ac: 11, color: '#e67e22' },
    
    { name: 'Goblin', type: 'monster', hp: 7, maxHp: 7, ac: 15, color: '#27ae60' },
    { name: 'Orc', type: 'monster', hp: 15, maxHp: 15, ac: 13, color: '#e74c3c' },
    { name: 'Skeleton', type: 'monster', hp: 13, maxHp: 13, ac: 13, color: '#95a5a6' },
    { name: 'Wolf', type: 'monster', hp: 11, maxHp: 11, ac: 13, color: '#7f8c8d' },
    { name: 'Dragon', type: 'monster', hp: 200, maxHp: 200, ac: 19, color: '#c0392b' },
    { name: 'Troll', type: 'monster', hp: 84, maxHp: 84, ac: 15, color: '#16a085' },
    
    { name: 'Barrel', type: 'object', hp: 10, maxHp: 10, ac: 15, color: '#8b4513' },
    { name: 'Chest', type: 'object', hp: 25, maxHp: 25, ac: 17, color: '#cd853f' },
    { name: 'Door', type: 'object', hp: 30, maxHp: 30, ac: 15, color: '#a0522d' },
    { name: 'Statue', type: 'object', hp: 50, maxHp: 50, ac: 17, color: '#708090' }
  ];

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || token.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredPresets = presetTokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || token.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const createToken = (tokenData) => {
    const tokenId = addToken({
      ...tokenData,
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300
    });
    setSelectedToken(tokenId);
  };

  const handleCreateToken = (e) => {
    e.preventDefault();
    if (!newToken.name.trim()) return;

    createToken(newToken);
    
    // Reset form
    setNewToken({
      name: '',
      type: 'pc',
      hp: 30,
      maxHp: 30,
      ac: 15,
      color: '#3498db'
    });
    setShowCreateForm(false);
  };

  const duplicateToken = (token) => {
    createToken({
      ...token,
      name: `${token.name} (Copy)`
    });
  };

  const toggleTokenVisibility = (tokenId) => {
    const token = tokens.find(t => t.id === tokenId);
    if (token) {
      updateToken(tokenId, { hidden: !token.hidden });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, just show an alert. In a real implementation,
      // you would upload the image and create a token with it
      alert(`Image upload functionality coming soon! Selected: ${file.name}`);
      fileInputRef.current.value = '';
    }
  };

  const CreateTokenForm = () => (
    <div className="create-token-form">
      <h4>Create New Token</h4>
      <form onSubmit={handleCreateToken}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Token name"
            value={newToken.name}
            onChange={(e) => setNewToken(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div className="form-row">
          <select
            value={newToken.type}
            onChange={(e) => setNewToken(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="pc">Player Character</option>
            <option value="npc">NPC</option>
            <option value="monster">Monster</option>
            <option value="object">Object</option>
          </select>
          
          <input
            type="color"
            value={newToken.color}
            onChange={(e) => setNewToken(prev => ({ ...prev, color: e.target.value }))}
            title="Token color"
          />
        </div>
        
        <div className="form-row">
          <input
            type="number"
            placeholder="HP"
            value={newToken.hp}
            onChange={(e) => {
              const hp = parseInt(e.target.value) || 0;
              setNewToken(prev => ({ 
                ...prev, 
                hp, 
                maxHp: Math.max(hp, prev.maxHp) 
              }));
            }}
            min="1"
          />
          
          <input
            type="number"
            placeholder="Max HP"
            value={newToken.maxHp}
            onChange={(e) => {
              const maxHp = parseInt(e.target.value) || 1;
              setNewToken(prev => ({ 
                ...prev, 
                maxHp,
                hp: Math.min(prev.hp, maxHp)
              }));
            }}
            min="1"
          />
          
          <input
            type="number"
            placeholder="AC"
            value={newToken.ac}
            onChange={(e) => setNewToken(prev => ({ ...prev, ac: parseInt(e.target.value) || 10 }))}
            min="1"
            max="30"
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <Plus size={14} />
            Create Token
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => setShowCreateForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const TokenItem = ({ token, isExisting = false }) => (
    <div className="token-item">
      <div 
        className="token-preview" 
        style={{ backgroundColor: token.color }}
        onClick={() => isExisting ? setSelectedToken(token.id) : createToken(token)}
      >
        {token.name[0]?.toUpperCase()}
      </div>
      
      <div className="token-info">
        <span className="token-name">{token.name}</span>
        <div className="token-stats">
          <span className="hp">HP: {token.hp}/{token.maxHp}</span>
          <span className="ac">AC: {token.ac}</span>
        </div>
      </div>
      
      <div className="token-actions">
        {isExisting ? (
          <>
            {isDMMode && (
              <>
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTokenVisibility(token.id);
                  }}
                  title={token.hidden ? 'Show token' : 'Hide token'}
                >
                  {token.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateToken(token);
                  }}
                  title="Duplicate token"
                >
                  <Copy size={12} />
                </button>
                <button
                  className="action-btn danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${token.name}?`)) {
                      deleteToken(token.id);
                    }
                  }}
                  title="Delete token"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </>
        ) : (
          <button
            className="action-btn primary"
            onClick={(e) => {
              e.stopPropagation();
              createToken(token);
            }}
            title="Add to canvas"
          >
            <Plus size={12} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="panel-content">
      <div className="panel-header">
        <h3>Token Library</h3>
        <div className="header-actions">
          <button 
            className="btn-sm" 
            onClick={() => fileInputRef.current?.click()}
            title="Upload token image"
          >
            <Upload size={14} />
          </button>
          <button 
            className="btn-sm" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            title="Create custom token"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* Create Token Form */}
      {showCreateForm && <CreateTokenForm />}

      {/* Search */}
      <div className="search-box">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="token-categories">
        {tokenCategories.map(category => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              className={`category ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
              title={category.label}
            >
              <IconComponent size={12} />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Existing Tokens on Canvas */}
      {filteredTokens.length > 0 && (
        <div className="token-section">
          <h4>On Canvas ({filteredTokens.length})</h4>
          <div className="token-grid">
            {filteredTokens.map(token => (
              <TokenItem key={token.id} token={token} isExisting={true} />
            ))}
          </div>
        </div>
      )}

      {/* Preset Token Library */}
      <div className="token-section">
        <h4>Token Library</h4>
        <div className="token-grid">
          {filteredPresets.map((token, index) => (
            <TokenItem key={index} token={token} isExisting={false} />
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="help-section">
        <h5>💡 Quick Tips:</h5>
        <ul>
          <li>Click any preset token to add it to the canvas</li>
          <li>Use the <Plus size={12} style={{display: 'inline'}} /> button to create custom tokens</li>
          <li>Upload images for custom token avatars</li>
          <li>Select tokens on canvas to view/edit details</li>
        </ul>
      </div>
    </div>
  );
};

export default TokenPanel;