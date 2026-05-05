# Frontend-to-CRM Integration

## Overview
Seamless lead capture from multiple sources into the CRM system with automated processing.

## API Structure

### 1. Website Forms → CRM
**Endpoint:** `POST /api/public/leads`

**Request Body:**
```json
{
  "name": "John Doe",
  "organization": "City Hospital",
  "facilityType": "HOSPITAL",
  "email": "john@cityhospital.com",
  "phone": "+1234567890",
  "requestedModules": ["EMR", "Billing"],
  "message": "Interested in your EMR solution",
  "landingPage": "/pricing",
  "utmParams": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "emr-launch-2026"
  }
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "uuid",
  "message": "Thank you! We will contact you soon."
}
```

**Features:**
- Rate limiting: 5 requests per minute per IP
- Auto-tagging based on content
- UTM parameter tracking
- Landing page attribution

---

### 2. Landing Pages → CRM
**Endpoint:** `POST /api/crm/leads`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "organization": "Clinic Plus",
  "facilityType": "CLINIC",
  "email": "jane@clinicplus.com",
  "phone": "+1987654321",
  "requestedModules": ["Pharmacy"],
  "message": "Need pharmacy module",
  "landingPage": "/modules/pharmacy",
  "utmSource": "facebook",
  "utmMedium": "social",
  "utmCampaign": "pharmacy-promo",
  "utmContent": "banner-1",
  "utmTerm": "pharmacy-software"
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "uuid",
  "message": "Thank you! We will contact you soon."
}
```

**Features:**
- UTM parameter capture
- Source detection (Website, WhatsApp, Email, SalesAgent)
- Landing page tracking

---

### 3. WhatsApp → CRM
**Endpoint:** `POST /api/webhooks/whatsapp`

**For Meta WhatsApp Business API:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "messages": [{
          "from": "1234567890",
          "id": "wamid.ID",
          "timestamp": "1661873999",
          "text": {
            "body": "Name: John Doe\nOrganization: City Hospital\nEmail: john@cityhospital.com\nModules: EMR, Billing\nInterested in your solution"
          }
        }]
      }
    }]
  }]
}
```

**For Direct/Simple Integration:**
```json
{
  "senderPhone": "1234567890",
  "message": "Name: John Doe\nOrganization: City Hospital\nEmail: john@cityhospital.com",
  "senderName": "John Doe",
  "organization": "City Hospital"
}
```

**Response:**
```json
{
  "success": true,
  "leadsCreated": 1
}
```

**Features:**
- Meta WhatsApp Business API compatible
- Automatic facility type detection from message content
- Email extraction from message
- Auto-tagging

---

## Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Website Form   │     │  Landing Page    │     │   WhatsApp      │
└────────┬────────┘     └────────┬─────────┘     └────────┬────────┘
         │                       │                          │
         │ POST                  │ POST                     │ Webhook
         ▼                       ▼                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│              /api/public/leads  │  /api/crm/leads  │  /api/    │
│                                   │                   webhooks/   │
│                                   │                   whatsapp    │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │  enquiry-normalizer.ts    │
              │  - normalizeWebForm()    │
              │  - normalizeWhatsApp()   │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │  StandardEnquiry Object  │
              │  - name, organization    │
              │  - facilityType          │
              │  - contactInfo           │
              │  - source                │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │  autoTagEnquiry()        │
              │  - Tags: facility type  │
              │  - Tags: modules        │
              │  - Tags: intent         │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │  Lead Created in DB      │
              │  (Control Database)      │
              │  - status: NewLead       │
              │  - tags, customConfig    │
              └────────────┬─────────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │  applyAutomationRules()  │
              │  - autoAssignLead()      │
              │  - createAutoFollowUp()  │
              │  - suggestModules()       │
              └──────────────────────────┘
```

---

## Lead Source Enum
- `Website` - Web forms and landing pages
- `WhatsApp` - WhatsApp messages
- `Email` - Email enquiries
- `SalesAgent` - Manual entry by sales agents

## Facility Type Enum
- `CLINIC` - Small clinics
- `HOSPITAL` - Full-service hospitals
- `PHARMACY` - Pharmacies
- `LAB` - Laboratories
- `SPECIALIST` - Specialist practices

## Database Fields (Lead Model)
- `hospitalName` - Organization name
- `contactName` - Contact person name
- `contactEmail` - Email address
- `contactPhone` - Phone number
- `source` - LeadSource enum
- `status` - PipelineStage enum (NewLead, Qualified, etc.)
- `facilityType` - FacilityType enum
- `requestedModules` - Array of module names
- `message` - Additional message
- `tags` - Auto-generated tags
- `customConfig` - JSON with UTM params, landing page, etc.
- `assignedAgentId` - Auto-assigned agent
- `potentialValue` - Estimated deal value

---

## Environment Variables
```env
# WhatsApp Webhook Verification
WHATSAPP_VERIFY_TOKEN=amisimedos-whatsapp-token

# Database URLs (already configured)
NEON_DATABASE_URL=...
NEON_DIRECT_URL=...
```

---

## Testing Examples

### Website Form
```bash
curl -X POST http://localhost:3000/api/public/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","organization":"Test Hospital","email":"test@example.com","facilityType":"CLINIC"}'
```

### WhatsApp Webhook (Meta format)
```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"object":"whatsapp_business_account","entry":[{"changes":[{"value":{"messages":[{"from":"123","text":{"body":"Name: Test\nEmail: test@example.com"}}]}]}]}'
```

### Landing Page Lead
```bash
curl -X POST http://localhost:3000/api/crm/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","organization":"Test","email":"test@example.com","facilityType":"HOSPITAL","utmSource":"facebook"}'
```
