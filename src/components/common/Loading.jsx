import React from 'react';
import './Loading.css';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loading loading--${size}`}>
      <div className="loading-spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
