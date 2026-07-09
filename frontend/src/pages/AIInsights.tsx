import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../redux/store';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  BarChart3, 
  Calendar, 
  Users, 
  Zap, 
  ChevronRight, 
  TrendingDown,
  Activity,
  Heart,
  ArrowRight
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { getRiskColorClass } from '../utils/helpers';

export const AIInsights: React.FC = () => {
  const { hcps } = useAppSelector(state => state.interactions);
  const [loading, setLoading] = useState(true);

  // Simulate premium database compile loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <Skeleton width="200px" height="24px" />
          <Skeleton width="340px" height="14px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          {[1, 2, 3].map(i => <Card key={i}><Skeleton height="120px" /></Card>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <Card><Skeleton height="240px" /></Card>
          <Card><Skeleton height="240px" /></Card>
        </div>
      </div>
    );
  }

  // Sentiment metrics calculations
  const sentimentStats = { positive: 68, neutral: 22, negative: 10 };
  
  // Radial Chart Calculations
  const radius = 32;
  const circumference = 2 * Math.PI * radius;

  // Mock Trend Chart Data coordinates
  // Jan (40), Feb (45), Mar (58), Apr (72), May (68), Jun (85), Jul (92)
  const linePoints = "0,140 60,130 120,105 180,75 240,82 300,50 360,35";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Page Header */}
      <div style={headerContainerStyle}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', fontSize: '22px', fontWeight: '800', color: 'var(--secondary)' }}>
            <span>HCP INSIGHTS</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Executive sales insights, medical adoption scores, and clinical churn predictions.
          </p>
        </div>


      </div>

      {/* Row 1: Radials + Line Trend + Sentiment */}
      <div style={rowGrid3Style}>
        
        {/* Card 1: Predictive Engagement Radials */}
        <Card hoverable style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={cardTitleContainerStyle}>
            <TrendingUp size={16} color="var(--accent)" />
            <span style={cardTitleStyle}>PREDICTIVE ENGAGEMENT METRIC</span>
          </div>
          
          <div style={radialContainerStyle}>
            {[
              { name: 'Dr. Jenkins', score: 92, color: 'var(--accent)' },
              { name: 'Dr. Chen', score: 85, color: 'var(--primary)' },
              { name: 'Dr. Patel', score: 78, color: 'var(--warning)' }
            ].map((d, i) => {
              const strokeOffset = circumference - (d.score / 100) * circumference;
              return (
                <div key={i} style={radialItemStyle}>
                  <div style={{ position: 'relative', width: '72px', height: '72px' }}>
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r={radius} fill="transparent" stroke="#F1F5F9" strokeWidth="4.5" />
                      <circle 
                        cx="36" 
                        cy="36" 
                        r={radius} 
                        fill="transparent" 
                        stroke={d.color} 
                        strokeWidth="4.5" 
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 36 36)"
                      />
                    </svg>
                    <span style={radialNumberStyle}>{d.score}%</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)', marginTop: '8px', textAlign: 'center' }}>
                    {d.name}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Card 2: SVG Line Chart for Engagement Trends */}
        <Card hoverable style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={cardTitleContainerStyle}>
            <Activity size={16} color="var(--primary)" />
            <span style={cardTitleStyle}>MONTHLY ENGAGEMENT TREND</span>
          </div>

          <div style={{ flex: 1, position: 'relative', height: '140px', marginTop: '10px' }}>
            <svg viewBox="0 0 360 150" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="35" x2="360" y2="35" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="360" y2="75" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="115" x2="360" y2="115" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Trend line */}
              <polyline fill="url(#chart-grad)" stroke="none" points={`0,150 ${linePoints} 360,150`} />
              <polyline fill="none" stroke="var(--primary)" strokeWidth="3" points={linePoints} strokeLinecap="round" />
              
              {/* Dots on line */}
              {[[0, 140], [60, 130], [120, 105], [180, 75], [240, 82], [300, 50], [360, 35]].map((pt, i) => (
                <circle key={i} cx={pt[0]} cy={pt[1]} r="4" fill="#FFFFFF" stroke="var(--primary)" strokeWidth="2.5" />
              ))}
            </svg>
          </div>
          <div style={chartLabelsContainerStyle}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((m, i) => (
              <span key={i} style={chartLabelStyle}>{m}</span>
            ))}
          </div>
        </Card>

        {/* Card 3: Sentiment Distribution */}
        <Card hoverable style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={cardTitleContainerStyle}>
            <Heart size={16} color="var(--danger)" />
            <span style={cardTitleStyle}>CLINICAL SENTIMENT ANALYSIS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', flex: 1, justifyContent: 'center' }}>
            {[
              { label: 'Positive Feedback', val: sentimentStats.positive, color: 'var(--success)' },
              { label: 'Neutral Inquiry', val: sentimentStats.neutral, color: 'var(--primary)' },
              { label: 'Negative / Delays', val: sentimentStats.negative, color: 'var(--danger)' }
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ color: 'var(--secondary)' }}>{item.val}%</span>
                </div>
                <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.val}%`, background: item.color, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: HCP Leaderboard + Churn Risk Table */}
      <div style={rowGrid2Style}>
        
        {/* Left: Doctors At Risk Table */}
        <Card style={{ flex: 1.8 }}>
          <div style={{ ...cardTitleContainerStyle, marginBottom: '16px' }}>
            <AlertTriangle size={16} color="var(--danger)" />
            <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--secondary)' }}>HCP Engagement Alert (At Risk)</h4>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>HCP NAME</th>
                  <th style={thStyle}>SPECIALTY</th>
                  <th style={thStyle}>HOSPITAL</th>
                  <th style={thStyle}>ENGAGEMENT</th>
                  <th style={thStyle}>ALERT BADGE</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Dr. Lisa Warren', spec: 'Neurology', hosp: 'St. Luke Medical Center', score: 64, alert: 'At Churn Risk' },
                  { name: 'Dr. Robert Chen', spec: 'Oncology', hosp: 'St. Jude Cancer Care', score: 85, alert: 'Medium Risk' },
                  { name: 'Dr. Amit Patel', spec: 'Pediatrics', hosp: 'Metro General Hospital', score: 78, alert: 'Low Risk' }
                ].map((item, idx) => (
                  <tr key={idx} style={tableRowStyle}>
                    <td style={{ ...tdStyle, fontWeight: '700', color: 'var(--secondary)' }}>{item.name}</td>
                    <td style={tdStyle}>{item.spec}</td>
                    <td style={tdStyle}>{item.hosp}</td>
                    <td style={{ ...tdStyle, fontWeight: '800', color: 'var(--primary)' }}>{item.score}/100</td>
                    <td style={tdStyle}>
                      <span className={getRiskColorClass(item.alert)} style={riskBadgeStyle}>
                        {item.alert}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right: Top Performing HCPs Leaderboard */}
        <Card style={{ flex: 1 }}>
          <div style={{ ...cardTitleContainerStyle, marginBottom: '16px' }}>
            <Users size={16} color="var(--accent)" />
            <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--secondary)' }}>Adoption Leaderboard</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { rank: 1, name: 'Dr. Sarah Jenkins', specialty: 'Cardiology', score: 96, label: 'Super Adopter' },
              { rank: 2, name: 'Dr. Robert Chen', specialty: 'Oncology', score: 88, label: 'Key Opinion Leader' },
              { rank: 3, name: 'Dr. Amit Patel', specialty: 'Pediatrics', score: 82, label: 'Active User' }
            ].map((h, i) => (
              <div key={i} style={leaderboardItemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={leaderboardRankStyle(h.rank)}>{h.rank}</div>
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>{h.name}</h5>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{h.specialty}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--accent)' }}>{h.score}%</span>
                  <span style={leaderboardBadgeStyle}>{h.label}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Next Best Actions + Product Discussion Trends */}
      <div style={rowGrid2Style}>
        
        {/* Left: AI Generated Next Best Actions */}
        <Card style={{ flex: 1.2 }}>
          <div style={{ ...cardTitleContainerStyle, marginBottom: '16px' }}>
            <Zap size={16} color="var(--accent)" />
            <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--secondary)' }}>AI Generated Next Best Actions</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { task: 'Send CardioGuard Pediatric Dosage Pamphlet', target: 'Dr. Sarah Jenkins', timeline: 'Due in 2 days', urgency: 'High' },
              { task: 'Email Tolerability study review on BetaBlock', target: 'Dr. Robert Chen', timeline: 'Due in 4 days', urgency: 'Medium' },
              { task: 'Arrange demo kit shipment for child syringes', target: 'Dr. Amit Patel', timeline: 'Due in 6 days', urgency: 'Low' }
            ].map((t, idx) => (
              <div key={idx} style={nbaCardStyle(t.urgency)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>{t.task}</h5>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '500' }}>
                    Recipient: <strong style={{ color: 'var(--text-main)' }}>{t.target}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: t.urgency === 'High' ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {t.timeline}
                  </span>
                  <button style={nbaActionStyle}>
                    <span>Execute</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Product Discussion Trends */}
        <Card style={{ flex: 1 }}>
          <div style={{ ...cardTitleContainerStyle, marginBottom: '16px' }}>
            <BarChart3 size={16} color="var(--primary)" />
            <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--secondary)' }}>Product Discussion Share</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {[
              { product: 'CardioGuard', percent: 45, count: '18 discussions', growth: '+14% MoM' },
              { product: 'BetaBlock', percent: 30, count: '12 discussions', growth: '+8% MoM' },
              { product: 'NeuroMax', percent: 15, count: '6 discussions', growth: '-4% MoM' },
              { product: 'OsteoShield', percent: 10, count: '4 discussions', growth: '+2% MoM' }
            ].map((p, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--secondary)' }}>{p.product}</span>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '10.5px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{p.count}</span>
                    <span style={{ color: p.growth.startsWith('+') ? 'var(--success)' : 'var(--danger)', fontWeight: '700' }}>
                      {p.growth}
                    </span>
                  </div>
                </div>
                <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.percent}%`, background: 'var(--primary)', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 4: Weekly Recommendations + Upcoming Critical Follow-ups */}
      <div style={rowGrid2Style}>
        
        {/* Left: Weekly AI Recommendations */}
        <Card style={{ flex: 1, background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF', border: 'none' }}>
          <div style={{ ...cardTitleContainerStyle, marginBottom: '20px' }}>
            <Sparkles size={16} color="var(--accent)" />
            <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: '#FFFFFF' }}>Weekly Strategic AI Recommendations</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              "Leverage CardioGuard pediatric trial details for Dr. Sarah Jenkins. Focus on placebo comparison figures.",
              "Address safety concern logs about elderly fatigue rates before scheduling Dr. Chen's next presentation.",
              "Resolve syringe shipping delay flags escalated by neurology reps to prevent St. Luke account churn."
            ].map((rec, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={recBulletStyle}>•</span>
                <p style={{ fontSize: '12.5px', color: '#E2E8F0', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>{rec}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Upcoming Critical Follow-ups */}
        <Card style={{ flex: 1 }}>
          <div style={{ ...cardTitleContainerStyle, marginBottom: '16px' }}>
            <Calendar size={16} color="var(--primary)" />
            <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--secondary)' }}>Critical Follow-ups Scheduled</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { date: 'July 14, 2026', hcp: 'Dr. Sarah Jenkins', task: 'Pediatric Pamphlet Delivery' },
              { date: 'July 20, 2026', hcp: 'Dr. Robert Chen', task: 'BetaBlock Tolerability Review' }
            ].map((f, i) => (
              <div key={i} style={followupBoxStyle}>
                <div style={followupDatePillStyle}>
                  <Calendar size={12} color="var(--primary)" />
                  <span>{f.date}</span>
                </div>
                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>{f.hcp}</h5>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>{f.task}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <style>{`
        .crm-card {
          box-shadow: var(--shadow-sm);
        }
        .crm-card:hover {
          box-shadow: var(--shadow-lg) !important;
          border-color: #CBD5E1 !important;
        }
        .badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

// Styling structures
const headerContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
  width: '100%'
};

const modelBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: '#E0F2FE',
  border: '1px solid #bae6fd',
  borderRadius: '20px',
  padding: '6px 14px',
  fontSize: '11.5px',
  fontWeight: '600',
  color: '#0369a1'
};

const rowGrid3Style: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  width: '100%'
};

const rowGrid2Style: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap',
  width: '100%'
};

const cardTitleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--secondary)',
  marginBottom: '12px'
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.5px'
};

const radialContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  flex: 1,
  padding: '10px 0'
};

const radialItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const radialNumberStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '12px',
  fontWeight: '800',
  color: 'var(--secondary)'
};

const chartLabelsContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 8px',
  marginTop: '4px',
  borderTop: '1px solid var(--border)',
  paddingTop: '6px'
};

const chartLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '600',
  color: 'var(--text-light)'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border)',
  background: '#F8FAFC'
};

const thStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontSize: '10px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.3px'
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border)',
  transition: 'background var(--transition-fast)'
};

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  fontSize: '12.5px',
  color: 'var(--text-main)'
};

const riskBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '700',
  padding: '2px 8px',
  borderRadius: '12px',
  display: 'inline-block'
};

const leaderboardItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 14px',
  background: '#F8FAFC',
  borderRadius: '10px',
  border: '1px solid var(--border)'
};

const leaderboardRankStyle = (rank: number) => {
  const bg = rank === 1 ? 'var(--accent-light)' : (rank === 2 ? 'var(--primary-light)' : '#F1F5F9');
  const color = rank === 1 ? '#0D9488' : (rank === 2 ? 'var(--primary)' : 'var(--text-muted)');
  return {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: bg,
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '800' as const
  };
};

const leaderboardBadgeStyle: React.CSSProperties = {
  fontSize: '9.5px',
  fontWeight: '700',
  color: 'var(--text-muted)'
};

const nbaCardStyle = (urgency: string) => {
  const borderLeft = urgency === 'High' ? '3px solid var(--danger)' : (urgency === 'Medium' ? '3px solid var(--warning)' : '3px solid var(--primary)');
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderLeft,
    borderRadius: '10px',
    gap: '12px'
  };
};

const nbaActionStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: 'var(--primary-light)',
  border: 'none',
  borderRadius: '6px',
  padding: '4px 10px',
  color: 'var(--primary)',
  fontSize: '11px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)'
};

const followupBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '10px 14px',
  border: '1px solid var(--border)',
  borderRadius: '10px',
  background: '#FCFDFE'
};

const followupDatePillStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 12px',
  background: 'var(--primary-light)',
  borderRadius: '8px',
  color: 'var(--primary)',
  fontSize: '10.5px',
  fontWeight: '700',
  gap: '4px',
  minWidth: '90px'
};

const recBulletStyle: React.CSSProperties = {
  fontSize: '18px',
  color: 'var(--accent)',
  lineHeight: '1'
};

export default AIInsights;
