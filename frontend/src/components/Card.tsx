import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverable = false,
  style = {}
}) => {
  const cardStyle: React.CSSProperties = {
    background: 'var(--card-bg)',
    borderRadius: 'var(--radius-card)',
    padding: '24px',
    boxShadow: 'var(--shadow-md)',
    border: '1px solid var(--border)',
    transition: 'all var(--transition-normal)',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  return (
    <div 
      style={cardStyle}
      onClick={onClick}
      className={`crm-card ${hoverable ? 'hoverable' : ''} ${className}`}
    >
      <style>{`
        .crm-card.hoverable:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: #CBD5E1;
        }
      `}</style>
      {children}
    </div>
  );
};

export default Card;
