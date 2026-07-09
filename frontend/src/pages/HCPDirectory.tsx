import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchHCPs } from '../redux/slices/hcpSlice';
import { updateDraft } from '../redux/slices/interactionSlice';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Phone, MapPin, Activity, Stethoscope, ChevronRight, PenTool } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { getRiskColorClass } from '../utils/helpers';

export const HCPDirectory: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { doctors: hcps } = useAppSelector(state => state.hcps);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchHCPs());
  }, [dispatch]);

  // Extract unique specialties for filtering
  const specialties = ['All', ...Array.from(new Set(hcps.map(h => h.specialty)))];

  // Filtering logic
  const filteredHCPs = hcps.filter(hcp => {
    const matchesSearch = hcp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hcp.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'All' || hcp.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const handleLogInteractionClick = (hcp: typeof hcps[0]) => {
    // Prefill form draft in Redux
    dispatch(updateDraft({
      hcp_name: hcp.name,
      hospital: hcp.hospital,
      specialty: hcp.specialty
    }));
    navigate('/log');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--secondary)' }}>Healthcare Professional Directory</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Browse, filter, and review details of all registered physicians and clinics.
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div style={filterBarContainerStyle}>
        <div style={searchBoxStyle}>
          <Search size={16} color="var(--text-light)" />
          <input 
            type="text" 
            placeholder="Search by doctor or clinic name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)' }}>Specialty:</span>
          <select 
            value={specialtyFilter} 
            onChange={e => setSpecialtyFilter(e.target.value)}
            style={selectStyle}
          >
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* HCP Grid list */}
      {filteredHCPs.length > 0 ? (
        <div style={gridStyle}>
          {filteredHCPs.map(hcp => (
            <Card key={hcp.id} hoverable className="hcp-card">
              {/* Profile header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)' }}>{hcp.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                    <Stethoscope size={12} color="var(--primary)" />
                    <span>{hcp.specialty}</span>
                  </div>
                </div>
                
                {/* Risk alert badge */}
                <span className={getRiskColorClass(hcp.risk_alert)} style={riskBadgeStyle}>
                  {hcp.risk_alert}
                </span>
              </div>

              {/* Stats detail box */}
              <div style={statsDetailStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={statLabelStyle}>ENGAGEMENT</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent)' }}>{hcp.engagement_score}/100</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={statLabelStyle}>FREQUENCY</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>{hcp.visit_frequency}</span>
                </div>
              </div>

              {/* Contact list */}
              <div style={contactListStyle}>
                <div style={contactRowStyle}>
                  <MapPin size={13} color="var(--text-light)" />
                  <span style={{ fontSize: '12px', fontWeight: '500' }}>{hcp.hospital}</span>
                </div>
                {hcp.email && (
                  <div style={contactRowStyle}>
                    <Mail size={13} color="var(--text-light)" />
                    <span style={{ fontSize: '12px', fontWeight: '500' }}>{hcp.email}</span>
                  </div>
                )}
                {hcp.phone && (
                  <div style={contactRowStyle}>
                    <Phone size={13} color="var(--text-light)" />
                    <span style={{ fontSize: '12px', fontWeight: '500' }}>{hcp.phone}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <Button 
                  variant="text" 
                  fullWidth 
                  onClick={() => handleLogInteractionClick(hcp)}
                  style={{ display: 'flex', gap: '6px', fontSize: '12.5px' }}
                >
                  <PenTool size={14} />
                  <span>Log Visit with Doctor</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={emptyStateStyle}>
          <Search size={40} color="var(--text-light)" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)' }}>No Doctors Match Your Search</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Try modifying your spelling or changing the specialty filter category.</p>
        </div>
      )}
    </div>
  );
};

// Styling structures
const filterBarContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#FFFFFF',
  padding: '16px 20px',
  borderRadius: '12px',
  border: '1px solid var(--border)',
  flexWrap: 'wrap',
  gap: '16px'
};

const searchBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid var(--border)',
  padding: '6px 12px',
  borderRadius: '8px',
  width: '300px'
};

const inputStyle: React.CSSProperties = {
  border: 'none',
  width: '100%',
  fontSize: '12.5px',
  color: 'var(--text-main)'
};

const selectStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '6px 12px',
  fontSize: '12.5px',
  background: '#FFFFFF',
  color: 'var(--text-main)'
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  width: '100%'
};

const riskBadgeStyle: React.CSSProperties = {
  fontSize: '10.5px',
  fontWeight: '700',
  padding: '2px 8px',
  borderRadius: '12px'
};

const statsDetailStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  background: '#F8FAFC',
  borderRadius: '8px',
  padding: '10px 14px',
  border: '1px solid var(--border)',
  marginBottom: '16px'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.5px'
};

const contactListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  color: 'var(--text-main)'
};

const contactRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
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

export default HCPDirectory;
