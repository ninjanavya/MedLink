import React from 'react';

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  error,
  required = false,
  children
}) => {
  return (
    <div style={{ marginBottom: '20px', width: '100%' }}>
      <label 
        htmlFor={id} 
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-main)',
          marginBottom: '6px'
        }}
      >
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      
      <div style={{ position: 'relative' }}>
        {children}
      </div>
      
      {error && (
        <span 
          style={{
            display: 'block',
            fontSize: '12px',
            color: 'var(--danger)',
            marginTop: '4px',
            fontWeight: '500'
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};
