import React from 'react';

export default function StatsPanel({ stats, shareUrl, isPublic, onGenerateShare, onRevokeShare }) {
  if (!stats) return null;

  const tagEntries = Object.entries(stats.tagCounts || {});

  return (
    <aside className="stats-panel">
      <div className="sidebar-label">List Statistics</div>

      <div className="stat-row">
        <span>Total Tasks</span>
        <strong>{stats.total}</strong>
      </div>
      <div className="stat-row">
        <span>Pending</span>
        <strong>{stats.pending}</strong>
      </div>
      <div className="stat-row">
        <span>Completed</span>
        <strong>{stats.completed}</strong>
      </div>

      <div className="stat-divider" />

      {tagEntries.map(([tag, count]) => (
        <div className="stat-row muted-row" key={tag}>
          <span>#{tag}</span>
          <strong>{count}</strong>
        </div>
      ))}
      <div className="stat-row muted-row">
        <span>No Tag</span>
        <strong>{stats.noTag}</strong>
      </div>

      <div className="stat-divider" />

      <div className="sidebar-label">Public Access</div>
      {isPublic && shareUrl ? (
        <>
          <div className="public-badge">● Publicly shared</div>
          <div className="share-link-box">{shareUrl}</div>
          <button
            className="btn btn-ghost"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
          >
            Copy Public Link
          </button>
          <button className="btn btn-text danger-text" onClick={onRevokeShare}>
            Revoke Access
          </button>
        </>
      ) : (
        <button className="btn btn-ghost" onClick={onGenerateShare}>
          Generate Public Link
        </button>
      )}
    </aside>
  );
}
