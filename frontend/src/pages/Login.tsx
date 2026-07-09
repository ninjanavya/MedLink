import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { loginUser } from '../redux/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  User,
  Lock,
  Eye,
  EyeOff,
  BriefcaseMedical,
  Building2,
} from 'lucide-react';
import Button from '../components/Button';
import { MedLinkLogo } from '../components/MedLinkLogo';

/* ─── Loading sequence steps ─── */
const LOAD_STEPS = [
  'Connecting to MedLink...',
  'Authenticating...',
  'Loading Doctor Profiles...',
  'Preparing Dashboard...',
  'Welcome Back!',
];

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isAuthenticated, error } = useAppSelector(state => state.auth);

  const [selectedRole, setSelectedRole] = useState<'Administrator' | 'Medical Representative'>('Administrator');
  const [email, setEmail] = useState('admin@healthcrm.ai');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  const [showProgress, setShowProgress] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  /* ─── Submit → loading sequence ─── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setShowProgress(true);
    setProgressStep(0);
    setTimeout(() => setProgressStep(1), 600);
    setTimeout(() => setProgressStep(2), 1200);
    setTimeout(() => setProgressStep(3), 1800);
    setTimeout(() => setProgressStep(4), 2400);
    setTimeout(() => dispatch(loginUser({ email, md5Pass: password })), 3000);
  };

  /* ─── Role change ─── */
  const handleRoleChange = (role: 'Administrator' | 'Medical Representative') => {
    setSelectedRole(role);
    if (role === 'Administrator') {
      setEmail('admin@healthcrm.ai');
      setPassword('admin123');
    } else {
      setEmail('rep@healthcrm.ai');
      setPassword('rep123');
    }
  };

  /* ════════════════════════════════════
     LOADING SCREEN
  ════════════════════════════════════ */
  if (showProgress) {
    const pct = Math.round(((progressStep + 1) / LOAD_STEPS.length) * 100);
    const isDone = progressStep === LOAD_STEPS.length - 1;
    return (
      <div style={containerStyle} className="login-root">
        <BgIllustrations />
        <div style={cardStyle} className="fade-in">
          <div style={progressScreenInner}>
            {/* Animated logo pulse */}
            <div style={logoPulseWrap} className={isDone ? 'logo-done' : 'logo-spin-wrap'}>
              <div style={logoPulseRing} className="pulse-ring" />
              <MedLinkLogo size={38} color="#0F766E" />
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={progressLabelStyle} className="step-text">
                {LOAD_STEPS[progressStep]}
              </p>
              <div style={progressTrackStyle}>
                <div
                  style={{
                    ...progressFillStyle,
                    width: `${pct}%`,
                    background: isDone
                      ? 'linear-gradient(90deg, #0F766E, #10B981)'
                      : '#0F766E',
                  }}
                />
              </div>
              <p style={progressPctStyle}>{pct}%</p>
            </div>
          </div>
        </div>
        <GlobalStyles />
      </div>
    );
  }

  /* ════════════════════════════════════
     MAIN LOGIN PAGE
  ════════════════════════════════════ */
  return (
    <div style={containerStyle} className="login-root">
      <BgIllustrations />

      {/* Central teal radial glow behind card */}
      <div style={cardGlowStyle} />

      {/* ── Glassmorphism card ── */}
      <div style={cardStyle} className="fade-in login-card">
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoCircle}>
            <MedLinkLogo size={28} color="#0F766E" />
          </div>
          <h1 style={brandTitle}>MedLink</h1>
          <p style={brandSubtitle}>Intelligent Healthcare Engagement System</p>
        </div>

        {/* Error */}
        {error && (
          <div style={errorBannerStyle}>
            <ShieldAlert size={15} color="var(--danger)" />
            <span>{error}</span>
          </div>
        )}

        {/* Role cards */}
        <div style={roleGridStyle}>
          <RoleCard
            active={selectedRole === 'Administrator'}
            onClick={() => handleRoleChange('Administrator')}
            label="Administrator"
            features={['Manages doctors', 'Analytics', 'CRM settings']}
            icon={<Building2 size={16} color={selectedRole === 'Administrator' ? '#0F766E' : '#94A3B8'} />}
          />
          <RoleCard
            active={selectedRole === 'Medical Representative'}
            onClick={() => handleRoleChange('Medical Representative')}
            label="Medical Rep"
            features={['Visit logging', 'Follow-ups', 'Interaction history']}
            icon={<BriefcaseMedical size={16} color={selectedRole === 'Medical Representative' ? '#0F766E' : '#94A3B8'} />}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <FloatInput
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<User size={15} color="#94A3B8" />}
          />
          <div style={{ position: 'relative' }}>
            <FloatInput
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock size={15} color="#94A3B8" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              style={pwToggleStyle}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="continue-btn"
            style={continueBtnStyle}
          >
            Continue →
          </Button>
        </form>
      </div>

      <GlobalStyles />
    </div>
  );
};

