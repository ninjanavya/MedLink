import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const getStyles = () => {
    let bg = 'var(--primary)';
    let color = '#FFFFFF';
    let border = '1px solid transparent';

    switch (variant) {
      case 'secondary':
        bg = 'var(--secondary)';
        break;
      case 'success':
        bg = 'var(--success)';
        break;
      case 'danger':
        bg = 'var(--danger)';
        break;
      case 'warning':
        bg = 'var(--warning)';
        break;
      case 'outline':
        bg = 'transparent';
        color = 'var(--text-main)';
        border = '1px solid var(--border)';
        break;
      case 'text':
        bg = 'transparent';
        color = 'var(--primary)';
        break;
    }

    const sizePadding = size === 'sm' ? '8px 16px' : (size === 'lg' ? '14px 28px' : '10px 20px');
    const fontSize = size === 'sm' ? '13px' : (size === 'lg' ? '16px' : '14px');

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: sizePadding,
      fontSize,
      fontWeight: '600',
      backgroundColor: bg,
      color,
      border,
      borderRadius: 'var(--radius-btn)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled || loading ? 0.6 : 1,
      gap: '8px',
      boxShadow: variant === 'outline' || variant === 'text' ? 'none' : 'var(--shadow-sm)',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      transition: 'all var(--transition-fast)'
    };
  };

  return (
    <button
      className={`ripple btn-${variant} ${className}`}
      style={getStyles()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          Loading...
        </>
      ) : children}
    </button>
  );
};

export default Button;
