import React from 'react';
import './Input.css';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  disabled = false,
  error = '',
  className = '',
  id,
  ...rest
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-field ${error ? 'input-field--error' : ''}`}
        {...rest}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;
