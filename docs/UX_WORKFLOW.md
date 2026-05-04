# AmisiMedOS UX & Workflow Design

## 1. Design Principles
- **3-Click Rule**: Every critical clinical action (e.g., issuing a prescription, marking triage) must be reachable within 3 clicks from the dashboard.
- **Role-Based Access (RBAC)**: Interfaces adapt automatically based on the logged-in staff role.
- **Mode Switching**:
  - **On-Duty Mode**: High-contrast, focus-driven interface for real-time operations.
  - **Admin Mode**: Data-dense, management-focused interface for reports and settings.

---

## 2. System Flow (The Patient Journey)
`Arrival` $\rightarrow$ `Intake` $\rightarrow$ `Triage` $\rightarrow$ `Queue` $\rightarrow$ `Consultation` $\rightarrow$ `Lab/Pharmacy` $\rightarrow$ `Billing` $\rightarrow$ `Exit`

### Interaction Map
| Step | Staff Role | Primary Action | UX Focus |
| :--- | :--- | :--- | :--- |
| Arrival | Receptionist | Register/Check-in | Fast Search & Entry |
| Triage | Triage Asst | Vitals $\rightarrow$ Severity | Numerical Input $\rightarrow$ Color Tag |
| Queue | System | Auto-sort by Severity | Real-time Priority Board |
| Consultation | Doctor | Diagnosis $\rightarrow$ Order | Timeline View $\rightarrow$ Quick Order |
| Lab/Pharm | Tech/Pharm | Fulfillment | Order Queue $\rightarrow$ Mark Complete |
| Billing | Cashier | Payment $\rightarrow$ Receipt | POS Grid $\rightarrow$ One-tap Payment |

---

## 3. Role Dashboards (On-Duty Mode)

### A. Triage Assistant Dashboard
- **Main View**: "Incoming Patients" list.
- **Quick Action**: "Start Triage" button $\rightarrow$ Opens a modal with Vitals Grid (BP, Temp, Pulse, SpO2).
- **UX Detail**: Severity selector uses color-coded buttons (Red: 1, Orange: 2, etc.).

### B. Doctor Dashboard
- **Main View**: "My Queue" (Sorted by severity, then time).
- **Active Patient Panel**: A side-panel showing the current patient's vitals and last 3 visits.
- **Quick Actions**: `[Add Note]`, `[Order Lab]`, `[Prescribe]`, `[Complete Visit]`.

### C. Pharmacist Dashboard
- **Main View**: "Pending Prescriptions" queue.
- **UX Detail**: Items highlighted in **Red** if stock is below `minQty`.
- **Quick Action**: `[Dispense]` $\rightarrow$ Deducts stock and notifies patient.

### D. Cashier Dashboard (POS Interface)
- **Main View**: "Pending Payments" list.
- **POS Grid**: Quick-select buttons for common payment methods (M-Pesa, Cash, Card).
- **Fast Flow**: Select Patient $\rightarrow$ Confirm Amount $\rightarrow$ Select Method $\rightarrow$ `[Print Receipt]`.

---

## 4. UI Layout Specs

### Global Layout
- **Header**: Role Indicator | Tenant Name | Mode Toggle (On-Duty $\leftrightarrow$ Admin) | Notifications.
- **Sidebar**: Contextual navigation (e.g., Doctor sees `Queue`, `Patients`, `My Schedule`).
- **Main Stage**: The role-specific dashboard.
- **Quick Action Floating Button (FAB)**: Bottom-right button for the most common role action (e.g., "New Patient" for Reception).

### The "Patient Header" (Ubiquitous Component)
Displayed at the top of every patient-linked screen:
`[Patient Name] | [MRN] | [Age/Gender] | [Current Severity: RED] | [Visit Status: TREATING]`

### Queue UX (The Priority Board)
- **Cards**: Patient cards colored by severity:
  - **Red (#FF4D4F)**: Critical (Immediate)
  - **Orange (#FFA940)**: Urgent
  - **Yellow (#FFEC3D)**: Stable
  - **Green (#73D13D)**: Routine
- **Auto-Shift**: When a doctor clicks "Start Consultation", the patient moves from "Waiting" to "In-Room" automatically.

---

## 5. Chat UX (Integrated Clinical Communication)
- **Location**: Embedded as a tab within the Patient Record.
- **Context-Awareness**: Messages are tagged with the `VisitId`.
- **Quick Templates**: Doctors can send pre-defined instructions (e.g., "Please proceed to the Lab").
- **Alerting**: Urgent chat messages from Nurses to Doctors trigger a high-priority notification on the Doctor's dashboard.
