import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchHCPs, createHCP, updateHCP, deleteHCP } from '../redux/slices/hcpSlice';
import { fetchInteractions } from '../redux/slices/interactionSlice';
import { addToast } from '../redux/slices/toastSlice';
import { MockHCP } from '../utils/mockData';
import Card from '../components/Card';
import { 
  User, ShieldAlert, Plus, Trash2, Edit2, Eye, Check, X, Search, 
  Server, Database, Activity, Cpu, Sparkles, TrendingUp, Users, 
  CalendarClock, UserCheck, ClipboardList, Clock, CheckCircle2, AlertOctagon
} from 'lucide-react';

interface CRMUser {
  id: number;
  name: string;
  role: 'Administrator' | 'Medical Representative';
  email: string;
  status: 'Active' | 'Disabled';
}

interface AuditLog {
  id: number;
  action: string;
  details: string;
  timestamp: string;
}

export const AdminPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { doctors, loading: hcpLoading } = useAppSelector(state => state.hcps);
  const { interactions } = useAppSelector(state => state.interactions);
  const { user: currentAdmin } = useAppSelector(state => state.auth);

  // Form states for HCP
  const [isEditingHCP, setIsEditingHCP] = useState(false);
  const [editingHCPId, setEditingHCPId] = useState<number | null>(null);
  const [hcpForm, setHcpForm] = useState({
    name: '',
    hospital: '',
    specialty: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    products: [] as string[],
    engagementScore: 70,
    riskCategory: 'Low Risk' as 'Low Risk' | 'Medium Risk' | 'At Churn Risk',
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Modals / View details
  const [selectedHCP, setSelectedHCP] = useState<MockHCP | null>(null);
  const [hcpSearch, setHcpSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  // User Management local states
  const [users, setUsers] = useState<CRMUser[]>([
    { id: 1, name: 'CRM Admin', role: 'Administrator', email: 'admin@healthcrm.ai', status: 'Active' },
    { id: 2, name: 'Alex Mercer', role: 'Medical Representative', email: 'rep@healthcrm.ai', status: 'Active' },
    { id: 3, name: 'Sarah Connor', role: 'Medical Representative', email: 'sconnor@healthcrm.ai', status: 'Disabled' }
  ]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<CRMUser | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    role: 'Medical Representative' as 'Administrator' | 'Medical Representative',
    email: '',
    status: 'Active' as 'Active' | 'Disabled'
  });

  // Audit timeline state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 1, action: 'Admin created user', details: 'Added Alex Mercer (rep@healthcrm.ai)', timestamp: '2026-07-08 09:00:12' },
    { id: 2, action: 'Admin updated doctor', details: 'Modified details for Dr. Sarah Jenkins', timestamp: '2026-07-08 10:22:45' },
    { id: 3, action: 'Admin created HCP', details: 'Added Dr. Kevin Lopez (Mercy OBGYN)', timestamp: '2026-07-08 11:45:00' }
  ]);

  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
  }, [dispatch]);

  const addAuditLog = (action: string, details: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAuditLogs(prev => [
      { id: Date.now(), action, details, timestamp: now },
      ...prev
    ]);
  };

  // HCP Form resets
  const handleClearForm = () => {
    setHcpForm({
      name: '',
      hospital: '',
      specialty: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      products: [],
      engagementScore: 70,
      riskCategory: 'Low Risk',
      status: 'Active'
    });
    setIsEditingHCP(false);
    setEditingHCPId(null);
  };

  // HCP Add / Edit submit
  const handleHCPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!hcpForm.name.trim()) return dispatch(addToast({ message: "Doctor Name is required", type: "warning" }));
    if (!hcpForm.hospital.trim()) return dispatch(addToast({ message: "Hospital Name is required", type: "warning" }));
    if (!hcpForm.specialty.trim()) return dispatch(addToast({ message: "Specialty is required", type: "warning" }));
    if (!hcpForm.email.trim() || !hcpForm.email.includes('@')) return dispatch(addToast({ message: "Provide a valid email", type: "warning" }));
    if (!hcpForm.city.trim()) return dispatch(addToast({ message: "City is required", type: "warning" }));
    if (!hcpForm.state.trim()) return dispatch(addToast({ message: "State is required", type: "warning" }));
    if (hcpForm.products.length === 0) return dispatch(addToast({ message: "Select at least one product tag", type: "warning" }));

    const payload = {
      name: hcpForm.name,
      hospital: hcpForm.hospital,
      specialty: hcpForm.specialty,
      email: hcpForm.email,
      phone: hcpForm.phone,
      city: hcpForm.city,
      state: hcpForm.state,
      products_assigned: hcpForm.products.join(', '),
      engagement_score: Number(hcpForm.engagementScore),
      risk_alert: hcpForm.riskCategory,
      status: hcpForm.status,
      visit_frequency: "1.0 visits / month"
    };

    try {
      if (isEditingHCP && editingHCPId !== null) {
        await dispatch(updateHCP({ id: editingHCPId, data: payload })).unwrap();
        addAuditLog('Admin updated doctor', `Modified details for Dr. ${payload.name}`);
        dispatch(addToast({ message: `Successfully updated Dr. ${payload.name}`, type: 'success' }));
      } else {
        await dispatch(createHCP(payload)).unwrap();
        addAuditLog('Admin created HCP', `Added Dr. ${payload.name} (${payload.hospital})`);
        dispatch(addToast({ message: `Successfully created Dr. ${payload.name}`, type: 'success' }));
      }
      handleClearForm();
    } catch (err: any) {
      dispatch(addToast({ message: err || "Failed to save HCP profile", type: "error" }));
    }
  };

  const handleEditHCPClick = (item: MockHCP) => {
    setIsEditingHCP(true);
    setEditingHCPId(item.id);
    setHcpForm({
      name: item.name,
      hospital: item.hospital,
      specialty: item.specialty,
      email: item.email || '',
      phone: item.phone || '',
      city: item.city || '',
      state: item.state || '',
      products: item.products_assigned ? item.products_assigned.split(', ') : [],
      engagementScore: item.engagement_score || 70,
      riskCategory: item.risk_alert || 'Low Risk',
      status: item.status || 'Active'
    });
    // scroll form into view on mobile
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleDeleteHCPClick = async (item: MockHCP) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${item.name} and all related interaction histories?`)) {
      try {
        await dispatch(deleteHCP(item.id)).unwrap();
        addAuditLog('Admin deleted doctor', `Removed Dr. ${item.name}`);
      } catch (err) {
        // error toast handled in slice
      }
    }
  };

  // Product Selection helper
  const toggleProduct = (product: string) => {
    setHcpForm(prev => {
      const exists = prev.products.includes(product);
      const updated = exists 
        ? prev.products.filter(p => p !== product)
        : [...prev.products, product];
      return { ...prev, products: updated };
    });
  };

  // User CRUD handlers
  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) {
      dispatch(addToast({ message: "Fill in all user fields", type: "warning" }));
      return;
    }

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u));
      addAuditLog('Admin updated user', `Modified user settings for ${userForm.name}`);
      dispatch(addToast({ message: `Updated user ${userForm.name}`, type: "success" }));
    } else {
      const newUser: CRMUser = {
        id: Date.now(),
        name: userForm.name,
        role: userForm.role,
        email: userForm.email,
        status: userForm.status
      };
      setUsers(prev => [...prev, newUser]);
      addAuditLog('Admin created user', `Added ${userForm.name} (${userForm.email})`);
      dispatch(addToast({ message: `Created user ${userForm.name}`, type: "success" }));
    }
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ name: '', role: 'Medical Representative', email: '', status: 'Active' });
  };

  const handleEditUserClick = (u: CRMUser) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      role: u.role,
      email: u.email,
      status: u.status
    });
    setShowUserModal(true);
  };

  const handleToggleUserStatus = (u: CRMUser) => {
    const nextStatus = u.status === 'Active' ? 'Disabled' : 'Active';
    setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, status: nextStatus } : usr));
    addAuditLog('Admin updated user status', `Set ${u.name} status to ${nextStatus}`);
    dispatch(addToast({ message: `User status changed to ${nextStatus}`, type: "info" }));
  };

  // Filtered Doctors
  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(hcpSearch.toLowerCase()) || 
                          d.hospital.toLowerCase().includes(hcpSearch.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'All' || d.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.specialty)))];

  // Dynamic system stats counters
  const totalVisits = interactions.length;
  const pendingFollowups = interactions.filter(i => i.follow_up_date && !i.follow_up_completed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* 1. Header with Admin Profile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'stretch' }} className="admin-header-grid">
        {/* Profile Details */}
        <Card style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '5px solid var(--primary)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <User size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>
                {currentAdmin?.email === 'admin@healthcrm.ai' ? 'CRM Admin' : (currentAdmin?.email || 'CRM Admin')}
              </h3>
              <span style={{ fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                ADMIN
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{currentAdmin?.email || 'admin@healthcrm.ai'}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', fontWeight: '500' }}>
              Org: <span style={{ fontWeight: '700' }}>MedLink Health Systems</span>
            </p>
          </div>
        </Card>

        {/* Profile Metadata */}
        <Card style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }} className="admin-meta-row">
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase' }}>User Level</span>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--secondary)', marginTop: '4px' }}>System Administrator</h4>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)', height: '40px' }} />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase' }}>Last Login Session</span>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--primary)" /> Today, 09:00 AM
            </h4>
          </div>
        </Card>
      </div>

      {/* 2. System Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        <div style={statCardStyle}>
          <div style={{ ...statIconStyle, background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <UserCheck size={18} />
          </div>
          <div>
            <h5 style={statLabelStyle}>Total Doctors</h5>
            <p style={statValStyle}>{doctors.length}</p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ ...statIconStyle, background: '#EEF2FF', color: '#4F46E5' }}>
            <Users size={18} />
          </div>
          <div>
            <h5 style={statLabelStyle}>Total Users</h5>
            <p style={statValStyle}>{users.length}</p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ ...statIconStyle, background: 'var(--success-light)', color: 'var(--success)' }}>
            <ClipboardList size={18} />
          </div>
          <div>
            <h5 style={statLabelStyle}>Logged Visits</h5>
            <p style={statValStyle}>{totalVisits}</p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ ...statIconStyle, background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <CalendarClock size={18} />
          </div>
          <div>
            <h5 style={statLabelStyle}>Pending Follow-ups</h5>
            <p style={statValStyle}>{pendingFollowups}</p>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ ...statIconStyle, background: '#ECFEFF', color: '#0891B2' }}>
            <Activity size={18} />
          </div>
          <div>
            <h5 style={statLabelStyle}>AI Chats Today</h5>
            <p style={statValStyle}>42</p>
          </div>
        </div>
      </div>



      {/* 4. HCP Management Grid (Form on Left, Table on Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px' }} className="admin-hcp-split">
        {/* Left Form Panel */}
        <Card style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', alignSelf: 'start' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)' }}>
            {isEditingHCP ? <Edit2 size={16} color="var(--primary)" /> : <Plus size={18} color="var(--primary)" />}
            {isEditingHCP ? `Edit Doctor Details` : `Add New Physician`}
          </h4>

          <form onSubmit={handleHCPSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Doctor Name *</label>
              <input 
                type="text" 
                placeholder="e.g. Dr. Arthur Pendragon" 
                style={inputStyle}
                value={hcpForm.name}
                onChange={e => setHcpForm({...hcpForm, name: e.target.value})}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Hospital *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mercy General" 
                  style={inputStyle}
                  value={hcpForm.hospital}
                  onChange={e => setHcpForm({...hcpForm, hospital: e.target.value})}
                />
              </div>
              <div>
                <label style={labelStyle}>Specialty *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Oncology" 
                  style={inputStyle}
                  value={hcpForm.specialty}
                  onChange={e => setHcpForm({...hcpForm, specialty: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input 
                  type="email" 
                  placeholder="name@hospital.org" 
                  style={inputStyle}
                  value={hcpForm.email}
                  onChange={e => setHcpForm({...hcpForm, email: e.target.value})}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input 
                  type="text" 
                  placeholder="555-0100" 
                  style={inputStyle}
                  value={hcpForm.phone}
                  onChange={e => setHcpForm({...hcpForm, phone: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>City *</label>
                <input 
                  type="text" 
                  placeholder="Houston" 
                  style={inputStyle}
                  value={hcpForm.city}
                  onChange={e => setHcpForm({...hcpForm, city: e.target.value})}
                />
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <input 
                  type="text" 
                  placeholder="TX" 
                  style={inputStyle}
                  value={hcpForm.state}
                  onChange={e => setHcpForm({...hcpForm, state: e.target.value})}
                />
              </div>
            </div>

            {/* Products Assigned Chips */}
            <div>
              <label style={labelStyle}>Products Assigned *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {["CardioGuard", "BetaBlock", "NeuroMax", "OsteoShield", "GastroZole", "Dermacure"].map(prod => {
                  const isSelected = hcpForm.products.includes(prod);
                  return (
                    <button
                      key={prod}
                      type="button"
                      onClick={() => toggleProduct(prod)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        border: '1px solid ' + (isSelected ? 'var(--primary)' : 'var(--border)'),
                        background: isSelected ? 'var(--primary-light)' : 'transparent',
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                    >
                      {prod}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Initial Score (0-100)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  style={inputStyle}
                  value={hcpForm.engagementScore}
                  onChange={e => setHcpForm({...hcpForm, engagementScore: Number(e.target.value)})}
                />
              </div>
              <div>
                <label style={labelStyle}>Risk category</label>
                <select 
                  style={inputStyle}
                  value={hcpForm.riskCategory}
                  onChange={e => setHcpForm({...hcpForm, riskCategory: e.target.value as any})}
                >
                  <option value="Low Risk">Low Risk</option>
                  <option value="Medium Risk">Medium Risk</option>
                  <option value="At Churn Risk">At Churn Risk</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select
                style={inputStyle}
                value={hcpForm.status}
                onChange={e => setHcpForm({...hcpForm, status: e.target.value as any})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="submit" 
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--primary)', color: '#FFFFFF', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
              >
                {isEditingHCP ? 'Save Changes' : 'Add HCP'}
              </button>
              <button 
                type="button" 
                onClick={handleClearForm}
                style={{ padding: '10px 16px', borderRadius: '8px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </form>
        </Card>

        {/* Right Table Panel */}
        <Card style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>Existing Physician Directory</h4>
            
            {/* Table filters */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px' }} color="var(--text-light)" />
                <input 
                  type="text" 
                  placeholder="Search doctors..." 
                  style={{ padding: '6px 12px 6px 30px', fontSize: '12.5px', border: '1px solid var(--border)', borderRadius: '8px', width: '160px' }}
                  value={hcpSearch}
                  onChange={e => setHcpSearch(e.target.value)}
                />
              </div>

              <select
                style={{ padding: '6px 12px', fontSize: '12.5px', border: '1px solid var(--border)', borderRadius: '8px' }}
                value={specialtyFilter}
                onChange={e => setSpecialtyFilter(e.target.value)}
              >
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>
                  <th style={{ padding: '10px 8px' }}>Doctor Name</th>
                  <th style={{ padding: '10px 8px' }}>Hospital</th>
                  <th style={{ padding: '10px 8px' }}>Specialty</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px' }}>Score</th>
                  <th style={{ padding: '10px 8px' }}>Risk</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doctor => (
                    <tr key={doctor.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '12px 8px', fontWeight: '700', color: 'var(--secondary)' }}>{doctor.name}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{doctor.hospital}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ fontSize: '11px', background: '#F8FAFC', color: 'var(--secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                          {doctor.specialty}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: (doctor.status === 'Inactive' ? 'var(--text-light)' : 'var(--success)')
                        }}>
                          {doctor.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700' }}>{doctor.engagement_score}</span>
                          <div style={{ width: '40px', height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${doctor.engagement_score}%`, height: '100%', background: doctor.engagement_score >= 80 ? 'var(--success)' : (doctor.engagement_score >= 65 ? 'var(--warning)' : 'var(--danger)') }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: doctor.risk_alert === 'At Churn Risk' ? 'var(--danger-light)' : (doctor.risk_alert === 'Medium Risk' ? 'var(--warning-light)' : 'var(--success-light)'),
                          color: doctor.risk_alert === 'At Churn Risk' ? 'var(--danger)' : (doctor.risk_alert === 'Medium Risk' ? 'var(--warning)' : 'var(--success)')
                        }}>
                          {doctor.risk_alert}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => setSelectedHCP(doctor)} title="View Details" style={actionBtnStyle}>
                            <Eye size={13} />
                          </button>
                          <button onClick={() => handleEditHCPClick(doctor)} title="Edit Profile" style={actionBtnStyle}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteHCPClick(doctor)} title="Delete Profile" style={{ ...actionBtnStyle, color: 'var(--danger)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)' }}>
                      No doctor records matched your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* 5. User Management & Audit Log Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px' }} className="admin-users-split">
        {/* User Management */}
        <Card style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>CRM User Directory</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>Role-based user registrations and login permissions.</p>
            </div>
            <button 
              onClick={() => {
                setEditingUser(null);
                setUserForm({ name: '', role: 'Medical Representative', email: '', status: 'Active' });
                setShowUserModal(true);
              }}
              style={{ padding: '6px 12px', background: 'var(--primary-light)', border: 'none', borderRadius: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Plus size={14} /> Create User
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>
                  <th style={{ padding: '10px 8px' }}>User Name</th>
                  <th style={{ padding: '10px 8px' }}>Role</th>
                  <th style={{ padding: '10px 8px' }}>Email Address</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '700', color: 'var(--secondary)' }}>{u.name}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ fontSize: '11px', background: u.role === 'Administrator' ? '#EEF2FF' : '#FFF1F2', color: u.role === 'Administrator' ? '#4F46E5' : '#E11D48', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: u.status === 'Active' ? 'var(--success)' : 'var(--text-light)'
                      }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleEditUserClick(u)} title="Edit User" style={actionBtnStyle}>
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleToggleUserStatus(u)} 
                          title={u.status === 'Active' ? 'Disable User' : 'Enable User'} 
                          style={{
                            ...actionBtnStyle,
                            color: u.status === 'Active' ? 'var(--danger)' : 'var(--success)'
                          }}
                        >
                          {u.status === 'Active' ? <AlertOctagon size={12} /> : <Check size={12} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Audit Log Timeline */}
        <Card style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={18} color="var(--primary)" /> System Audit Log
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, maxHeight: '300px', paddingRight: '4px' }}>
            {auditLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', gap: '12px', borderLeft: '2px solid var(--border)', paddingLeft: '16px', position: 'relative' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', position: 'absolute', left: '-5px', top: '4px' }} />
                <div>
                  <h6 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--secondary)' }}>{log.action}</h6>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>{log.details}</p>
                  <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Clock size={10} /> {log.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 6. View Details Modal */}
      {selectedHCP && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>Physician Comprehensive Profile</h3>
              <button onClick={() => setSelectedHCP(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>
                <p style={detailLabelStyle}>Name</p>
                <p style={detailValStyle}>{selectedHCP.name}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Specialty</p>
                <p style={detailValStyle}>{selectedHCP.specialty}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Hospital</p>
                <p style={detailValStyle}>{selectedHCP.hospital}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Email</p>
                <p style={detailValStyle}>{selectedHCP.email || 'N/A'}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Phone</p>
                <p style={detailValStyle}>{selectedHCP.phone || 'N/A'}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>City / State</p>
                <p style={detailValStyle}>{(selectedHCP.city || 'N/A') + ' / ' + (selectedHCP.state || 'N/A')}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Products Assigned</p>
                <p style={detailValStyle}>{selectedHCP.products_assigned || 'None'}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Engagement Score</p>
                <p style={{ ...detailValStyle, fontWeight: '800', color: 'var(--primary)' }}>{selectedHCP.engagement_score}%</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Risk Alert Level</p>
                <p style={detailValStyle}>{selectedHCP.risk_alert}</p>
              </div>
              <div>
                <p style={detailLabelStyle}>Status</p>
                <p style={detailValStyle}>{selectedHCP.status || 'Active'}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedHCP(null)}
              style={{ width: '100%', marginTop: '20px', padding: '10px', background: 'var(--primary)', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* 7. Create/Edit User Modal */}
      {showUserModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--secondary)' }}>
                {editingUser ? 'Edit User Credentials' : 'Create New CRM User'}
              </h3>
              <button onClick={() => setShowUserModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUserFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>User Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Doe" 
                  style={inputStyle}
                  value={userForm.name}
                  onChange={e => setUserForm({...userForm, name: e.target.value})}
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input 
                  type="email" 
                  placeholder="jdoe@healthcrm.ai" 
                  style={inputStyle}
                  value={userForm.email}
                  onChange={e => setUserForm({...userForm, email: e.target.value})}
                />
              </div>

              <div>
                <label style={labelStyle}>Role Permissions</label>
                <select
                  style={inputStyle}
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value as any})}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Medical Representative">Medical Representative</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Account Status</label>
                <select
                  style={inputStyle}
                  value={userForm.status}
                  onChange={e => setUserForm({...userForm, status: e.target.value as any})}
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  Save User
                </button>
                <button type="button" onClick={() => setShowUserModal(false)} style={{ padding: '10px 16px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Styling structures matching app guidelines
const statCardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  padding: '16px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  border: '1px solid var(--border)'
};

const statIconStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-light)',
  fontWeight: '600',
  textTransform: 'uppercase'
};

const statValStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '800',
  color: 'var(--secondary)',
  marginTop: '2px'
};

const aiConfigCardStyle: React.CSSProperties = {
  padding: '14px 20px',
  background: '#FFFFFF',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  border: '1px solid var(--border)'
};

const badgeStyle: React.CSSProperties = {
  padding: '3px 8px',
  borderRadius: '12px',
  fontSize: '10.5px',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};

const labelStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: 'var(--text-muted)',
  fontWeight: '600',
  display: 'block',
  marginBottom: '4px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  fontSize: '13px',
  fontWeight: '500',
  outline: 'none',
  boxSizing: 'border-box'
};

const actionBtnStyle: React.CSSProperties = {
  padding: '6px',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  background: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  transition: 'all 0.2s'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  background: '#FFFFFF',
  padding: '24px',
  borderRadius: '16px',
  width: '420px',
  maxWidth: '90%',
  boxShadow: 'var(--shadow-lg)'
};

const detailLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-light)',
  fontWeight: '600',
  textTransform: 'uppercase'
};

const detailValStyle: React.CSSProperties = {
  fontSize: '13.5px',
  color: 'var(--secondary)',
  fontWeight: '600',
  marginTop: '2px'
};

export default AdminPanel;
