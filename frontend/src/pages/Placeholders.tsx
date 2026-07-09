import React from 'react';
import Card from '../components/Card';
import { Settings as SettingsIcon } from 'lucide-react';


export const Settings: React.FC = () => {
  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}><SettingsIcon size={20} color="var(--text-muted)" /> CRM Settings & Configurations</h2>
      <Card style={cardStyle}>
        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Integration Parameters</h4>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Configure API keys, model fallbacks (Gemma-2-9b vs Llama-3.3-70b), CORS endpoints, and PostgreSQL connections.
        </p>
      </Card>
    </div>
  );
};

const containerStyle = { display: 'flex', flexDirection: 'column' as const, gap: '24px' };
const titleStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '800', color: 'var(--secondary)' };
const cardStyle = { padding: '24px', background: '#FFFFFF', borderRadius: '16px' };
