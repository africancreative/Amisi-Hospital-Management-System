# AmisiMedOS Role-Based UX System

## 🎯 UX Philosophy
AmisiMedOS utilizes a dynamic, role-based User Experience. To minimize cognitive load, users only see modules directly relevant to their function. The interface adapts based on whether the user is actively processing queues (**On-Duty Mode**), reviewing general information (**Off-Duty Mode**), or configuring the system (**Admin Mode**).

---

## 🔐 Permissions Matrix

Access levels defined as: **[R]** Read, **[W]** Write/Create, **[U]** Update, **[D]** Delete, **[-]** No Access.

| Module | Doctor | Nurse | Assistant | Pharmacist | Cashier | Admin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Patient Admin** | R | R, W, U | R, W | R | R, W | R |
| **Triage / Vitals** | R | R, W, U | R, W | - | - | R |
| **EMR / Clinical Notes**| R, W, U | R | - | - | - | R |
| **Prescriptions** | R, W, U | R | - | R, U | - | R |
| **Lab Results** | R, W | R | - | - | - | R |
| **Ward / Inpatient** | R, W, U | R, W, U | R, W | R | - | R |
| **Pharmacy / Dispensing**| R | - | - | R, W, U | - | R |
| **Inventory** | - | - | - | R, W, U | - | R, W, U, D |
| **Billing / POS** | - | - | - | - | R, W, U | R |
| **System Settings** | - | - | - | - | - | R, W, U, D |

*(Note: Admins have full system visibility for auditing and management, but generally do not possess write permissions for clinical records to maintain data integrity.)*

---

## 🧭 Navigation Structure

### 1. Off-Duty / General Mode
This is the default mode upon login when not actively assigned to a shift or queue. The sidebar navigation is customized per role.

*   **Doctor**: Dashboard, My Patients, Lab Results, Appointment Calendar.
*   **Nurse**: Dashboard, Ward Overview, Pending Admissions, Patient Search.
*   **Assistant**: Dashboard, Tasks, Patient Transport, Supplies Request.
*   **Pharmacist**: Dashboard, Inventory Status, Low Stock Alerts, Expiry Tracker.
*   **Cashier**: Dashboard, Today's Transactions, Unpaid Invoices, End-of-Day Reconciliation.

### 2. On-Duty Mode (Operational)
Triggered when a user "Clocks In" to a specific department or queue.
*   **Visual Shift**: The sidebar collapses or disappears entirely to maximize workspace.
*   **Route Lock**: The user is confined to the active workflow interface.
*   **Context Bar**: A persistent top bar shows the current active patient, timer, and critical alerts.

**Role-Specific On-Duty Workflows:**
*   **Doctor (`/doctor-on-duty`)**: Split-screen view. Left: Dynamic weighted queue of waiting patients. Right: Comprehensive EMR view, historical timeline, and quick-order pads for labs/meds.
*   **Nurse (`/triage-on-duty`)**: Fast-entry form for vitals, automated ESI (Emergency Severity Index) calculator, and 1-tap chief complaint tags.
*   **Pharmacist (`/pharmacy-on-duty`)**: Queue of verified prescriptions awaiting dispensing. Scanning interface for barcode validation, and visual alerts for drug interactions.
*   **Assistant (`/ward-assistant-on-duty`)**: Task list for patient transport, bed cleaning, and basic patient care activities.

### 3. Admin Mode (Management)
Accessible only to the **Admin** role. Provides system-wide configuration and oversight.
*   **Navigation Sidebar**:
    *   **Facility Setup**: Tenant config, feature flags, billing rules.
    *   **User Management**: RBAC, staff onboarding, role assignment.
    *   **Inventory Control**: Master catalog, procurement approvals.
    *   **Analytics**: System performance, wait times, revenue reports.
    *   **Audit Logs**: HIPAA/GDPR compliance tracking.

---

## 🛡️ Architecture & Enforcement

1.  **UI Component Level**: Features like `useFeatureFlags` and `useRoleContext` dynamically hide/show buttons and navigation items.
2.  **Routing Level**: React/Vue Router implements middleware that redirects unauthorized roles to a fallback dashboard.
3.  **API Security (The Ultimate Check)**: The `ensureRole` backend middleware validates the JWT claims on every request, ensuring that a hidden UI element cannot be bypassed via direct API calls.
