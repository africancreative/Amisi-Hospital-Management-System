# AmisiMedOS Role-Based Dashboard Spec

## 🔐 RBAC Matrix & Dashboard Assignments

| Role | Primary Dashboard | Key Permissions | UI Constraints |
| :--- | :--- | :--- | :--- |
| **RECEPTIONIST** | `ReceptionDashboard` | Patient Registration, Queue Management | No Clinical Notes, No Lab Results |
| **NURSE (TRIAGE)** | `TriageDashboard` | Vital Signs, ESI Scoring, Dept Routing | Can view basic history, No Prescribing |
| **DOCTOR** | `DoctorDashboard` | EMR Access, Lab/Med Orders, Diagnosing | Full Clinical Access |
| **NURSE (WARD)** | `WardDashboard` | Bedside Care, Med Administration | Ward-specific view, No Financials |
| **PHARMACIST** | `PharmacistDashboard`| Dispensing, Stock Control | No Clinical Assessment, No Lab Entry |
| **LAB TECHNICIAN** | `LabDashboard` | Result Entry, Specimen Tracking | No Prescribing, No Patient Registration |
| **CASHIER** | `CashierDashboard` | POS, Payments, Insurance, Invoicing | No Clinical Data (except billing items) |
| **ADMIN / MANAGER** | `InventoryDashboard` | Inventory, Staffing, System Config | Full Read, Limited Clinical Write |

---

## 🧭 Navigation Structure

### 1. General Mode (Off-Duty)
The sidebar provides access to module-level overviews:
*   **Clinics**: Patient list and appointments.
*   **Ward**: Bed occupancy map.
*   **Pharmacy**: Inventory and stock levels.
*   **Laboratory**: Test catalog and pending reports.
*   **Billing**: Financial reports and outstanding balances.

### 2. Operational Mode (On-Duty)
The system locks into a role-specific layout:
*   **No Sidebar**: Maximum workspace for clinical data.
*   **Locked Route**: Users are confined to their designated dashboard.
*   **Contextual Top-Bar**: Displays role status, timer, and connectivity.

---

## 🚪 Default Landing Logic

When a user authenticates, the system determines their landing page based on their active role:

```typescript
function getRoleLanding(role: Role) {
  switch(role) {
    case 'NURSE': return '/triage-on-duty';
    case 'DOCTOR': return '/doctor-on-duty';
    case 'PHARMACIST': return '/pharmacy-on-duty';
    case 'LAB_TECH': return '/lab-on-duty';
    case 'CASHIER': return '/billing-on-duty';
    case 'RECEPTIONIST': return '/queue';
    default: return '/dashboard';
  }
}
```

## 🛡️ Permission Guarding
All Server Actions (e.g., `saveTriageIntake`, `dispenseMedication`) are protected by the `ensureRole` middleware, preventing cross-role data mutation.
