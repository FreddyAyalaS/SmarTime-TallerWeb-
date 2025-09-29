
import React from 'react';


const Input = ({ label, type = 'text', name, value, onChange, placeholder, error, required = false, className = '' }) => {
  const inputId = name || label?.toLowerCase().replace(/\s+/g, '-') || `input-${Math.random().toString(36).substring(7)}`;


  const groupClasses = `input-group ${className}`; 

  const labelClasses = "input-label";
  const inputFieldClasses = `input-field ${error ? 'input-field-error' : ''}`;
  const errorMessageClasses = "input-error-message";
  const requiredIndicatorClasses = "input-required-indicator";


  return (
    <div className={groupClasses}>
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className={requiredIndicatorClasses}>*</span>}
        </label>
      )}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputFieldClasses}
        aria-invalid={error ? "true" : "false"}
      />
      {error && <p className={errorMessageClasses}>{error}</p>}
    </div>
  );
};

export default Input;