# AmisiMedOS Integration Blueprint

## 1. Event Architecture
The system operates on a **Centralized Event Bus**. The `Patient` is the primary aggregate root.

### Primary Event Flow
`Action` $\rightarrow$ `EventDispatcher` $\rightarrow$ `DB Log` $\rightarrow$ `Module Handlers` $\rightarrow$ `Real-time UI Update`.

### Key Event Matrix
| Event | Trigger | Effect on EMR | Effect on Finance | Effect on Inventory | Effect on HR |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PatientRegistered` | Front Desk | New Profile | - | - | - |
| `TriageCompleted` | Nurse | Timeline Entry | Triage Fee | - | Performance Log |
| `ConsultationStarted` | Doctor | Visit Start | Consultation Fee | - | Session Start |
| `LabOrdered` | Doctor | Order Record | Lab Fee | - | - |
| `PrescriptionIssued` | Doctor | Prescription | Med Fee | **Stock Reduction** | - |
| `ChatMessageSent` | Staff/Pt | Chat Archive | - | - | - |
| `PaymentRecorded` | Cashier | Payment Status | Invoice Paid | - | Revenue Metric |

## 2. Data Flow & Integration
### The Patient-Centric Timeline
Every event contains a `patientId`. The EMR module queries the `EventLog` and `MedicalRecord` tables to reconstruct a linear timeline:
`Registration` $\rightarrow$ `Triage` $\rightarrow$ `Waiting` $\rightarrow$ `Consultation` $\rightarrow$ `Lab/Pharmacy` $\rightarrow$ `Billing` $\rightarrow$ `Checkout`.

### Real-time Behavior
1. **WebSockets**: When `EventDispatcher` processes an event, it broadcasts a payload to the `tenant-id` room.
2. **UI Reactive Updates**:
   - **Queue Dashboard**: Re-sorts automatically when `TriageCompleted` is received.
   - **Doctor's Portal**: Updates the patient's current status in real-time.
   - **Admin Panel**: Updates revenue and stock counters instantly.

## 3. Module Logic
- **Finance**: Listens for any "Chargeable" event. It creates an `Invoice` entry.
- **Inventory**: Listens for `PrescriptionIssued`. It decrements `InventoryItem.stockQty`.
- **HR**: Listens for `ConsultationStarted` and `PaymentRecorded` to calculate "Time per Patient" and "Revenue per Staff".
- **Chat**: Linked to `VisitId`. Messages are mirrored to `MedicalRecord` as `CHAT_LOG` for legal auditing.