export default Login;

/* ════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════ */

/** Role selection card */
const RoleCard: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  features: string[];
  icon: React.ReactNode;
}> = ({ active, onClick, label, features, icon }) => (
  <div
    onClick={onClick}
    className={`role-card ${active ? 'role-card--active' : ''}`}
    style={roleCardBase(active)}
  >
    <div style={roleCardTop}>
      <div style={roleIconBadge(active)}>{icon}</div>
      <div style={radioOuter(active)}>
        {active && <div style={radioInner} />}
      </div>
    </div>
    <span style={roleLabelStyle(active)}>{label}</span>
    <ul style={roleFeatures}>
      {features.map(f => (
        <li key={f} style={roleFeatureItem(active)}>
          <span style={{ color: active ? '#0F766E' : '#CBD5E1', marginRight: 5, fontSize: 10 }}>▸</span>
          {f}
        </li>
      ))}
    </ul>
  </div>
);

/** Floating-label style input wrapper */
const FloatInput: React.FC<{
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}> = ({ type, placeholder, value, onChange, icon }) => (
  <div className="float-input-wrap" style={floatInputWrap}>
    <span style={inputIconStyle}>{icon}</span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={inputBase}
      className="premium-input"
      required
    />
  </div>
);

/**
 * Enterprise SaaS background — abstract network nodes + ECG segments.
 * Everything lives inside one full-viewport SVG at 4–8 % opacity.
 * Two slow-drift animation groups (15 s / 20 s) keep it alive without
 * competing with the login card.
 */
