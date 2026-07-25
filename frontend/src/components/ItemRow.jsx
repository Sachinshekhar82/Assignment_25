import React, { useState } from 'react';

export default function ItemRow({
  item,
  onToggle,
  onRename,
  onDelete,
  onTagsChange,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [tagInput, setTagInput] = useState('');

  function saveTitle() {
    setEditing(false);
    if (title.trim() && title.trim() !== item.title) {
      onRename(item._id, title.trim());
    } else {
      setTitle(item.title);
    }
  }

  function addTag(e) {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (!item.tags.includes(tag)) {
      onTagsChange(item._id, [...item.tags, tag]);
    }
    setTagInput('');
  }

  function removeTag(tag) {
    onTagsChange(
      item._id,
      item.tags.filter((t) => t !== tag)
    );
  }

  return (
    <div className={`item-row ${item.completed ? 'completed' : ''}`}>
      <div className="move-controls">
        <button
          className="move-btn"
          onClick={() => onMoveUp(item._id)}
          disabled={isFirst}
          aria-label="Move up"
        >
          ▲
        </button>
        <button
          className="move-btn"
          onClick={() => onMoveDown(item._id)}
          disabled={isLast}
          aria-label="Move down"
        >
          ▼
        </button>
      </div>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={() => onToggle(item._id, !item.completed)}
        className="item-checkbox"
      />

      <div className="item-body">
        {editing ? (
          <input
            className="item-title-input"
            value={title}
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
          />
        ) : (
          <span className="item-title" onClick={() => setEditing(true)}>
            {item.title}
          </span>
        )}

        <div className="tag-row">
          {item.tags.map((tag) => (
            <span key={tag} className={`tag-chip tag-${tag.replace(/\s+/g, '-')}`}>
              #{tag}
              <button className="tag-remove" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                ×
              </button>
            </span>
          ))}
          <form onSubmit={addTag} className="tag-add-form">
            <input
              placeholder="+ tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </form>
        </div>
      </div>

      <button className="item-delete" onClick={() => onDelete(item._id)} aria-label="Delete item">
        Delete
      </button>
    </div>
  );
}
