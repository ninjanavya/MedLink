import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  fetchHCPs, 
  deleteHCP,
  setSearchTerm,
  setSpecialtyFilter,
  setHospitalFilter,
  clearFilters
} from '../redux/slices/hcpSlice';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Mail,
  Phone,
  Hospital,
  Sparkles,
  RefreshCcw,
  UserCheck
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { DoctorFormModal } from '../components/DoctorFormModal';
import { getRiskColorClass } from '../utils/helpers';
import { MockHCP, SPECIALTIES_LIST } from '../utils/mockData';

export const HCPManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { doctors, loading, searchTerm, specialtyFilter, hospitalFilter } = useAppSelector(state => state.hcps);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<MockHCP | null>(null);

  useEffect(() => {
    dispatch(fetchHCPs());
  }, [dispatch]);

  // Compute list of unique hospitals in current doctors list for filter dropdown
  const uniqueHospitals = Array.from(new Set(doctors.map(h => h.hospital)));

  // Filtered doctors list
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.email.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesSpecialty = specialtyFilter === 'All' || doc.specialty === specialtyFilter;
    const matchesHospital = hospitalFilter === 'All' || doc.hospital === hospitalFilter;

    return matchesSearch && matchesSpecialty && matchesHospital;
  });

  // Calculate statistics
  const totalDoctors = doctors.length;
  const atRiskCount = doctors.filter(d => d.risk_alert === 'At Churn Risk').length;
  const avgEngagement = totalDoctors > 0 
    ? Math.round(doctors.reduce((sum, d) => sum + d.engagement_score, 0) / totalDoctors) 
    : 0;

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this doctor's profile? This will also delete all associated interaction timeline history.")) {
      dispatch(deleteHCP(id));
    }
  };

  const handleEditClick = (doc: MockHCP) => {
    setEditingDoctor(doc);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingDoctor(null);
    setIsFormOpen(true);
  };

  if (loading && doctors.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Skeleton width="180px" height="24px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[1, 2, 3].map(i => <Card key={i}><Skeleton height="150px" /></Card>)}
        </div>
      </div>
    );
  }

  // Get initial letters for avatar placeholder
  const getAvatarInitials = (fullName: string) => {
    const parts = fullName.replace('Dr. ', '').split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--primary)';
    return 'var(--warning)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header controls */}
      <div style={headerContainerStyle}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--secondary)' }}>HCP Account Management</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Add, update, or remove Healthcare Professionals from the CRM master directory.
          </p>
        </div>

        <Button onClick={handleAddClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Add Doctor</span>
        </Button>
      </div>

      {/* KPI Stats row */}
      <div style={statsRowGridStyle}>
        <Card style={kpiCardStyle('var(--primary)')}>
          <span style={kpiLabelStyle}>TOTAL REGISTERED HCPs</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <h3 style={kpiValStyle}>{totalDoctors}</h3>
            <UserCheck size={20} color="var(--primary)" />
          </div>
        </Card>

        <Card style={kpiCardStyle('var(--danger)')}>
          <span style={kpiLabelStyle}>ACCOUNTS AT CHURN RISK</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <h3 style={kpiValStyle}>{atRiskCount}</h3>
            <AlertTriangle size={20} color="var(--danger)" />
          </div>
        </Card>

        <Card style={kpiCardStyle('var(--accent)')}>
          <span style={kpiLabelStyle}>AVERAGE ENGAGEMENT RATE</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <h3 style={kpiValStyle}>{avgEngagement}%</h3>
            <TrendingUp size={20} color="var(--accent)" />
          </div>
        </Card>
      </div>

      {/* Filter toolbar */}
      <div style={filterBarContainerStyle}>
        <div style={searchBoxStyle}>
          <Search size={15} color="var(--text-light)" />
          <input 
            type="text" 
            placeholder="Search doctors, hospitals, emails..." 
            value={searchTerm}
            onChange={e => dispatch(setSearchTerm(e.target.value))}
            style={searchFieldStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            value={specialtyFilter} 
            onChange={e => dispatch(setSpecialtyFilter(e.target.value))} 
            style={selectDropdownStyle}
          >
            <option value="All">All Specialties</option>
            {SPECIALTIES_LIST.map((spec, i) => (
              <option key={i} value={spec}>{spec}</option>
            ))}
          </select>

          <select 
            value={hospitalFilter} 
            onChange={e => dispatch(setHospitalFilter(e.target.value))} 
            style={selectDropdownStyle}
          >
            <option value="All">All Hospitals</option>
            {uniqueHospitals.map((hosp, i) => (
              <option key={i} value={hosp}>{hosp}</option>
            ))}
          </select>

          <button onClick={() => dispatch(clearFilters())} style={resetBtnStyle}>
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* Grid List */}
      {filteredDoctors.length > 0 ? (
        <div style={doctorGridStyle}>
          {filteredDoctors.map(doc => (
            <Card key={doc.id} hoverable style={doctorCardStyle}>
              {/* Card Header (Avatar + Action buttons) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={avatarStyle}>
                    {getAvatarInitials(doc.name)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>{doc.name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{doc.specialty}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => handleEditClick(doc)} style={actionBtnStyle} title="Edit Profile">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => handleDelete(doc.id)} style={{ ...actionBtnStyle, color: 'var(--danger)' }} title="Delete Profile">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Hospital & Contact */}
              <div style={cardContentStyle}>
                <div style={contactRowStyle}>
                  <Hospital size={12} color="var(--text-light)" />
                  <span>{doc.hospital}</span>
                </div>
                {doc.email && (
                  <div style={contactRowStyle}>
                    <Mail size={12} color="var(--text-light)" />
                    <span style={{ wordBreak: 'break-all' }}>{doc.email}</span>
                  </div>
                )}
                {doc.phone && (
                  <div style={contactRowStyle}>
                    <Phone size={12} color="var(--text-light)" />
                    <span>{doc.phone}</span>
                  </div>
                )}
              </div>

              {/* Engagement Metric */}
              <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Engagement Score</span>
                  <span style={{ color: 'var(--secondary)' }}>{doc.engagement_score}%</span>
                </div>
                <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ height: '100%', width: `${doc.engagement_score}%`, background: getEngagementColor(doc.engagement_score), borderRadius: '3px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Freq: {doc.visit_frequency}
                  </span>
                  <span className={getRiskColorClass(doc.risk_alert)} style={riskBadgeStyle}>
                    {doc.risk_alert}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={emptyStateStyle}>
          <AlertTriangle size={36} color="var(--text-light)" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--secondary)' }}>No Doctor Profiles Match Search</h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Try resetting filters or adjusting search terms.</p>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <DoctorFormModal 
          doctor={editingDoctor} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

// Styling structures
const headerContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px'
};

const statsRowGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '20px',
  width: '100%'
};

const kpiCardStyle = (color: string) => ({
  padding: '18px 24px',
  borderTop: `3px solid ${color}`
});

const kpiLabelStyle: React.CSSProperties = {
  fontSize: '9.5px',
  fontWeight: '800',
  color: 'var(--text-muted)',
  letterSpacing: '0.5px'
};

const kpiValStyle: React.CSSProperties = {
  fontSize: '24px',
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
  gap: '12px',
  boxShadow: 'var(--shadow-sm)'
};

const searchBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid var(--border)',
  padding: '6px 12px',
  borderRadius: '8px',
  width: '280px'
};

const searchFieldStyle: React.CSSProperties = {
  border: 'none',
  width: '100%',
  fontSize: '12.5px',
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

const resetBtnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  width: '32px',
  height: '32px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  transition: 'all var(--transition-fast)'
};

const doctorGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
  gap: '20px',
  width: '100%'
};

const doctorCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  height: '270px'
};

const avatarStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: 'var(--primary-light)',
  color: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '13px',
  fontWeight: '800'
};

const actionBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px',
  color: 'var(--text-light)',
  borderRadius: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background var(--transition-fast)'
};

const cardContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  margin: '16px 0',
  fontSize: '12px',
  color: 'var(--text-muted)'
};

const contactRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: '500'
};

const riskBadgeStyle: React.CSSProperties = {
  fontSize: '9.5px',
  fontWeight: '700',
  padding: '2px 8px',
  borderRadius: '10px'
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '50px 20px',
  border: '2px dashed var(--border)',
  borderRadius: '16px',
  background: '#FFFFFF',
  color: 'var(--text-muted)'
};

export default HCPManagement;
