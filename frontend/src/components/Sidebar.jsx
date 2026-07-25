import React, { useState } from 'react';

export default function Sidebar({ lists, activeListId, onSelect, onCreate, user, onLogout }) {
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    await onCreate(newName.trim());
    setNewName('');
    setCreating(false);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand-mark">Ledger</div>
        <div className="user-chip" title={user?.email}>
          {user?.name}
        </div>
      </div>

      <div className="sidebar-label">My Lists</div>
      <nav className="list-nav">
        {lists.map((list) => (
          <button
            key={list._id}
            className={`list-nav-item ${list._id === activeListId ? 'active' : ''}`}
            onClick={() => onSelect(list._id)}
          >
            <span className="list-nav-name">{list.name}</span>
            <span className="list-nav-count">{list.stats?.pending ?? 0}</span>
          </button>
        ))}
        {lists.length === 0 && <div className="empty-hint">No lists yet</div>}
      </nav>

      <form onSubmit={handleCreate} className="new-list-form">
        <input
          type="text"
          placeholder="New list name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="btn btn-ghost" disabled={creating}>
          + New List
        </button>
      </form>

      <button className="btn btn-text logout-btn" onClick={onLogout}>
        Log out
      </button>
    </aside>
  );
}
