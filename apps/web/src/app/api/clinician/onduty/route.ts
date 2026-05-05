import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicianId = searchParams.get('clinicianId') || 'demo-clinician';

    // System status
    const systemStatus = {
      online: true,
      syncStatus: 'synced', // synced | syncing | offline
      lastSync: new Date().toISOString(),
      pendingChanges: 0,
    };

    // Live queue (sorted by severity, then wait time)
    const queue = [
      {
        id: 'p1',
        name: 'John Doe',
        age: 45,
        gender: 'Male',
        severity: 'critical', // critical | urgent | moderate | minor
        waitTime: 8, // minutes
        triageNotes: 'Chest pain, shortness of breath',
        status: 'waiting', // waiting | in-progress | completed
        allergies: ['Penicillin', 'Sulfa'],
        vitals: { bp: '140/90', hr: 110, spo2: '92%', temp: '38.5' },
      },
      {
        id: 'p2',
        name: 'Jane Smith',
        age: 32,
        gender: 'Female',
        severity: 'urgent',
        waitTime: 15,
        triageNotes: 'High fever, persistent cough',
        status: 'waiting',
        allergies: [],
        vitals: { bp: '120/80', hr: 95, spo2: '97%', temp: '39.2' },
      },
      {
        id: 'p3',
        name: 'Bob Wilson',
        age: 58,
        gender: 'Male',
        severity: 'moderate',
        waitTime: 25,
        triageNotes: 'Follow-up, post-op check',
        status: 'in-progress',
        allergies: ['Latex'],
        vitals: { bp: '130/85', hr: 72, spo2: '98%', temp: '36.8' },
      },
      {
        id: 'p4',
        name: 'Mary Johnson',
        age: 28,
        gender: 'Female',
        severity: 'minor',
        waitTime: 40,
        triageNotes: 'Minor laceration, finger',
        status: 'waiting',
        allergies: [],
        vitals: { bp: '118/76', hr: 68, spo2: '99%', temp: '36.6' },
      },
    ];

    // Active patient (if any)
    const activePatient = queue.find(p => p.status === 'in-progress') || null;

    // Common diagnoses (SNOMED/ICD coded)
    const commonDiagnoses = [
      { code: '38341003', name: 'Hypertensive disorder', system: 'SNOMED' },
      { code: '44054006', name: 'Diabetes mellitus type 2', system: 'SNOMED' },
      { code: 'J06.9', name: 'Acute upper respiratory infection', system: 'ICD-10' },
      { code: 'R06.02', name: 'Shortness of breath', system: 'ICD-10' },
      { code: '486', name: 'Pneumonia', system: 'ICD-9' },
    ];

    // Common medications
    const commonMedications = [
      { name: 'Lisinopril 10mg', type: 'Tablet', frequency: 'Once daily' },
      { name: 'Metformin 500mg', type: 'Tablet', frequency: 'Twice daily' },
      { name: 'Amoxicillin 500mg', type: 'Capsule', frequency: 'Three times daily' },
      { name: 'Ibuprofen 400mg', type: 'Tablet', frequency: 'As needed' },
    ];

    // Common lab tests
    const commonLabs = [
      'Complete Blood Count (CBC)',
      'Basic Metabolic Panel (BMP)',
      'Chest X-Ray',
      'ECG',
      'Urinalysis',
    ];

    // Active alerts
    const alerts = [
      {
        id: 'a1',
        type: 'critical',
        message: 'Patient John Doe: SpO2 92% - Needs immediate attention',
        acknowledged: false,
        patientId: 'p1',
      },
      {
        id: 'a2',
        type: 'warning',
        message: 'Patient Bob Wilson: Penicillin allergy - Check prescriptions',
        acknowledged: false,
        patientId: 'p1',
      },
      {
        id: 'a3',
        type: 'info',
        message: 'Jane Smith waiting 15+ minutes',
        acknowledged: false,
        patientId: 'p2',
      },
    ];

    // Keyboard shortcuts reference
    const shortcuts = [
      { key: 'Ctrl+N', action: 'Add Note' },
      { key: 'Ctrl+D', action: 'Add Diagnosis' },
      { key: 'Ctrl+R', action: 'Prescribe Med' },
      { key: 'Ctrl+L', action: 'Order Lab' },
      { key: 'Ctrl+S', action: 'Save & Complete' },
    ];

    return NextResponse.json({
      systemStatus,
      queue,
      activePatient,
      commonDiagnoses,
      commonMedications,
      commonLabs,
      alerts,
      shortcuts,
      clinicianRole: 'DOCTOR', // DOCTOR | NURSE | ASSISTANT
    });
  } catch (error) {
    console.error('On-duty API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch on-duty data' },
      { status: 500 }
    );
  }
}
