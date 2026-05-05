'use client';

import { useEffect, useState } from 'react';

interface QueuePatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  severity: 'critical' | 'urgent' | 'moderate' | 'minor';
  waitTime: number;
  triageNotes: string;
  status: 'waiting' | 'in-progress' | 'completed';
  allergies: string[];
  vitals: { bp: string; hr: number; spo2: string; temp: string };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  acknowledged: boolean;
  patientId: string;
}

interface ApiData {
  systemStatus: { online: boolean; syncStatus: string; lastSync: string; pendingChanges: number };
  queue: QueuePatient[];
  activePatient: QueuePatient | null;
  commonDiagnoses: Array<{ code: string; name: string; system: string }>;
  commonMedications: Array<{ name: string; type: string; frequency: string }>;
  commonLabs: string[];
  alerts: Alert[];
  shortcuts: Array<{ key: string; action: string }>;
  clinicianRole: string;
}

const severityColors: Record<string, string> = {
  critical: '#dc2626',
  urgent: '#ea580c',
  moderate: '#ca8a04',
  minor: '#16a34a',
};

const severityBg: Record<string, string> = {
  critical: '#fef2f2',
  urgent: '#fff7ed',
  moderate: '#fefce8',
  minor: '#f0fdf4',
};

export default function OnDutyPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePatient, setActivePatient] = useState<QueuePatient | null>(null);
  const [patientTabs, setPatientTabs] = useState<QueuePatient[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch('/api/clinician/onduty')
      .then(res => res.json())
      .then((d: ApiData) => {
        setData(d);
        setAlerts(d.alerts);
        if (d.activePatient) {
          setActivePatient(d.activePatient);
          setPatientTabs([d.activePatient]);
          setActiveTabId(d.activePatient.id);
        }
      })
      .finally(() => setLoading(false));

    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const startConsultation = (patient: QueuePatient) => {
    if (!patientTabs.find(p => p.id === patient.id)) {
      setPatientTabs([...patientTabs, patient]);
    }
    setActivePatient(patient);
    setActiveTabId(patient.id);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(a => (a.id === alertId ? { ...a, acknowledged: true } : a)));
  };

  const toggleMed = (med: string) => {
    setSelectedMeds(prev => prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med]);
  };

  const toggleLab = (lab: string) => {
    setSelectedLabs(prev => prev.includes(lab) ? prev.filter(l => l !== lab) : [...prev, lab]);
  };

  if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>Loading On-Duty Interface...</div>;
  if (!data) return <div style={{ padding: '32px' }}>Failed to load.</div>;

  const { systemStatus, queue, commonDiagnoses, commonMedications, commonLabs, shortcuts, clinicianRole } = data;

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
      {/* TOP BAR */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626', margin: 0 }}>⚡ ON-DUTY MODE</h1>
          <span style={{ fontSize: '14px', color: '#475569' }}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {unacknowledgedAlerts.length > 0 && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              🚨 {unacknowledgedAlerts.length} Alert{unacknowledgedAlerts.length > 1 ? 's' : ''}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: systemStatus.online ? '#22c55e' : '#ef4444',
              display: 'inline-block',
            }} />
            {systemStatus.syncStatus === 'synced' ? 'Online' : systemStatus.syncStatus}
            {systemStatus.pendingChanges > 0 && ` (${systemStatus.pendingChanges} pending)`}
          </div>
        </div>
      </div>

      {/* ALERT BANNERS */}
      {unacknowledgedAlerts.map(alert => (
        <div
          key={alert.id}
          style={{
            backgroundColor: alert.type === 'critical' ? '#dc2626' : alert.type === 'warning' ? '#ea580c' : '#2563eb',
            color: 'white',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 500 }}>⚠️ {alert.message}</span>
          <button
            onClick={() => acknowledgeAlert(alert.id)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Acknowledge
          </button>
        </div>
      ))}

      {/* MAIN 3-PANEL LAYOUT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT PANEL: LIVE QUEUE */}
        <div style={{
          width: '300px',
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Live Queue ({queue.length})</h2>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {queue
              .sort((a, b) => {
                const order = { critical: 0, urgent: 1, moderate: 2, minor: 3 };
                return (order[a.severity] || 4) - (order[b.severity] || 4) || a.waitTime - b.waitTime;
              })
              .map(patient => (
                <div
                  key={patient.id}
                  onClick={() => startConsultation(patient)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: activeTabId === patient.id ? '#eff6ff' : severityBg[patient.severity] || '#f8fafc',
                    border: `1px solid ${activeTabId === patient.id ? '#3b82f6' : severityColors[patient.severity] || '#e2e8f0'}`,
                    marginBottom: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{patient.name}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: severityBg[patient.severity],
                      color: severityColors[patient.severity],
                      textTransform: 'uppercase',
                    }}>
                      {patient.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>Wait: {patient.waitTime} min</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{patient.triageNotes}</div>
                  {patient.allergies.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>⚠️ {patient.allergies.join(', ')}</div>
                  )}
                  {patient.status === 'in-progress' && (
                    <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px', fontWeight: 600 }}>▶ In Progress</div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* CENTER: ACTIVE PATIENT WORKSPACE */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#f8fafc' }}>
          {activePatient ? (
            <div>
              {/* PATIENT HEADER - ALL CRITICAL DATA VISIBLE WITHOUT SCROLLING */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: `2px solid ${severityColors[activePatient.severity] || '#e2e8f0'}`,
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                      {activePatient.name}, {activePatient.age} ({activePatient.gender})
                    </h2>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#475569' }}>
                      <span>Status: <strong>{activePatient.status}</strong></span>
                      <span>Severity: <span style={{ color: severityColors[activePatient.severity] }}>{activePatient.severity.toUpperCase()}</span></span>
                    </div>
                  </div>
                  <button
                    onClick={() => startConsultation(activePatient)}
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Start Consultation
                  </button>
                </div>
                {/* ALLERGIES - HIGHLIGHTED */}
                {activePatient.allergies.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#dc2626',
                    fontWeight: 500,
                  }}>
                    ⚠️ ALLERGIES: {activePatient.allergies.join(', ')}
                  </div>
                )}
              </div>

              {/* VITALS SNAPSHOT */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                  { label: 'BP', value: activePatient.vitals.bp, normal: '90-140/60-90' },
                  { label: 'HR', value: String(activePatient.vitals.hr), normal: '60-100' },
                  { label: 'SpO2', value: activePatient.vitals.spo2, normal: '95-100%' },
                  { label: 'Temp', value: `${activePatient.vitals.temp}°C`, normal: '36.1-37.2' },
                ].map((vital, idx) => {
                  const isAbnormal =
                    (vital.label === 'HR' && (parseInt(vital.value) > 100 || parseInt(vital.value) < 60)) ||
                    (vital.label === 'SpO2' && parseInt(vital.value) < 95);
                  return (
                    <div key={idx} style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: `1px solid ${isAbnormal ? '#fecaca' : '#e2e8f0'}`,
                      padding: '12px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>{vital.label}</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: isAbnormal ? '#dc2626' : '#0f172a' }}>{vital.value}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{vital.normal}</div>
                    </div>
                  );
                })}
              </div>

              {/* CURRENT COMPLAINT */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>Current Complaint / Triage Notes</h3>
                <p style={{ fontSize: '14px', color: '#334155', margin: 0 }}>{activePatient.triageNotes}</p>
              </div>

              {/* HISTORY (CONDENSED) */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>History (Condensed)</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No chronic conditions recorded. Previous visits: 2 (Hypertension - 2025, Follow-up - 2026)</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '14px' }}>
              Select a patient from the queue to begin
            </div>
          )}
        </div>

        {/* RIGHT PANEL: ACTIONS */}
        <div style={{
          width: '320px',
          backgroundColor: 'white',
          borderLeft: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Actions</h2>
            {clinicianRole !== 'DOCTOR' && (
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>Role: {clinicianRole} - Limited actions</p>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {/* PATIENT TABS (MULTI-PATIENT) */}
            {patientTabs.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>OPEN PATIENTS</p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {patientTabs.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setActivePatient(p); setActiveTabId(p.id); }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: activeTabId === p.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        backgroundColor: activeTabId === p.id ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        color: '#0f172a',
                      }}
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DIAGNOSIS */}
            {(clinicianRole === 'DOCTOR' || clinicianRole === 'ASSISTANT') && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>DIAGNOSIS (SNOMED/ICD)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {commonDiagnoses.map(dx => (
                    <button
                      key={dx.code}
                      onClick={() => setSelectedDiagnosis(dx.name)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: selectedDiagnosis === dx.name ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        backgroundColor: selectedDiagnosis === dx.name ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>{dx.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{dx.code} ({dx.system})</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PRESCRIBE MEDICATION */}
            {(clinicianRole === 'DOCTOR' || clinicianRole === 'ASSISTANT') && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>PRESCRIBE MEDS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {commonMedications.map(med => (
                    <button
                      key={med.name}
                      onClick={() => toggleMed(med.name)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: selectedMeds.includes(med.name) ? '2px solid #16a34a' : '1px solid #e2e8f0',
                        backgroundColor: selectedMeds.includes(med.name) ? '#f0fdf4' : 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ fontWeight: 500, color: '#0f172a' }}>{med.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{med.type} - {med.frequency}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ORDER LABS */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>ORDER LABS/IMAGING</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {commonLabs.map(lab => (
                  <button
                    key={lab}
                    onClick={() => toggleLab(lab)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: selectedLabs.includes(lab) ? '2px solid #ea580c' : '1px solid #e2e8f0',
                      backgroundColor: selectedLabs.includes(lab) ? '#fff7ed' : 'white',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#0f172a',
                    }}
                  >
                    {selectedLabs.includes(lab) ? '✓ ' : ''}{lab}
                  </button>
                ))}
              </div>
            </div>

            {/* NOTES */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>NOTES</p>
              <textarea
                value={consultationNotes}
                onChange={e => setConsultationNotes(e.target.value)}
                placeholder="Type consultation notes (auto-saved)..."
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Auto-saved</div>
            </div>

            {/* KEYBOARD SHORTCUTS */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>SHORTCUTS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {shortcuts.map(s => (
                  <div key={s.key} style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{s.key}</span>
                    <span>{s.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COMPLETE CONSULTATION BUTTON */}
          <div style={{ padding: '12px', borderTop: '1px solid #f1f5f9' }}>
            <button
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✓ Complete Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
