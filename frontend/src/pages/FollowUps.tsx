import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchInteractions, updateInteraction, loadInteractionIntoDraft } from '../redux/slices/interactionSlice';
import { addToast } from '../redux/slices/toastSlice';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  BrainCircuit, 
  Edit3, 
  Eye, 
  CalendarRange, 
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { formatDate } from '../utils/helpers';
import { MockInteraction } from '../utils/mockData';

export const FollowUps: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { interactions, loading } = useAppSelector(state => state.interactions);
  
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Local list to track completed follow-ups
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  // Local state for reschedule interaction
  const [reschedulingItem, setReschedulingItem] = useState<MockInteraction | null>(null);
  const [newFollowUpDate, setNewFollowUpDate] = useState('');
  // Local state for details modal
  const [selectedItem, setSelectedItem] = useState<MockInteraction | null>(null);

  useEffect(() => {
    dispatch(fetchInteractions());
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Extract interactions with follow-up dates
  const followUpsList = interactions.filter(i => i.follow_up_date);

  const getFollowUpStatus = (item: MockInteraction): 'Overdue' | 'Due Today' | 'Pending' | 'Completed' => {
    if (item.follow_up_completed || completedIds.includes(item.id)) return 'Completed';
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    
    if (item.follow_up_date && item.follow_up_date < todayStr) return 'Overdue';
    if (item.follow_up_date === todayStr) return 'Due Today';
    return 'Pending';
  };

  // KPIs Calculations
  const counts = {
    pending: 0,
    overdue: 0,
    dueToday: 0,
    completed: 0
  };

  followUpsList.forEach(item => {
    const status = getFollowUpStatus(item);
    if (status === 'Completed') counts.completed++;
    else if (status === 'Overdue') counts.overdue++;
    else if (status === 'Due Today') counts.dueToday++;
    else counts.pending++;
  });

  // Filters application
  const filteredFollowUps = followUpsList.filter(item => {
    const status = getFollowUpStatus(item);
    const matchesSearch = item.hcp_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.next_best_action && item.next_best_action.toLowerCase().includes(searchTerm.toLowerCase()));
                          
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Mark Completed Action
  const handleMarkComplete = async (id: number) => {
    try {
      await dispatch(updateInteraction({
        id,
        data: { follow_up_completed: true }
      })).unwrap();
    } catch (e) {
      // toast shown in reducer
    }
  };

  // Reschedule save handler
  const handleRescheduleSave = async () => {
    if (!reschedulingItem || !newFollowUpDate) return;
    try {
      await dispatch(updateInteraction({
        id: reschedulingItem.id,
        data: { follow_up_date: newFollowUpDate }
      })).unwrap();
      setReschedulingItem(null);
      setNewFollowUpDate('');
      dispatch(fetchInteractions());
    } catch (e) {
      // toast shown in reducer
    }
  };

  // Redirect to Log page to edit in form
  const handleEditClick = (item: MockInteraction) => {
    dispatch(loadInteractionIntoDraft(item));
    navigate('/log');
  };

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <Skeleton width="180px" height="24px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => <Card key={i}><Skeleton height="50px" /></Card>)}
        </div>
        <Skeleton width="100%" height="300px" />
      </div>
    );
  }

  // AI recommendations for prioritizing follow ups
  const aiPriorities = followUpsList
    .filter(i => getFollowUpStatus(i) !== 'Completed' && i.priority === 'High')
    .slice(0, 3);

  return (
    <div style={pageLayoutGridStyle}>
      {/* Main Follow Up Area */}
      <div style={mainContentColumnStyle}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--secondary)' }}>Follow-up Task Manager</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Track, mark complete, or reschedule tasks and patient/physician check-ins.
          </p>
        </div>

        {/* 1. Summary KPI Cards */}
        <div style={kpiGridStyle}>
          <Card style={kpiCardStyle('var(--warning)')}>
            <span style={kpiLabelStyle}>DUE TODAY</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <h3 style={kpiValStyle}>{counts.dueToday}</h3>
              <Clock size={20} color="var(--warning)" />
            </div>
          </Card>
          
          <Card style={kpiCardStyle('var(--danger)')}>
            <span style={kpiLabelStyle}>OVERDUE</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <h3 style={kpiValStyle}>{counts.overdue}</h3>
              <AlertTriangle size={20} color="var(--danger)" />
            </div>
          </Card>
          
          <Card style={kpiCardStyle('var(--primary)')}>
            <span style={kpiLabelStyle}>PENDING</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <h3 style={kpiValStyle}>{counts.pending}</h3>
              <Calendar size={20} color="var(--primary)" />
            </div>
          </Card>

          <Card style={kpiCardStyle('var(--success)')}>
            <span style={kpiLabelStyle}>COMPLETED</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <h3 style={kpiValStyle}>{counts.completed}</h3>
              <CheckCircle2 size={20} color="var(--success)" />
            </div>
          </Card>
        </div>

        {/* 2. Search & Filters Bar */}
        <div style={filterBarContainerStyle}>
          <div style={searchBoxStyle}>
            <Search size={15} color="var(--text-light)" />
            <input 
              type="text" 
              placeholder="Search doctor, hospital, action..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={searchFieldStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select 
              value={priorityFilter} 
              onChange={e => setPriorityFilter(e.target.value)} 
              style={selectDropdownStyle}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)} 
              style={selectDropdownStyle}
            >
              <option value="All">All Statuses</option>
              <option value="Due Today">Due Today</option>
              <option value="Overdue">Overdue</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* 3. Follow Up List */}
        {filteredFollowUps.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredFollowUps.map(item => {
              const status = getFollowUpStatus(item);
              return (
                <div key={item.id} style={followupCardStyle(item.priority)}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--secondary)' }}>
                        {item.hcp_name}
                      </h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
                        {item.hospital}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={priorityBadgeStyle(item.priority)}>{item.priority} Priority</span>
                      <span style={statusBadgeStyle(status)}>{status}</span>
                    </div>
                  </div>

                  {/* Task details */}
                  <div style={taskDetailBoxStyle}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.3px', display: 'block', marginBottom: '2px' }}>
                      NEXT BEST ACTION
                    </span>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-main)', margin: 0, fontWeight: '600' }}>
                      {item.next_best_action || 'No action items set.'}
                    </p>
                  </div>

                  {/* Footer details and action buttons */}
                  <div style={cardFooterStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      <Calendar size={12} />
                      <span>Due: {formatDate(item.follow_up_date)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setSelectedItem(item)} style={actionBtnStyle} title="View Detail"><Eye size={13} /></button>
                      <button onClick={() => handleEditClick(item)} style={actionBtnStyle} title="Edit Notes"><Edit3 size={13} /></button>
                      
                      {status !== 'Completed' && (
                        <>
                          <button onClick={() => setReschedulingItem(item)} style={{ ...actionBtnStyle, color: 'var(--primary)' }} title="Reschedule Date">
                            <CalendarRange size={13} />
                          </button>
                          <button onClick={() => handleMarkComplete(item.id)} style={{ ...actionBtnStyle, color: 'var(--success)' }} title="Mark Complete">
                            <CheckCircle size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={emptyStateStyle}>
            <CalendarRange size={40} color="var(--text-light)" style={{ marginBottom: '12px' }} />
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)' }}>No Follow-ups Found</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Right-Hand AI Panel */}
      <div style={rightColumnStyle} className="followup-right-panel">
        <div style={aiPanelStyle}>
          <div style={aiPanelHeaderStyle}>
            <BrainCircuit size={16} color="var(--accent)" />
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)' }}>AI Prioritization Engine</h4>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px', fontWeight: '500' }}>
            The AI prioritizes follow-ups based on doctor engagement scores, churn risk alerts, and pending clinical brochure packages.
          </p>

          <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--text-light)', display: 'block', marginBottom: '10px', letterSpacing: '0.5px' }}>
            CRITICAL FOCUS ITEMS
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiPriorities.length > 0 ? (
              aiPriorities.map((item, idx) => (
                <div key={idx} style={aiItemBoxStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--secondary)' }}>{item.hcp_name}</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--danger)' }}>High Priority</span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>
                    {item.next_best_action || 'Brochure delivery due.'}
                  </p>
                  <button 
                    onClick={() => { setSelectedItem(item); }}
                    style={aiLinkStyle}
                  >
                    <span>View Details</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-light)', fontWeight: '500' }}>
                No pending high priority follow-ups detected.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Reschedule Overlay Modal */}
      {reschedulingItem && (
        <div style={modalOverlayStyle} onClick={() => setReschedulingItem(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)' }}>Reschedule Follow-up</h3>
              <button onClick={() => setReschedulingItem(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, fontWeight: '500' }}>
                Select a new follow-up date for <strong style={{ color: 'var(--secondary)' }}>{reschedulingItem.hcp_name}</strong>.
              </p>
              <input 
                type="date" 
                value={newFollowUpDate}
                onChange={e => setNewFollowUpDate(e.target.value)}
                style={dateInputStyle}
              />
            </div>
            <div style={modalFooterStyle}>
              <Button variant="outline" onClick={() => setReschedulingItem(null)}>Cancel</Button>
              <Button disabled={!newFollowUpDate} onClick={handleRescheduleSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. View Details Modal */}
      {selectedItem && (
        <div style={modalOverlayStyle} onClick={() => setSelectedItem(null)}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)' }}>Follow-up Task Card</h3>
              <button onClick={() => setSelectedItem(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={priorityBadgeStyle(selectedItem.priority)}>{selectedItem.priority} Priority</span>
                <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)', marginTop: '8px' }}>{selectedItem.hcp_name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>{selectedItem.hospital}</p>
              </div>

              <div style={detailBoxStyle}>
                <span style={modalLabelStyle}>DUE DATE</span>
                <span style={detailValStyle}>{formatDate(selectedItem.follow_up_date)}</span>
              </div>

              <div style={detailBoxStyle}>
                <span style={modalLabelStyle}>NEXT BEST ACTION</span>
                <span style={{ ...detailValStyle, fontWeight: '600' }}>{selectedItem.next_best_action || 'No action details scheduled.'}</span>
              </div>

              <div style={detailBoxStyle}>
                <span style={modalLabelStyle}>HISTORICAL NOTES</span>
                <span style={{ ...detailValStyle, fontWeight: '500', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{selectedItem.notes || 'No notes available.'}</span>
              </div>
            </div>
            <div style={modalFooterStyle}>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
              <Button onClick={() => handleEditClick(selectedItem)}>Edit Notes</Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width: 992px) {
          .followup-right-panel {
            min-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

// Styling structures
const pageLayoutGridStyle: React.CSSProperties = {
  display: 'flex',
  gap: '32px',
  alignItems: 'flex-start',
  width: '100%',
  flexWrap: 'wrap'
};

const mainContentColumnStyle: React.CSSProperties = {
  flex: 1.8,
  display: 'flex',
  flexDirection: 'column',
  gap: '28px',
  minWidth: '320px'
};

const rightColumnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '340px'
};

const kpiGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '16px',
  width: '100%'
};

const kpiCardStyle = (color: string) => ({
  padding: '16px',
  borderTop: `3px solid ${color}`
});

const kpiLabelStyle: React.CSSProperties = {
  fontSize: '9.5px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.5px'
};

const kpiValStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '800',
  color: 'var(--secondary)'
};

const filterBarContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#FFFFFF',
  padding: '12px 18px',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  flexWrap: 'wrap',
  gap: '12px'
};

const searchBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid var(--border)',
  padding: '6px 12px',
  borderRadius: '8px',
  width: '260px'
};

const searchFieldStyle: React.CSSProperties = {
  border: 'none',
  width: '100%',
  fontSize: '12px',
  color: 'var(--text-main)'
};

const selectDropdownStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '6px 10px',
  fontSize: '12px',
  background: '#FFFFFF',
  color: 'var(--text-muted)',
  fontWeight: '600'
};

const followupCardStyle = (priority: string): React.CSSProperties => {
  const borderLeft = priority === 'High' ? '3px solid var(--danger)' : (priority === 'Medium' ? '3px solid var(--warning)' : '3px solid var(--success)');
  return {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-card)',
    border: '1px solid var(--border)',
    borderLeft,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all var(--transition-normal)'
  };
};

const priorityBadgeStyle = (priority: string) => {
  const isHigh = priority === 'High';
  const isMed = priority === 'Medium';
  const bg = isHigh ? 'var(--danger-light)' : (isMed ? 'var(--warning-light)' : 'var(--success-light)');
  const color = isHigh ? 'var(--danger)' : (isMed ? 'var(--warning)' : 'var(--success)');
  return {
    fontSize: '9.5px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
    background: bg,
    color,
    display: 'inline-block'
  };
};

const statusBadgeStyle = (status: string) => {
  let bg = 'var(--primary-light)';
  let color = 'var(--primary)';
  if (status === 'Completed') {
    bg = 'var(--success-light)';
    color = 'var(--success)';
  } else if (status === 'Overdue') {
    bg = 'var(--danger-light)';
    color = 'var(--danger)';
  } else if (status === 'Due Today') {
    bg = 'var(--warning-light)';
    color = 'var(--warning)';
  }
  return {
    fontSize: '9.5px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px',
    background: bg,
    color,
    display: 'inline-block'
  };
};

const taskDetailBoxStyle: React.CSSProperties = {
  background: '#F8FAFC',
  borderRadius: '8px',
  padding: '10px 14px',
  border: '1px solid var(--border)'
};

const cardFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '4px',
  borderTop: '1px solid var(--border)',
  paddingTop: '12px'
};

const actionBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px',
  color: 'var(--text-muted)',
  borderRadius: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background var(--transition-fast)'
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  border: '2px dashed var(--border)',
  borderRadius: '16px',
  background: '#FFFFFF',
  color: 'var(--text-muted)'
};

const aiPanelStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-premium)',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column'
};

const aiPanelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--secondary)',
  paddingBottom: '12px',
  borderBottom: '1px solid var(--border)',
  marginBottom: '16px'
};

const aiItemBoxStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '10px',
  background: 'var(--danger-light)',
  border: '1px solid rgba(239, 68, 68, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const aiLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '11px',
  color: 'var(--danger)',
  fontWeight: '700',
  padding: 0,
  marginTop: '6px',
  width: 'fit-content'
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
  maxWidth: '440px',
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column'
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '16px 20px',
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

const dateInputStyle: React.CSSProperties = {
  width: '100%',
  height: '40px',
  padding: '0 12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text-main)'
};

const modalFooterStyle: React.CSSProperties = {
  padding: '16px 20px',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px'
};

const detailBoxStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: '#F8FAFC',
  borderRadius: '10px',
  border: '1px solid var(--border)'
};

const modalLabelStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.5px',
  display: 'block',
  marginBottom: '2px'
};

const detailValStyle: React.CSSProperties = {
  fontSize: '12.5px',
  color: 'var(--text-main)',
  display: 'block'
};

export default FollowUps;
