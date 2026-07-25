import React from 'react';

export default function TagFilter({ tags, activeTag, onChange }) {
  return (
    <div className="tag-filter-row">
      <button className={`filter-pill ${!activeTag ? 'active' : ''}`} onClick={() => onChange(null)}>
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={`filter-pill ${activeTag === tag ? 'active' : ''}`}
          onClick={() => onChange(tag)}
        >
          #{tag}
        </button>
      ))}
      <button
        className={`filter-pill ${activeTag === '__none__' ? 'active' : ''}`}
        onClick={() => onChange('__none__')}
      >
        No tag
      </button>
    </div>
  );
}
