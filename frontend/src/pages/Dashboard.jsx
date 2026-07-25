import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ItemRow from '../components/ItemRow.jsx';
import StatsPanel from '../components/StatsPanel.jsx';
import TagFilter from '../components/TagFilter.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [renamingList, setRenamingList] = useState(false);
  const [listNameDraft, setListNameDraft] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);

  const activeList = useMemo(
    () => lists.find((l) => l._id === activeListId) || null,
    [lists, activeListId]
  );

  const shareUrl = activeList?.shareToken
    ? `${window.location.origin}/share/${activeList.shareToken}`
    : null;

  const loadLists = useCallback(async () => {
    const res = await api.get('/lists');
    setLists(res.data.lists);
    if (!activeListId && res.data.lists.length > 0) {
      setActiveListId(res.data.lists[0]._id);
    }
  }, [activeListId]);

  useEffect(() => {
    loadLists();
  
  }, []);

  const loadItems = useCallback(async () => {
    if (!activeListId) {
      setItems([]);
      return;
    }
    setLoadingItems(true);
    try {
      const params = {};
      if (activeTag) params.tag = activeTag;
      const res = await api.get(`/lists/${activeListId}/items`, { params });
      setItems(res.data.items);
    } finally {
      setLoadingItems(false);
    }
  }, [activeListId, activeTag]);

  const loadStats = useCallback(async () => {
    if (!activeListId) {
      setStats(null);
      return;
    }
    const res = await api.get(`/lists/${activeListId}/stats`);
    setStats(res.data);
  }, [activeListId]);

  useEffect(() => {
    setActiveTag(null);
  }, [activeListId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  async function handleCreateList(name) {
    const res = await api.post('/lists', { name });
    setLists((prev) => [...prev, { ...res.data.list, stats: { total: 0, completed: 0, pending: 0 } }]);
    setActiveListId(res.data.list._id);
  }

  async function handleDeleteList() {
    if (!activeList) return;
    if (!confirm(`Delete "${activeList.name}" and all its tasks?`)) return;
    await api.delete(`/lists/${activeList._id}`);
    const remaining = lists.filter((l) => l._id !== activeList._id);
    setLists(remaining);
    setActiveListId(remaining[0]?._id || null);
  }

  async function handleRenameList() {
    if (!listNameDraft.trim() || listNameDraft.trim() === activeList.name) {
      setRenamingList(false);
      return;
    }
    const res = await api.patch(`/lists/${activeList._id}`, { name: listNameDraft.trim() });
    setLists((prev) => prev.map((l) => (l._id === activeList._id ? { ...l, name: res.data.list.name } : l)));
    setRenamingList(false);
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!newItemTitle.trim() || !activeListId) return;
    const res = await api.post(`/lists/${activeListId}/items`, { title: newItemTitle.trim() });
    setNewItemTitle('');
    if (!activeTag) setItems((prev) => [...prev, res.data.item]);
    else await loadItems();
    refreshListStats();
    loadStats();
  }

  async function refreshListStats() {
    const res = await api.get('/lists');
    setLists(res.data.lists);
  }

  async function handleToggle(itemId, completed) {
    setItems((prev) => prev.map((it) => (it._id === itemId ? { ...it, completed } : it)));
    await api.patch(`/lists/${activeListId}/items/${itemId}`, { completed });
    refreshListStats();
    loadStats();
  }

  async function handleRename(itemId, title) {
    setItems((prev) => prev.map((it) => (it._id === itemId ? { ...it, title } : it)));
    await api.patch(`/lists/${activeListId}/items/${itemId}`, { title });
  }

  async function handleTagsChange(itemId, tags) {
    setItems((prev) => prev.map((it) => (it._id === itemId ? { ...it, tags } : it)));
    await api.patch(`/lists/${activeListId}/items/${itemId}`, { tags });
    loadStats();
  }

  async function handleDeleteItem(itemId) {
    setItems((prev) => prev.filter((it) => it._id !== itemId));
    await api.delete(`/lists/${activeListId}/items/${itemId}`);
    refreshListStats();
    loadStats();
  }

  async function moveItem(itemId, direction) {
    const index = items.findIndex((it) => it._id === itemId);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    setItems(reordered);
    await api.post(`/lists/${activeListId}/items/reorder`, {
      orderedIds: reordered.map((it) => it._id),
    });
  }

  async function handleGenerateShare() {
    const res = await api.post(`/lists/${activeListId}/share`);
    setLists((prev) => prev.map((l) => (l._id === activeListId ? res.data.list : l)));
  }

  async function handleRevokeShare() {
    const res = await api.delete(`/lists/${activeListId}/share`);
    setLists((prev) => prev.map((l) => (l._id === activeListId ? res.data.list : l)));
  }

  const allTags = useMemo(() => {
    const set = new Set();
    items.forEach((it) => it.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [items]);

  return (
    <div className="app-shell">
      <Sidebar
        lists={lists}
        activeListId={activeListId}
        onSelect={setActiveListId}
        onCreate={handleCreateList}
        user={user}
        onLogout={logout}
      />

      <main className="main-panel">
        {activeList ? (
          <>
            <div className="main-header">
              {renamingList ? (
                <input
                  className="list-title-input"
                  autoFocus
                  value={listNameDraft}
                  onChange={(e) => setListNameDraft(e.target.value)}
                  onBlur={handleRenameList}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameList()}
                />
              ) : (
                <h1
                  onClick={() => {
                    setListNameDraft(activeList.name);
                    setRenamingList(true);
                  }}
                >
                  {activeList.name}
                  {activeList.isPublic && <span className="public-flag">Public</span>}
                </h1>
              )}
              <button className="btn btn-text danger-text" onClick={handleDeleteList}>
                Delete List
              </button>
            </div>

            <form onSubmit={handleAddItem} className="add-item-form">
              <input
                type="text"
                placeholder="Add a new task…"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                + New Task
              </button>
            </form>

            {allTags.length > 0 && (
              <TagFilter tags={allTags} activeTag={activeTag} onChange={setActiveTag} />
            )}

            <div className="item-list">
              {loadingItems && <div className="empty-hint">Loading…</div>}
              {!loadingItems && items.length === 0 && (
                <div className="empty-hint">No tasks yet. Add your first one above.</div>
              )}
              {items.map((item, index) => (
                <ItemRow
                  key={item._id}
                  item={item}
                  onToggle={handleToggle}
                  onRename={handleRename}
                  onDelete={handleDeleteItem}
                  onTagsChange={handleTagsChange}
                  onMoveUp={(id) => moveItem(id, 'up')}
                  onMoveDown={(id) => moveItem(id, 'down')}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-hint centered">Create a todo list to get started.</div>
        )}
      </main>

      {activeList && (
        <StatsPanel
          stats={stats}
          shareUrl={shareUrl}
          isPublic={activeList.isPublic}
          onGenerateShare={handleGenerateShare}
          onRevokeShare={handleRevokeShare}
        />
      )}
    </div>
  );
}
