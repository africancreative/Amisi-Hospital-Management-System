-- CreateEnum
CREATE TYPE "SystemStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECH', 'ACCOUNTANT', 'HR_MANAGER', 'HR', 'ADMIN', 'MIDWIFE', 'ICU_NURSE', 'ONCOLOGY_NURSE', 'RADIOGRAPHER', 'RADIOLOGIST', 'RECEPTIONIST', 'SECURITY', 'CLEANER', 'DRIVER', 'PATHOLOGIST', 'PROCUREMENT_MANAGER', 'INVENTORY_CLERK', 'ADMISSIONS', 'NURSE_MANAGER', 'HIM_OFFICER', 'AUDITOR', 'SURGEON', 'ANESTHESIOLOGIST', 'OT_MANAGER', 'PATIENT_PORTAL', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "hospital_settings" (
    "id" TEXT NOT NULL,
    "hospital_name" TEXT NOT NULL,
    "system_status" "SystemStatus" NOT NULL DEFAULT 'ACTIVE',
    "address" TEXT,
    "phone" TEXT,
    "detailed_address" TEXT,
    "tax_id" TEXT,
    "marketing_slogan" TEXT,
    "contact_email" TEXT,
    "logo_url" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "last_synced_at" TIMESTAMP(3),
    "ehr_enabled" BOOLEAN NOT NULL DEFAULT true,
    "billing_enabled" BOOLEAN NOT NULL DEFAULT true,
    "lab_enabled" BOOLEAN NOT NULL DEFAULT false,
    "pharmacy_enabled" BOOLEAN NOT NULL DEFAULT false,
    "hr_enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "hospital_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "local_subscription" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "plan_code" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "grace_period_end" TIMESTAMP(3) NOT NULL,
    "signed_token" TEXT NOT NULL,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "local_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "mrn" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "biometric_hash" TEXT,
    "biometric_type" TEXT,
    "respiratory_scale" INTEGER NOT NULL DEFAULT 1,
    "insurance_provider" TEXT,
    "insurance_id" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "conflict_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "message_type" TEXT NOT NULL DEFAULT 'TEXT',
    "patient_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_role" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "reply_to_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "is_clinical" BOOLEAN NOT NULL DEFAULT false,
    "is_system_generated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_chat_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'TEXT',
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT,
    "group_id" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "user_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "type" TEXT NOT NULL DEFAULT 'DIRECT',
    "description" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_message_at" TIMESTAMP(3),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "chat_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "duration" INTEGER,
    "thumbnail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message_read_receipts" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_read_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounters" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "visit_id" TEXT,
    "encounter_type" TEXT NOT NULL DEFAULT 'OPD',
    "doctor_name" TEXT NOT NULL,
    "doctor_id" TEXT,
    "type" TEXT NOT NULL,
    "notes" TEXT,
    "plan" TEXT,
    "esi_level" INTEGER,
    "triage_notes" TEXT,
    "triage_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" DOUBLE PRECISION,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "pulse" INTEGER,
    "spo2" INTEGER,
    "resp_rate" INTEGER,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "symptoms" TEXT,
    "risk_flags" TEXT,
    "mse_completed_at" TIMESTAMP(3),
    "is_stabilized" BOOLEAN NOT NULL DEFAULT false,
    "discharge_summary" TEXT,
    "discharged_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "department" TEXT,
    "room_bed" TEXT,
    "queue_number" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "checked_in_at" TIMESTAMP(3),
    "triaged_at" TIMESTAMP(3),
    "seen_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "conflict_status" TEXT,
    "conflict_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encounters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_notes" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "author_role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "note_type" TEXT NOT NULL DEFAULT 'GENERAL',
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encounter_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_chats" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "message_type" TEXT NOT NULL DEFAULT 'TEXT',
    "reference_type" TEXT,
    "reference_id" TEXT,
    "attachment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encounter_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reason" TEXT,
    "admitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discharged_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_notes" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT,
    "encounter_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SOAP',
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "content" TEXT,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "signed_at" TIMESTAMP(3),
    "signed_by_name" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_timeline_events" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "visit_id" TEXT,
    "encounter_id" TEXT,
    "clinical_note_id" TEXT,
    "actor_id" TEXT,
    "actor_name" TEXT,
    "actor_role" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "floor" INTEGER,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beds" (
    "id" TEXT NOT NULL,
    "ward_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "bed_id" TEXT NOT NULL,
    "attending_physician_id" TEXT,
    "admission_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ADMITTED',
    "admitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discharged_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adt_transfer_events" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "from_bed_id" TEXT NOT NULL,
    "to_bed_id" TEXT NOT NULL,
    "reason_for_transfer" TEXT,
    "transferred_by_role" TEXT,
    "transferred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "adt_transfer_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_administration" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GIVEN',
    "reason_for_skip" TEXT,
    "administered_by" TEXT NOT NULL,
    "administered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_administration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "sub_category" TEXT,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "min_level" INTEGER NOT NULL DEFAULT 10,
    "reorder_level" INTEGER NOT NULL DEFAULT 20,
    "reorder_qty" INTEGER NOT NULL DEFAULT 50,
    "expiry_date" TIMESTAMP(3),
    "location" TEXT,
    "is_asset" BOOLEAN NOT NULL DEFAULT false,
    "serial_number" TEXT,
    "batch_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "ordered_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "billed_amount" DECIMAL(10,2),
    "is_billed" BOOLEAN NOT NULL DEFAULT false,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "drug_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "inventory_item_id" TEXT,
    "stock_checked_at" TIMESTAMP(3),
    "stock_available" BOOLEAN DEFAULT false,
    "reserved_batch_id" TEXT,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispensing_records" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT,
    "item_id" TEXT NOT NULL,
    "quantity_dispensed" INTEGER NOT NULL,
    "dispensed_by" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispensing_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DOCTOR',
    "department" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "phone" TEXT,
    "national_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "contract_type" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "date_joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_terminated" TIMESTAMP(3),
    "probation_ends" TIMESTAMP(3),
    "base_salary" DECIMAL(10,2) NOT NULL,
    "hourly_rate" DECIMAL(8,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "license_number" TEXT,
    "license_expiry" TIMESTAMP(3),
    "license_body" TEXT,
    "credentials_docs" JSONB,
    "emergency_name" TEXT,
    "emergency_phone" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_records" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "base_amount" DECIMAL(10,2) NOT NULL,
    "bonus_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deduction_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "paid_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "income_tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "nhif" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "nssf" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "allowances" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "overtime_pay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "hours_worked" DECIMAL(6,2),
    "overtime_hours" DECIMAL(6,2),

    CONSTRAINT "payroll_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_schedules" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "shift_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "shiftType" TEXT NOT NULL DEFAULT 'DAY',
    "department" TEXT NOT NULL,
    "ward" TEXT,
    "swap_requested_with" TEXT,
    "swap_status" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_logs" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clock_in" TIMESTAMP(3),
    "clock_out" TIMESTAMP(3),
    "hours_worked" DECIMAL(5,2),
    "overtime_hrs" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "offline_mode" BOOLEAN NOT NULL DEFAULT false,
    "device_id" TEXT,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "days_requested" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "medical_cert_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "payroll_record_id" TEXT NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "base_salary" DECIMAL(10,2) NOT NULL,
    "allowances" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "overtime_pay" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonus" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "gross_pay" DECIMAL(10,2) NOT NULL,
    "income_tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "nhif" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "nssf" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "other_deductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(10,2) NOT NULL,
    "net_pay" DECIMAL(10,2) NOT NULL,
    "hours_worked" DECIMAL(6,2) NOT NULL,
    "overtime_hours" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "days_absent" INTEGER NOT NULL DEFAULT 0,
    "days_on_leave" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "disbursed_at" TIMESTAMP(3),
    "payment_ref" TEXT,
    "pdf_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_orders" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "category" TEXT NOT NULL DEFAULT 'LAB',
    "test_name" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'routine',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ordered_by" TEXT NOT NULL,
    "specimen_id" TEXT,
    "collection_time" TIMESTAMP(3),
    "validated_at" TIMESTAMP(3),
    "validated_by" TEXT,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_results" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "reference_range" TEXT,
    "flag" TEXT,
    "performed_by" TEXT,
    "verified_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vitals" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "blood_pressure" TEXT,
    "heart_rate" INTEGER,
    "temperature" DECIMAL(65,30),
    "respiratory_rate" INTEGER,
    "spO2" INTEGER,
    "weight" DECIMAL(65,30),
    "height" DECIMAL(65,30),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "system" TEXT NOT NULL DEFAULT 'ICD-10',
    "description" TEXT NOT NULL,
    "category" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "substance" TEXT NOT NULL,
    "reaction" TEXT,
    "severity" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "visit_id" TEXT,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance_due" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "payer_type" TEXT NOT NULL DEFAULT 'CASH',
    "insurance_policy_number" TEXT,
    "pre_auth_code" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" TEXT NOT NULL,
    "reference" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_items" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "encounter_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "tax_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_reason" TEXT,
    "is_exempt" BOOLEAN NOT NULL DEFAULT false,
    "exemption_reason" TEXT,
    "total_price" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "category" TEXT NOT NULL,
    "inventory_item_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "bill_item_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "accountingStandard" TEXT NOT NULL DEFAULT 'BOTH',
    "ledgerType" TEXT NOT NULL DEFAULT 'GENERAL',
    "fiscal_period" TEXT,
    "source_type" TEXT,
    "source_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_lines" (
    "id" TEXT NOT NULL,
    "journal_entry_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "description" TEXT,
    "debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "journal_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "payment_terms" TEXT,
    "is_insurance" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_catalog_items" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "vendor_sku" TEXT,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "minimum_order_qty" INTEGER NOT NULL DEFAULT 1,
    "lead_time_days" INTEGER NOT NULL DEFAULT 7,

    CONSTRAINT "vendor_catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "ordered_by" TEXT NOT NULL,
    "ordered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by_id" TEXT,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grns" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "received_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_by" TEXT NOT NULL,
    "delivery_note" TEXT,

    CONSTRAINT "grns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grn_items" (
    "id" TEXT NOT NULL,
    "grn_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),

    CONSTRAINT "grn_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "inventory_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_bins" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "inventory_bins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_batches" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "cost_price" DECIMAL(10,2),

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "reference" TEXT,
    "actor_id" TEXT,
    "actor_name" TEXT,
    "balance_after" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_alerts" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_maintenance" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "last_serviced_at" TIMESTAMP(3),
    "technician_name" TEXT,
    "notes" TEXT,
    "next_due_date" TIMESTAMP(3),

    CONSTRAINT "asset_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_journal" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "operation_type" TEXT NOT NULL,
    "payload" JSONB,
    "encrypted_payload" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signature" TEXT,
    "public_key_id" TEXT,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "direction" TEXT NOT NULL DEFAULT 'OUTGOING',
    "sequence_number" BIGINT NOT NULL DEFAULT 0,
    "device_id" TEXT,

    CONSTRAINT "event_journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "session_id" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "department" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prev_hash" TEXT,
    "hash" TEXT,
    "chain_position" BIGINT NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'ACTIVITY',
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "is_retained" BOOLEAN NOT NULL DEFAULT true,
    "retain_until" TIMESTAMP(3),

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_record_changes" (
    "id" TEXT NOT NULL,
    "audit_log_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "change_type" TEXT NOT NULL,
    "before_state" JSONB,
    "after_state" JSONB,
    "changed_fields" TEXT[],
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_record_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_chat_actions" (
    "id" TEXT NOT NULL,
    "audit_log_id" TEXT NOT NULL,
    "message_id" TEXT,
    "group_id" TEXT,
    "patient_id" TEXT,
    "action" TEXT NOT NULL,
    "original_content" TEXT,
    "new_content" TEXT,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_chat_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_access_logs" (
    "id" TEXT NOT NULL,
    "audit_log_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "access_reason" TEXT,
    "access_duration_ms" INTEGER,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_nodes" (
    "id" TEXT NOT NULL,
    "node_name" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL DEFAULT 'EDGE',
    "last_heartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icu_monitoring" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "bed_id" TEXT,
    "admission_reason" TEXT NOT NULL,
    "apache_score" INTEGER,
    "sofa_score" INTEGER,
    "ventilator_mode" TEXT,
    "fio2" DECIMAL(4,2),
    "tidal_volume" INTEGER,
    "peep" DECIMAL(4,1),
    "isolation_status" TEXT NOT NULL DEFAULT 'NONE',
    "code_status" TEXT NOT NULL DEFAULT 'FULL',
    "admitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discharged_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "icu_monitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vitals_logs" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "icu_monitoring_id" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by" TEXT NOT NULL,
    "blood_pressure" TEXT,
    "heart_rate" INTEGER,
    "temperature" DECIMAL(4,1),
    "respiratory_rate" INTEGER,
    "spO2" INTEGER,
    "gcs" INTEGER,
    "urine_output_ml" INTEGER,
    "pain_score" INTEGER,
    "news2_score" INTEGER,
    "infusion_data" JSONB,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vitals_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oncology_treatments" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "oncologist_id" TEXT NOT NULL,
    "protocol_name" TEXT NOT NULL,
    "cancer_type" TEXT NOT NULL,
    "stage" TEXT,
    "intent" TEXT,
    "total_cycles" INTEGER NOT NULL,
    "current_cycle" INTEGER NOT NULL DEFAULT 0,
    "cycle_interval_days" INTEGER NOT NULL DEFAULT 21,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "response" TEXT,
    "discontinuation_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oncology_treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chemo_sessions" (
    "id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "cycle_number" INTEGER NOT NULL,
    "session_number" INTEGER NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "actual_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "anc" DECIMAL(5,2),
    "platelets" INTEGER,
    "weight_kg" DECIMAL(5,1),
    "bsa" DECIMAL(4,2),
    "pre_chemo_cleared" BOOLEAN NOT NULL DEFAULT false,
    "drugs" JSONB,
    "toxicities" JSONB,
    "session_notes" TEXT,
    "adverse_event" BOOLEAN NOT NULL DEFAULT false,
    "dose_reduced" BOOLEAN NOT NULL DEFAULT false,
    "dose_reduction_reason" TEXT,
    "infusion_start" TIMESTAMP(3),
    "infusion_end" TIMESTAMP(3),
    "nurse_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chemo_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maternity_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "gravida" INTEGER NOT NULL,
    "para" INTEGER NOT NULL,
    "lmp" TIMESTAMP(3) NOT NULL,
    "edd" TIMESTAMP(3) NOT NULL,
    "gestational_age_weeks" INTEGER,
    "blood_group" TEXT,
    "rhesus" TEXT,
    "hiv_status" TEXT,
    "pmtct_enrolled" BOOLEAN NOT NULL DEFAULT false,
    "risk_level" TEXT NOT NULL DEFAULT 'LOW',
    "risk_factors" TEXT[],
    "anc_visit_count" INTEGER NOT NULL DEFAULT 0,
    "next_anc_date" TIMESTAMP(3),
    "delivery_outcome" TEXT,
    "delivery_date" TIMESTAMP(3),
    "birth_weight_kg" DECIMAL(5,3),
    "apgar_1min" INTEGER,
    "apgar_5min" INTEGER,
    "neonatal_patient_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ANTENATAL',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maternity_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_logs" (
    "id" TEXT NOT NULL,
    "maternity_record_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "midwife_id" TEXT NOT NULL,
    "obstetrician_id" TEXT,
    "labour_onset_at" TIMESTAMP(3),
    "membrane_status" TEXT,
    "liquor_color" TEXT,
    "partogram_data" JSONB,
    "delivery_time" TIMESTAMP(3),
    "delivery_method" TEXT,
    "c_section_indication" TEXT,
    "placenta_delivery_time" TIMESTAMP(3),
    "blood_loss_ml" INTEGER,
    "episiotomy" BOOLEAN NOT NULL DEFAULT false,
    "perineal_tear" TEXT,
    "is_emergency" BOOLEAN NOT NULL DEFAULT false,
    "baby_sex" TEXT,
    "birth_weight_kg" DECIMAL(5,3),
    "apgar_1min" INTEGER,
    "apgar_5min" INTEGER,
    "resuscitation_required" BOOLEAN NOT NULL DEFAULT false,
    "oxytocin_given" BOOLEAN NOT NULL DEFAULT false,
    "vitamin_k_given" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "ndc_code" TEXT,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "drug_class" TEXT,
    "dea_schedule" TEXT,
    "unit" TEXT NOT NULL,
    "dosage_form" TEXT,
    "min_dose" DECIMAL(10,3),
    "max_dose" DECIMAL(10,3),
    "max_daily_dose" DECIMAL(10,3),
    "requires_ra" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_inventory" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "location_id" TEXT,
    "batch_number" TEXT NOT NULL,
    "lot_number" TEXT,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "quantity_on_hand" INTEGER NOT NULL DEFAULT 0,
    "quantity_reserved" INTEGER NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(10,2),
    "is_controlled" BOOLEAN NOT NULL DEFAULT false,
    "storage_condition" TEXT NOT NULL DEFAULT 'ROOM_TEMP',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_interactions" (
    "id" TEXT NOT NULL,
    "drug_a_id" TEXT NOT NULL,
    "drug_b_id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "mechanism" TEXT,
    "clinical_effect" TEXT,
    "management" TEXT,
    "source" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispensing_logs" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "pharmacy_inventory_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "pharmacist_id" TEXT NOT NULL,
    "technician_id" TEXT,
    "quantity_dispensed" INTEGER NOT NULL,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "counseling_notes" TEXT,
    "patient_instructed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DISPENSED',
    "offline_mode" BOOLEAN NOT NULL DEFAULT false,
    "ip_address" TEXT,
    "device_id" TEXT,
    "hash" TEXT,
    "prev_hash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispensing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "controlled_substances_log" (
    "id" TEXT NOT NULL,
    "dispensing_log_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "dea_schedule" TEXT NOT NULL,
    "prescriber_dea" TEXT NOT NULL,
    "pharmacy_dea" TEXT NOT NULL,
    "quantity_dispensed" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "running_balance" INTEGER NOT NULL,
    "pic_id" TEXT NOT NULL,
    "witness_id" TEXT,
    "pic_signed_at" TIMESTAMP(3),
    "witness_signed_at" TIMESTAMP(3),
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "controlled_substances_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_versions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "changed_by" TEXT NOT NULL,
    "changed_by_role" TEXT NOT NULL,
    "change_reason" TEXT,
    "changeType" TEXT NOT NULL,
    "snapshot_data" JSONB NOT NULL,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT true,
    "encryption_key_id" TEXT,
    "hash" TEXT,
    "prev_hash" TEXT,
    "access_level" TEXT NOT NULL DEFAULT 'RESTRICTED',
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "record_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_requests" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "requester_type" TEXT NOT NULL,
    "requester_org" TEXT,
    "requester_email" TEXT,
    "purpose_of_use" TEXT NOT NULL,
    "record_date_from" TIMESTAMP(3),
    "record_date_to" TIMESTAMP(3),
    "requested_fields" TEXT[],
    "urgency" TEXT NOT NULL DEFAULT 'ROUTINE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "denial_reason" TEXT,
    "approval_notes" TEXT,
    "fulfilled_at" TIMESTAMP(3),
    "delivery_method" TEXT,
    "delivery_ref" TEXT,
    "consent_form_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_forms" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "consent_given" BOOLEAN NOT NULL DEFAULT false,
    "consent_scope" TEXT[],
    "authorized_party" TEXT,
    "signed_at" TIMESTAMP(3),
    "signed_by_name" TEXT,
    "signature_method" TEXT,
    "witness_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(3),
    "revoked_reason" TEXT,
    "document_url" TEXT,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT true,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consent_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "record_access_grants" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "granted_to" TEXT NOT NULL,
    "granted_to_role" TEXT NOT NULL,
    "granted_by" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL,
    "scope" TEXT[],
    "reason" TEXT,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "revoked_at" TIMESTAMP(3),
    "revoked_by" TEXT,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "record_access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_orders" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "ordered_by_id" TEXT NOT NULL,
    "ordered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modality" TEXT NOT NULL,
    "target_region" TEXT NOT NULL,
    "clinical_indication" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduled_date" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'ROUTINE',
    "billed_amount" DECIMAL(10,2),
    "is_billed" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_studies" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "dicom_study_uid" TEXT NOT NULL,
    "accession_number" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "study_date" TIMESTAMP(3) NOT NULL,
    "study_description" TEXT,
    "referring_physician_id" TEXT,
    "radiologist_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACQUIRED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imaging_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dicom_series" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "dicom_series_uid" TEXT NOT NULL,
    "series_number" INTEGER NOT NULL,
    "modality" TEXT NOT NULL,
    "series_description" TEXT,
    "body_part_examined" TEXT,
    "number_of_instances" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dicom_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dicom_instances" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "dicom_sop_instance_uid" TEXT NOT NULL,
    "instance_number" INTEGER NOT NULL,
    "storage_url" TEXT NOT NULL,
    "file_size_kb" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dicom_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_reports" (
    "id" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "findings" TEXT NOT NULL,
    "impression" TEXT NOT NULL,
    "addendums" JSONB,
    "is_critical_result" BOOLEAN NOT NULL DEFAULT false,
    "signing_radiologist_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "signed_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgery_requests" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "encounter_id" TEXT,
    "requested_by_id" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "procedure_code" TEXT NOT NULL,
    "requested_date" TIMESTAMP(3) NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'ELECTIVE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "medical_clearance_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surgery_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ot_schedules" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "theatre_room_id" TEXT NOT NULL,
    "scheduled_start_time" TIMESTAMP(3) NOT NULL,
    "scheduled_end_time" TIMESTAMP(3) NOT NULL,
    "primary_surgeon_id" TEXT NOT NULL,
    "anesthesiologist_id" TEXT NOT NULL,
    "scrub_nurse_id" TEXT,
    "circulating_nurse_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ot_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgery_pre_op" (
    "id" TEXT NOT NULL,
    "ot_schedule_id" TEXT NOT NULL,
    "consent_signed" BOOLEAN NOT NULL DEFAULT false,
    "consent_document_url" TEXT,
    "fasting_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "surgical_site_marked" BOOLEAN NOT NULL DEFAULT false,
    "anesthesia_cleared" BOOLEAN NOT NULL DEFAULT false,
    "blood_reserved_units" INTEGER NOT NULL DEFAULT 0,
    "crossmatch_status" TEXT,
    "cleared_for_surgery" BOOLEAN NOT NULL DEFAULT false,
    "cleared_by_nurse_id" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surgery_pre_op_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgery_intra_op" (
    "id" TEXT NOT NULL,
    "ot_schedule_id" TEXT NOT NULL,
    "time_out_completed" BOOLEAN NOT NULL DEFAULT false,
    "incision_time" TIMESTAMP(3),
    "closure_time" TIMESTAMP(3),
    "anesthesia_log" JSONB,
    "drugs_used" JSONB,
    "estimated_blood_loss_ml" INTEGER,
    "implants_used" JSONB,
    "complications" TEXT,
    "surgeon_notes" TEXT,
    "specimens_sent_to_lab" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surgery_intra_op_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgery_post_op" (
    "id" TEXT NOT NULL,
    "ot_schedule_id" TEXT NOT NULL,
    "pacu_arrival_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrival_aldrete_score" INTEGER,
    "discharge_aldrete_score" INTEGER,
    "vitals_log" JSONB,
    "post_op_instructions" TEXT,
    "pacu_discharge_time" TIMESTAMP(3),
    "discharge_destination" TEXT,
    "discharged_by_md" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surgery_post_op_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT,
    "encounter_id" TEXT,
    "ordered_by_id" TEXT,
    "is_standalone" BOOLEAN NOT NULL DEFAULT false,
    "external_patient_source" TEXT,
    "external_patient_data" JSONB,
    "test_panel_id" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'ROUTINE',
    "clinical_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "ordered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billed_amount" DECIMAL(10,2),
    "is_billed" BOOLEAN NOT NULL DEFAULT false,
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_samples" (
    "id" TEXT NOT NULL,
    "lab_order_id" TEXT NOT NULL,
    "specimen_type" TEXT NOT NULL,
    "container_type" TEXT,
    "barcode" TEXT NOT NULL,
    "collected_at" TIMESTAMP(3),
    "collected_by_id" TEXT,
    "is_rejected" BOOLEAN NOT NULL DEFAULT false,
    "rejection_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL,
    "lab_order_id" TEXT NOT NULL,
    "biomarker_name" TEXT NOT NULL,
    "value_result" TEXT NOT NULL,
    "numeric_value" DECIMAL(10,3),
    "unit" TEXT,
    "reference_range_min" DECIMAL(10,3),
    "reference_range_max" DECIMAL(10,3),
    "reference_text" TEXT,
    "flag" TEXT NOT NULL DEFAULT 'NORMAL',
    "machine_id" TEXT,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_reports" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "pathologist_id" TEXT NOT NULL,
    "clinical_interpretation" TEXT,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "validated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'FINAL',
    "pdf_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_log" (
    "id" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "data" JSONB,
    "user_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "node_id" TEXT,
    "device_id" TEXT,

    CONSTRAINT "change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_queue" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'OUTGOING',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_at" TIMESTAMP(3),
    "locked_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalSyncQueue" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalSyncQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudSyncJournal" (
    "sequenceId" BIGSERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CloudSyncJournal_pkey" PRIMARY KEY ("sequenceId")
);

-- CreateTable
CREATE TABLE "SyncMetadata" (
    "id" TEXT NOT NULL,
    "cursor" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_mrn_key" ON "patients"("mrn");

-- CreateIndex
CREATE INDEX "chat_messages_patient_id_idx" ON "chat_messages"("patient_id");

-- CreateIndex
CREATE INDEX "chat_messages_timestamp_idx" ON "chat_messages"("timestamp");

-- CreateIndex
CREATE INDEX "user_chat_messages_sender_id_receiver_id_idx" ON "user_chat_messages"("sender_id", "receiver_id");

-- CreateIndex
CREATE INDEX "user_chat_messages_group_id_idx" ON "user_chat_messages"("group_id");

-- CreateIndex
CREATE INDEX "user_chat_messages_timestamp_idx" ON "user_chat_messages"("timestamp");

-- CreateIndex
CREATE INDEX "chat_groups_last_message_at_idx" ON "chat_groups"("last_message_at");

-- CreateIndex
CREATE UNIQUE INDEX "chat_members_group_id_user_id_key" ON "chat_members"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "internal_attachments_message_id_idx" ON "internal_attachments"("message_id");

-- CreateIndex
CREATE INDEX "chat_message_read_receipts_user_id_read_at_idx" ON "chat_message_read_receipts"("user_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "chat_message_read_receipts_message_id_user_id_key" ON "chat_message_read_receipts"("message_id", "user_id");

-- CreateIndex
CREATE INDEX "attachments_message_id_idx" ON "attachments"("message_id");

-- CreateIndex
CREATE INDEX "encounter_notes_encounter_id_idx" ON "encounter_notes"("encounter_id");

-- CreateIndex
CREATE INDEX "encounter_chats_encounter_id_idx" ON "encounter_chats"("encounter_id");

-- CreateIndex
CREATE INDEX "clinical_notes_patient_id_idx" ON "clinical_notes"("patient_id");

-- CreateIndex
CREATE INDEX "clinical_notes_visit_id_idx" ON "clinical_notes"("visit_id");

-- CreateIndex
CREATE INDEX "patient_timeline_events_patient_id_occurred_at_idx" ON "patient_timeline_events"("patient_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "admissions_encounter_id_key" ON "admissions"("encounter_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_sku_key" ON "inventory_items"("sku");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE INDEX "inventory_items_quantity_idx" ON "inventory_items"("quantity");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_id_key" ON "employees"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_national_id_key" ON "employees"("national_id");

-- CreateIndex
CREATE INDEX "shift_schedules_employee_id_shift_date_idx" ON "shift_schedules"("employee_id", "shift_date");

-- CreateIndex
CREATE INDEX "attendance_logs_employee_id_date_idx" ON "attendance_logs"("employee_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_logs_employee_id_date_key" ON "attendance_logs"("employee_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_employee_id_period_month_period_year_key" ON "payslips"("employee_id", "period_month", "period_year");

-- CreateIndex
CREATE UNIQUE INDEX "vitals_encounter_id_key" ON "vitals"("encounter_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_encounter_id_key" ON "invoices"("encounter_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocations_payment_id_bill_item_id_key" ON "payment_allocations"("payment_id", "bill_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_code_key" ON "accounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_catalog_items_vendor_id_inventory_item_id_key" ON "vendor_catalog_items"("vendor_id", "inventory_item_id");

-- CreateIndex
CREATE INDEX "inventory_batches_item_id_idx" ON "inventory_batches"("item_id");

-- CreateIndex
CREATE INDEX "inventory_batches_expiry_date_idx" ON "inventory_batches"("expiry_date");

-- CreateIndex
CREATE INDEX "stock_movements_item_id_created_at_idx" ON "stock_movements"("item_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_alerts_item_id_is_resolved_idx" ON "stock_alerts"("item_id", "is_resolved");

-- CreateIndex
CREATE INDEX "stock_alerts_alertType_is_resolved_idx" ON "stock_alerts"("alertType", "is_resolved");

-- CreateIndex
CREATE INDEX "event_journal_sequence_number_idx" ON "event_journal"("sequence_number");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_category_timestamp_idx" ON "audit_logs"("category", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_chain_position_idx" ON "audit_logs"("chain_position");

-- CreateIndex
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs"("severity");

-- CreateIndex
CREATE INDEX "audit_record_changes_entity_type_entity_id_idx" ON "audit_record_changes"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_record_changes_actor_id_timestamp_idx" ON "audit_record_changes"("actor_id", "timestamp");

-- CreateIndex
CREATE INDEX "audit_record_changes_change_type_timestamp_idx" ON "audit_record_changes"("change_type", "timestamp");

-- CreateIndex
CREATE INDEX "audit_record_changes_timestamp_idx" ON "audit_record_changes"("timestamp");

-- CreateIndex
CREATE INDEX "audit_chat_actions_message_id_idx" ON "audit_chat_actions"("message_id");

-- CreateIndex
CREATE INDEX "audit_chat_actions_patient_id_idx" ON "audit_chat_actions"("patient_id");

-- CreateIndex
CREATE INDEX "audit_chat_actions_actor_id_timestamp_idx" ON "audit_chat_actions"("actor_id", "timestamp");

-- CreateIndex
CREATE INDEX "audit_chat_actions_group_id_timestamp_idx" ON "audit_chat_actions"("group_id", "timestamp");

-- CreateIndex
CREATE INDEX "audit_chat_actions_timestamp_idx" ON "audit_chat_actions"("timestamp");

-- CreateIndex
CREATE INDEX "audit_access_logs_actor_id_timestamp_idx" ON "audit_access_logs"("actor_id", "timestamp");

-- CreateIndex
CREATE INDEX "audit_access_logs_resource_type_resource_id_idx" ON "audit_access_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_access_logs_patient_id_timestamp_idx" ON "audit_access_logs"("patient_id", "timestamp");

-- CreateIndex
CREATE INDEX "audit_access_logs_timestamp_idx" ON "audit_access_logs"("timestamp");

-- CreateIndex
CREATE INDEX "vitals_logs_patient_id_recorded_at_idx" ON "vitals_logs"("patient_id", "recorded_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_logs_maternity_record_id_key" ON "delivery_logs"("maternity_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "medications_ndc_code_key" ON "medications"("ndc_code");

-- CreateIndex
CREATE INDEX "pharmacy_inventory_medication_id_expiry_date_idx" ON "pharmacy_inventory"("medication_id", "expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "drug_interactions_drug_a_id_drug_b_id_key" ON "drug_interactions"("drug_a_id", "drug_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "controlled_substances_log_dispensing_log_id_key" ON "controlled_substances_log"("dispensing_log_id");

-- CreateIndex
CREATE INDEX "record_versions_patient_id_version_number_idx" ON "record_versions"("patient_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "record_versions_patient_id_version_number_key" ON "record_versions"("patient_id", "version_number");

-- CreateIndex
CREATE INDEX "record_access_grants_patient_id_granted_to_idx" ON "record_access_grants"("patient_id", "granted_to");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_studies_dicom_study_uid_key" ON "imaging_studies"("dicom_study_uid");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_studies_accession_number_key" ON "imaging_studies"("accession_number");

-- CreateIndex
CREATE UNIQUE INDEX "dicom_series_dicom_series_uid_key" ON "dicom_series"("dicom_series_uid");

-- CreateIndex
CREATE UNIQUE INDEX "dicom_instances_dicom_sop_instance_uid_key" ON "dicom_instances"("dicom_sop_instance_uid");

-- CreateIndex
CREATE UNIQUE INDEX "ot_schedules_request_id_key" ON "ot_schedules"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "surgery_pre_op_ot_schedule_id_key" ON "surgery_pre_op"("ot_schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "surgery_intra_op_ot_schedule_id_key" ON "surgery_intra_op"("ot_schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "surgery_post_op_ot_schedule_id_key" ON "surgery_post_op"("ot_schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "lab_samples_barcode_key" ON "lab_samples"("barcode");

-- CreateIndex
CREATE INDEX "change_log_timestamp_idx" ON "change_log"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "sync_queue_event_id_key" ON "sync_queue"("event_id");

-- CreateIndex
CREATE INDEX "sync_queue_status_next_attempt_at_idx" ON "sync_queue"("status", "next_attempt_at");

-- CreateIndex
CREATE INDEX "LocalSyncQueue_status_timestamp_idx" ON "LocalSyncQueue"("status", "timestamp");

-- CreateIndex
CREATE INDEX "CloudSyncJournal_timestamp_idx" ON "CloudSyncJournal"("timestamp");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_chat_messages" ADD CONSTRAINT "user_chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_chat_messages" ADD CONSTRAINT "user_chat_messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_chat_messages" ADD CONSTRAINT "user_chat_messages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "chat_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "chat_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_attachments" ADD CONSTRAINT "internal_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "user_chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message_read_receipts" ADD CONSTRAINT "chat_message_read_receipts_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "user_chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_notes" ADD CONSTRAINT "encounter_notes_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_chats" ADD CONSTRAINT "encounter_chats_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_timeline_events" ADD CONSTRAINT "patient_timeline_events_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_timeline_events" ADD CONSTRAINT "patient_timeline_events_clinical_note_id_fkey" FOREIGN KEY ("clinical_note_id") REFERENCES "clinical_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adt_transfer_events" ADD CONSTRAINT "adt_transfer_events_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_administration" ADD CONSTRAINT "medication_administration_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensing_records" ADD CONSTRAINT "dispensing_records_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensing_records" ADD CONSTRAINT "dispensing_records_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_records" ADD CONSTRAINT "payroll_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_schedules" ADD CONSTRAINT "shift_schedules_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payroll_record_id_fkey" FOREIGN KEY ("payroll_record_id") REFERENCES "payroll_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "diagnostic_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allergies" ADD CONSTRAINT "allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_bill_item_id_fkey" FOREIGN KEY ("bill_item_id") REFERENCES "bill_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_lines" ADD CONSTRAINT "journal_lines_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_catalog_items" ADD CONSTRAINT "vendor_catalog_items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_catalog_items" ADD CONSTRAINT "vendor_catalog_items_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grns" ADD CONSTRAINT "grns_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "grns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_bins" ADD CONSTRAINT "inventory_bins_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "inventory_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "inventory_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_alerts" ADD CONSTRAINT "stock_alerts_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenance" ADD CONSTRAINT "asset_maintenance_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_record_changes" ADD CONSTRAINT "audit_record_changes_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "audit_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_chat_actions" ADD CONSTRAINT "audit_chat_actions_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "audit_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_access_logs" ADD CONSTRAINT "audit_access_logs_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "audit_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_monitoring" ADD CONSTRAINT "icu_monitoring_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_monitoring" ADD CONSTRAINT "icu_monitoring_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_monitoring" ADD CONSTRAINT "icu_monitoring_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals_logs" ADD CONSTRAINT "vitals_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vitals_logs" ADD CONSTRAINT "vitals_logs_icu_monitoring_id_fkey" FOREIGN KEY ("icu_monitoring_id") REFERENCES "icu_monitoring"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oncology_treatments" ADD CONSTRAINT "oncology_treatments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemo_sessions" ADD CONSTRAINT "chemo_sessions_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "oncology_treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemo_sessions" ADD CONSTRAINT "chemo_sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maternity_records" ADD CONSTRAINT "maternity_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maternity_records" ADD CONSTRAINT "maternity_records_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_maternity_record_id_fkey" FOREIGN KEY ("maternity_record_id") REFERENCES "maternity_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_inventory" ADD CONSTRAINT "pharmacy_inventory_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_interactions" ADD CONSTRAINT "drug_interactions_drug_a_id_fkey" FOREIGN KEY ("drug_a_id") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_interactions" ADD CONSTRAINT "drug_interactions_drug_b_id_fkey" FOREIGN KEY ("drug_b_id") REFERENCES "medications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensing_logs" ADD CONSTRAINT "dispensing_logs_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensing_logs" ADD CONSTRAINT "dispensing_logs_pharmacy_inventory_id_fkey" FOREIGN KEY ("pharmacy_inventory_id") REFERENCES "pharmacy_inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispensing_logs" ADD CONSTRAINT "dispensing_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "controlled_substances_log" ADD CONSTRAINT "controlled_substances_log_dispensing_log_id_fkey" FOREIGN KEY ("dispensing_log_id") REFERENCES "dispensing_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_versions" ADD CONSTRAINT "record_versions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_requests" ADD CONSTRAINT "release_requests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_requests" ADD CONSTRAINT "release_requests_consent_form_id_fkey" FOREIGN KEY ("consent_form_id") REFERENCES "consent_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_forms" ADD CONSTRAINT "consent_forms_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "record_access_grants" ADD CONSTRAINT "record_access_grants_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_orders" ADD CONSTRAINT "radiology_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_orders" ADD CONSTRAINT "radiology_orders_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "radiology_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dicom_series" ADD CONSTRAINT "dicom_series_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dicom_instances" ADD CONSTRAINT "dicom_instances_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "dicom_series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_requests" ADD CONSTRAINT "surgery_requests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_requests" ADD CONSTRAINT "surgery_requests_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ot_schedules" ADD CONSTRAINT "ot_schedules_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "surgery_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_pre_op" ADD CONSTRAINT "surgery_pre_op_ot_schedule_id_fkey" FOREIGN KEY ("ot_schedule_id") REFERENCES "ot_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_intra_op" ADD CONSTRAINT "surgery_intra_op_ot_schedule_id_fkey" FOREIGN KEY ("ot_schedule_id") REFERENCES "ot_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_post_op" ADD CONSTRAINT "surgery_post_op_ot_schedule_id_fkey" FOREIGN KEY ("ot_schedule_id") REFERENCES "ot_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_samples" ADD CONSTRAINT "lab_samples_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_reports" ADD CONSTRAINT "lab_reports_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "lab_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_queue" ADD CONSTRAINT "sync_queue_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event_journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

