import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '4px',
  className = ''
}) => {
  return (
    <div 
      className={`shimmer ${className}`}
      style={{ width, height, borderRadius, marginBottom: '8px' }}
    />
  );
};

export const TimelineSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {[1, 2, 3].map(i => (
        <div 
          key={i} 
          style={{
            padding: '20px',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton width="180px" height="18px" />
            <Skeleton width="60px" height="20px" borderRadius="12px" />
          </div>
          <Skeleton width="260px" height="14px" />
          <Skeleton width="100%" height="32px" />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <Skeleton width="80px" height="24px" borderRadius="12px" />
            <Skeleton width="80px" height="24px" borderRadius="12px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const AIPanelSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="80px" height="14px" />
        <Skeleton width="100%" height="80px" borderRadius="12px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="120px" height="16px" />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Skeleton width="80px" height="24px" borderRadius="12px" />
          <Skeleton width="100px" height="24px" borderRadius="12px" />
          <Skeleton width="70px" height="24px" borderRadius="12px" />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="100px" height="14px" />
            <Skeleton width="80px" height="14px" />
          </div>
        ))}
      </div>
    </div>
  );
};
