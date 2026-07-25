import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function PublicList() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/public/${token}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'This list could not be found'));
  }, [token]);

  if (error) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand-mark">To-do</div>
          <p className="form-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="auth-shell">
        <div className="empty-hint">Loading…</div>
      </div>
    );
  }

  const { list, items } = data;
  const completed = items.filter((i) => i.completed).length;

  return (
    <div className="public-shell">
      <div className="public-card">
        <div className="public-badge">● Publicly shared list</div>
        <h1>{list.name}</h1>
        <p className="muted">
          Shared by {list.owner?.name || 'a Ledger user'} · {completed}/{items.length} complete
        </p>

        <div className="item-list read-only">
          {items.map((item) => (
            <div key={item._id} className={`item-row static ${item.completed ? 'completed' : ''}`}>
              <span className="static-check">{item.completed ? '✓' : '○'}</span>
              <div className="item-body">
                <span className="item-title">{item.title}</span>
                <div className="tag-row">
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="empty-hint">This list has no tasks yet.</div>}
        </div>
      </div>
    </div>
  );
}
