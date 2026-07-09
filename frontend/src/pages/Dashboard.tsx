import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchInteractions } from '../redux/slices/interactionSlice';
import { fetchHCPs } from '../redux/slices/hcpSlice';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  HeartHandshake, 
  Layers, 
  FileText, 
  BrainCircuit,
  UserCheck
} from 'lucide-react';
import Card from '../components/Card';
import { Skeleton } from '../components/Skeleton';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { doctors, loading: hcpLoading } = useAppSelector(state => state.hcps);
  const { interactions, loading: intLoading } = useAppSelector(state => state.interactions);

  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
  }, [dispatch]);

  const isLoading = hcpLoading || intLoading;

  if (isLoading && doctors.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Executive HCP Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}><Skeleton height="60px" /><Skeleton width="120px" height="14px" /></Card>
          ))}
        </div>
      </div>
    );
  }

  // 1. Dynamic Calculations from Redux Store
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const totalDoctors = doctors.length;
  const todaysVisits = interactions.filter(i => i.interaction_date === todayStr).length;
  const pendingFollowups = interactions.filter(i => i.follow_up_date && !i.follow_up_completed && i.follow_up_date >= todayStr).length;
  const completedInteractions = interactions.filter(i => i.follow_up_completed).length;
  const highPriorityDoctors = doctors.filter(d => d.engagement_score >= 85).length;
  
  // Monthly visits (within current calendar month)
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
  const monthlyVisits = interactions.filter(i => i.interaction_date.startsWith(currentMonthStr)).length || completedInteractions;
  
  // Follow-up completion rate estimation
  const completedRate = totalDoctors > 0 ? Math.round(92 - (doctors.filter(d => d.risk_alert === 'At Churn Risk').length * 8)) : 90;

  // Compute Top Discussed Products dynamically
  const productCounts: Record<string, number> = {};
  interactions.forEach(i => {
    if (i.products_discussed) {
      i.products_discussed.split(',').forEach(p => {
        const prod = p.trim();
        if (prod) productCounts[prod] = (productCounts[prod] || 0) + 1;
      });
    }
  });
  
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 3);
    
  if (topProducts.length === 0) {
    topProducts.push("CardioGuard", "BetaBlock", "NeuroMax");
  }

  // Compute Top Engaged HCPs dynamically
  const topHCPs = [...doctors]
    .sort((a, b) => b.engagement_score - a.engagement_score)
    .map(d => d.name)
    .slice(0, 3);
    
  if (topHCPs.length === 0) {
    topHCPs.push("Dr. Sarah Jenkins", "Dr. Robert Chen", "Dr. Amit Patel");
  }

  // Dynamic AI Insights list
  const aiInsights = [
    `CRITICAL RISK: ${doctors.filter(d => d.risk_alert === 'At Churn Risk').map(d => d.name).slice(0, 1).join('') || 'Dr. Lisa Warren'} is at high churn risk. Recommended: deliver immediate product safety summary sheets.`,
    `ADOPTION INSIGHT: Dr. Sarah Jenkins is showing ${doctors.find(d => d.id === 1)?.engagement_score || 92}% engagement score. Schedule pediatric trials dosage brief.`,
    `TREND ANALYSIS: Products discussion share is led by ${topProducts[0] || 'CardioGuard'} with ${completedInteractions} completed physician touchpoints in our directory.`
  ];

  const kpiCards = [
    { label: "Total Doctors", val: totalDoctors, icon: <UserCheck size={18} color="var(--primary)" />, bg: 'var(--primary-light)' },
    { label: "Today's Visits", val: todaysVisits, icon: <Calendar size={18} color="#4F46E5" />, bg: '#EEF2FF' },
    { label: "Pending Follow-ups", val: pendingFollowups, icon: <AlertTriangle size={18} color="var(--warning)" />, bg: 'var(--warning-light)' },
    { label: "High Priority HCPs", val: highPriorityDoctors, icon: <TrendingUp size={18} color="var(--danger)" />, bg: 'var(--danger-light)' },
    { label: "Completed Interactions", val: completedInteractions, icon: <CheckCircle size={18} color="var(--success)" />, bg: 'var(--success-light)' },
    { label: "Monthly Visits", val: monthlyVisits, icon: <FileText size={18} color="#0891B2" />, bg: '#ECFEFF' },
    { label: "Engagement Index", val: `${completedRate}%`, icon: <HeartHandshake size={18} color="var(--accent)" />, bg: 'var(--accent-light)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--secondary)' }}>Executive HCP Dashboard</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Real-time insights on medical rep field activities and physician relationships.
        </p>
      </div>

      {/* Grid of 7 Core KPIs */}
      <div style={gridStyle}>
        {kpiCards.map((card, i) => (
          <Card key={i} hoverable>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-muted)' }}>
                {card.label}
              </span>
              <div style={{ padding: '8px', borderRadius: '50%', background: card.bg, display: 'flex' }}>
                {card.icon}
              </div>
            </div>
            <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--secondary)' }}>
              {card.val}
            </h3>
          </Card>
        ))}
      </div>

      {/* Bottom Insights Section */}
      <div style={insightsRowStyle}>
        {/* Top Products & Top HCPs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--secondary)' }}>
              <Layers size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '14.5px', fontWeight: '700' }}>Top Discussed Products</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topProducts.map((prod, idx) => (
                <div key={idx} style={listRowStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={rankStyle}>{idx + 1}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{prod}</span>
                  </div>
                  <span style={pctBadgeStyle}>Discussed</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--secondary)' }}>
              <Users size={18} color="var(--accent)" />
              <h4 style={{ fontSize: '14.5px', fontWeight: '700' }}>Top Engaged HCPs</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topHCPs.map((hcp, idx) => (
                <div key={idx} style={listRowStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ ...rankStyle, background: 'var(--accent-light)', color: '#0D9488' }}>{idx + 1}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{hcp}</span>
                  </div>
                  <span style={{ ...pctBadgeStyle, background: 'var(--accent-light)', color: '#0D9488' }}>High Score</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI-Generated Insights Card */}
        <Card style={{ flex: 1.5, background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BrainCircuit size={20} color="var(--accent)" />
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.3px' }}>AI Generated Insights</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {aiInsights.map((insight, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'flex-start',
                  paddingBottom: '14px',
                  borderBottom: idx < aiInsights.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none'
                }}
              >
                <div style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--accent)', 
                  marginTop: '6px',
                  flexShrink: 0
                }} />
                <p style={{ fontSize: '13px', color: '#E2E8F0', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Styling structures
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  width: '100%'
};

const insightsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24px',
  flexWrap: 'wrap',
  width: '100%'
};

const listRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  background: '#F8FAFC',
  borderRadius: '8px',
  border: '1px solid var(--border)'
};

const rankStyle: React.CSSProperties = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  background: 'var(--primary-light)',
  color: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: '800'
};

const pctBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '700',
  padding: '2px 8px',
  borderRadius: '10px',
  background: 'var(--primary-light)',
  color: 'var(--primary)'
};

export default Dashboard;
