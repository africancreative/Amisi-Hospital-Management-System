# AmisiMedOS Clinical UX Design Spec

## 🎯 Design Philosophy: "The Clinical Appliance"
AmisiMedOS is designed not as a generic CRM, but as a high-precision clinical appliance. In high-stress, high-volume hospital environments, cognitive load is the enemy. Our design system prioritizes **Speed over Aesthetics** and **Clarity over Complexity**.

---

## 🛠️ Interaction Rules

### 1. The 3-Click Mandate
No core clinical task (Triage, Consultation, Dispensing, Lab Entry) shall require more than **3 distinct user actions** to reach completion.
*   **Action 1**: Select Subject (Patient/Prescription).
*   **Action 2**: Record Data (Vitals/Notes/Verification).
*   **Action 3**: Execute & Synchronize (Mark Ready/Dispense/Complete).

### 2. Touch-First Ergononomics
*   **Hit Areas**: All interactive elements (buttons, toggles, steppers) maintain a minimum target size of **48x48px**.
*   **Steppers vs. Typing**: Numerical data (BP, Temp, HR) uses +/- steppers to eliminate keyboard dependency and input errors.
*   **Tap-to-Tag**: Common symptoms and risk factors use a grid of toggle buttons for 1-tap recording.

### 3. Visual Hierarchy & Safety
*   **High-Contrast Mode**: Ultra-dark background with vibrant clinical color-coding (Blue/Emerald/Amber/Rose) for instant situational awareness.
*   **Critical Pulse**: Any vital sign outside normal physiological limits (e.g., SpO2 < 92%) triggers a visual pulse animation and high-contrast color shift.
*   **Digital Signatures**: Every action is automatically timestamped and signed by the authenticated user's credentials, ensuring an immutable audit trail.

---

## 🛰️ Offline-First Resiliency

### 1. Persistent Local State
All dashboards utilize an **Offline Queue** strategy. If the LAN or Internet connection fails:
*   The UI displays an **"Offline Mode"** warning in the top bar.
*   All data is persisted to the browser's local storage (IndexedDB) or the **Local Node** PostgreSQL instance.
*   Synchronization occurs automatically in the background once connectivity is restored, with automatic conflict resolution.

### 2. Sub-Second UI Feedback
The UI uses "Optimistic Updates." When a nurse marks a patient as "Ready," the patient is immediately moved from the local queue, providing instant feedback while the server synchronization happens asynchronously.

---

## 👨‍⚕️ Role-Specific Workflows

### Nurse/Triage: "The Intake Loop"
*   **Goal**: Process patient in <2 minutes.
*   **UI Focus**: 4-section layout (Info, Symptoms, Vitals, Risks).
*   **Automation**: Auto-suggests ESI severity level based on vital analysis.

### Doctor: "Continuous Consultation"
*   **Goal**: Zero-delay between patients.
*   **UI Focus**: Dynamic Weighted Queue.
*   **Next-Best Logic**: Clinical algorithm automatically presents the most urgent patient as the "Recommended Next."

### Pharmacist: "Accuracy-First Dispensing"
*   **Goal**: Zero medication errors.
*   **UI Focus**: Visual stock validation (Green/Amber/Red).
*   **Safety Gate**: Required "Verify & Dispense" signature before finalization.

### Lab Technician: "Diagnostic Throughput"
*   **Goal**: Rapid result turnaround.
*   **UI Focus**: Direct result entry cards with "Normal Range" overlays.
*   **Escalation**: Automated SMS/Notification trigger for panic-level results.

---

## 🏥 Edge Case Handling
*   **Emergency Override**: A system-wide "RED ALERT" overlay for ESI-1 patients that bypasses standard queues.
*   **Wait-Time Escalation**: Patients waiting longer than 60 minutes are automatically bubbled up in the dynamic queue, regardless of severity, to prevent "Silent Waiting Room" neglect.
*   **Dual-Signature Requests**: High-risk actions (e.g., administering Schedule II narcotics) trigger a "Witness Signature" requirement in Ward mode.
