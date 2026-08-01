import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hyperspeed from '../components/Effects/Hyperspeed';
import './HistoryPage.css';

const TYPES = [
  { id: 'email', label: 'Mail Pitch', color: '#FF6B35' },
  { id: 'linkedin', label: 'LinkedIn Message', color: '#0077B5' },
  { id: 'coldCall', label: 'Cold Call Script', color: '#22C55E' },
  { id: 'adCopy', label: 'Advertising', color: '#A855F7' },
];

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem('pitchHistory') || '[]')
  );
  const [selectedItem, setSelectedItem] = useState(null);

  const removeItem = (id) => {
    const next = history.filter((item) => item.id !== id);
    setHistory(next);
    localStorage.setItem('pitchHistory', JSON.stringify(next));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem('pitchHistory');
    setSelectedItem(null);
  };

  return (
    <div className="hp-page">
      <div className="hp-bg">
        <Hyperspeed />
      </div>

      <nav className="hp-nav">
        <button className="hp-nav__back" onClick={() => navigate('/generator')}>
          ← Back to Generator
        </button>
        {history.length > 0 && (
          <button className="hp-nav__clear" onClick={clearAll}>
            🗑️ Clear All History
          </button>
        )}
      </nav>

      <div className="hp-content">
        <div className="hp-hero">
          <h1>📜 Pitch Generation History</h1>
          <p>Review, copy, or manage your previously generated pitches.</p>
        </div>

        {history.length === 0 ? (
          <div className="hp-empty">
            <p>No saved pitch history found.</p>
            <button onClick={() => navigate('/generator')} className="hp-btn">
              Generate New Pitch
            </button>
          </div>
        ) : (
          <div className="hp-grid">
            <div className="hp-list">
              {history.map((item) => {
                const t = TYPES.find((type) => type.id === item.type);
                return (
                  <div
                    key={item.id}
                    className={`hp-card ${selectedItem?.id === item.id ? 'hp-card--active' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="hp-card__head">
                      <span className="hp-card__type" style={{ color: t?.color || '#FF6B35' }}>
                        {t?.label || item.type}
                      </span>
                      <button
                        className="hp-card__del"
                        title="Remove item"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <h3 className="hp-card__title">{item.serviceName || 'Untitled Pitch'}</h3>
                    <span className="hp-card__time">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedItem && (
              <div className="hp-preview">
                <div className="hp-preview__head">
                  <h3>{selectedItem.serviceName}</h3>
                  <button className="hp-preview__close" onClick={() => setSelectedItem(null)}>
                    ✕
                  </button>
                </div>
                <div className="hp-preview__body">
                  <pre>{JSON.stringify(selectedItem.data, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