const BgIllustrations: React.FC = () => (
  <>
    {/* ── Large soft radial teal glow centred behind the card ── */}
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '680px', height: '680px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(15,118,110,0.07) 0%, rgba(20,184,166,0.03) 40%, transparent 70%)',
      filter: 'blur(60px)',
      pointerEvents: 'none',
      zIndex: 0,
    }} />

    {/* ── Corner accent glows ── */}
    <div style={{ position:'absolute', top:'-5%', left:'-5%', width:'50vw', height:'50vh', borderRadius:'50%', background:'radial-gradient(circle, rgba(15,118,110,0.035) 0%, transparent 65%)', filter:'blur(70px)', pointerEvents:'none', zIndex:0 }} />
    <div style={{ position:'absolute', bottom:'-5%', right:'-5%', width:'45vw', height:'45vh', borderRadius:'50%', background:'radial-gradient(circle, rgba(20,184,166,0.04) 0%, transparent 65%)', filter:'blur(70px)', pointerEvents:'none', zIndex:0 }} />

    {/* ── Full-viewport network SVG ── */}
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }}
      aria-hidden="true"
    >
      <defs>
        {/* Reusable node: small filled circle + faint halo */}
        <g id="node-a">
          <circle r="3.5" fill="#0F766E" opacity="0.55" />
          <circle r="7" fill="none" stroke="#0F766E" strokeWidth="0.8" opacity="0.25" />
        </g>
        <g id="node-b">
          <circle r="2.5" fill="#14B8A6" opacity="0.5" />
          <circle r="5.5" fill="none" stroke="#14B8A6" strokeWidth="0.7" opacity="0.22" />
        </g>
        <g id="node-c">
          <circle r="4.5" fill="none" stroke="#0F766E" strokeWidth="1" opacity="0.35" />
          <circle r="2" fill="#0F766E" opacity="0.4" />
        </g>
      </defs>

      {/* ════ GROUP A — drifts slowly up-left (15 s) ════ */}
      <g className="net-drift-a" opacity="0.06">
        {/* Long spine lines across the canvas */}
        <line x1="80"  y1="180" x2="420" y2="310" stroke="#0F766E" strokeWidth="0.9" />
        <line x1="420" y1="310" x2="680" y2="210" stroke="#0F766E" strokeWidth="0.9" />
        <line x1="680" y1="210" x2="980" y2="370" stroke="#0F766E" strokeWidth="0.9" />
        <line x1="980" y1="370" x2="1300" y2="260" stroke="#0F766E" strokeWidth="0.9" />
        {/* Branch spurs */}
        <line x1="420" y1="310" x2="360" y2="480" stroke="#0F766E" strokeWidth="0.7" strokeDasharray="5 4" />
        <line x1="680" y1="210" x2="720" y2="420" stroke="#0F766E" strokeWidth="0.7" strokeDasharray="5 4" />
        <line x1="980" y1="370" x2="940" y2="560" stroke="#0F766E" strokeWidth="0.7" strokeDasharray="5 4" />
        {/* Second tier */}
        <line x1="360" y1="480" x2="720" y2="420" stroke="#14B8A6" strokeWidth="0.7" />
        <line x1="720" y1="420" x2="940" y2="560" stroke="#14B8A6" strokeWidth="0.7" />
        <line x1="940" y1="560" x2="1200" y2="500" stroke="#14B8A6" strokeWidth="0.7" strokeDasharray="6 4" />
        {/* Third tier — lower */}
        <line x1="200" y1="650" x2="500" y2="720" stroke="#0F766E" strokeWidth="0.7" strokeDasharray="4 5" />
        <line x1="500" y1="720" x2="820" y2="660" stroke="#0F766E" strokeWidth="0.7" strokeDasharray="4 5" />
        <line x1="820" y1="660" x2="1100" y2="740" stroke="#0F766E" strokeWidth="0.7" strokeDasharray="4 5" />
        <line x1="1100" y1="740" x2="1380" y2="680" stroke="#0F766E" strokeWidth="0.7" strokeDasharray="4 5" />
        {/* Cross-links */}
        <line x1="360" y1="480" x2="200" y2="650" stroke="#14B8A6" strokeWidth="0.6" strokeDasharray="3 6" />
        <line x1="720" y1="420" x2="500" y2="720" stroke="#14B8A6" strokeWidth="0.6" strokeDasharray="3 6" />
        <line x1="940" y1="560" x2="820" y2="660" stroke="#14B8A6" strokeWidth="0.6" strokeDasharray="3 6" />
        <line x1="1200" y1="500" x2="1100" y2="740" stroke="#14B8A6" strokeWidth="0.6" strokeDasharray="3 6" />

        {/* ── Nodes ── */}
        <use href="#node-a" transform="translate(80,180)" />
        <use href="#node-b" transform="translate(420,310)" />
        <use href="#node-c" transform="translate(680,210)" />
        <use href="#node-a" transform="translate(980,370)" />
        <use href="#node-b" transform="translate(1300,260)" />
        <use href="#node-c" transform="translate(360,480)" />
        <use href="#node-a" transform="translate(720,420)" />
        <use href="#node-b" transform="translate(940,560)" />
        <use href="#node-c" transform="translate(1200,500)" />
        <use href="#node-b" transform="translate(200,650)" />
        <use href="#node-a" transform="translate(500,720)" />
        <use href="#node-c" transform="translate(820,660)" />
        <use href="#node-b" transform="translate(1100,740)" />
        <use href="#node-a" transform="translate(1380,680)" />

        {/* ── ECG micro-segment embedded in upper spine ── */}
        <polyline
          points="440,305 452,295 458,318 466,288 474,310 480,305"
          fill="none" stroke="#0F766E" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"
        />
        <polyline
          points="700,205 712,195 718,218 726,185 734,208 740,205"
          fill="none" stroke="#14B8A6" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>

      {/* ════ GROUP B — drifts slowly down-right (20 s, offset) ════ */}
      <g className="net-drift-b" opacity="0.05">
        {/* Upper-right cluster */}
        <line x1="1050" y1="80"  x2="1260" y2="180" stroke="#0F766E" strokeWidth="0.8" />
        <line x1="1260" y1="180" x2="1420" y2="120" stroke="#0F766E" strokeWidth="0.8" />
        <line x1="1050" y1="80"  x2="1120" y2="260" stroke="#14B8A6" strokeWidth="0.7" strokeDasharray="5 4" />
        <line x1="1260" y1="180" x2="1350" y2="340" stroke="#14B8A6" strokeWidth="0.7" strokeDasharray="5 4" />
        <line x1="1120" y1="260" x2="1350" y2="340" stroke="#0F766E" strokeWidth="0.6" />
        <use href="#node-c" transform="translate(1050,80)" />
        <use href="#node-a" transform="translate(1260,180)" />
        <use href="#node-b" transform="translate(1420,120)" />
        <use href="#node-b" transform="translate(1120,260)" />
        <use href="#node-c" transform="translate(1350,340)" />

        {/* Lower-left cluster */}
        <line x1="40"  y1="780" x2="180" y2="840" stroke="#0F766E" strokeWidth="0.8" />
        <line x1="180" y1="840" x2="380" y2="800" stroke="#0F766E" strokeWidth="0.8" />
        <line x1="380" y1="800" x2="520" y2="860" stroke="#14B8A6" strokeWidth="0.7" strokeDasharray="5 4" />
        <line x1="40"  y1="780" x2="120" y2="680" stroke="#14B8A6" strokeWidth="0.7" strokeDasharray="5 4" />
        <line x1="120" y1="680" x2="380" y2="800" stroke="#0F766E" strokeWidth="0.6" />
        <use href="#node-b" transform="translate(40,780)" />
        <use href="#node-a" transform="translate(180,840)" />
        <use href="#node-c" transform="translate(380,800)" />
        <use href="#node-b" transform="translate(520,860)" />
        <use href="#node-a" transform="translate(120,680)" />

        {/* Geometric pentagon ring — top-left area */}
        <polygon
          points="130,100 190,70 250,100 250,160 190,190 130,160"
          fill="none" stroke="#0F766E" strokeWidth="0.7" strokeDasharray="4 5"
        />
        <circle cx="190" cy="130" r="2.5" fill="#0F766E" opacity="0.5" />

        {/* Geometric triangle — bottom-right */}
        <polygon
          points="1280,760 1360,820 1200,820"
          fill="none" stroke="#14B8A6" strokeWidth="0.7" strokeDasharray="4 5"
        />
        <circle cx="1280" cy="800" r="2" fill="#14B8A6" opacity="0.45" />

        {/* ECG micro-segment embedded in lower spine */}
        <polyline
          points="195,835 207,825 213,848 221,815 229,838 235,835"
          fill="none" stroke="#0F766E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
        />
      </g>

      {/* ── Subtle horizontal rule lines for depth ── */}
      <g opacity="0.03">
        <line x1="0" y1="220" x2="1440" y2="220" stroke="#0F766E" strokeWidth="0.6" />
        <line x1="0" y1="460" x2="1440" y2="460" stroke="#0F766E" strokeWidth="0.6" />
        <line x1="0" y1="700" x2="1440" y2="700" stroke="#0F766E" strokeWidth="0.6" />
      </g>
    </svg>
  </>
);

