// components/NotesPanel.js - Campaign Notes Management System
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Search,
  Book,
  Calendar,
  MapPin,
  Users,
  Scroll,
  Star,
  Archive,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const NotesPanel = () => {
  const {
    notes,
    addNote,
    deleteNote,
    updateNote,
    isDMMode
  } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ text: '', category: 'general', isPrivate: false });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const textareaRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All Notes', icon: Book },
    { id: 'general', label: 'General', icon: Scroll },
    { id: 'session', label: 'Session', icon: Calendar },
    { id: 'location', label: 'Locations', icon: MapPin },
    { id: 'npc', label: 'NPCs', icon: Users },
    { id: 'plot', label: 'Plot', icon: Star },
    { id: 'rules', label: 'Rules', icon: Archive }
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newNote.text, editingNote]);

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      const canView = isDMMode || !note.isPrivate;
      return matchesSearch && matchesCategory && canView;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return b.timestamp - a.timestamp;
      }
    });

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newNote.text.trim()) return;

    addNote({
      text: newNote.text.trim(),
      category: newNote.category,
      isPrivate: newNote.isPrivate && isDMMode
    });

    setNewNote({ text: '', category: 'general', isPrivate: false });
    setShowCreateForm(false);
  };

  const startEditing = (note) => {
    setEditingNote({
      id: note.id,
      text: note.text,
      category: note.category,
      isPrivate: note.isPrivate
    });
  };

  const saveEdit = () => {
    if (editingNote && editingNote.text.trim()) {
      updateNote(editingNote.id, editingNote.text.trim());
      setEditingNote(null);
    }
  };

  const cancelEdit = () => {
    setEditingNote(null);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: '#95a5a6',
      session: '#3498db',
      location: '#27ae60',
      npc: '#e67e22',
      plot: '#9b59b6',
      rules: '#34495e'
    };
    return colors[category] || '#95a5a6';
  };

  const CreateNoteForm = () => (
    <div className="create-note-form">
      <form onSubmit={handleCreateNote}>
        <div className="form-row">
          <select
            value={newNote.category}
            onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
          >
            {categories.filter(cat => cat.id !== 'all').map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
          
          {isDMMode && (
            <label className="private-checkbox">
              <input
                type="checkbox"
                checked={newNote.isPrivate}
                onChange={(e) => setNewNote(prev => ({ ...prev, isPrivate: e.target.checked }))}
              />
              <Eye size={14} />
              Private
            </label>
          )}
        </div>
        
        <textarea
          ref={textareaRef}
          value={newNote.text}
          onChange={(e) => setNewNote(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Write your note here..."
          required
          maxLength="2000"
          rows="3"
        />
        
        <div className="form-footer">
          <div className="char-counter">
            {newNote.text.length}/2000
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <Save size={14} />
              Save Note
            </button>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setShowCreateForm(false)}
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const NoteItem = ({ note }) => {
    const IconComponent = categories.find(cat => cat.id === note.category)?.icon || Book;
    const isEditing = editingNote && editingNote.id === note.id;

    return (
      <div className={`note-item ${isEditing ? 'editing' : ''}`}>
        <div className="note-header">
          <div className="note-meta">
            <div 
              className="category-badge" 
              style={{ backgroundColor: getCategoryColor(note.category) }}
            >
              <IconComponent size={12} />
              {categories.find(cat => cat.id === note.category)?.label}
            </div>
            
            {note.isPrivate && isDMMode && (
              <div className="private-badge" title="DM Only">
                <EyeOff size={12} />
                Private
              </div>
            )}
            
            <div className="timestamp">
              {formatTimestamp(note.timestamp)}
              {note.edited && (
                <span className="edited-indicator" title="Edited">
                  • edited {formatTimestamp(note.edited)}
                </span>
              )}
            </div>
          </div>
          
          <div className="note-actions">
            {isDMMode && !isEditing && (
              <>
                <button
                  className="action-btn"
                  onClick={() => startEditing(note)}
                  title="Edit note"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  className="action-btn danger"
                  onClick={() => {
                    if (window.confirm('Delete this note?')) {
                      deleteNote(note.id);
                    }
                  }}
                  title="Delete note"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
            
            {isEditing && (
              <>
                <button
                  className="action-btn success"
                  onClick={saveEdit}
                  title="Save changes"
                >
                  <Save size={12} />
                </button>
                <button
                  className="action-btn"
                  onClick={cancelEdit}
                  title="Cancel editing"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="note-content">
          {isEditing ? (
            <textarea
              value={editingNote.text}
              onChange={(e) => setEditingNote(prev => ({ ...prev, text: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancelEdit();
                if (e.key === 'Enter' && e.ctrlKey) saveEdit();
              }}
              maxLength="2000"
              rows="4"
              autoFocus
            />
          ) : (
            <div className="note-text">
              {note.text.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < note.text.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        
        {isEditing && (
          <div className="edit-footer">
            <div className="char-counter">
              {editingNote.text.length}/2000
            </div>
            <div className="edit-hint">
              Ctrl+Enter to save, Escape to cancel
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="panel-content notes-panel">
      <div className="panel-header">
        <h3>Campaign Notes</h3>
        <div className="header-actions">
          <button 
            className="btn-sm" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            title="Create new note"
          >
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      {/* Create Note Form */}
      {showCreateForm && <CreateNoteForm />}

      {/* Search and Filters */}
      <div className="notes-controls">
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(cat => {
              const IconComponent = cat.icon;
              return (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              );
            })}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">A-Z</option>
            <option value="category">By Category</option>
          </select>
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-tabs">
        {categories.map(category => {
          const IconComponent = category.icon;
          const count = category.id === 'all' 
            ? notes.filter(note => isDMMode || !note.isPrivate).length
            : notes.filter(note => 
                note.category === category.id && (isDMMode || !note.isPrivate)
              ).length;
          
          return (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              title={category.label}
            >
              <IconComponent size={14} />
              <span>{category.label}</span>
              <span className="count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Notes List */}
      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="empty-notes">
            {searchTerm ? (
              <div>
                <Search size={32} />
                <h4>No notes found</h4>
                <p>Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div>
                <Book size={32} />
                <h4>No notes yet</h4>
                <p>Create your first campaign note to get started!</p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus size={14} />
                  Create Note
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="notes-summary">
              Showing {filteredNotes.length} of {notes.filter(note => isDMMode || !note.isPrivate).length} notes
            </div>
            {filteredNotes.map(note => (
              <NoteItem key={note.id} note={note} />
            ))}
          </>
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h5>💡 Tips:</h5>
        <ul>
          <li>Use categories to organize your notes</li>
          <li>Private notes are only visible to the DM</li>
          <li>Click edit to modify existing notes</li>
          <li>Use search to quickly find specific information</li>
        </ul>
      </div>
    </div>
  );
};

export default NotesPanel;