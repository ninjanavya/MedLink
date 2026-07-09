import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../redux/store';
import { createHCP, updateHCP } from '../redux/slices/hcpSlice';
import { X, Sparkles } from 'lucide-react';
import Button from './Button';
import { MockHCP, SPECIALTIES_LIST, PRODUCTS_LIST } from '../utils/mockData';

interface DoctorFormModalProps {
  doctor: MockHCP | null; // Null if adding a new doctor
  onClose: () => void;
}

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({ doctor, onClose }) => {
  const dispatch = useAppDispatch();

  // Form Fields State
  const [name, setName] = useState('');
  const [hospital, setHospital] = useState('');
  const [specialty, setSpecialty] = useState(SPECIALTIES_LIST[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [experience, setExperience] = useState('5');
  const [products, setProducts] = useState<string[]>([]);
  const [riskAlert, setRiskAlert] = useState<'Low Risk' | 'Medium Risk' | 'At Churn Risk'>('Low Risk');
  const [engagementScore, setEngagementScore] = useState(70);
  const [preferredComm, setPreferredComm] = useState('In-Person');
  const [notes, setNotes] = useState('');

  // Prefill details if editing
  useEffect(() => {
    if (doctor) {
      setName(doctor.name);
      setHospital(doctor.hospital);
      setSpecialty(doctor.specialty);
      setEmail(doctor.email || '');
      setPhone(doctor.phone || '');
      setRiskAlert(doctor.risk_alert);
      setEngagementScore(doctor.engagement_score);
      // Mock other fields for prefill
      setCity('Chicago');
      setStateName('IL');
      setExperience('8');
      setProducts([PRODUCTS_LIST[0]]);
      setPreferredComm('Email');
      setNotes('Key opinion leader interested in pediatric formulations.');
    }
  }, [doctor]);

  const handleReset = () => {
    setName('');
    setHospital('');
    setSpecialty(SPECIALTIES_LIST[0]);
    setEmail('');
    setPhone('');
    setCity('');
    setStateName('');
    setExperience('5');
    setProducts([]);
    setRiskAlert('Low Risk');
    setEngagementScore(70);
    setPreferredComm('In-Person');
    setNotes('');
  };

  const handleProductToggle = (prod: string) => {
    setProducts(prev => 
      prev.includes(prod) ? prev.filter(p => p !== prod) : [...prev, prod]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !hospital || !email) return;

    // Construct form payload
    const payload = {
      name,
      hospital,
      specialty,
      email,
      phone,
      engagement_score: Number(engagementScore),
      visit_frequency: `${(Number(engagementScore) / 40 + 0.5).toFixed(1)} visits / month`,
      risk_alert: riskAlert
    };

    if (doctor) {
      dispatch(updateHCP({ id: doctor.id, data: payload }));
    } else {
      dispatch(createHCP(payload));
    }
    onClose();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>
              {doctor ? 'Edit Healthcare Professional' : 'Register Healthcare Professional'}
            </h3>
          </div>
          <button onClick={onClose} style={closeBtnStyle}><X size={18} /></button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={gridStyle}>
            {/* Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>DOCTOR NAME *</label>
              <input 
                type="text" 
                placeholder="e.g. Dr. Sarah Jenkins" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={inputStyle}
                required
              />
            </div>

            {/* Hospital */}
            <div style={fieldStyle}>
              <label style={labelStyle}>HOSPITAL / CLINIC *</label>
              <input 
                type="text" 
                placeholder="e.g. Mayo Clinic" 
                value={hospital} 
                onChange={e => setHospital(e.target.value)} 
                style={inputStyle}
                required
              />
            </div>

            {/* Specialty */}
            <div style={fieldStyle}>
              <label style={labelStyle}>SPECIALTY</label>
              <select 
                value={specialty} 
                onChange={e => setSpecialty(e.target.value)} 
                style={selectStyle}
              >
                {SPECIALTIES_LIST.map((spec, i) => (
                  <option key={i} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div style={fieldStyle}>
              <label style={labelStyle}>EMAIL ADDRESS *</label>
              <input 
                type="email" 
                placeholder="name@hospital.org" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={inputStyle}
                required
              />
            </div>

            {/* Phone */}
            <div style={fieldStyle}>
              <label style={labelStyle}>PHONE NUMBER</label>
              <input 
                type="tel" 
                placeholder="555-0100" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                style={inputStyle}
              />
            </div>

            {/* Experience */}
            <div style={fieldStyle}>
              <label style={labelStyle}>EXPERIENCE (YEARS)</label>
              <input 
                type="number" 
                value={experience} 
                onChange={e => setExperience(e.target.value)} 
                style={inputStyle}
                min="1"
              />
            </div>

            {/* City */}
            <div style={fieldStyle}>
              <label style={labelStyle}>CITY</label>
              <input 
                type="text" 
                placeholder="Chicago" 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                style={inputStyle}
              />
            </div>

            {/* State */}
            <div style={fieldStyle}>
              <label style={labelStyle}>STATE</label>
              <input 
                type="text" 
                placeholder="IL" 
                value={stateName} 
                onChange={e => setStateName(e.target.value)} 
                style={inputStyle}
              />
            </div>

            {/* Risk Alert Level */}
            <div style={fieldStyle}>
              <label style={labelStyle}>CHURN RISK LEVEL</label>
              <select 
                value={riskAlert} 
                onChange={e => setRiskAlert(e.target.value as any)} 
                style={selectStyle}
              >
                <option value="Low Risk">Low Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="At Churn Risk">At Churn Risk</option>
              </select>
            </div>

            {/* Engagement Score */}
            <div style={fieldStyle}>
              <label style={labelStyle}>ENGAGEMENT SCORE (0-100)</label>
              <input 
                type="number" 
                value={engagementScore} 
                onChange={e => setEngagementScore(Math.min(100, Math.max(0, Number(e.target.value))))} 
                style={inputStyle}
                min="0"
                max="100"
              />
            </div>

            {/* Preferred Communication */}
            <div style={fieldStyle}>
              <label style={labelStyle}>PREFERRED COMMUNICATION</label>
              <select 
                value={preferredComm} 
                onChange={e => setPreferredComm(e.target.value)} 
                style={selectStyle}
              >
                <option value="In-Person">In-Person Visit</option>
                <option value="Virtual">Virtual Session</option>
                <option value="Email">Email Newsletters</option>
                <option value="Phone">Phone Callback</option>
              </select>
            </div>
          </div>

          {/* Assigned Products Multi-select */}
          <div style={fieldStyle}>
            <label style={labelStyle}>ASSIGNED HEALTHCARE PRODUCTS</label>
            <div style={productsGridStyle}>
              {PRODUCTS_LIST.map((prod, idx) => {
                const isActive = products.includes(prod);
                return (
                  <button 
                    type="button" 
                    key={idx}
                    onClick={() => handleProductToggle(prod)}
                    style={productPillStyle(isActive)}
                  >
                    {prod}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div style={fieldStyle}>
            <label style={labelStyle}>HISTORICAL CLINICAL NOTES</label>
            <textarea 
              placeholder="Enter profile observations, research areas, etc." 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={textareaStyle}
              rows={3}
            />
          </div>

          {/* Footer controls */}
          <div style={footerStyle}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
            <Button type="submit">
              Save Doctor
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(4px)',
  zIndex: 99999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px'
};

const modalStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-premium)',
  width: '100%',
  maxWidth: '680px',
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column'
};

const headerStyle: React.CSSProperties = {
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

const formStyle: React.CSSProperties = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '16px'
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle: React.CSSProperties = {
  fontSize: '9.5px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.5px'
};

const inputStyle: React.CSSProperties = {
  height: '40px',
  padding: '0 12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text-main)',
  background: '#FFFFFF'
};

const selectStyle: React.CSSProperties = {
  height: '40px',
  padding: '0 12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text-main)',
  background: '#FFFFFF'
};

const textareaStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text-main)',
  background: '#FFFFFF',
  resize: 'vertical'
};

const productsGridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  background: '#F8FAFC',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid var(--border)'
};

const productPillStyle = (isActive: boolean) => ({
  background: isActive ? 'var(--primary)' : '#FFFFFF',
  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
  border: '1px solid',
  borderColor: isActive ? 'var(--primary)' : 'var(--border)',
  borderRadius: '20px',
  padding: '4px 12px',
  fontSize: '11px',
  fontWeight: '700' as const,
  cursor: 'pointer',
  transition: 'all var(--transition-fast)'
});

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '16px',
  borderTop: '1px solid var(--border)',
  paddingTop: '18px'
};

export default DoctorFormModal;
