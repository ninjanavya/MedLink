import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAppSelector } from '../redux/store';

export const AIIndicator: React.FC = () => {
  const isChatProcessing = useAppSelector(state => state.chat.aiProcessing);
  const isInteractionLoading = useAppSelector(state => state.interactions.loading);
  
  const isProcessing = isChatProcessing || isInteractionLoading;

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '20px',
        background: isProcessing ? 'var(--accent-light)' : 'rgba(241, 245, 249, 0.8)',
        border: `1px solid ${isProcessing ? 'var(--accent)' : 'var(--border)'}`,
        fontSize: '12px',
        fontWeight: '600',
        color: isProcessing ? 'var(--accent)' : 'var(--text-muted)',
        transition: 'all var(--transition-normal)'
      }}
    >
      <div 
        className={isProcessing ? 'pulse-ai' : ''}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isProcessing ? 'var(--accent)' : 'var(--text-light)',
          display: 'inline-block'
        }}
      />
      <Sparkles size={14} color={isProcessing ? 'var(--accent)' : 'var(--text-muted)'} />
      <span>
        {isProcessing ? 'AI Agent Processing...' : 'AI Copilot Ready'}
      </span>
    </div>
  );
};

export default AIIndicator;
