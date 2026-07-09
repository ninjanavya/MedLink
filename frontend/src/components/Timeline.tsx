import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/store';
import { deleteInteraction } from '../redux/slices/interactionSlice';
import { formatDate, getPriorityBadgeClass } from '../utils/helpers';
import { Calendar, Tag, Trash2, Edit3, Eye, FileText, ChevronRight, X } from 'lucide-react';
import { MockInteraction } from '../utils/mockData';
import { TimelineSkeleton } from './Skeleton';
import Button from './Button';

interface TimelineProps {
  onEditClick: (item: MockInteraction) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ onEditClick }) => {
  const dispatch = useAppDispatch();
  const { interactions, loading } = useAppSelector(state => state.interactions);
  const [selectedItem, setSelectedItem] = useState<MockInteraction | null>(null);

  if (loading && interactions.length === 0) {
    return <TimelineSkeleton />;
  }

  if (interactions.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <FileText size={48} color="var(--text-light)" style={{ marginBottom: '12px' }} />
        <h4 style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: '600' }}>No Interactions Logged Yet</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '300px', marginTop: '4px' }}>
          Use the Structured Form or speak with our AI Assistant to record your first customer interaction.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {interactions.map(item => (
        <div key={item.id} className="timeline-card" style={cardStyle}>
          {/* Card Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)' }}>
                {item.hcp_name}
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
                {item.specialty} • {item.hospital}
              </p>
            </div>
            <span className={`badge ${getPriorityBadgeClass(item.priority)}`} style={badgeStyle}>
              {item.priority} Priority
            </span>
          </div>

          {/* AI Summary / Notes */}
          <p style={notesStyle}>
            {item.summary || item.notes}
          </p>

          {/* Products discussed */}
          {item.products_discussed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
              <Tag size={12} color="var(--text-light)" />
              {item.products_discussed.split(',').map((p, idx) => (
                <span key={idx} style={prodChipStyle}>
                  {p.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Footer details & action buttons */}
          <div style={footerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
              <Calendar size={12} />
              <span>Follow-up: {item.follow_up_date ? formatDate(item.follow_up_date) : 'None'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => setSelectedItem(item)}
                style={actionBtnStyle} 
                title="View Details"
              >
                <Eye size={14} />
                <span>View</span>
              </button>
              <button 
                onClick={() => onEditClick(item)}
                style={actionBtnStyle} 
                title="Edit Interaction"
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => dispatch(deleteInteraction(item.id))}
                style={{ ...actionBtnStyle, color: 'var(--danger)' }} 
                title="Delete Interaction"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Detail Modal Overlay */}
      {selectedItem && (
        <div style={modalOverlayStyle} onClick={() => setSelectedItem(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--secondary)' }}>Interaction Details</h3>
              <button onClick={() => setSelectedItem(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className={`badge ${getPriorityBadgeClass(selectedItem.priority)}`} style={{ float: 'right', ...badgeStyle }}>{selectedItem.priority}</span>
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>{selectedItem.hcp_name}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
                  {selectedItem.specialty} • {selectedItem.hospital}
                </p>
              </div>

              <div style={modalDetailBoxStyle}>
                <span style={labelStyle}>VISIT DATE</span>
                <p style={detailTextStyle}>{formatDate(selectedItem.interaction_date)} ({selectedItem.interaction_type})</p>
              </div>

              <div style={modalDetailBoxStyle}>
                <span style={labelStyle}>PRODUCTS DISCUSSED</span>
                <p style={detailTextStyle}>{selectedItem.products_discussed || 'None'}</p>
              </div>

              <div style={modalDetailBoxStyle}>
                <span style={labelStyle}>MEETING MINUTES / NOTES</span>
                <p style={{ ...detailTextStyle, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{selectedItem.notes || 'No detailed notes entered.'}</p>
              </div>

              {selectedItem.summary && (
                <div style={{ ...modalDetailBoxStyle, background: 'var(--primary-light)', border: '1px solid rgba(37,99,235,0.1)' }}>
                  <span style={{ ...labelStyle, color: 'var(--primary)' }}>AI GENERATED SUMMARY</span>
                  <p style={{ ...detailTextStyle, fontWeight: '500' }}>{selectedItem.summary}</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={modalDetailBoxStyle}>
                  <span style={labelStyle}>FOLLOW-UP TARGET</span>
                  <p style={detailTextStyle}>{selectedItem.follow_up_date ? formatDate(selectedItem.follow_up_date) : 'No follow-up scheduled'}</p>
                </div>
                <div style={modalDetailBoxStyle}>
                  <span style={labelStyle}>SENTIMENT ANALYSIS</span>
                  <p style={{ ...detailTextStyle, color: selectedItem.sentiment === 'Positive' ? 'var(--success)' : (selectedItem.sentiment === 'Negative' ? 'var(--danger)' : 'var(--text-main)') }}>
                    {selectedItem.sentiment || 'Neutral'} (Score: {selectedItem.sentiment_score ?? 0.0})
                  </p>
                </div>
              </div>

              {selectedItem.next_best_action && (
                <div style={{ ...modalDetailBoxStyle, borderLeft: '3px solid var(--accent)' }}>
                  <span style={{ ...labelStyle, color: 'var(--accent)' }}>RECOMMENDED NEXT BEST ACTION</span>
                  <p style={{ ...detailTextStyle, fontWeight: '600' }}>{selectedItem.next_best_action}</p>
                </div>
              )}
            </div>

            <div style={modalFooterStyle}>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
              <Button onClick={() => { onEditClick(selectedItem); setSelectedItem(null); }}>Edit Record</Button>
            </div>
          </div>
        </div>
      )}

      {/* Local badges and animations styles */}
      <style>{`
        .timeline-card {
          transition: all var(--transition-normal);
        }
        .timeline-card:hover {
          transform: translateX(4px);
          border-color: #CBD5E1 !important;
          box-shadow: var(--shadow-md) !important;
        }
        .badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 12px;
          display: inline-block;
        }
        .badge-danger {
          background-color: var(--danger-light);
          color: var(--danger);
        }
        .badge-warning {
          background-color: var(--warning-light);
          color: var(--warning);
        }
        .badge-primary {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        .badge-secondary {
          background-color: #F1F5F9;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

// Styling structures
const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-sm)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const badgeStyle: React.CSSProperties = {
  fontSize: '10.5px'
};

const notesStyle: React.CSSProperties = {
  fontSize: '12.5px',
  color: 'var(--text-main)',
  lineHeight: '1.6',
  marginTop: '4px',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  fontWeight: '500'
};

const prodChipStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  padding: '2px 8px',
  borderRadius: '8px',
  background: '#F1F5F9',
  color: 'var(--text-muted)'
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '16px',
  paddingTop: '12px',
  borderTop: '1px solid var(--border)'
};

const actionBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  color: 'var(--primary)',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  borderRadius: '6px',
  transition: 'background var(--transition-fast)'
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  border: '2px dashed var(--border)',
  borderRadius: 'var(--radius-card)',
  background: '#FCFDFE',
  color: 'var(--text-muted)'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(4px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const modalStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '20px',
  boxShadow: 'var(--shadow-premium)',
  width: '100%',
  maxWidth: '560px',
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '18px 24px',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-light)'
};

const modalDetailBoxStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: '#F8FAFC',
  borderRadius: '12px',
  border: '1px solid var(--border)'
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.5px',
  display: 'block',
  marginBottom: '4px'
};

const detailTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-main)',
  margin: 0,
  fontWeight: '600'
};

const modalFooterStyle: React.CSSProperties = {
  padding: '18px 24px',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px'
};

export default Timeline;
