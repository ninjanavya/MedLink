import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { removeToast, Toast } from '../redux/slices/toastSlice';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'var(--success-light)',
          border: '1px solid var(--success)',
          text: '#065F46',
          icon: <CheckCircle2 size={18} color="var(--success)" />
        };
      case 'warning':
        return {
          bg: 'var(--warning-light)',
          border: '1px solid var(--warning)',
          text: '#92400E',
          icon: <AlertTriangle size={18} color="var(--warning)" />
        };
      case 'error':
        return {
          bg: 'var(--danger-light)',
          border: '1px solid var(--danger)',
          text: '#991B1B',
          icon: <AlertCircle size={18} color="var(--danger)" />
        };
      case 'info':
      default:
        return {
          bg: 'var(--primary-light)',
          border: '1px solid var(--primary)',
          text: '#1E40AF',
          icon: <Info size={18} color="var(--primary)" />
        };
    }
  };

  const style = getToastStyles();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: 50 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: style.bg,
        border: style.border,
        borderRadius: '12px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '10px',
        color: style.text,
        width: '320px',
        fontSize: '13.5px',
        fontWeight: '500',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {style.icon}
        <span>{toast.message}</span>
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: style.text,
          opacity: 0.6,
          display: 'flex',
          padding: '2px'
        }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export const NotificationToast: React.FC = () => {
  const toasts = useAppSelector(state => state.toast.toasts);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none'
      }}
    >
      <div style={{ pointerEvents: 'auto' }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
