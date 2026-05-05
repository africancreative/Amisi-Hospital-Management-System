-- Add queue_config column to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS queue_config JSONB;

-- Add other potentially missing columns based on schema
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_config JSONB;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS staff_roles JSONB;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS compliance_isolation JSONB DEFAULT '{"byok_enabled": false, "data_residency": "", "isolation_policy": "logical"}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS facility_type TEXT DEFAULT 'CLINIC';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS module_config JSONB DEFAULT '{}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_quotas JSONB DEFAULT '{"seat_limit": 5, "storage_mb": 5000}';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS workflow_customization JSONB DEFAULT '{"queue_logic": {"routing_rules": [], "triage_levels": ["Critical", "Urgent", "Routine"]}, "staff_roles": {}, "billing_rules": {"currency": "USD", "tax_rate": 0, "payment_methods": ["CASH", "CARD", "MPESA"]}}';
