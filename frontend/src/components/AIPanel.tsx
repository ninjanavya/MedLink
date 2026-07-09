import React from 'react';
import { useAppSelector } from '../redux/store';
import { ShieldAlert, Award, Calendar, Activity, Zap, CheckSquare, Sparkles, Heart } from 'lucide-react';
import { getSentimentColor, getRiskColorClass } from '../utils/helpers';
import { AIPanelSkeleton } from './Skeleton';

export const AIPanel: React.FC = () => {
  const chatState = useAppSelector(state => state.chat);
  const {
    doctorDetails,
    productsMentioned,
    sentiment,
    priorityScore,
    nextBestAction,
    recentInsights,
    riskAlert,
    visitFrequency,
    engagementScore,
    summary,
    aiProcessing
  } = chatState;

  if (aiProcessing) {
    return (
      <div style={panelContainerStyle} className="ai-panel-container">
        <div style={headerStyle}>
          <Sparkles size={16} color="var(--accent)" />
          <h3 style={{ fontSize: '15px', fontWeight: '700' }}>AI INSIGHTS & ANALYTICS</h3>
        </div>
        <AIPanelSkeleton />
      </div>
    );
  }

  // Calculate circular SVG stroke dasharray for the engagement score
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (engagementScore / 100) * circumference;

  return (
    <div style={panelContainerStyle} className="ai-panel-container">
      <div style={headerStyle}>
        <Sparkles size={16} color="var(--accent)" />
        <h3 style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px' }}>AI ENGINE INSIGHTS</h3>
      </div>

      {/* 1. Doctor Header Info */}
      <div style={doctorBlockStyle}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--secondary)', marginBottom: '4px' }}>
            {doctorDetails.name || 'Select a Doctor'}
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '2px' }}>
            {specialtyIconMap(doctorDetails.specialty)} {doctorDetails.specialty}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '500' }}>
            🏥 {doctorDetails.hospital}
          </p>
        </div>

        {/* Radial Engagement Score Gauge */}
        <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={radius} fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
            <circle 
              cx="28" 
              cy="28" 
              r={radius} 
              fill="transparent" 
              stroke="var(--accent)" 
              strokeWidth="4" 
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 28 28)"
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', fontSize: '11px', fontWeight: '800', color: 'var(--secondary)' }}>
            {engagementScore}
          </div>
        </div>
      </div>

      {/* 2. Advanced Metrics Grid */}
      <div style={metricsGridStyle}>
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
            <Calendar size={12} />
            <span>FREQUENCY</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>
            {visitFrequency || '1.5x / month'}
          </span>
        </div>

        <div style={metricCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
            <ShieldAlert size={12} />
            <span>RISK LEVEL</span>
          </div>
          <span className={getRiskColorClass(riskAlert)} style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
            {riskAlert || 'Low Risk'}
          </span>
        </div>
      </div>

      {/* 3. AI Summary Card */}
      <div style={sectionBoxStyle}>
        <div style={sectionTitleStyle}>
          <Zap size={14} color="var(--primary)" />
          <span>REAL-TIME VISIT SUMMARY</span>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
          {summary || 'AI is listening. Logs, notes, or chat discussions will be summarized here in real-time.'}
        </p>
      </div>

      {/* 4. Products & Sentiment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={lightCardStyle}>
          <span style={subLabelStyle}>SENTIMENT</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getSentimentColor(sentiment) }} />
            <span style={{ fontSize: '13px', fontWeight: '700', color: getSentimentColor(sentiment) }}>
              {sentiment || 'Neutral'}
            </span>
          </div>
        </div>

        <div style={lightCardStyle}>
          <span style={subLabelStyle}>PRIORITY SCORE</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: priorityScore >= 75 ? 'var(--danger)' : 'var(--primary)' }}>
              {priorityScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* 5. Products Mentioned */}
      <div style={sectionBoxStyle}>
        <span style={subLabelStyle}>PRODUCTS DISCUSSED</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          {productsMentioned.length > 0 ? (
            productsMentioned.map((prod, index) => (
              <span key={index} style={productChipStyle}>
                {prod}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>No products identified</span>
          )}
        </div>
      </div>

      {/* 6. Next Best Action */}
      <div style={{ ...sectionBoxStyle, borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
        <div style={{ ...sectionTitleStyle, color: 'var(--accent)' }}>
          <CheckSquare size={14} />
          <span>NEXT BEST ACTION</span>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-main)', lineHeight: '1.5', margin: 0, fontWeight: '600' }}>
          {nextBestAction || 'No pending follow-ups scheduled.'}
        </p>
      </div>

      {/* 7. Recent AI Insights */}
      <div style={{ ...sectionBoxStyle, marginBottom: 0 }}>
        <span style={subLabelStyle}>RECENT CLINICAL INSIGHTS</span>
        <ul style={insightsListStyle}>
          {recentInsights.length > 0 ? (
            recentInsights.map((insight, index) => (
              <li key={index} style={insightItemStyle}>
                {insight}
              </li>
            ))
          ) : (
            <li style={{ color: 'var(--text-light)', fontStyle: 'italic', listStyleType: 'none', marginLeft: 0 }}>No historical insights loaded</li>
          )}
        </ul>
      </div>
    </div>
  );
};

// Helpers for specialties icons
const specialtyIconMap = (specialty?: string) => {
  switch (specialty?.toLowerCase()) {
    case 'cardiology':
      return '❤️';
    case 'oncology':
      return '🔬';
    case 'pediatrics':
      return '👶';
    case 'neurology':
      return '🧠';
    default:
      return '🩺';
  }
};

// Styled objects
const panelContainerStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-premium)',
  padding: '24px',
  width: '380px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflowY: 'auto'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--secondary)',
  paddingBottom: '16px',
  borderBottom: '1px solid var(--border)',
  marginBottom: '20px'
};

const doctorBlockStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'var(--primary-light)',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '16px'
};

const metricsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: '16px'
};

const metricCardStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
};

const sectionBoxStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px',
  marginBottom: '16px',
  background: '#FCFDFE'
};

const sectionTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--primary)',
  marginBottom: '8px',
  letterSpacing: '0.3px'
};

const lightCardStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '12px',
  background: '#FFFFFF'
};

const subLabelStyle: React.CSSProperties = {
  fontSize: '10.5px',
  fontWeight: '700',
  color: 'var(--text-muted)',
  letterSpacing: '0.3px'
};

const productChipStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  padding: '4px 10px',
  borderRadius: '12px',
  background: 'var(--accent-light)',
  color: '#0D9488',
  border: '1px solid rgba(20, 184, 166, 0.2)'
};

const insightsListStyle: React.CSSProperties = {
  marginTop: '8px',
  paddingLeft: '16px',
  fontSize: '12px',
  color: 'var(--text-main)',
  lineHeight: '1.6'
};

const insightItemStyle: React.CSSProperties = {
  marginBottom: '6px',
  fontWeight: '500'
};

export default AIPanel;