/* ════════════════════════════════════════
   GLOBAL STYLES (injected once)
════════════════════════════════════════ */
const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    .login-root {
      font-family: 'Inter', sans-serif;
      background-color: #F8FAFC;
      background-image:
        radial-gradient(rgba(15,118,110,0.045) 1.4px, transparent 1.4px);
      background-size: 26px 26px;
    }

    /* ── Animations ── */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    /* Extremely slow network drifts — enterprise SaaS feel */
    @keyframes netDriftA {
      0%,100% { transform: translate(0px, 0px); }
      25%     { transform: translate(-4px, -6px); }
      50%     { transform: translate(-7px, -3px); }
      75%     { transform: translate(-3px, -7px); }
    }
    @keyframes netDriftB {
      0%,100% { transform: translate(0px, 0px); }
      25%     { transform: translate(5px, 4px); }
      50%     { transform: translate(3px, 8px); }
      75%     { transform: translate(6px, 3px); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulseRing {
      0%   { transform: scale(0.9); opacity: 0.6; }
      70%  { transform: scale(1.5); opacity: 0; }
      100% { transform: scale(0.9); opacity: 0; }
    }

    .fade-in    { animation: fadeInUp 0.65s cubic-bezier(0.16,1,0.3,1) both; }
    /* 15 s and 20 s — almost imperceptibly slow, premium SaaS motion */
    .net-drift-a { animation: netDriftA 15s ease-in-out infinite; }
    .net-drift-b { animation: netDriftB 20s ease-in-out infinite 3s; }

    /* ── Login card hover lift ── */
    .login-card {
      transition: transform 0.35s ease, box-shadow 0.35s ease !important;
    }
    .login-card:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 32px 60px -20px rgba(15,118,110,0.14), 0 0 0 1px rgba(15,118,110,0.06) !important;
    }

    /* ── Role card hover ── */
    .role-card {
      transition: all 0.22s cubic-bezier(0.16,1,0.3,1) !important;
    }
    .role-card:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 20px -6px rgba(15,118,110,0.10) !important;
    }
    .role-card--active {
      box-shadow: 0 6px 18px -4px rgba(15,118,110,0.14) !important;
    }

    /* ── Inputs ── */
    .premium-input {
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease !important;
    }
    .premium-input:focus {
      border-color: #0F766E !important;
      box-shadow: 0 0 0 3px rgba(15,118,110,0.10), 0 4px 12px rgba(15,118,110,0.05) !important;
      transform: translateY(-1px) !important;
      outline: none !important;
    }

    /* ── Continue button ── */
    .continue-btn {
      transition: all 0.25s cubic-bezier(0.16,1,0.3,1) !important;
    }
    .continue-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #0d9488, #10B981) !important;
      transform: translateY(-1px) scale(1.01) !important;
      box-shadow: 0 10px 24px -6px rgba(15,118,110,0.28) !important;
    }
    .continue-btn:active:not(:disabled) {
      transform: scale(0.985) !important;
    }

    /* ── Progress screen ── */
    .step-text {
      animation: fadeInUp 0.4s ease both;
    }
    .logo-spin-wrap svg {
      animation: spin 3s linear infinite;
    }
    .logo-done svg {
      animation: none;
    }
    .pulse-ring {
      animation: pulseRing 1.8s ease-out infinite;
    }
  `}</style>
);

/* ════════════════════════════════════════
   STYLE OBJECTS
════════════════════════════════════════ */
const containerStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  overflow: 'hidden',
  zIndex: 99999,
};

const glow: React.CSSProperties = {
  position: 'absolute',
  borderRadius: '50%',
  pointerEvents: 'none',
  filter: 'blur(50px)',
};



const cardGlowStyle: React.CSSProperties = {
  position: 'absolute',
  width: '480px',
  height: '480px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(15,118,110,0.08) 0%, transparent 65%)',
  filter: 'blur(40px)',
  pointerEvents: 'none',
  zIndex: 1,
};

const cardStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  width: '100%',
  maxWidth: '448px',
  background: 'rgba(255,255,255,0.88)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(226,232,240,0.9)',
  borderRadius: '24px',
  padding: '40px 38px 36px',
  boxShadow: '0 24px 48px -16px rgba(15,118,110,0.09), 0 1px 4px rgba(0,0,0,0.03)',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '28px',
};

const logoCircle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 52,
  height: 52,
  borderRadius: '14px',
  background: 'rgba(15,118,110,0.06)',
  border: '1px solid rgba(15,118,110,0.12)',
  marginBottom: '12px',
};

const brandTitle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '800',
  color: '#0F766E',
  letterSpacing: '-0.6px',
  margin: '0 0 4px',
};

const brandSubtitle: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#64748B',
  fontWeight: '500',
  margin: 0,
  letterSpacing: '0.1px',
};

const errorBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(239,68,68,0.05)',
  border: '1px solid rgba(239,68,68,0.18)',
  borderRadius: '10px',
  padding: '10px 14px',
  color: 'var(--danger)',
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '18px',
};

const roleGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: '24px',
};

const roleCardBase = (active: boolean): React.CSSProperties => ({
  background: active ? 'rgba(15,118,110,0.04)' : '#FAFAFA',
  border: active ? '1.8px solid #0F766E' : '1px solid #E2E8F0',
  borderRadius: '14px',
  padding: '14px',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  userSelect: 'none',
});

const roleCardTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
};

const roleIconBadge = (active: boolean): React.CSSProperties => ({
  width: 30,
  height: 30,
  borderRadius: '8px',
  background: active ? 'rgba(15,118,110,0.10)' : 'rgba(148,163,184,0.10)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const radioOuter = (active: boolean): React.CSSProperties => ({
  width: 14,
  height: 14,
  borderRadius: '50%',
  border: active ? '4px solid #0F766E' : '1.5px solid #CBD5E1',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  flexShrink: 0,
});

const radioInner: React.CSSProperties = {
  width: 4,
  height: 4,
  borderRadius: '50%',
  background: '#fff',
};

const roleLabelStyle = (active: boolean): React.CSSProperties => ({
  fontSize: '12.5px',
  fontWeight: '700',
  color: active ? '#0F766E' : '#0F172A',
  letterSpacing: '-0.1px',
});

const roleFeatures: React.CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const roleFeatureItem = (active: boolean): React.CSSProperties => ({
  fontSize: '10.5px',
  color: active ? '#0F766E' : '#94A3B8',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.2s',
});

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const floatInputWrap: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const inputIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '14px',
  pointerEvents: 'none',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
};

const inputBase: React.CSSProperties = {
  width: '100%',
  height: '46px',
  padding: '0 14px 0 42px',
  borderRadius: '10px',
  border: '1.5px solid #E2E8F0',
  fontSize: '13.5px',
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const pwToggleStyle: React.CSSProperties = {
  position: 'absolute',
  right: '14px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#94A3B8',
  display: 'flex',
  alignItems: 'center',
  padding: 0,
  zIndex: 1,
};

const continueBtnStyle: React.CSSProperties = {
  height: '46px',
  width: '100%',
  marginTop: '6px',
  fontSize: '14px',
  fontWeight: '700',
  background: '#0F766E',
  color: '#FFFFFF',
  borderRadius: '10px',
  border: 'none',
  cursor: 'pointer',
  letterSpacing: '0.2px',
  boxShadow: '0 4px 10px -2px rgba(15,118,110,0.18)',
};

/* ── Progress screen ── */
const progressScreenInner: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '28px',
  minHeight: '280px',
};

const logoPulseWrap: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 70,
  height: 70,
};

const logoPulseRing: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  border: '2.5px solid rgba(15,118,110,0.4)',
};

const progressLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#0F766E',
  marginBottom: '14px',
  minHeight: '20px',
  letterSpacing: '-0.1px',
};

const progressTrackStyle: React.CSSProperties = {
  width: '180px',
  height: '3px',
  background: '#E2E8F0',
  borderRadius: '99px',
  overflow: 'hidden',
  position: 'relative',
  margin: '0 auto',
};

const progressFillStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  height: '100%',
  borderRadius: '99px',
  transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1), background 0.4s ease',
};

const progressPctStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#94A3B8',
  marginTop: '8px',
  fontWeight: '600',
  textAlign: 'center',
};
