import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { 
  updateDraft, 
  clearDraft, 
  createInteraction, 
  loadInteractionIntoDraft 
} from '../redux/slices/interactionSlice';
import { 
  sendChatMessage, 
  saveExtractedPreview, 
  discardPreview, 
  updatePreviewField,
  clearChat
} from '../redux/slices/chatSlice';
import { addToast } from '../redux/slices/toastSlice';
import { MockInteraction } from '../utils/mockData';
import { 
  Mic, 
  Send, 
  Paperclip, 
  FileSpreadsheet, 
  Sparkles, 
  Check, 
  FileCheck,
  Play,
  ChevronDown,
  ChevronUp,
  Download,
  ClipboardCheck,
  Target,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { FormField } from '../components/FormField';
import Button from '../components/Button';
import Card from '../components/Card';
import AIPanel from '../components/AIPanel';
import Timeline from '../components/Timeline';
import { fetchHCPs } from '../redux/slices/hcpSlice';

// Import specialties/hospitals lists for prefill helper
import { SPECIALTIES_LIST, HOSPITALS_LIST, PRODUCTS_LIST } from '../utils/mockData';

export const LogInteraction: React.FC = () => {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(state => state.interactions.currentDraft);
  const draftSavedTime = useAppSelector(state => state.interactions.draftLastSaved);
  const { messages, aiProcessing, extractedPreview } = useAppSelector(state => state.chat);
  const { doctors } = useAppSelector(state => state.hcps);
  
  const [activeTab, setActiveTab] = useState<'form' | 'chat'>('form');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── AI Summary state ──────────────────────────────────────
  interface VisitSummary {
    summary: string;
    keyPoints: string[];
    sentiment: string;
    followUps: string[];
  }
  const [visitSummary, setVisitSummary]   = useState<VisitSummary | null>(null);
  const [nextActions, setNextActions]     = useState<string[]>([]);
  const [summaryOpen, setSummaryOpen]     = useState(true);
  const [actionsOpen, setActionsOpen]     = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<typeof draft | null>(null);
  // ─────────────────────────────────────────────────────────
  
  // Voice Input state
  const [isRecording, setIsRecording] = useState(false);
  const [recordWave, setRecordWave]   = useState<number[]>([]);
  const waveInterval = useRef<any>(null);

  // Fetch doctors on mount
  useEffect(() => {
    dispatch(fetchHCPs());
  }, [dispatch]);

  // File Attach state
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Chat Input state
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiProcessing]);

  // Simulate audio wave if recording
  useEffect(() => {
    if (isRecording) {
      waveInterval.current = setInterval(() => {
        setRecordWave(Array.from({ length: 15 }, () => Math.floor(Math.random() * 24) + 4));
      }, 100);
    } else {
      if (waveInterval.current) clearInterval(waveInterval.current);
      setRecordWave([]);
    }
    return () => {
      if (waveInterval.current) clearInterval(waveInterval.current);
    };
  }, [isRecording]);

  // Form Field change handler
  const handleFormChange = (fields: Partial<typeof draft>) => {
    dispatch(updateDraft(fields));
    // Clear validation error on type
    const key = Object.keys(fields)[0];
    if (key && errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  // Product Selection handler
  const handleProductToggle = (prod: string) => {
    const list = [...draft.products_discussed];
    if (list.includes(prod)) {
      handleFormChange({ products_discussed: list.filter(p => p !== prod) });
    } else {
      handleFormChange({ products_discussed: [...list, prod] });
    }
  };

  // ── AI Summary generators ────────────────────────────────
  const generateAISummary = (data: typeof draft): VisitSummary => {
    const prods = data.products_discussed.length
      ? data.products_discussed.join(', ')
      : 'general portfolio';
    const sentimentMap: Record<string, string> = {
      High: 'Very Positive — Strong engagement and receptivity observed.',
      Medium: 'Positive — Moderate interest with room for further development.',
      Low: 'Neutral — Initial contact; relationship building recommended.',
    };
    return {
      summary: `${data.interaction_type} visit with ${data.hcp_name} (${data.specialty}) at ${data.hospital} on ${data.interaction_date}. Discussion centred on ${prods}. ${
        data.notes
          ? data.notes.slice(0, 120) + (data.notes.length > 120 ? '…' : '')
          : 'No additional notes were recorded for this visit.'
      }`,
      keyPoints: [
        `Discussed ${prods} with ${data.hcp_name}.`,
        `Visit type: ${data.interaction_type} — conducted at ${data.hospital}.`,
        data.follow_up_date
          ? `Follow-up scheduled for ${data.follow_up_date}.`
          : 'No follow-up date currently assigned.',
        `Priority classification: ${data.priority}.`,
        data.notes ? 'Detailed field notes captured and stored.' : 'No field notes provided.',
      ],
      sentiment: sentimentMap[data.priority] ?? 'Neutral',
      followUps: [
        data.follow_up_date
          ? `Confirm follow-up appointment on ${data.follow_up_date}.`
          : 'Schedule a follow-up call within 7 business days.',
        `Send ${data.hcp_name} the latest ${prods.split(',')[0]} clinical data sheet.`,
        'Share updated product efficacy summary via email.',
        `Coordinate with territory manager regarding ${data.hospital} account status.`,
      ],
    };
  };

  const buildNextActions = (data: typeof draft): string[] => {
    const prods = data.products_discussed.length
      ? data.products_discussed[0]
      : 'key product';
    return [
      `Email ${data.hcp_name} the ${prods} clinical trial brochure within 24 hours.`,
      data.follow_up_date
        ? `Confirm follow-up visit scheduled for ${data.follow_up_date}.`
        : `Schedule a follow-up visit with ${data.hcp_name} within 7 days.`,
      `Share updated ${prods} pricing and reimbursement information.`,
      `Invite ${data.hcp_name} to the upcoming regional clinical symposium.`,
      `Log interaction outcome in CRM and update territory KPIs.`,
    ];
  };
  // ─────────────────────────────────────────────────────────

  // ── Download Visit Report (browser print) ────────────────
  const downloadVisitReport = () => {
    if (!visitSummary || !lastSavedData) return;
    const prods = lastSavedData.products_discussed.join(', ') || 'None';
    const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>MedLink CRM – Visit Report</title>
<style>
  @page { size: A4; margin: 28mm 20mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0F172A; font-size: 11pt; line-height: 1.65; margin: 0; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #0F766E; padding-bottom: 14px; margin-bottom: 22px; }
  .brand { font-size: 20pt; font-weight: 800; color: #0F766E; letter-spacing: -0.5px; }
  .brand-sub { font-size: 9pt; color: #64748B; margin-top: 2px; }
  .report-meta { text-align: right; font-size: 9pt; color: #64748B; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 10pt; font-weight: 700; color: #0F766E; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; margin-bottom: 10px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
  .info-row { display: flex; flex-direction: column; margin-bottom: 4px; }
  .info-label { font-size: 8.5pt; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.4px; }
  .info-value { font-size: 10.5pt; font-weight: 600; color: #0F172A; }
  .summary-box { background: #F0FDFA; border-left: 4px solid #0F766E; padding: 12px 16px; border-radius: 4px; font-size: 10.5pt; }
  .sentiment-badge { display: inline-block; background: #ECFDF5; color: #065F46; font-size: 8.5pt; font-weight: 700; padding: 3px 10px; border-radius: 20px; border: 1px solid #A7F3D0; margin-bottom: 10px; }
  ul { margin: 6px 0 0 0; padding-left: 18px; }
  ul li { margin-bottom: 5px; font-size: 10.5pt; }
  .actions-list { list-style: none; padding: 0; margin: 0; }
  .actions-list li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 7px; font-size: 10.5pt; }
  .action-num { background: #0F766E; color: #fff; font-weight: 700; font-size: 8pt; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .footer { border-top: 1px solid #E2E8F0; padding-top: 10px; font-size: 8.5pt; color: #94A3B8; display: flex; justify-content: space-between; margin-top: 32px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="brand">MedLink CRM</div>
    <div class="brand-sub">AI-Powered Healthcare CRM for HCP Engagement</div>
  </div>
  <div class="report-meta">
    <strong>Visit Report</strong><br/>
    Generated: ${ts}<br/>
    Report ID: MLR-${Date.now().toString(36).toUpperCase()}
  </div>
</div>

<div class="section">
  <div class="section-title">Visit Details</div>
  <div class="info-grid">
    <div class="info-row"><span class="info-label">Doctor / HCP</span><span class="info-value">${lastSavedData.hcp_name}</span></div>
    <div class="info-row"><span class="info-label">Hospital / Clinic</span><span class="info-value">${lastSavedData.hospital}</span></div>
    <div class="info-row"><span class="info-label">Specialty</span><span class="info-value">${lastSavedData.specialty}</span></div>
    <div class="info-row"><span class="info-label">Interaction Type</span><span class="info-value">${lastSavedData.interaction_type}</span></div>
    <div class="info-row"><span class="info-label">Visit Date</span><span class="info-value">${lastSavedData.interaction_date}</span></div>
    <div class="info-row"><span class="info-label">Follow-up Date</span><span class="info-value">${lastSavedData.follow_up_date || 'Not scheduled'}</span></div>
    <div class="info-row"><span class="info-label">Priority</span><span class="info-value">${lastSavedData.priority}</span></div>
    <div class="info-row"><span class="info-label">Products Discussed</span><span class="info-value">${prods}</span></div>
  </div>
</div>

${
  lastSavedData.notes
    ? `<div class="section"><div class="section-title">Discussion Notes</div><p style="font-size:10.5pt;">${lastSavedData.notes}</p></div>`
    : ''
}

<div class="section">
  <div class="section-title">AI Visit Summary</div>
  <div class="sentiment-badge">Sentiment: ${visitSummary.sentiment.split(' — ')[0]}</div>
  <div class="summary-box">${visitSummary.summary}</div>
  <ul style="margin-top:12px;">
    ${visitSummary.keyPoints.map(p => `<li>${p}</li>`).join('')}
  </ul>
</div>

<div class="section">
  <div class="section-title">Required Follow-ups</div>
  <ul>${visitSummary.followUps.map(f => `<li>${f}</li>`).join('')}</ul>
</div>

<div class="section">
  <div class="section-title">Recommended Next Actions</div>
  <ol class="actions-list">
    ${nextActions.map((a, i) => `<li><span class="action-num">${i + 1}</span><span>${a}</span></li>`).join('')}
  </ol>
</div>

<div class="footer">
  <span>Generated by MedLink CRM &nbsp;·&nbsp; Confidential – For Internal Use Only</span>
  <span>${ts}</span>
</div>
</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };
  // ─────────────────────────────────────────────────────────

  // Form Submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    const newErrors: Record<string, string> = {};
    if (!draft.hcp_name.trim()) newErrors.hcp_name = 'HCP Name is required';
    if (!draft.hospital.trim()) newErrors.hospital = 'Hospital Name is required';
    if (!draft.specialty.trim()) newErrors.specialty = 'Specialty is required';
    if (!draft.interaction_date) newErrors.interaction_date = 'Interaction Date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      dispatch(addToast({ message: "Please resolve the required form fields", type: "warning" }));
      return;
    }

    // Snapshot draft before clearing
    const snapshot = { ...draft, products_discussed: [...draft.products_discussed] };

    // Submit
    const formattedData: Omit<MockInteraction, 'id'> = {
      hcp_name: draft.hcp_name,
      hospital: draft.hospital,
      specialty: draft.specialty,
      interaction_type: draft.interaction_type,
      products_discussed: draft.products_discussed.join(', '),
      interaction_date: draft.interaction_date,
      follow_up_date: draft.follow_up_date || undefined,
      priority: draft.priority,
      notes: draft.notes
    };

    try {
      await dispatch(createInteraction(formattedData)).unwrap();
      dispatch(clearDraft());
      setErrors({});

      // ── Trigger AI summary generation ──
      setLastSavedData(snapshot);
      setVisitSummary(null);
      setNextActions([]);
      setSummaryLoading(true);
      setSummaryOpen(true);
      setActionsOpen(true);
      // Simulate LLM latency
      setTimeout(() => {
        setVisitSummary(generateAISummary(snapshot));
        setNextActions(buildNextActions(snapshot));
        setSummaryLoading(false);
        dispatch(addToast({ message: 'AI Visit Summary generated', type: 'success' }));
      }, 1800);
      // ────────────────────────────────────
    } catch (err) {
      // handled inside action toast
    }
  };

  // Chat message submit
  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    dispatch(sendChatMessage(chatInput));
    setChatInput('');
  };

  // Triggered when Rep clicks Edit on a timeline card
  const handleTimelineEditClick = (item: MockInteraction) => {
    dispatch(loadInteractionIntoDraft(item));
    setActiveTab('form');
    // Scroll window to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    dispatch(addToast({ message: "Interaction loaded into Structured Form", type: "info" }));
  };

  // Voice recording simulation
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate input speech translation
      setChatInput("Met with Dr. Sarah Jenkins at City Cardiology Clinic. Discussed CardioGuard dosage pamphlets. She was extremely interested and requested a virtual check-in on July 15.");
      dispatch(addToast({ message: "Speech converted to text successfully", type: "success" }));
    } else {
      setIsRecording(true);
      dispatch(addToast({ message: "Listening... Speak now.", type: "info" }));
    }
  };

  // Attach PDF simulation
  const handleAttachClick = () => {
    if (attachedFile) {
      setAttachedFile(null);
      dispatch(addToast({ message: "File removed", type: "warning" }));
    } else {
      setAttachedFile("clinical_trial_cardio_efficacy_2026.pdf");
      setChatInput(prev => prev + " [File: clinical_trial_cardio_efficacy_2026.pdf] ");
      dispatch(addToast({ message: "clinical_trial_cardio_efficacy_2026.pdf Attached", type: "success" }));
    }
  };

  const suggestedPrompts = [
    "Log meeting with Dr. Jenkins. Discussed CardioGuard. High interest.",
    "Record Oncology virtual review with Dr. Robert Chen regarding BetaBlock placebo tolerability issues.",
    "Lookup historical interaction insights for St. Luke Neurology Clinic."
  ];

  return (
    <div style={pageGridStyle}>
      {/* Left Area (Tabs + Form/Chat + Timeline) */}
      <div style={leftColumnStyle} className="log-left-column">
        
        {/* Main tabs box */}
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          {/* Tab selector header */}
          <div style={tabHeaderStyle}>
            <button 
              onClick={() => setActiveTab('form')}
              style={{
                ...tabBtnStyle,
                borderBottom: activeTab === 'form' ? '2px solid var(--primary)' : 'none',
                color: activeTab === 'form' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <FileSpreadsheet size={16} />
              <span>Structured Form</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('chat')}
              style={{
                ...tabBtnStyle,
                borderBottom: activeTab === 'chat' ? '2px solid var(--primary)' : 'none',
                color: activeTab === 'chat' ? 'var(--primary)' : 'var(--text-muted)'
              }}
            >
              <Sparkles size={16} />
              <span>AI Conversation</span>
            </button>
          </div>

          {/* Tab Content 1: Form */}
          {activeTab === 'form' && (
            <form onSubmit={handleFormSubmit} style={{ padding: '24px' }}>
              <div style={formGridStyle}>
                <FormField label="HCP Name" id="hcp_name" error={errors.hcp_name} required>
                  <input 
                    type="text" 
                    id="hcp_name"
                    value={draft.hcp_name} 
                    placeholder="e.g. Dr. Sarah Jenkins"
                    onChange={e => {
                      const name = e.target.value;
                      const matched = doctors.find(d => d.name.toLowerCase() === name.toLowerCase());
                      if (matched) {
                        handleFormChange({ 
                          hcp_name: name,
                          hospital: matched.hospital,
                          specialty: matched.specialty
                        });
                      } else {
                        handleFormChange({ hcp_name: name });
                      }
                    }}
                    style={formInputStyle}
                    list="hcp-names-list"
                  />
                  <datalist id="hcp-names-list">
                    {doctors.map(d => (
                      <option key={d.id} value={d.name} />
                    ))}
                  </datalist>
                </FormField>

                <FormField label="Hospital / Clinic" id="hospital" error={errors.hospital} required>
                  <input 
                    type="text" 
                    id="hospital"
                    value={draft.hospital} 
                    placeholder="e.g. City Cardiology Clinic"
                    onChange={e => handleFormChange({ hospital: e.target.value })}
                    style={formInputStyle}
                    list="hospitals-options"
                  />
                  <datalist id="hospitals-options">
                    {HOSPITALS_LIST.map(h => <option key={h} value={h} />)}
                  </datalist>
                </FormField>
              </div>

              <div style={formGridStyle}>
                <FormField label="Specialty" id="specialty" error={errors.specialty} required>
                  <select 
                    id="specialty"
                    value={draft.specialty}
                    onChange={e => handleFormChange({ specialty: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="">-- Select Specialty --</option>
                    {SPECIALTIES_LIST.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Interaction Type" id="interaction_type" required>
                  <select 
                    id="interaction_type"
                    value={draft.interaction_type}
                    onChange={e => handleFormChange({ interaction_type: e.target.value })}
                    style={formInputStyle}
                  >
                    <option value="In-Person">In-Person</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                  </select>
                </FormField>
              </div>

              {/* Products Discussed (Pill checkboxes) */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
                  Products Discussed
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PRODUCTS_LIST.map(prod => {
                    const selected = draft.products_discussed.includes(prod);
                    return (
                      <button
                        key={prod}
                        type="button"
                        onClick={() => handleProductToggle(prod)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                          background: selected ? 'var(--primary-light)' : '#FFFFFF',
                          color: selected ? 'var(--primary)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        {prod}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={formGridStyle}>
                <FormField label="Interaction Date" id="interaction_date" error={errors.interaction_date} required>
                  <input 
                    type="date" 
                    id="interaction_date"
                    value={draft.interaction_date}
                    onChange={e => handleFormChange({ interaction_date: e.target.value })}
                    style={formInputStyle}
                  />
                </FormField>

                <FormField label="Follow-up Date" id="follow_up_date">
                  <input 
                    type="date" 
                    id="follow_up_date"
                    value={draft.follow_up_date}
                    onChange={e => handleFormChange({ follow_up_date: e.target.value })}
                    style={formInputStyle}
                  />
                </FormField>
              </div>

              <FormField label="Priority" id="priority">
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                  {['Low', 'Medium', 'High'].map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="priority"
                        value={p}
                        checked={draft.priority === p}
                        onChange={() => handleFormChange({ priority: p as any })}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </FormField>

              <FormField label="Discussion Notes" id="notes">
                <textarea 
                  id="notes"
                  rows={4}
                  value={draft.notes} 
                  placeholder="Record summary of clinic feedback, safety queries, or logistics details discussed..."
                  onChange={e => handleFormChange({ notes: e.target.value })}
                  style={{ ...formInputStyle, height: 'auto', resize: 'vertical', padding: '12px' }}
                />
              </FormField>

              {/* Draft auto save timer display */}
              <div style={draftSaveContainerStyle}>
                {draftSavedTime ? (
                  <span style={saveIndicatorStyle}>
                    <span style={greenDotStyle} />
                    Draft auto-saved at {draftSavedTime}
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '500' }}>No changes drafted yet.</span>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="outline" type="button" onClick={() => dispatch(clearDraft())}>
                    Clear Form
                  </Button>
                  <Button type="submit">
                    Submit Interaction
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Tab Content 2: AI Conversation (Copilot Style) */}
          {activeTab === 'chat' && (
            <div style={chatWrapperStyle}>
              {/* Chat bubbles list */}
              <div style={messagesBoxStyle}>
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                      width: '100%',
                      marginBottom: '16px'
                    }}
                  >
                    <div 
                      style={{
                        padding: '12px 18px',
                        borderRadius: '16px',
                        maxWidth: '80%',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        fontWeight: '500',
                        backgroundColor: m.role === 'user' ? 'var(--primary)' : 'var(--background)',
                        color: m.role === 'user' ? '#FFFFFF' : 'var(--text-main)',
                        border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        borderTopRightRadius: m.role === 'user' ? '2px' : '16px',
                        borderTopLeftRadius: m.role === 'assistant' ? '2px' : '16px',
                      }}
                    >
                      {m.content}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px', padding: '0 4px', fontWeight: '600' }}>
                      {m.role === 'user' ? 'Representative' : 'AI Assistant'}
                    </span>
                  </div>
                ))}

                {/* AI Shimmer typist */}
                {aiProcessing && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', padding: '12px 20px', borderRadius: '16px', background: 'var(--background)', border: '1px solid var(--border)' }}>
                      <span className="dot" style={{ animation: 'bounce 1s infinite', animationDelay: '0s' }} />
                      <span className="dot" style={{ animation: 'bounce 1s infinite', animationDelay: '0.2s' }} />
                      <span className="dot" style={{ animation: 'bounce 1s infinite', animationDelay: '0.4s' }} />
                      <style>{`
                        .dot {
                          width: 6px;
                          height: 6px;
                          background-color: var(--text-muted);
                          border-radius: 50%;
                          display: inline-block;
                        }
                        @keyframes bounce {
                          0%, 100% { transform: translateY(0); }
                          50% { transform: translateY(-4px); }
                        }
                      `}</style>
                    </div>
                  </div>
                )}

                {/* Extracted Entity Preview Box inside Chat Console */}
                {extractedPreview && (
                  <Card style={{ margin: '12px 0 24px 0', border: '1px solid var(--accent)', background: 'var(--accent-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#0D9488' }}>
                      <FileCheck size={18} />
                      <h5 style={{ fontSize: '13px', fontWeight: '700' }}>AI Structured Interaction Preview</h5>
                    </div>

                    <div style={previewGridStyle}>
                      <div>
                        <span style={previewLabelStyle}>HCP Name</span>
                        <input 
                          type="text" 
                          value={extractedPreview.hcp_name}
                          onChange={e => dispatch(updatePreviewField({ hcp_name: e.target.value }))}
                          style={previewInputStyle}
                        />
                      </div>
                      <div>
                        <span style={previewLabelStyle}>Hospital</span>
                        <input 
                          type="text" 
                          value={extractedPreview.hospital}
                          onChange={e => dispatch(updatePreviewField({ hospital: e.target.value }))}
                          style={previewInputStyle}
                        />
                      </div>
                      <div>
                        <span style={previewLabelStyle}>Specialty</span>
                        <input 
                          type="text" 
                          value={extractedPreview.specialty}
                          onChange={e => dispatch(updatePreviewField({ specialty: e.target.value }))}
                          style={previewInputStyle}
                        />
                      </div>
                      <div>
                        <span style={previewLabelStyle}>Products</span>
                        <input 
                          type="text" 
                          value={extractedPreview.products_discussed}
                          onChange={e => dispatch(updatePreviewField({ products_discussed: e.target.value }))}
                          style={previewInputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid rgba(20,184,166,0.1)', paddingTop: '12px' }}>
                      <Button variant="text" onClick={() => dispatch(discardPreview())} style={{ color: '#0F172A' }}>
                        Discard
                      </Button>
                      <Button onClick={() => dispatch(saveExtractedPreview())} style={{ background: '#0D9488' }}>
                        <Check size={14} />
                        <span>One-Click Save</span>
                      </Button>
                    </div>
                  </Card>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* suggested prompts chips */}
              {messages.length === 1 && (
                <div style={{ padding: '0 24px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>
                    SUGGESTED INTERACTIONS
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {suggestedPrompts.map((p, index) => (
                      <button
                        key={index}
                        onClick={() => { setChatInput(p); dispatch(sendChatMessage(p)); }}
                        style={suggestedPromptBtnStyle}
                      >
                        <Play size={10} color="var(--primary)" />
                        <span style={{ textAlign: 'left' }}>{p}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat action input panel */}
              <div style={chatActionBoxStyle}>
                {isRecording && (
                  <div style={voiceWaveContainerStyle}>
                    <Mic size={16} color="var(--danger)" className="pulse-ai" />
                    <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: '700' }}>Recording audio... Speak now</span>
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '28px' }}>
                      {recordWave.map((h, i) => (
                        <div 
                          key={i} 
                          style={{
                            width: '2px', 
                            height: `${h}px`, 
                            backgroundColor: 'var(--danger)', 
                            borderRadius: '1px',
                            transition: 'height 0.1s ease'
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* File Upload button */}
                  <button 
                    onClick={handleAttachClick}
                    style={{ ...iconBtnStyle, color: attachedFile ? 'var(--accent)' : 'var(--text-light)' }}
                    title={attachedFile ? "Remove attachment" : "Attach clinical trial summary PDF"}
                  >
                    <Paperclip size={18} />
                  </button>

                  <input 
                    type="text" 
                    placeholder={isRecording ? "Voice processing..." : "Met with Dr. Sarah Jenkins regarding CardioGuard..."}
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleChatSend()}
                    disabled={isRecording}
                    style={chatInputFieldStyle}
                  />

                  {/* Mic toggle */}
                  <button 
                    onClick={toggleRecording}
                    style={{ ...iconBtnStyle, color: isRecording ? 'var(--danger)' : 'var(--text-light)' }}
                    title="Translate visit note speech"
                  >
                    <Mic size={18} />
                  </button>

                  {/* Send button */}
                  <button 
                    onClick={handleChatSend}
                    disabled={!chatInput.trim()}
                    style={{
                      ...iconBtnStyle,
                      backgroundColor: chatInput.trim() ? 'var(--primary)' : 'transparent',
                      color: chatInput.trim() ? '#FFFFFF' : 'var(--text-light)',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* ════ AI SUMMARY SECTION (appears after successful save) ════ */}
        {summaryLoading && (
          <Card style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={shimmerBox(120, 16)} />
            </div>
            {[180, 240, 160].map((w, i) => <div key={i} style={{ ...shimmerBox(w, 11), marginBottom: 10 }} />)}
          </Card>
        )}

        {visitSummary && !summaryLoading && (
          <>
            {/* ── Card 1: AI Visit Summary ── */}
            <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(15,118,110,0.18)' }}>
              {/* Header */}
              <button
                onClick={() => setSummaryOpen(o => !o)}
                style={summaryHeaderStyle}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={summaryIconBadge}>
                    <Sparkles size={16} color="#0F766E" />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>AI Visit Summary</p>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: '500' }}>
                      Generated for {lastSavedData?.hcp_name} · {lastSavedData?.interaction_date}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={sentimentBadgeStyle}>{visitSummary.sentiment.split(' — ')[0]}</span>
                  {summaryOpen ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
                </div>
              </button>

              {summaryOpen && (
                <div style={{ padding: '0 24px 24px' }}>
                  {/* Summary paragraph */}
                  <div style={summaryBodyBox}>
                    <p style={{ fontSize: '13px', color: '#0F172A', lineHeight: '1.7', margin: 0 }}>
                      {visitSummary.summary}
                    </p>
                  </div>

                  {/* Key points + Follow-ups side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
                    <div>
                      <p style={summarySubheading}><ClipboardCheck size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Key Discussion Points</p>
                      <ul style={summaryList}>
                        {visitSummary.keyPoints.map((pt, i) => (
                          <li key={i} style={summaryListItem}>
                            <span style={tealDot} />{pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p style={summarySubheading}><ArrowRight size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />Follow-up Requirements</p>
                      <ul style={summaryList}>
                        {visitSummary.followUps.map((fu, i) => (
                          <li key={i} style={summaryListItem}>
                            <span style={tealDot} />{fu}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Sentiment full label */}
                  <div style={sentimentFullRow}>
                    <TrendingUp size={14} color="#0F766E" />
                    <span style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600' }}>
                      Sentiment Analysis: {visitSummary.sentiment}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* ── Card 2: Recommended Next Actions ── */}
            <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(15,118,110,0.18)' }}>
              <button
                onClick={() => setActionsOpen(o => !o)}
                style={summaryHeaderStyle}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ ...summaryIconBadge, background: 'rgba(16,185,129,0.10)' }}>
                    <Target size={16} color="#059669" />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Recommended Next Actions</p>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0, fontWeight: '500' }}>
                      {nextActions.length} actions · Auto-generated based on visit outcome
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={e => { e.stopPropagation(); downloadVisitReport(); }}
                    style={downloadBtnStyle}
                  >
                    <Download size={13} />
                    Download Visit Report
                  </button>
                  {actionsOpen ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
                </div>
              </button>

              {actionsOpen && (
                <div style={{ padding: '0 24px 24px' }}>
                  <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {nextActions.map((action, i) => (
                      <li key={i} style={actionItemStyle}>
                        <span style={actionNumberBadge}>{i + 1}</span>
                        <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: '500' }}>{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Bottom Section: Recent Timeline */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--secondary)' }}>
              Recent Interactions Timeline
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
              Showing latest updates first
            </span>
          </div>
          <Timeline onEditClick={handleTimelineEditClick} />
        </div>
      </div>

      {/* Right Column: AI Analytics Panel */}
      <div style={rightColumnStyle} className="log-right-column">
        <AIPanel />
      </div>
    </div>
  );
};

// Styling structures
const pageGridStyle: React.CSSProperties = {
  display: 'flex',
  gap: '32px',
  alignItems: 'flex-start',
  width: '100%',
  flexWrap: 'wrap'
};

const leftColumnStyle: React.CSSProperties = {
  flex: 1.8,
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  minWidth: '320px'
};

const rightColumnStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '340px',
  position: 'sticky',
  top: '32px'
};

const tabHeaderStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid var(--border)',
  background: '#FCFDFE'
};

const tabBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '16px 24px',
  fontSize: '13.5px',
  fontWeight: '700',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all var(--transition-fast)'
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '20px'
};

const formInputStyle: React.CSSProperties = {
  width: '100%',
  height: '42px',
  padding: '0 14px',
  borderRadius: 'var(--radius-input)',
  border: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text-main)',
  background: '#FFFFFF'
};

const draftSaveContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '24px',
  paddingTop: '18px',
  borderTop: '1px solid var(--border)',
  flexWrap: 'wrap',
  gap: '12px'
};

const saveIndicatorStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: 'var(--success)',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px'
};

const greenDotStyle: React.CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: 'var(--success)',
  display: 'inline-block'
};

const chatWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '480px',
  background: '#FFFFFF'
};

const messagesBoxStyle: React.CSSProperties = {
  flex: 1,
  padding: '24px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column'
};

const chatActionBoxStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderTop: '1px solid var(--border)',
  background: '#FCFDFE',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const chatInputFieldStyle: React.CSSProperties = {
  flex: 1,
  height: '38px',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '0 12px',
  fontSize: '12.5px',
  color: 'var(--text-main)',
  background: '#FFFFFF'
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px'
};

const suggestedPromptBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  borderRadius: '8px',
  background: 'var(--background)',
  border: '1px solid var(--border)',
  fontSize: '12px',
  fontWeight: '600',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  transition: 'all var(--transition-fast)'
};

const voiceWaveContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#FFF1F2',
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid #FECDD3',
  marginBottom: '4px'
};

const previewGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginTop: '8px'
};

const previewLabelStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: '700',
  color: '#0F766E',
  display: 'block',
  marginBottom: '2px',
  letterSpacing: '0.3px'
};

const previewInputStyle: React.CSSProperties = {
  width: '100%',
  height: '28px',
  padding: '0 8px',
  fontSize: '12px',
  fontWeight: '600',
  borderRadius: '6px',
  border: '1px solid rgba(20,184,166,0.3)',
  color: 'var(--text-main)',
  background: '#FFFFFF'
};

/* ════════════════════════════════════════
   AI SUMMARY + NEXT ACTIONS STYLES
════════════════════════════════════════ */

const summaryHeaderStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 24px',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid #F1F5F9',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 0.15s ease',
};

const summaryIconBadge: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '10px',
  background: 'rgba(15,118,110,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const sentimentBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#065F46',
  background: '#ECFDF5',
  border: '1px solid #A7F3D0',
  borderRadius: '20px',
  padding: '3px 10px',
  whiteSpace: 'nowrap' as const,
};

const summaryBodyBox: React.CSSProperties = {
  background: '#F0FDFA',
  borderLeft: '3px solid #0F766E',
  borderRadius: '6px',
  padding: '14px 16px',
  marginTop: '6px',
};

const summarySubheading: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#475569',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
};

const summaryList: React.CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
};

const summaryListItem: React.CSSProperties = {
  fontSize: '12.5px',
  color: '#334155',
  fontWeight: '500',
  lineHeight: '1.5',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
};

const tealDot: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: '#0F766E',
  flexShrink: 0,
  marginTop: 6,
};

const sentimentFullRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '16px',
  paddingTop: '14px',
  borderTop: '1px solid #F1F5F9',
};

const actionItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: '10px',
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  transition: 'all 0.15s ease',
};

const actionNumberBadge: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: '50%',
  background: '#0F766E',
  color: '#FFFFFF',
  fontSize: '11px',
  fontWeight: '800',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginTop: 1,
};

const downloadBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: '0 4px 10px -2px rgba(15,118,110,0.28)',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap' as const,
};

const shimmerBox = (width: number | string, height: number): React.CSSProperties => ({
  width: typeof width === 'number' ? `${width}px` : width,
  height: `${height}px`,
  borderRadius: '6px',
  background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite linear',
});

export default LogInteraction;

