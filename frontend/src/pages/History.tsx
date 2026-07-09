import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchInteractions, loadInteractionIntoDraft } from '../redux/slices/interactionSlice';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, History as HistIcon, Calendar } from 'lucide-react';
import Timeline from '../components/Timeline';
import Card from '../components/Card';

export const History: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { interactions } = useAppSelector(state => state.interactions);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  const handleEditClick = (item: any) => {
    dispatch(loadInteractionIntoDraft(item));
    navigate('/log');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '22px', fontWeight: '800', color: 'var(--secondary)' }}>
          <HistIcon size={22} color="var(--primary)" />
          <span>Interaction History Log</span>
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Audit trail of logged discussions, notes, and AI-summarized insights.
        </p>
      </div>

      {/* Timeline Section */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Timeline onEditClick={handleEditClick} />
      </Card>
    </div>
  );
};

export default History;
